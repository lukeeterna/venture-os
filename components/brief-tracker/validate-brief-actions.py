#!/usr/bin/env python3
# Validator schema brief-actions.jsonl (Fase B Validation Window).
# Schema blueprint sez. 11: date, brief_read, action_taken, source_match, notes.
"""Exit 0 se zero righe rifiutate, exit 1 altrimenti. Idempotente: crea file vuoto se manca."""

import json
import re
import sys
from pathlib import Path

JSONL = Path("/Volumes/MontereyT7/venture-os/state/brief-actions.jsonl")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

REQUIRED_FIELDS = {
    "date": str,
    "brief_read": bool,
    "action_taken": (str, type(None)),
    "source_match": bool,
    "notes": str,
}


def validate(line: str) -> tuple[bool, str]:
    try:
        d = json.loads(line)
    except json.JSONDecodeError as e:
        return False, f"JSON malformato: {e}"
    if not isinstance(d, dict):
        return False, "non oggetto"
    missing = [k for k in REQUIRED_FIELDS if k not in d]
    if missing:
        return False, f"campi mancanti: {missing}"
    for k, expected in REQUIRED_FIELDS.items():
        if not isinstance(d[k], expected):
            return False, f"campo {k!r} tipo errato (atteso {expected})"
    if not DATE_RE.match(d["date"]):
        return False, f"date non ISO YYYY-MM-DD: {d['date']!r}"
    return True, ""


def main() -> int:
    JSONL.parent.mkdir(parents=True, exist_ok=True)
    if not JSONL.exists():
        JSONL.touch()
        print(f"File creato (vuoto): {JSONL}")
        return 0

    valid = 0
    rejected = []
    with open(JSONL) as f:
        for i, line in enumerate(f, 1):
            stripped = line.strip()
            if not stripped:
                continue
            ok, reason = validate(stripped)
            if ok:
                valid += 1
            else:
                rejected.append((i, reason, stripped[:120]))

    print(f"Righe valide: {valid}")
    print(f"Righe rifiutate: {len(rejected)}")
    for ln, reason, content in rejected:
        print(f"  riga {ln}: {reason} | {content}")
    return 0 if not rejected else 1


if __name__ == "__main__":
    sys.exit(main())
