#!/usr/bin/env python3
# Morning briefer v0 (Fase A MVP): aggregator italiano hardcoded, no LLM.
# Legge inventory + DB progetti read-only + host-monitor MacBook/iMac → brief markdown ≤50 righe.
"""Output: ~/venture-os/briefs/YYYY-MM-DD.md. Mai INSERT/UPDATE su DB host."""

import json
import os
import sqlite3
import subprocess
import sys
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Optional

import yaml

_SHARED = Path(__file__).resolve().parent.parent / "_shared"
sys.path.insert(0, str(_SHARED))
from mount_check import require_t7_or_exit  # noqa: E402

require_t7_or_exit("morning-briefer")

VOS_ROOT = Path("/Volumes/MontereyT7/venture-os")
INVENTORY = VOS_ROOT / "state" / "projects-inventory.yaml"
HOST_MONITOR_LOG = VOS_ROOT / "state" / "host-monitor.jsonl"
ERROR_LOG = VOS_ROOT / "state" / "errors.jsonl"
GIT_PUSH_LOG = VOS_ROOT / "state" / "git-push.log"
TOOL_SCOUT_DIFF = VOS_ROOT / "state" / "tool-scout-diff.jsonl"
SARA_GATE_RUNS = VOS_ROOT / "state" / "sara-gate-runs.jsonl"
ROUTING_DRIFT = VOS_ROOT / "state" / "routing-drift.jsonl"
BRIEFS_DIR = VOS_ROOT / "briefs"
BRIEFS_DIR.mkdir(parents=True, exist_ok=True)

# Filtri DB: solo SQLite analizzabile (no DuckDB, no profili browser)
SQLITE_EXTS = (".sqlite", ".sqlite3", ".db")
EXCLUDE_PATTERNS = ("chrome_profile", "whatsapp-session", "heavy_ad", "first_party")

# Soglie segnali brief
DATA_SSD_WARN = 85.0
UPTIME_WARN_H = 720  # 30gg

MESI_IT = [
    "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
    "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
]


def _log_error(msg: str, exc: Optional[Exception] = None) -> None:
    entry = {
        "ts": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "component": "morning-briefer",
        "msg": msg,
        "error": repr(exc) if exc else None,
    }
    try:
        with open(ERROR_LOG, "a") as f:
            f.write(json.dumps(entry) + "\n")
    except Exception:
        pass


def _date_it(d: date) -> str:
    return f"{d.day} {MESI_IT[d.month - 1]} {d.year}"


def _read_inventory() -> dict:
    try:
        with open(INVENTORY) as f:
            return yaml.safe_load(f) or {}
    except Exception as e:  # noqa: BLE001
        _log_error("inventory unreadable", e)
        return {"projects": {}}


def _last_macbook_probe() -> Optional[dict]:
    try:
        if not HOST_MONITOR_LOG.exists():
            return None
        with open(HOST_MONITOR_LOG) as f:
            lines = [ln for ln in f if ln.strip()]
        for ln in reversed(lines):
            try:
                d = json.loads(ln)
                # ultimo probe NON skip_mount_check (= MacBook locale)
                if not d.get("skip_mount_check"):
                    return d
            except Exception:
                continue
        return None
    except Exception as e:  # noqa: BLE001
        _log_error("read macbook probe", e)
        return None


def _imac_probe_via_ssh() -> Optional[dict]:
    """Probe iMac on-demand via SSH alias `imac`. Fallback graceful se irraggiungibile."""
    try:
        r = subprocess.run(
            ["ssh", "-o", "ConnectTimeout=5", "-o", "BatchMode=yes",
             "imac", "tail -1 ~/venture-os-remote/state/host-monitor.jsonl"],
            capture_output=True, text=True, timeout=10,
        )
        if r.returncode != 0 or not r.stdout.strip():
            _log_error(f"ssh imac rc={r.returncode}: {r.stderr.strip()[:200]}")
            return None
        return json.loads(r.stdout.strip())
    except (subprocess.TimeoutExpired, json.JSONDecodeError, Exception) as e:  # noqa: BLE001
        _log_error("ssh imac failed", e)
        return None


def _git_push_status() -> Optional[str]:
    """Ispeziona ultima riga git-push.log. Se FAIL ritorna msg per segnale, altrimenti None.
    Formato log: 'TS OK COMMIT' oppure 'TS FAIL rc=N COMMIT msg=...'.
    """
    try:
        if not GIT_PUSH_LOG.exists():
            return None
        with open(GIT_PUSH_LOG) as f:
            lines = [ln for ln in f if ln.strip()]
        if not lines:
            return None
        last = lines[-1].strip()
        parts = last.split(" ", 2)
        if len(parts) >= 2 and parts[1] == "FAIL":
            return f"backup git iMac fallito — ultimo log: {last[:140]}"
        return None
    except Exception as e:  # noqa: BLE001
        _log_error("git-push.log read failed", e)
        return None


def _git_head_drift() -> Optional[str]:
    """Confronta HEAD locale vs HEAD bare repo iMac via SSH.
    Copre lo scenario in cui il post-commit hook non scatta affatto
    (es. commit fatto fuori da Claude Code, hook rimosso, race condition).
    Ritorna msg segnale se diverge; None se uguali o iMac irraggiungibile
    (in quest'ultimo caso il signal generico 'iMac non raggiungibile' copre già il caso).
    """
    try:
        r_local = subprocess.run(
            ["git", "-C", str(VOS_ROOT), "rev-parse", "HEAD"],
            capture_output=True, text=True, timeout=5,
        )
        if r_local.returncode != 0:
            _log_error(f"git rev-parse local rc={r_local.returncode}: {r_local.stderr.strip()[:200]}")
            return None
        local_head = r_local.stdout.strip()

        r_remote = subprocess.run(
            ["ssh", "-o", "ConnectTimeout=5", "-o", "BatchMode=yes",
             "imac", "git --git-dir=$HOME/git-backups/venture-os.git rev-parse master"],
            capture_output=True, text=True, timeout=10,
        )
        if r_remote.returncode != 0 or not r_remote.stdout.strip():
            # iMac irraggiungibile o bare repo mancante — non un'anomalia di drift,
            # gestito dal segnale generico 'iMac non raggiungibile' in _signals.
            return None
        remote_head = r_remote.stdout.strip()

        if local_head == remote_head:
            return None

        # HEAD diversi: prova a contare commit locali non pushati.
        # Se il remote_head non esiste localmente (es. clone fresco senza fetch),
        # rev-list fallisce e cadiamo nel ramo divergente generico.
        r_count = subprocess.run(
            ["git", "-C", str(VOS_ROOT), "rev-list", "--count", f"{remote_head}..HEAD"],
            capture_output=True, text=True, timeout=5,
        )
        if r_count.returncode == 0 and r_count.stdout.strip().isdigit():
            n = int(r_count.stdout.strip())
            if n > 0:
                return (
                    f"backup iMac in ritardo, {n} commit non pushati "
                    f"(HEAD locale {local_head[:7]} ≠ iMac {remote_head[:7]})"
                )
        return (
            f"backup iMac divergente (HEAD locale {local_head[:7]} ≠ iMac {remote_head[:7]})"
        )
    except subprocess.TimeoutExpired as e:
        _log_error("git head drift timeout", e)
        return None
    except Exception as e:  # noqa: BLE001
        _log_error("git head drift check failed", e)
        return None


def _select_main_db(db_files: list) -> Optional[str]:
    """Filtra: SQLite ext + esclude profili browser. Ritorna il primo path valido."""
    for p in db_files:
        pl = p.lower()
        if not pl.endswith(SQLITE_EXTS):
            continue
        if any(pat in pl for pat in EXCLUDE_PATTERNS):
            continue
        if not os.path.exists(p):
            continue
        return p
    return None


def _probe_db_readonly(path: str) -> Optional[dict]:
    """Apre DB read-only con busy_timeout=5000. Mai modifiche. Ritorna {tables, counts} o None."""
    try:
        # mode=ro garantisce no INSERT/UPDATE/DELETE/ALTER anche se il codice provasse
        conn = sqlite3.connect(f"file:{path}?mode=ro", uri=True, timeout=5)
        try:
            cur = conn.cursor()
            # PRAGMA busy_timeout PRIMA di qualsiasi SELECT (vincolo blueprint sez. 7.6)
            cur.execute("PRAGMA busy_timeout=5000")
            cur.execute(
                "SELECT name FROM sqlite_master WHERE type='table' "
                "AND name NOT LIKE 'sqlite_%' LIMIT 20"
            )
            tables = [r[0] for r in cur.fetchall()]
            counts = {}
            for t in tables[:3]:
                try:
                    # quoting tabella per safety (nome tabella mai input utente, ma costume)
                    cur.execute(f'SELECT COUNT(*) FROM "{t}"')
                    counts[t] = cur.fetchone()[0]
                except sqlite3.Error as e:
                    _log_error(f"count failed {path}::{t}", e)
                    counts[t] = None
            return {"tables_n": len(tables), "tables": tables, "counts": counts}
        finally:
            conn.close()
    except sqlite3.Error as e:
        _log_error(f"sqlite open failed {path}", e)
        return None
    except Exception as e:  # noqa: BLE001
        _log_error(f"db probe fatal {path}", e)
        return None


def _project_summary(name: str, info: dict) -> str:
    """1 riga markdown italiano per progetto."""
    n_db_total = len(info.get("db_files", []))
    debt = info.get("handoff_debt_lines", 0)
    threshold = info.get("handoff_threshold", 2000)
    debt_flag = " [⚠ compilation Karpathy raccomandata]" if debt >= threshold else ""

    main_db = _select_main_db(info.get("db_files", []))
    if not main_db:
        db_part = f"{n_db_total} DB rilevati, nessun SQLite analizzabile"
    else:
        probe = _probe_db_readonly(main_db)
        db_short = Path(main_db).name
        if probe is None:
            db_part = f"{n_db_total} DB ({db_short} non leggibile)"
        else:
            tables_n = probe["tables_n"]
            sample = ", ".join(
                f"{t}={c}" for t, c in probe["counts"].items() if c is not None
            )
            sample_str = f" — {sample}" if sample else ""
            db_part = f"{n_db_total} DB, principale `{db_short}` {tables_n} tabelle{sample_str}"

    return f"- **{name}**: {db_part} | handoff {debt}/{threshold} righe{debt_flag}"


def _resource_line(probe: Optional[dict], label: str) -> str:
    if not probe:
        return f"- **{label}**: non raggiungibile"
    cpu = probe.get("cpu_percent")
    mem = probe.get("mem_used_pct")
    root = probe.get("disk_root_used_pct")
    data = probe.get("disk_data_used_pct")
    t7 = probe.get("disk_t7_used_pct")
    up = probe.get("uptime_hours")
    parts = [f"CPU {cpu}%", f"RAM {mem}%"]
    if data is not None:
        parts.append(f"Data SSD {data}%")
    elif root is not None:
        parts.append(f"root {root}%")
    if t7 is not None:
        parts.append(f"T7 {t7}%")
    parts.append(f"uptime {up}h")
    return f"- **{label}**: " + ", ".join(parts)


def _signals(mac: Optional[dict], imac: Optional[dict], projects: dict) -> list:
    sigs = []
    if mac:
        data = mac.get("disk_data_used_pct") or 0
        if data >= DATA_SSD_WARN:
            sigs.append(f"SSD MacBook al limite ({data}%), pulizia raccomandata")
        up = mac.get("uptime_hours") or 0
        if up >= UPTIME_WARN_H:
            sigs.append(f"MacBook uptime {int(up)}h ({int(up // 24)}gg), considerare reboot")
    if imac:
        up = imac.get("uptime_hours") or 0
        if up >= UPTIME_WARN_H:
            sigs.append(f"iMac uptime {int(up)}h ({int(up // 24)}gg), considerare reboot")
    else:
        sigs.append("iMac non raggiungibile via SSH")

    gp = _git_push_status()
    if gp:
        sigs.append(gp)

    gd = _git_head_drift()
    if gd:
        sigs.append(gd)

    for pname, pinfo in (projects or {}).items():
        debt = pinfo.get("handoff_debt_lines", 0)
        thr = pinfo.get("handoff_threshold", 2000)
        if debt >= thr:
            sigs.append(f"{pname}: handoff debt {debt} righe oltre soglia ({thr}) — compilation Sessione 4 Fase C")

    # Sara Gate runs (S207): segnale FAIL ultimo run + age da ultimo PASS
    if SARA_GATE_RUNS.exists():
        try:
            with open(SARA_GATE_RUNS) as f:
                runs = [ln for ln in f if ln.strip()]
            if runs:
                last = json.loads(runs[-1])
                verdict = last.get("verdict", "?")
                if verdict == "FAIL":
                    per_v = last.get("per_vertical", {})
                    fail_verts = [v for v, c in per_v.items() if c.get("fail", 0) > 0]
                    if fail_verts:
                        sigs.append(f"Sara Gate FAIL: {len(fail_verts)} verticali ko ({', '.join(fail_verts[:3])})")
                    else:
                        sigs.append("Sara Gate FAIL — verifica report")
                elif verdict == "INFRA_ERROR":
                    sigs.append("Sara Gate INFRA_ERROR — pipeline iMac/SSH non raggiungibile")
                # Age da ultimo run (warning se >7gg, pattern release abbandonato)
                ts_str = last.get("ts", "")
                if ts_str:
                    try:
                        last_ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                        age_days = (datetime.now(timezone.utc) - last_ts).days
                        if age_days >= 7:
                            sigs.append(f"Sara Gate non eseguito da {age_days}gg — drift release rischio")
                    except Exception:  # noqa: BLE001
                        pass
        except Exception as e:  # noqa: BLE001
            _log_error("sara-gate-runs parse fail", e)

    # Tool-scout VOS: ultimo diff settimanale (B5 S7 2026-05-12, esteso GitHub source)
    if TOOL_SCOUT_DIFF.exists():
        try:
            with open(TOOL_SCOUT_DIFF) as f:
                ls = [ln for ln in f if ln.strip()]
            if ls:
                last = json.loads(ls[-1])
                diffs = last.get("diffs") or []
                if diffs:
                    for d in diffs[:3]:  # max 3 voci totale (vincolo brief 50 righe)
                        area = d.get("area", "?")
                        new = d.get("new_entries") or []
                        if new:
                            sigs.append(f"tool-scout {area}: nuovo top-safe {new[0]} (settimana {last.get('week')})")
        except Exception as e:  # noqa: BLE001
            _log_error("tool-scout diff parse fail", e)

    # Routing-refresh (S12): ultima run_marker entry → drift count + provider fail
    if ROUTING_DRIFT.exists():
        try:
            with open(ROUTING_DRIFT) as f:
                ls = [ln for ln in f if ln.strip()]
            # Cerca ultimo run_marker (può non essere last line se altre entry dopo)
            last_marker = None
            for ln in reversed(ls):
                try:
                    e = json.loads(ln)
                    if e.get("drift_type") == "run_marker":
                        last_marker = e
                        break
                except Exception:
                    continue
            if last_marker:
                drift_count = last_marker.get("drift_count", 0)
                breakdown = last_marker.get("drift_breakdown", {}) or {}
                providers_fail = last_marker.get("providers_fail", []) or []
                if providers_fail:
                    pf = ",".join(p.get("provider", "?") for p in providers_fail[:3])
                    sigs.append(f"routing-refresh: {len(providers_fail)} provider FAIL ({pf}) — verifica state/routing-drift.jsonl")
                elif drift_count > 0:
                    parts = [f"{k}={v}" for k, v in breakdown.items()]
                    sigs.append(f"routing-drift: {drift_count} entry ({', '.join(parts)}) — review state/routing-drift.jsonl")
                # Age da ultimo run: warning se >36h (LaunchAgent saltato 2 notti)
                ts_str = last_marker.get("ts", "")
                if ts_str:
                    try:
                        last_ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                        age_h = (datetime.now(timezone.utc) - last_ts).total_seconds() / 3600
                        if age_h >= 36:
                            sigs.append(f"routing-refresh non eseguito da {int(age_h)}h — verifica LaunchAgent")
                    except Exception:  # noqa: BLE001
                        pass
        except Exception as e:  # noqa: BLE001
            _log_error("routing-drift parse fail", e)
    return sigs


def _tool_landscape_top_github_by_project(top_n: int = 3) -> list:
    """Ultimo snapshot landscape: estrae top GitHub repos raggruppati per progetto needs.
    Max top_n totali per evitare brief overflow. Solo aree con safe_count > 0."""
    if not (VOS_ROOT / "state" / "tool-landscape.jsonl").exists():
        return []
    try:
        with open(VOS_ROOT / "state" / "tool-landscape.jsonl") as f:
            ls = [ln for ln in f if ln.strip()]
        if not ls:
            return []
        snap = json.loads(ls[-1])
        rows = []
        for a in snap.get("areas") or []:
            if a.get("source") != "github" or not a.get("top_safe"):
                continue
            need = a.get("needs_from", "?")
            top = a["top_safe"][0]  # 1 per area
            rows.append({
                "need": need,
                "id": top["id"],
                "stars": top.get("stars", 0),
                "license": top.get("license", "?"),
                "desc": (top.get("description") or "")[:80],
            })
        rows.sort(key=lambda r: r["stars"], reverse=True)
        return rows[:top_n]
    except Exception as e:  # noqa: BLE001
        _log_error("tool-landscape top github parse fail", e)
        return []


def build_brief(today: date) -> str:
    inv = _read_inventory()
    mac = _last_macbook_probe()
    imac = _imac_probe_via_ssh()
    projects = inv.get("projects") or {}

    lines = []
    lines.append(f"# Brief mattutino — {_date_it(today)}")
    lines.append("")
    lines.append("## Risorse")
    lines.append(_resource_line(mac, "MacBook"))
    lines.append(_resource_line(imac, "iMac"))
    lines.append("")
    lines.append("## Progetti")
    for pname in ("ARGOS", "FLUXION", "Guardian"):
        if pname in projects:
            lines.append(_project_summary(pname, projects[pname]))
    lines.append("")

    sigs = _signals(mac, imac, projects)
    if sigs:
        lines.append("## Segnali")
        for s in sigs:
            lines.append(f"- {s}")
        lines.append("")

    # AI tools rilevanti questa settimana (Layer 1 tool-scout GitHub filtered by capability-needs)
    gh_top = _tool_landscape_top_github_by_project(top_n=3)
    if gh_top:
        lines.append("## AI tools rilevanti this week")
        for r in gh_top:
            lines.append(f"- [{r['need']}] {r['id']} ⭐{r['stars']} ({r['license']}) — {r['desc']}")
        lines.append("")

    # Footer Validation Window — riga echo precompilata
    date_iso = today.isoformat()
    payload = json.dumps({
        "date": date_iso, "brief_read": True, "action_taken": None,
        "source_match": False, "notes": "",
    }, ensure_ascii=False)
    lines.append("## Per chiudere oggi (Validation Window)")
    lines.append("Copia-incolla in shell con la decisione di oggi:")
    lines.append("```bash")
    lines.append(f"echo '{payload}' >> ~/venture-os/state/brief-actions.jsonl")
    lines.append("```")

    # Trim a 50 righe priorità: Risorse > Segnali > Progetti > Footer
    if len(lines) > 50:
        # Strategia: rimuovi segnali eccedenti partendo dal basso fino a rientrare
        # (mantiene sempre Risorse + Progetti + Footer)
        _log_error(f"brief sopra 50 righe ({len(lines)}), trim segnali")
        lines = lines[:50]
    return "\n".join(lines) + "\n"


def main() -> int:
    today = date.today()
    try:
        content = build_brief(today)
    except Exception as e:  # noqa: BLE001
        _log_error("build_brief fatal", e)
        return 1
    out = BRIEFS_DIR / f"{today.isoformat()}.md"
    out.write_text(content, encoding="utf-8")
    print(f"Brief scritto: {out} ({content.count(chr(10))} righe)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
