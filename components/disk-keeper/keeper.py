#!/usr/bin/env python3
# disk-keeper v0 — wrapper Python sopra du+rm controllato + Mole come tool interattivo a fianco.
# Legge whitelist a inclusione chiusa da config/disk-keeper-include.yaml e opera SOLO sui path elencati.
# Modalita: --dry-run (default, mostra) | --execute (chiede conferma esplicita prima di rimuovere).
# Audit log: state/disk-keeper-log.jsonl (timestamp, path, before, after, status).
# Vincolo blueprint 13bis.3: Mole 1.37 non espone --scope --> deviazione documentata.

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

# Path relativi alla root VOS (resi assoluti a runtime via parent walk).
VOS_ROOT = Path(__file__).resolve().parents[2]
WHITELIST_FILE = VOS_ROOT / "config" / "disk-keeper-include.yaml"
LOG_FILE = VOS_ROOT / "state" / "disk-keeper-log.jsonl"
ERRORS_FILE = VOS_ROOT / "state" / "errors.jsonl"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def log_audit(record: dict) -> None:
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def log_error(record: dict) -> None:
    ERRORS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with ERRORS_FILE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def parse_whitelist(path: Path) -> list[str]:
    """Parse YAML minimale senza dipendenze esterne.
    Formato atteso: chiave 'safe_to_clean' seguita da lista di path con prefisso '- '.
    """
    if not path.exists():
        sys.stderr.write(f"[disk-keeper] Whitelist mancante: {path}\n")
        sys.exit(2)
    in_block = False
    out: list[str] = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        s = raw.strip()
        if not s or s.startswith("#"):
            continue
        if s.startswith("safe_to_clean:"):
            in_block = True
            continue
        if in_block:
            if s.startswith("- "):
                out.append(s[2:].strip())
            elif raw and not raw.startswith((" ", "\t", "-")):
                # Nuova chiave top-level => fine blocco
                in_block = False
    return out


def expand(p: str) -> Path:
    return Path(os.path.expanduser(os.path.expandvars(p)))


def du_bytes(path: Path) -> int:
    """Ritorna byte usati dal path. 0 se path non esiste."""
    if not path.exists():
        return 0
    try:
        # -s: somma; -k: KB; output portabile macOS/Linux
        out = subprocess.check_output(["du", "-sk", str(path)], stderr=subprocess.DEVNULL)
        kb = int(out.split()[0])
        return kb * 1024
    except subprocess.CalledProcessError as e:
        log_error({"ts": now_iso(), "component": "disk-keeper", "path": str(path), "event": "du_failed", "rc": e.returncode})
        return 0


def fmt_size(n: int) -> str:
    units = ["B", "KB", "MB", "GB", "TB"]
    f = float(n)
    for u in units:
        if f < 1024 or u == units[-1]:
            return f"{f:.1f} {u}"
        f /= 1024
    return f"{n} B"


def df_root_pct() -> float | None:
    """Percentuale realmente occupata del pool APFS che ospita /.
    Su APFS i volumi condividono lo spazio: `df /` mostra solo il singolo volume e
    sottostima il pieno reale. Usiamo il volume Data che riflette il consumo utente.
    """
    target = "/System/Volumes/Data" if Path("/System/Volumes/Data").exists() else "/"
    try:
        out = subprocess.check_output(["df", "-P", target]).decode()
        # Filesystem  1024-blocks  Used  Available  Capacity  Mounted on
        line = out.splitlines()[1].split()
        cap = line[4].rstrip("%")
        return float(cap)
    except Exception as e:
        log_error({"ts": now_iso(), "component": "disk-keeper", "event": "df_failed", "msg": str(e)})
        return None


def analyze(paths: list[str]) -> list[dict]:
    rows = []
    for p in paths:
        ep = expand(p)
        exists = ep.exists()
        size = du_bytes(ep) if exists else 0
        rows.append({
            "path": str(ep),
            "raw": p,
            "exists": exists,
            "size_bytes": size,
            "size_human": fmt_size(size),
        })
    return rows


def print_table(rows: list[dict], total: int) -> None:
    print()
    print(f"{'STATO':<6}  {'DIMENSIONE':>10}  PATH")
    print(f"{'-' * 6}  {'-' * 10}  {'-' * 60}")
    for r in rows:
        stato = "OK" if r["exists"] else "MISS"
        print(f"{stato:<6}  {r['size_human']:>10}  {r['path']}")
    print(f"{'-' * 6}  {'-' * 10}")
    print(f"{'TOT':<6}  {fmt_size(total):>10}  liberabile dalla whitelist")
    print()


def clean_path(path: Path) -> tuple[bool, int, int]:
    """Rimuove ricorsivamente il contenuto di `path` ma non la dir stessa.
    Per .Trash usa la stessa logica (svuotamento contenuto).
    Ritorna (success, before_bytes, after_bytes).
    """
    before = du_bytes(path)
    if not path.exists():
        return True, 0, 0
    try:
        for entry in path.iterdir():
            if entry.is_symlink() or entry.is_file():
                entry.unlink(missing_ok=True)
            elif entry.is_dir():
                shutil.rmtree(entry, ignore_errors=True)
        after = du_bytes(path)
        return True, before, after
    except Exception as e:
        log_error({"ts": now_iso(), "component": "disk-keeper", "path": str(path), "event": "clean_failed", "msg": str(e)})
        return False, before, du_bytes(path)


def execute(rows: list[dict], approved: set[str] | None = None) -> None:
    print()
    print("Esecuzione cleanup sui path approvati:")
    for r in rows:
        if not r["exists"] or r["size_bytes"] == 0:
            continue
        if approved is not None and r["raw"] not in approved and r["path"] not in approved:
            print(f"SKIP  {r['path']}")
            continue
        ok, before, after = clean_path(Path(r["path"]))
        delta = before - after
        status = "OK" if ok else "FAIL"
        print(f"{status}  liberato {fmt_size(delta)}  ({fmt_size(before)} -> {fmt_size(after)})  {r['path']}")
        log_audit({
            "ts": now_iso(),
            "component": "disk-keeper",
            "event": "clean",
            "path": r["path"],
            "before_bytes": before,
            "after_bytes": after,
            "freed_bytes": delta,
            "status": status,
        })


def main() -> int:
    # Mount check obbligatorio (re-import evita dipendenze circolari su prima esecuzione).
    try:
        sys.path.insert(0, str(VOS_ROOT / "components" / "_shared"))
        from mount_check import require_t7_or_exit  # type: ignore
        require_t7_or_exit("disk-keeper")
    except ModuleNotFoundError:
        # Sessione 1: mount_check creato al Task 9. Tollerato in dry-run, hard-fail in execute.
        if "--execute" in sys.argv:
            sys.stderr.write("[disk-keeper] mount_check non disponibile, --execute bloccato.\n")
            return 3

    ap = argparse.ArgumentParser(description="disk-keeper v0 — cleanup whitelist a inclusione chiusa.")
    ap.add_argument("--dry-run", action="store_true", help="Solo analisi (default).")
    ap.add_argument("--execute", action="store_true", help="Esegue cleanup (richiede conferma esplicita).")
    ap.add_argument("--yes", action="store_true", help="Salta prompt interattivo (uso in script).")
    ap.add_argument("--only", action="append", default=[], help="Limita a uno o piu' path raw (ripetibile).")
    args = ap.parse_args()

    paths = parse_whitelist(WHITELIST_FILE)
    if args.only:
        paths = [p for p in paths if any(p == o or expand(p).as_posix() == expand(o).as_posix() for o in args.only)]
    rows = analyze(paths)
    total = sum(r["size_bytes"] for r in rows)
    print(f"\n[disk-keeper] Whitelist: {WHITELIST_FILE}")
    print(f"[disk-keeper] Path nella whitelist: {len(paths)}")
    pct = df_root_pct()
    if pct is not None:
        print(f"[disk-keeper] Disco / al {pct:.0f}% (target post-cleanup: <85%)")
    print_table(rows, total)

    log_audit({
        "ts": now_iso(),
        "component": "disk-keeper",
        "event": "analyze",
        "paths_count": len(rows),
        "total_bytes": total,
        "df_root_pct": pct,
    })

    if not args.execute:
        print("Modalita': dry-run. Per eseguire: keeper.py --execute")
        return 0

    if not args.yes:
        sys.stderr.write("\n[disk-keeper] Stai per ESEGUIRE cleanup. Conferma con Y maiuscola: ")
        sys.stderr.flush()
        try:
            ans = input().strip()
        except EOFError:
            ans = ""
        if ans != "Y":
            print("Annullato.")
            return 1

    execute(rows)
    pct2 = df_root_pct()
    if pct2 is not None:
        print(f"[disk-keeper] Disco / ora al {pct2:.0f}%")
    return 0


if __name__ == "__main__":
    sys.exit(main())
