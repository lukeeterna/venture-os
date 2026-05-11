#!/usr/bin/env python3
"""
Global Violation Gate — VOS vincolo #3, #9 enforcement.

Stop hook. Legge ultima assistant message dal transcript, applica regex pattern
detection per opener diplomatici e liste decisionali. Se hit:
  - LOG sempre in ~/venture-os/state/cc-violations.jsonl
  - MODE=block (env CLAUDE_VIOLATION_GATE_MODE=block): stdout decision=block + reason
  - MODE=log-only (default): no block, solo log

Spec Stop hook verificata 2026-05-11 (vincolo #1):
  https://code.claude.com/docs/en/hooks
  - Input: session_id, transcript_path, cwd, permission_mode, hook_event_name=Stop
  - Block output: {"decision":"block","reason":"..."} — reason mostrato a Claude,
    "Not added to context" (nudging, non altera storia).

Origine: deviation S4 vincolo-9-recidiva + caso empirico S5e CC FLUXION 2026-05-11.
Seed: ~/venture-os/seeds/S5f-hook-cc-violation-gate.md
Vincolo #12: scope globale (~/.claude/hooks/), copre ARGOS+FLUXION+Guardian+VOS.
"""
from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

LOG_PATH = Path("/Volumes/MontereyT7/venture-os/state/cc-violations.jsonl")
LOG_PATH_FALLBACK = Path.home() / ".venture-os-cc-violations.jsonl"

# Modalità: "block" forza Claude a riformulare; "log-only" registra ma non blocca.
# Default log-only durante baseline week (7gg) — switch a block dopo audit.
MODE = os.environ.get("CLAUDE_VIOLATION_GATE_MODE", "log-only").lower()

# Limite scan transcript dall'ultima riga indietro per trovare ultima assistant TEXT.
SCAN_MAX_LINES = 50

# Pattern detection — regex compilate.
# p1: "hai ragione" — vincolo #9. Case-insensitive, word-boundary.
P_HAI_RAGIONE = re.compile(r"\bhai\s+ragione\b", re.IGNORECASE)

# p2: incipit "Perfetto," / "Perfetto!" / "Perfetto." come opener di risposta.
# Match solo nei primi ~120 char (incipit), evita falsi positivi su occorrenze mid-text.
P_PERFETTO_OPENER = re.compile(r"^\s*Perfetto[,.!]", re.IGNORECASE)

# p3: lista numerata 1.+2.+3. in contesto decisionale.
# Heuristic: la risposta contiene SIA la lista 1./2./3. (riga inizio) SIA keyword
# decisionale tecnica. Senza keyword decisionale, lista numerata è enumerazione
# legittima (es. step plan, ordini di operazioni).
P_DECISION_LIST = re.compile(r"^\s*1\.\s+.+?\n.*?^\s*2\.\s+.+?\n.*?^\s*3\.\s+",
                              re.MULTILINE | re.DOTALL)
P_DECISION_KEYWORDS = re.compile(
    r"\b(scegli|preferisci|preferisce|opzioni|alternative|quale\s+(scegliere|preferisci)|"
    r"opzione\s+[a-d]|option\s+[a-d])\b",
    re.IGNORECASE,
)

# Code fence stripper — rimuove blocchi ```...``` prima del pattern match
# per evitare match su esempi di codice o citazioni.
P_CODE_FENCE = re.compile(r"```.*?```", re.DOTALL)
P_INLINE_CODE = re.compile(r"`[^`\n]+`")
# Quote markers — strip > righe (markdown blockquote)
P_BLOCKQUOTE_LINE = re.compile(r"^\s*>\s.*$", re.MULTILINE)


def _strip_noise(text: str) -> str:
    """Rimuove code blocks e blockquotes per evitare falsi positivi."""
    text = P_CODE_FENCE.sub("", text)
    text = P_INLINE_CODE.sub("", text)
    text = P_BLOCKQUOTE_LINE.sub("", text)
    return text


def _last_assistant_text(transcript_path: str) -> str | None:
    """Legge JSONL backwards, ritorna concat text blocks ultima assistant message."""
    p = Path(transcript_path)
    if not p.exists():
        return None
    try:
        # Leggi tutto (transcripts tipici <5MB). Backwards scan.
        lines = p.read_text(encoding="utf-8", errors="replace").splitlines()
    except OSError:
        return None
    for line in reversed(lines[-SCAN_MAX_LINES:]):
        if not line.strip():
            continue
        try:
            d = json.loads(line)
        except json.JSONDecodeError:
            continue
        if d.get("type") != "assistant":
            continue
        msg = d.get("message")
        if not isinstance(msg, dict):
            continue
        content = msg.get("content", [])
        if not isinstance(content, list):
            continue
        texts: list[str] = []
        for block in content:
            if isinstance(block, dict) and block.get("type") == "text":
                t = block.get("text")
                if isinstance(t, str) and t.strip():
                    texts.append(t)
        if texts:
            return "\n".join(texts)
    return None


def detect_violations(text: str) -> list[dict]:
    """Restituisce lista violazioni [{pattern_id, snippet}, ...]."""
    clean = _strip_noise(text)
    hits: list[dict] = []

    m = P_HAI_RAGIONE.search(clean)
    if m:
        s = max(0, m.start() - 30)
        e = min(len(clean), m.end() + 30)
        hits.append({
            "pattern_id": "vincolo-9-hai-ragione",
            "vincolo": 9,
            "snippet": clean[s:e].strip(),
        })

    # Perfetto opener: cerca SOLO nei primi 120 char (incipit reale).
    incipit = clean.lstrip()[:120]
    m = P_PERFETTO_OPENER.search(incipit)
    if m:
        hits.append({
            "pattern_id": "vincolo-9-perfetto-opener",
            "vincolo": 9,
            "snippet": incipit[:80].strip(),
        })

    # Lista decisionale: serve SIA pattern lista SIA keyword decisionale.
    list_hit = P_DECISION_LIST.search(clean)
    kw_hit = P_DECISION_KEYWORDS.search(clean)
    if list_hit and kw_hit:
        s = list_hit.start()
        e = min(len(clean), list_hit.end() + 50)
        hits.append({
            "pattern_id": "vincolo-3-lista-decisionale",
            "vincolo": 3,
            "snippet": clean[s:e].strip()[:200],
            "decision_keyword": kw_hit.group(0),
        })

    return hits


def _log(record: dict) -> None:
    """Append JSONL. Fallback a $HOME se T7 non montato."""
    target = LOG_PATH if LOG_PATH.parent.exists() else LOG_PATH_FALLBACK
    try:
        target.parent.mkdir(parents=True, exist_ok=True)
        with open(target, "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
    except OSError:
        pass  # mai fallire per log issue


def main() -> int:
    try:
        data = json.load(sys.stdin)
    except Exception:
        return 0  # malformed input → no block, fail safe

    if data.get("hook_event_name") != "Stop":
        return 0

    transcript_path = data.get("transcript_path")
    if not transcript_path:
        return 0

    # Anti-loop: se stop_hook_active già true (Claude sta già reagendo a un block),
    # non rebloccare per evitare loop infinito.
    if data.get("stop_hook_active"):
        return 0

    text = _last_assistant_text(transcript_path)
    if not text:
        return 0

    hits = detect_violations(text)
    if not hits:
        return 0

    ts = datetime.now(timezone.utc).isoformat()
    session_id = data.get("session_id", "")
    cwd = data.get("cwd", "")

    for hit in hits:
        _log({
            "ts": ts,
            "session_id": session_id,
            "cwd": cwd,
            "mode": MODE,
            **hit,
        })

    if MODE != "block":
        return 0  # log-only mode: registrato ma no block

    # Build reason message — visibile a Claude (non al user).
    reasons = []
    for hit in hits:
        reasons.append(
            f"Vincolo #{hit['vincolo']} violato — pattern '{hit['pattern_id']}'."
        )
    reason = (
        " ".join(reasons) +
        " Riformula con raccomandazione singola motivata con dati, o disaccordo motivato con dati. "
        "Mai opener diplomatici, mai liste A/B/C/D su decisioni tecniche."
    )
    out = {"decision": "block", "reason": reason}
    print(json.dumps(out))
    return 0


if __name__ == "__main__":
    sys.exit(main())
