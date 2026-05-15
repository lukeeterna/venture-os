#!/usr/bin/env python3
# decision-validator — valida DECIDED entries in wiki/projects/*/DECISIONS.md
# Schema: ~/venture-os/templates/DECISION-entry.yaml. Output: state/decision-validation.jsonl
"""Uso: validate.py [--project=ARGOS|FLUXION|Guardian] [--quiet]
Exit: 0=ok, 1=malformed, 2=schema err, 3=io err."""

import json
import re
import sys
from datetime import date, datetime, timezone
from pathlib import Path

import yaml

_SHARED = Path(__file__).resolve().parent.parent / "_shared"
sys.path.insert(0, str(_SHARED))
from mount_check import require_t7_or_exit  # noqa: E402

require_t7_or_exit("decision-validator")

VOS_ROOT = Path("/Volumes/MontereyT7/venture-os")
SCHEMA_PATH = VOS_ROOT / "templates" / "DECISION-entry.yaml"
PROJECTS_DIR = VOS_ROOT / "wiki" / "projects"
OUTPUT_LOG = VOS_ROOT / "state" / "decision-validation.jsonl"
ERROR_LOG = VOS_ROOT / "state" / "errors.jsonl"
KNOWN_PROJECTS = ("ARGOS", "FLUXION", "Guardian")

EMOJI_PREFIX = re.compile(r"^[\W_]+", re.UNICODE)  # strip ⚠️ / ** / spazi iniziali


def _log_error(msg, exc=None):
    try:
        ERROR_LOG.parent.mkdir(parents=True, exist_ok=True)
        with open(ERROR_LOG, "a") as f:
            f.write(json.dumps({
                "ts": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "component": "decision-validator", "msg": msg,
                "error": repr(exc) if exc else None}) + "\n")
    except Exception:
        pass


def _load_schema():
    if not SCHEMA_PATH.exists():
        raise FileNotFoundError(f"schema mancante: {SCHEMA_PATH}")
    s = yaml.safe_load(SCHEMA_PATH.read_text()) or {}
    for k in ("header_regex", "required_fields", "status_enum", "field_patterns", "stale_days"):
        if k not in s:
            raise ValueError(f"schema invalid: `{k}` mancante")
    return s


def _split_entries(md):
    """Splitta su `## D-NN` (mantiene header, ritorna [(line_no, body), ...])."""
    out, current, start = [], [], 0
    for i, line in enumerate(md.splitlines(), start=1):
        if re.match(r"^##\s+D-\d{2,3}\s+—", line):
            if current:
                out.append((start, "\n".join(current)))
            current, start = [line], i
        elif current:
            current.append(line)
    if current:
        out.append((start, "\n".join(current)))
    return out


def _extract(pattern, body):
    m = re.search(pattern, body, re.MULTILINE)
    return m.group(1).strip() if m else None


def _normalize_status(raw):
    """Strip emoji/markdown prefix, estrai prima keyword status."""
    s = EMOJI_PREFIX.sub("", raw).strip()
    s = re.sub(r"^\*+\s*", "", s).strip()  # strip leading bold
    # Prima parola alfanumerica = status base (es. "DECIDED", "SUPERSEDED-by-D-12")
    m = re.match(r"([A-Z]+)(?:-\S*)?", s)
    return m.group(1) if m else s.split()[0] if s else None


def _parse_entry(start, body, schema):
    fp = schema["field_patterns"]
    e = {"_line": start, "errors": [], "warnings": []}

    head = re.match(schema["header_regex"], body.splitlines()[0])
    if not head:
        e["errors"].append("header malformato")
        return e
    e["id"], e["title"], e["decided_at"], e["session"] = head.groups()

    raw_status = _extract(fp["status"], body)
    if raw_status:
        sup_m = re.search(fp["supersedes_in_status"], raw_status)
        if sup_m:
            e["supersedes"] = sup_m.group(1)
        e["status"] = _normalize_status(raw_status)
        fi_m = re.search(fp["founder_input_in_status"], raw_status)
        if fi_m:
            e["founder_input"] = fi_m.group(1)

    for f in ("contesto", "decisione", "opzioni_considerate", "conseguenze", "ref"):
        v = _extract(fp[f], body)
        if v is not None:
            e[f] = v

    lr_m = re.search(fp["last_reviewed"], body)
    if lr_m:
        e["last_reviewed"] = lr_m.group(1)

    for req in schema["required_fields"]:
        if not e.get(req):
            e["errors"].append(f"required `{req}` mancante")
    if e.get("status") and e["status"] not in schema["status_enum"]:
        e["errors"].append(f"status `{e['status']}` fuori enum")

    # Date format: YYYY-MM-DD canonico, YYYY-MM legacy → warning
    if e.get("decided_at"):
        d = e["decided_at"]
        if re.fullmatch(r"\d{4}-\d{2}-\d{2}", d):
            try:
                datetime.strptime(d, "%Y-%m-%d")
            except ValueError:
                e["errors"].append(f"decided_at `{d}` invalid")
        elif re.fullmatch(r"\d{4}-\d{2}", d):
            e["warnings"].append(f"decided_at `{d}` legacy YYYY-MM (raccomandato YYYY-MM-DD)")
        else:
            e["errors"].append(f"decided_at `{d}` formato invalid")
    return e


def _is_stale(entry, schema, today):
    if entry.get("status") not in schema.get("stale_status_filter", ["DECIDED"]):
        return False
    ref = entry.get("last_reviewed") or entry.get("decided_at")
    if not ref:
        return False
    # Tollera YYYY-MM (assume giorno=01)
    if re.fullmatch(r"\d{4}-\d{2}", ref):
        ref = ref + "-01"
    try:
        ref_d = datetime.strptime(ref, "%Y-%m-%d").date()
    except ValueError:
        return False
    return (today - ref_d).days > schema["stale_days"]


def validate_project(project, schema, today):
    path = PROJECTS_DIR / project / "DECISIONS.md"
    rep = {"project": project, "path": str(path), "entries": 0, "ok": 0,
           "malformed": [], "warnings": [], "stale": [], "missing_file": False}
    if not path.exists():
        rep["missing_file"] = True
        return rep
    for start, body in _split_entries(path.read_text(encoding="utf-8")):
        e = _parse_entry(start, body, schema)
        rep["entries"] += 1
        if e["errors"]:
            rep["malformed"].append({"id": e.get("id", "?"), "line": start, "errors": e["errors"]})
        else:
            rep["ok"] += 1
        if e["warnings"]:
            rep["warnings"].append({"id": e.get("id", "?"), "line": start, "warnings": e["warnings"]})
        if _is_stale(e, schema, today):
            rep["stale"].append({"id": e["id"], "title": e["title"],
                                 "decided_at": e["decided_at"],
                                 "last_reviewed": e.get("last_reviewed")})
    return rep


def main(argv):
    quiet = "--quiet" in argv
    pf = next((a.split("=", 1)[1] for a in argv if a.startswith("--project=")), None)

    try:
        schema = _load_schema()
    except Exception as ex:
        _log_error("schema load fail", ex)
        print(f"schema error: {ex}", file=sys.stderr)
        return 2

    today = date.today()
    targets = [pf] if pf else list(KNOWN_PROJECTS)
    reports, fail = [], False
    for p in targets:
        try:
            r = validate_project(p, schema, today)
        except Exception as ex:
            _log_error(f"validate fail {p}", ex)
            print(f"io error {p}: {ex}", file=sys.stderr)
            return 3
        reports.append(r)
        if r["malformed"]:
            fail = True

    run = {"ts": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
           "date": today.isoformat(), "projects": reports,
           "verdict": "FAIL" if fail else "OK"}
    OUTPUT_LOG.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_LOG, "a") as f:
        f.write(json.dumps(run, ensure_ascii=False) + "\n")

    if not quiet:
        for r in reports:
            tag = "MISSING" if r["missing_file"] else f"{r['ok']}/{r['entries']} ok"
            ex = [f"{len(r[k])} {k}" for k in ("malformed", "warnings", "stale") if r[k]]
            print(f"[{r['project']}] {tag}" + (f" — {', '.join(ex)}" if ex else ""))
            for m in r["malformed"]:
                print(f"  ✗ {m['id']} L{m['line']}: {'; '.join(m['errors'])}")
        print(f"verdict: {run['verdict']}")
    return 1 if fail else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
