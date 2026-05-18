#!/usr/bin/env python3
"""
cc-meta-monitor/monitor.py — VOS Anti-pattern Detection (WAVE 3 P9, S181)
Analizza il jsonl dell'ultima sessione Claude Code VOS e rileva anti-pattern
comportamentali. Python 3.9 stdlib only. Big Sur compatible.

Mount check T7 obbligatorio all'avvio (vincolo S181).
Fail-soft su ogni linea jsonl malformata.

Anti-pattern rilevati:
  1. delegation_gap   — ≥5 tool_use consecutivi senza Task spawn
  2. search_loop      — WebSearch identica ≥2x in finestra 1h
  3. edit_revert      — Edit file X + Edit stesso file con rollback entro 5 turn
  4. context_pollution — Read stesso file_path ≥3x (escluse offset diverse)
  5. blind_execution  — Bash exit!=0 / "Error:" ≥30% degli ultimi 10 Bash

Output:
  - stdout: JSON report
  - state/cc-anti-patterns.jsonl: append finding
  - state/cc-alerts-pending.jsonl: append se severity HIGH
  - state/cc-anti-patterns-weekly-<YYYY-WW>.md: aggregazione settimanale
"""

import json
import os
import sys
import re
import hashlib
import datetime
from pathlib import Path
from typing import Optional

# ---------------------------------------------------------------------------
# Costanti path
# ---------------------------------------------------------------------------

T7_MOUNT = "/Volumes/MontereyT7"
VOS_ROOT = Path(T7_MOUNT) / "venture-os"
STATE_DIR = VOS_ROOT / "state"
CC_PATTERNS_LOG = STATE_DIR / "cc-anti-patterns.jsonl"
CC_ALERTS_LOG = STATE_DIR / "cc-alerts-pending.jsonl"
SESSION_DIR = Path.home() / ".claude" / "projects" / "-Volumes-MontereyT7-venture-os"

# Tool names classificati per tipo
DIRECT_TOOLS = {"Bash", "Read", "Edit", "Write", "Glob", "Grep"}
DELEGATION_TOOLS = {"Task"}
SEARCH_TOOLS = {"WebSearch", "WebFetch"}


# ---------------------------------------------------------------------------
# Utility
# ---------------------------------------------------------------------------

def _t7_mounted() -> bool:
    return os.path.ismount(T7_MOUNT)


def _now_iso() -> str:
    return datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")


def _iso_to_epoch(ts_str: str) -> float:
    """Converte ISO8601 in epoch float. Ritorna 0.0 su errore."""
    try:
        # Gestisce sia Z che +00:00
        ts_str = ts_str.replace("Z", "+00:00")
        dt = datetime.datetime.fromisoformat(ts_str)
        return dt.timestamp()
    except Exception:
        return 0.0


def _normalize_query(q: str) -> str:
    """Normalizza query WebSearch per confronto: lowercase, strip, no punctuation."""
    q = q.lower().strip()
    q = re.sub(r"[^\w\s]", "", q)
    q = re.sub(r"\s+", " ", q)
    return q


def _get_week_tag() -> str:
    """Ritorna YYYY-WW per il file weekly."""
    now = datetime.datetime.utcnow()
    return now.strftime("%Y-%W")


# ---------------------------------------------------------------------------
# Parsing jsonl sessione
# ---------------------------------------------------------------------------

def find_latest_session() -> Optional[Path]:
    """
    Trova il jsonl dell'ultima sessione VOS per mtime.
    Ritorna None se nessun file trovato.
    """
    if not SESSION_DIR.exists():
        sys.stderr.write(f"[cc-meta-monitor] WARN: session dir non trovata: {SESSION_DIR}\n")
        return None

    jsonl_files = list(SESSION_DIR.glob("*.jsonl"))
    if not jsonl_files:
        sys.stderr.write(f"[cc-meta-monitor] WARN: nessun jsonl in {SESSION_DIR}\n")
        return None

    latest = max(jsonl_files, key=lambda p: p.stat().st_mtime)
    return latest


def parse_turns(session_path: Path) -> list[dict]:
    """
    Legge il jsonl e restituisce lista di turns rilevanti.
    Ogni turn: {line_num, type, tool_name, tool_input, tool_result_content,
                is_error, timestamp, session_id}

    Fail-soft: linee malformate → skip + stderr log.
    Nota struttura reale CC jsonl:
      - type=assistant, message.content = lista di {type:"tool_use", name:..., input:{...}}
      - type=user,      message.content = lista di {type:"tool_result", is_error:..., content:...}
    """
    turns = []
    session_id = session_path.stem

    # Mappa tool_use_id → tool info (per correlare tool_result all'invocazione)
    pending_tools: dict[str, dict] = {}

    with open(session_path, encoding="utf-8", errors="replace") as fh:
        for line_num, raw_line in enumerate(fh, 1):
            raw_line = raw_line.strip()
            if not raw_line:
                continue
            try:
                obj = json.loads(raw_line)
            except json.JSONDecodeError as exc:
                sys.stderr.write(
                    f"[cc-meta-monitor] SKIP malformed JSON line {line_num}: {exc}\n"
                )
                continue

            entry_type = obj.get("type", "")
            timestamp = obj.get("timestamp", "")
            msg = obj.get("message", {})
            if not isinstance(msg, dict):
                continue

            role = msg.get("role", "")
            content = msg.get("content", [])
            if not isinstance(content, list):
                continue

            if role == "assistant":
                # Estrai tool_use calls
                for item in content:
                    if not isinstance(item, dict):
                        continue
                    if item.get("type") == "tool_use":
                        tool_id = item.get("id", "")
                        tool_name = item.get("name", "")
                        tool_input = item.get("input", {})
                        turn_record = {
                            "line_num": line_num,
                            "turn_type": "tool_use",
                            "tool_name": tool_name,
                            "tool_input": tool_input,
                            "tool_result_content": "",
                            "is_error": False,
                            "timestamp": timestamp,
                            "session_id": session_id,
                        }
                        turns.append(turn_record)
                        if tool_id:
                            pending_tools[tool_id] = turn_record

            elif role == "user":
                # Estrai tool_result (risposta al tool_use precedente)
                for item in content:
                    if not isinstance(item, dict):
                        continue
                    if item.get("type") == "tool_result":
                        tool_id = item.get("tool_use_id", "")
                        is_error = bool(item.get("is_error", False))
                        result_content = item.get("content", "")
                        # content può essere stringa o lista di {type, text}
                        if isinstance(result_content, list):
                            result_text = " ".join(
                                c.get("text", "") for c in result_content
                                if isinstance(c, dict)
                            )
                        else:
                            result_text = str(result_content)

                        # Aggiorna il turn_record corrispondente
                        if tool_id in pending_tools:
                            pending_tools[tool_id]["tool_result_content"] = result_text
                            pending_tools[tool_id]["is_error"] = is_error

    return turns


# ---------------------------------------------------------------------------
# Detection rules
# ---------------------------------------------------------------------------

def detect_delegation_gap(turns: list[dict]) -> list[dict]:
    """
    Rule 1: ≥5 tool_use consecutivi in DIRECT_TOOLS senza alcun Task spawn.
    HIGH se ≥8 consecutive, MED se 5-7.
    """
    findings = []
    consecutive_start = None
    consecutive_count = 0
    run_turns = []

    for t in turns:
        if t["turn_type"] != "tool_use":
            continue
        name = t["tool_name"]

        if name in DIRECT_TOOLS:
            if consecutive_start is None:
                consecutive_start = t["line_num"]
                run_turns = [t["line_num"]]
                consecutive_count = 1
            else:
                consecutive_count += 1
                run_turns.append(t["line_num"])
        elif name in DELEGATION_TOOLS:
            # Task spawn interrompe la corsa
            if consecutive_count >= 5:
                sev = "high" if consecutive_count >= 8 else "med"
                findings.append({
                    "type": "delegation_gap",
                    "severity": sev,
                    "evidence_turns": run_turns.copy(),
                    "count": consecutive_count,
                    "suggestion": (
                        f"{consecutive_count} tool_use direct consecutivi senza Task spawn. "
                        "Usare vos-auto-router per sub-task >=3 indipendenti."
                    ),
                })
            # Reset
            consecutive_start = None
            consecutive_count = 0
            run_turns = []
        # Altri tool (WebSearch, etc.) non interrompono ma non contano

    # Controlla la corsa al termine
    if consecutive_count >= 5:
        sev = "high" if consecutive_count >= 8 else "med"
        findings.append({
            "type": "delegation_gap",
            "severity": sev,
            "evidence_turns": run_turns.copy(),
            "count": consecutive_count,
            "suggestion": (
                f"{consecutive_count} tool_use direct consecutivi senza Task spawn. "
                "Usare vos-auto-router per sub-task >=3 indipendenti."
            ),
        })

    return findings


def detect_search_loop(turns: list[dict]) -> list[dict]:
    """
    Rule 2: WebSearch con query normalizzata identica ≥2x entro 1h.
    HIGH se ≥3, MED se 2.
    """
    findings = []
    # query_norm → lista (timestamp_epoch, line_num)
    query_map: dict[str, list] = {}

    for t in turns:
        if t["turn_type"] != "tool_use" or t["tool_name"] != "WebSearch":
            continue
        raw_query = t["tool_input"].get("query", "")
        norm = _normalize_query(raw_query)
        ts_epoch = _iso_to_epoch(t["timestamp"]) if t["timestamp"] else 0.0
        if norm not in query_map:
            query_map[norm] = []
        query_map[norm].append((ts_epoch, t["line_num"], raw_query))

    for norm, occurrences in query_map.items():
        if len(occurrences) < 2:
            continue
        # Raggruppa per finestra 1h
        occurrences_sorted = sorted(occurrences, key=lambda x: x[0])
        window_start = occurrences_sorted[0][0]
        in_window = [o for o in occurrences_sorted if o[0] - window_start <= 3600]

        if len(in_window) >= 2:
            sev = "high" if len(in_window) >= 3 else "med"
            findings.append({
                "type": "search_loop",
                "severity": sev,
                "evidence_turns": [o[1] for o in in_window],
                "count": len(in_window),
                "suggestion": (
                    f"Query '{in_window[0][2][:60]}' ripetuta {len(in_window)}x in 1h. "
                    "Salvare risultato WebSearch in nota prima di procedere."
                ),
            })

    return findings


def detect_edit_revert(turns: list[dict]) -> list[dict]:
    """
    Rule 3: Edit file_path X seguito da Edit stesso file con old/new invertiti entro 5 turn.
    MED se 2 revert, HIGH se ≥3 sullo stesso file.

    Nota: un "revert" è quando new_string di turn N == old_string di un turn precedente
    sullo stesso file_path.
    """
    findings = []
    # Traccia edits per file: {file_path: [(line_num, old_string, new_string)]}
    edit_history: dict[str, list] = {}

    edit_turns = [
        t for t in turns
        if t["turn_type"] == "tool_use" and t["tool_name"] == "Edit"
    ]

    for i, t in enumerate(edit_turns):
        fp = t["tool_input"].get("file_path", "")
        old_s = t["tool_input"].get("old_string", "")
        new_s = t["tool_input"].get("new_string", "")

        if fp not in edit_history:
            edit_history[fp] = []

        # Cerca revert: new_string corrente == old_string di un edit precedente
        # sullo stesso file entro 5 edit precedenti
        recent_edits = edit_history[fp][-5:]
        revert_found = any(
            prev_new == old_s and prev_old == new_s
            for (_, prev_old, prev_new) in recent_edits
        )

        if revert_found:
            revert_turns = [t["line_num"] for t in edit_turns[max(0, i-5):i+1]]
            # Conta quante volte questo file ha avuto revert
            existing = [f for f in findings if f["type"] == "edit_revert"
                        and fp in f.get("file_path", "")]
            if existing:
                existing[0]["count"] += 1
                existing[0]["evidence_turns"].append(t["line_num"])
                if existing[0]["count"] >= 3:
                    existing[0]["severity"] = "high"
            else:
                findings.append({
                    "type": "edit_revert",
                    "severity": "med",
                    "file_path": fp,
                    "evidence_turns": revert_turns,
                    "count": 1,
                    "suggestion": (
                        f"Revert rilevato su {Path(fp).name}. "
                        "Pattern indecision: pianifica la modifica prima di editare."
                    ),
                })

        edit_history[fp].append((t["line_num"], old_s, new_s))

    return findings


def detect_context_pollution(turns: list[dict]) -> list[dict]:
    """
    Rule 4: Read stesso file_path ≥3x (escluse Read con offset diverso = paginazione legittima).
    MED se 3-4, HIGH se ≥5.
    """
    findings = []
    # file_path → set di (line_num, offset)
    read_map: dict[str, list] = {}

    for t in turns:
        if t["turn_type"] != "tool_use" or t["tool_name"] != "Read":
            continue
        fp = t["tool_input"].get("file_path", "")
        offset = t["tool_input"].get("offset", 0)
        if fp not in read_map:
            read_map[fp] = []
        read_map[fp].append((t["line_num"], offset))

    for fp, reads in read_map.items():
        # Conta solo reads con stesso offset (paginazione con offset diverso = legittima)
        offset_groups: dict = {}
        for line_num, offset in reads:
            key = offset if offset else 0
            if key not in offset_groups:
                offset_groups[key] = []
            offset_groups[key].append(line_num)

        for offset, line_nums in offset_groups.items():
            if len(line_nums) >= 3:
                sev = "high" if len(line_nums) >= 5 else "med"
                findings.append({
                    "type": "context_pollution",
                    "severity": sev,
                    "evidence_turns": line_nums,
                    "file_path": fp,
                    "count": len(line_nums),
                    "suggestion": (
                        f"{Path(fp).name} letto {len(line_nums)}x con offset={offset}. "
                        "Salvare contenuto rilevante in variabile o leggere una volta sola."
                    ),
                })

    return findings


def detect_blind_execution(turns: list[dict]) -> list[dict]:
    """
    Rule 5: Bash con exit code !=0 (is_error=True) o 'Error:' nel result ≥30% degli ultimi 10 Bash.
    LOW se 1-2/10, MED se 3-4/10, HIGH se ≥5/10.
    """
    findings = []
    bash_turns = [
        t for t in turns
        if t["turn_type"] == "tool_use" and t["tool_name"] == "Bash"
    ]

    if len(bash_turns) < 3:
        return findings  # Non abbastanza campione

    # Analizza per finestre di 10 Bash
    window_size = 10
    windows_checked = set()

    for i in range(len(bash_turns)):
        window_end = min(i + window_size, len(bash_turns))
        window = bash_turns[i:window_end]
        if len(window) < 3:
            continue

        window_key = tuple(t["line_num"] for t in window)
        if window_key in windows_checked:
            continue
        windows_checked.add(window_key)

        errors = [
            t for t in window
            if t["is_error"] or "Error:" in t["tool_result_content"][:200]
        ]
        error_rate = len(errors) / len(window)

        if error_rate >= 0.50:
            sev = "high"
        elif error_rate >= 0.30:
            sev = "med"
        elif error_rate >= 0.10:
            sev = "low"
        else:
            continue

        if sev in ("med", "high"):
            findings.append({
                "type": "blind_execution",
                "severity": sev,
                "evidence_turns": [t["line_num"] for t in errors],
                "error_count": len(errors),
                "window_size": len(window),
                "error_rate_pct": round(error_rate * 100),
                "suggestion": (
                    f"{len(errors)}/{len(window)} Bash con errore ({round(error_rate*100)}%). "
                    "Verificare output prima di procedere, usare dry-run dove possibile."
                ),
            })
            break  # Un finding per sessione è sufficiente

    return findings


# ---------------------------------------------------------------------------
# Score calculation
# ---------------------------------------------------------------------------

def calculate_score(all_findings: list[dict]) -> int:
    """
    Score 0-100. Deductions per severity.
    HIGH: -20 pts each. MED: -10 pts. LOW: -3 pts.
    """
    score = 100
    for f in all_findings:
        sev = f.get("severity", "low")
        if sev == "high":
            score -= 20
        elif sev == "med":
            score -= 10
        elif sev == "low":
            score -= 3
    return max(0, score)


# ---------------------------------------------------------------------------
# Persistence
# ---------------------------------------------------------------------------

def append_jsonl(path: Path, entry: dict) -> bool:
    """Append entry a file jsonl. Ritorna True su successo."""
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(entry, ensure_ascii=False) + "\n")
        return True
    except Exception as exc:
        sys.stderr.write(f"[cc-meta-monitor] ERROR append {path}: {exc}\n")
        return False


def write_alert(session_id: str, findings: list[dict]) -> None:
    """Scrive alert pending per sessione successiva se ci sono HIGH."""
    high_findings = [f for f in findings if f.get("severity") == "high"]
    if not high_findings:
        return

    alert = {
        "ts": _now_iso(),
        "session_id": session_id,
        "alert_type": "anti_pattern_high",
        "patterns": [f["type"] for f in high_findings],
        "system_reminder": (
            f"[ANTI-PATTERN ALERT] Sessione precedente ha rilevato {len(high_findings)} "
            f"pattern HIGH: {', '.join(f['type'] for f in high_findings)}. "
            "Prioritizza delegation (vos-auto-router) e evita tool_use chain lunghe."
        ),
    }
    append_jsonl(CC_ALERTS_LOG, alert)
    sys.stderr.write(
        f"[cc-meta-monitor] ALERT written to cc-alerts-pending.jsonl: "
        f"{len(high_findings)} HIGH patterns\n"
    )


def update_weekly_report(session_id: str, findings: list[dict]) -> None:
    """
    Aggiorna report settimanale cc-anti-patterns-weekly-<YYYY-WW>.md.
    Idempotente: legge esistente, aggiunge entry, riscrive.
    """
    week_tag = _get_week_tag()
    weekly_path = STATE_DIR / f"cc-anti-patterns-weekly-{week_tag}.md"

    # Conta pattern per tipo in questa sessione
    pattern_counts: dict[str, int] = {}
    for f in findings:
        t = f.get("type", "unknown")
        pattern_counts[t] = pattern_counts.get(t, 0) + 1

    # Leggi sessioni già registrate questa settimana
    existing_sessions = []
    if weekly_path.exists():
        content = weekly_path.read_text(encoding="utf-8")
        # Estrai session ids già loggati
        for line in content.splitlines():
            if "session_id:" in line:
                existing_sessions.append(line.strip())

    # Append nuova entry al file
    now = _now_iso()
    entry_block = (
        f"\n### {now}\n"
        f"- session_id: {session_id}\n"
        f"- patterns trovati: {json.dumps(pattern_counts)}\n"
        f"- score: {calculate_score(findings)}\n"
    )

    # Aggiungi header se file nuovo
    if not weekly_path.exists():
        header = (
            f"# cc-anti-patterns weekly — {week_tag}\n\n"
            "Generato automaticamente da cc-meta-monitor (WAVE 3 P9).\n"
            "Revisione ogni lunedi: aggiornare feedback memories se pattern ripetuti.\n\n"
        )
        weekly_path.write_text(header + entry_block, encoding="utf-8")
    else:
        with open(weekly_path, "a", encoding="utf-8") as fh:
            fh.write(entry_block)

    # Se ci sono >=3 sessioni questa settimana, aggiungi sezione top patterns
    total_sessions_this_week = len(existing_sessions) + 1
    if total_sessions_this_week >= 3:
        # Ricalcola top 3 leggendo tutto il file
        _append_weekly_summary(weekly_path)


def _append_weekly_summary(weekly_path: Path) -> None:
    """Appende sezione top-3 pattern + suggested feedback rules."""
    try:
        # Parse tutte le entry dal file
        content = weekly_path.read_text(encoding="utf-8")
        pattern_totals: dict[str, int] = {}

        for line in content.splitlines():
            if "patterns trovati:" in line:
                try:
                    json_part = line.split("patterns trovati:")[1].strip()
                    counts = json.loads(json_part)
                    for k, v in counts.items():
                        pattern_totals[k] = pattern_totals.get(k, 0) + v
                except Exception:
                    pass

        if not pattern_totals:
            return

        top3 = sorted(pattern_totals.items(), key=lambda x: x[1], reverse=True)[:3]

        FEEDBACK_RULES = {
            "delegation_gap": (
                "Suggerisci memory feedback: 'Prima di chain ≥5 tool_use diretti, "
                "valuta vos-auto-router per sub-task indipendenti.'"
            ),
            "search_loop": (
                "Suggerisci memory feedback: 'Dopo ogni WebSearch, salvare risultato "
                "in note prima di continuare — evita ricerche duplicate.'"
            ),
            "edit_revert": (
                "Suggerisci memory feedback: 'Pianifica la modifica (scrivi intento) "
                "prima di Edit — riduce revert.'"
            ),
            "context_pollution": (
                "Suggerisci memory feedback: 'Read file una sola volta per sessione, "
                "poi opera su contenuto in memoria — usa offset per file grandi.'"
            ),
            "blind_execution": (
                "Suggerisci memory feedback: 'Verifica exit code Bash prima del "
                "passo successivo — usa dry-run e --check flags.'"
            ),
        }

        summary = "\n\n---\n## TOP PATTERN QUESTA SETTIMANA\n\n"
        for i, (pattern, count) in enumerate(top3, 1):
            rule = FEEDBACK_RULES.get(pattern, "Nessun suggerimento specifico.")
            summary += f"{i}. **{pattern}** ({count} occorrenze)\n   {rule}\n\n"

        summary += (
            "_Rivedere con Luke ogni lunedi per aggiornare feedback memories._\n"
        )

        with open(weekly_path, "a", encoding="utf-8") as fh:
            fh.write(summary)

    except Exception as exc:
        sys.stderr.write(f"[cc-meta-monitor] WARN weekly summary failed: {exc}\n")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def run_analysis(session_path: Optional[Path] = None) -> dict:
    """
    Core analysis. Ritorna dict report.
    Se session_path è None, usa l'ultima sessione VOS.
    """
    if session_path is None:
        session_path = find_latest_session()
        if session_path is None:
            return {"error": "nessuna sessione trovata", "ts": _now_iso()}

    session_id = session_path.stem

    sys.stderr.write(
        f"[cc-meta-monitor] Analisi sessione: {session_id} "
        f"({session_path.stat().st_size // 1024}KB)\n"
    )

    turns = parse_turns(session_path)
    total_turns = len(turns)

    if total_turns == 0:
        return {
            "session_id": session_id,
            "ts": _now_iso(),
            "error": "nessun turn parseable",
            "total_turns_analyzed": 0,
            "score": 100,
            "anti_patterns": [],
        }

    # Esegui tutte le detection rules (fail-soft per ognuna)
    all_findings = []

    for rule_fn in [
        detect_delegation_gap,
        detect_search_loop,
        detect_edit_revert,
        detect_context_pollution,
        detect_blind_execution,
    ]:
        try:
            results = rule_fn(turns)
            all_findings.extend(results)
        except Exception as exc:
            sys.stderr.write(
                f"[cc-meta-monitor] WARN rule {rule_fn.__name__} failed: {exc}\n"
            )

    score = calculate_score(all_findings)

    report = {
        "ts": _now_iso(),
        "session_id": session_id,
        "session_path": str(session_path),
        "total_turns_analyzed": total_turns,
        "score": score,
        "anti_patterns": all_findings,
        "partial_session": False,
    }

    # Persisti findings
    if all_findings:
        for finding in all_findings:
            entry = {
                "ts": _now_iso(),
                "session_id": session_id,
                "pattern_type": finding["type"],
                "severity": finding["severity"],
                "evidence": {
                    "turns": finding.get("evidence_turns", []),
                    "details": {
                        k: v for k, v in finding.items()
                        if k not in ("type", "severity", "evidence_turns")
                    },
                },
            }
            append_jsonl(CC_PATTERNS_LOG, entry)

        # Alert per HIGH
        write_alert(session_id, all_findings)

    # Weekly report
    try:
        update_weekly_report(session_id, all_findings)
    except Exception as exc:
        sys.stderr.write(f"[cc-meta-monitor] WARN weekly update failed: {exc}\n")

    return report


def main() -> int:
    # Mount check T7 (vincolo S181)
    if not _t7_mounted():
        sys.stderr.write(
            f"[cc-meta-monitor] ERROR: T7 non montato a {T7_MOUNT}. "
            "Connetti SSD T7 prima di eseguire.\n"
        )
        return 1

    # Argomento opzionale: path sessione specifica
    session_path = None
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        if arg == "--test-fixture":
            # Modalità test: leggi fixture da stdin o sys.argv[2]
            if len(sys.argv) > 2:
                session_path = Path(sys.argv[2])
            else:
                sys.stderr.write("Usage: monitor.py --test-fixture <path.jsonl>\n")
                return 1
        else:
            session_path = Path(arg)

    report = run_analysis(session_path)
    print(json.dumps(report, indent=2, ensure_ascii=False))

    # Exit code: 0=ok, 2=HIGH patterns found (per uso da LaunchAgent/hook)
    has_high = any(
        f.get("severity") == "high"
        for f in report.get("anti_patterns", [])
    )
    return 2 if has_high else 0


if __name__ == "__main__":
    sys.exit(main())
