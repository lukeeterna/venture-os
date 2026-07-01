#!/usr/bin/env bash
# test_advance_gate.sh — prova terminal-fact per vos_advance_gate.py (F3a, lettura B).
# Usa-e-getta: crea un VOS_REPO temporaneo (FIXTURE, NON dato reale), verifica
# gli exit-code reali del hook, poi rm -rf. Non tocca il repo reale ne' settings.json.
#
# Fatti terminali attesi:
#   1) advance con provenance stazione-corrente {{  -> BLOCK (exit 2)
#   2) advance con provenance compilata            -> PASS  (exit 0)
#   3) REGRESSION-GUARD: matcher becca `vos-factory-run advance` in 3 varianti di path
#   4) pass-through: `vos-factory-run status`      -> PASS  (exit 0)
set -u

HERE="$(cd "$(dirname "$0")" && pwd)"
HOOK="$HERE/vos_advance_gate.py"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "== VOS advance-gate — prova terminal-fact =="
echo "   dossier usato: FIXTURE (non dato reale) in $TMP"
echo "   hook: $HOOK"
echo

fail=0
assert_exit() {  # $1=atteso $2=reale $3=label
  if [ "$2" -eq "$1" ]; then
    echo "  PASS  [$3] exit=$2 (atteso $1)"
  else
    echo "  FAIL  [$3] exit=$2 (atteso $1)"
    fail=1
  fi
}

# --- FIXTURE dossier: stazione corrente S2, provenance ancora {{ -------------
mkdir -p "$TMP/ventures/fix_block"
cat > "$TMP/ventures/fix_block/venture-dossier.md" <<'EOF'
# venture-dossier — fix_block  (FIXTURE)

```yaml
run_id: fix_block
state: S2
verdict: null
```

## S2 — scocca (Demand validation) — GATE G1

- placeholder di lavoro

```yaml
provenance:
  tool: {{...}}
  ts: {{...}}
```
EOF

# --- FIXTURE dossier: stessa stazione S2 ma provenance COMPILATA -------------
mkdir -p "$TMP/ventures/fix_pass"
cat > "$TMP/ventures/fix_pass/venture-dossier.md" <<'EOF'
# venture-dossier — fix_pass  (FIXTURE)

```yaml
run_id: fix_pass
state: S2
verdict: null
```

## S2 — scocca (Demand validation) — GATE G1

- lavoro reale

```yaml
provenance:
  tool: Task(trend-researcher) + WebSearch
  sources: [https://example.com/evidence]
  ts: 2026-07-01T00:00:00Z
```
EOF

payload() {  # $1=command  -> stampa payload PreToolUse su stdout
  python3 - "$1" <<'PY'
import json,sys
print(json.dumps({"session_id":"test","tool_name":"Bash","tool_input":{"command":sys.argv[1]}}))
PY
}

run_hook() {  # $1=command -> ritorna exit-code del hook
  payload "$1" | VOS_REPO="$TMP" python3 "$HOOK" >/dev/null 2>&1
  echo $?
}

# 1) BLOCK: advance su stazione corrente con provenance {{
rc=$(run_hook "bin/vos-factory-run advance fix_block --to S3 --gate PASS --evidence http://x")
assert_exit 2 "$rc" "advance provenance-corrente {{  -> BLOCK"

# 2) PASS: advance su stazione corrente con provenance compilata
rc=$(run_hook "bin/vos-factory-run advance fix_pass --to S3 --gate PASS --evidence http://x")
assert_exit 0 "$rc" "advance provenance-corrente compilata -> PASS"

# 3) REGRESSION-GUARD: il matcher DEVE beccare `vos-factory-run advance` a
#    prescindere dal prefisso di path. Se il matcher si rompe (no-op silenzioso),
#    questi diventano exit 0 e il test FALLISCE qui.
rc=$(run_hook "./bin/vos-factory-run advance fix_block --to S3 --gate PASS --evidence http://x")
assert_exit 2 "$rc" "GUARD variante ./bin/ -> BLOCK"
rc=$(run_hook "python3 $TMP/bin/vos-factory-run advance fix_block --to S3 --gate PASS --evidence http://x")
assert_exit 2 "$rc" "GUARD variante path-assoluto -> BLOCK"
rc=$(run_hook "/usr/bin/env vos-factory-run advance fix_block --to S3 --gate KILL --evidence x")
assert_exit 2 "$rc" "GUARD variante env-prefix -> BLOCK"

# 4) pass-through: comandi che NON sono `advance` non vengono gaterati
rc=$(run_hook "vos-factory-run status fix_block")
assert_exit 0 "$rc" "status (non-advance) -> PASS"
rc=$(run_hook "echo advance vos-factory-run")   # parole presenti ma non e' un'invocazione advance
assert_exit 0 "$rc" "falso-positivo lessicale -> PASS"

echo
if [ "$fail" -eq 0 ]; then
  echo "RISULTATO: TUTTI I FATTI TERMINALI VERDI"
else
  echo "RISULTATO: FALLITO (vedi FAIL sopra)"
fi
exit "$fail"
