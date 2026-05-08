# project-scanner v0 — discovery read-only dei progetti attivi VOS.
# Output: state/projects-inventory.yaml (sintesi macchina-leggibile) + wiki/projects/<NAME>/index.md (stub umano).
# Mai scrittura su filesystem progetti host. Mai INSERT/UPDATE/DELETE su loro DB.
"""project-scanner v0 — Sessione 1 MVP Venture OS.

Legge config/projects-whitelist.yaml e config/handoff-debt-config.yaml,
verifica esistenza path, conta CLAUDE.md, lista DB (.sqlite/.duckdb),
somma handoff debt per pattern per-progetto, scrive inventory + stub markdown.
"""
from __future__ import annotations

import glob
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# Import shared mount check
VOS_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(VOS_ROOT / "components"))
from _shared.mount_check import require_t7_or_exit  # noqa: E402

import yaml  # noqa: E402

CONFIG_DIR = VOS_ROOT / "config"
STATE_DIR = VOS_ROOT / "state"
WIKI_DIR = VOS_ROOT / "wiki" / "projects"
WHITELIST = CONFIG_DIR / "projects-whitelist.yaml"
DEBT_CONFIG = CONFIG_DIR / "handoff-debt-config.yaml"
DB_EXTENSIONS = (".sqlite", ".sqlite3", ".db", ".duckdb")


def expand(p: str) -> Path:
    return Path(os.path.expanduser(p)).resolve()


def count_handoff_debt(root: Path, patterns: list[str]) -> tuple[int, int]:
    """Ritorna (righe_totali, file_count) sommando i match dei pattern dentro root."""
    if not root.exists():
        return 0, 0
    total_lines = 0
    file_count = 0
    seen: set[Path] = set()
    for pat in patterns:
        for match in glob.glob(str(root / pat), recursive=True):
            mp = Path(match)
            if mp in seen or not mp.is_file():
                continue
            seen.add(mp)
            try:
                with open(mp, "r", encoding="utf-8", errors="ignore") as f:
                    total_lines += sum(1 for _ in f)
                file_count += 1
            except OSError:
                continue
    return total_lines, file_count


def find_db_files(root: Path, max_depth: int = 4) -> list[str]:
    """Lista file DB (sqlite/duckdb) sotto root, max_depth livelli."""
    if not root.exists():
        return []
    found = []
    root_parts = len(root.parts)
    for dirpath, dirnames, filenames in os.walk(root):
        depth = len(Path(dirpath).parts) - root_parts
        if depth > max_depth:
            dirnames[:] = []
            continue
        # Skip dirs noisy/heavy
        dirnames[:] = [
            d for d in dirnames
            if d not in (".git", "node_modules", "venv", ".venv", "__pycache__",
                         "target", "dist", "build", ".cache")
        ]
        for fn in filenames:
            if fn.endswith(DB_EXTENSIONS):
                found.append(str(Path(dirpath) / fn))
    return sorted(found)


def last_modified_iso(root: Path) -> str | None:
    if not root.exists():
        return None
    try:
        ts = root.stat().st_mtime
        return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()
    except OSError:
        return None


def write_stub(name: str, info: dict) -> None:
    out_dir = WIKI_DIR / name
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / "index.md"
    debt = info["handoff_debt_lines"]
    threshold = info.get("handoff_threshold", 2000)
    debt_status = "OK" if debt < threshold else "compilation raccomandata"
    db_list = "\n".join(f"- `{p}`" for p in info["db_files"]) or "_nessuno trovato_"
    content = f"""# Progetto: {name}

> Stub generato da `project-scanner` Sessione 1 MVP. Solo discovery read-only.

- **Path**: `{info['path']}`
- **Stack**: {info['stack']}
- **Esiste**: {info['exists']}
- **CLAUDE.md presente**: {info['has_claude_md']}
- **Ultimo mtime root**: {info['last_modified'] or 'N/D'}
- **Handoff debt**: {debt} righe su {info['handoff_files']} file (soglia {threshold}) → {debt_status}

## DB rilevati

{db_list}

---
_File rigenerato a ogni esecuzione di scanner.py — non modificare a mano._
"""
    out_file.write_text(content, encoding="utf-8")


def main() -> int:
    require_t7_or_exit("project-scanner")
    if not WHITELIST.exists():
        print(f"ERROR: whitelist mancante: {WHITELIST}", file=sys.stderr)
        return 2
    if not DEBT_CONFIG.exists():
        print(f"ERROR: debt config mancante: {DEBT_CONFIG}", file=sys.stderr)
        return 2

    whitelist = yaml.safe_load(WHITELIST.read_text())
    debt_cfg = yaml.safe_load(DEBT_CONFIG.read_text())
    debt_projects = debt_cfg.get("projects", {})

    inventory = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "scanner_version": "v0",
        "projects": {},
    }

    for entry in whitelist.get("active_projects", []):
        name = entry["name"]
        raw_path = entry["path"]
        root = expand(raw_path)
        exists = root.exists()
        has_claude_md = (root / "CLAUDE.md").is_file() if exists else False

        debt_entry = debt_projects.get(name, {})
        threshold = debt_entry.get("threshold_lines", 2000)
        patterns = debt_entry.get("patterns", [])
        debt_lines, debt_files = count_handoff_debt(root, patterns) if exists else (0, 0)

        info = {
            "path": str(root),
            "stack": entry.get("stack", "unknown"),
            "exists": exists,
            "has_claude_md": has_claude_md,
            "db_files": find_db_files(root) if exists else [],
            "handoff_debt_lines": debt_lines,
            "handoff_files": debt_files,
            "handoff_threshold": threshold,
            "last_modified": last_modified_iso(root),
        }
        inventory["projects"][name] = info
        write_stub(name, info)

    STATE_DIR.mkdir(parents=True, exist_ok=True)
    out = STATE_DIR / "projects-inventory.yaml"
    out.write_text(yaml.safe_dump(inventory, sort_keys=False, allow_unicode=True), encoding="utf-8")

    # Riepilogo italiano
    print(f"Discovery completata: {len(inventory['projects'])} progetti")
    for name, info in inventory["projects"].items():
        status = "✔" if info["exists"] else "✘ path mancante"
        print(
            f"  - {name}: {status} | CLAUDE.md={info['has_claude_md']} "
            f"| DB={len(info['db_files'])} | handoff={info['handoff_debt_lines']} righe"
            f" su {info['handoff_files']} file"
        )
    print(f"\nInventario: {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
