#!/usr/bin/env bash
# VOS Fabric A2 — Google Antigravity direct-official worker qualification.
# Run only inside an isolated VOS worker environment. No API-key or paid fallback.
set -euo pipefail

ACTION="${1:-preflight}"
say(){ printf '%s\n' "$*"; }
fail(){ say "A2_BLOCKED=$*"; exit 2; }

require_linux_x86_64(){ [ "$(uname -s)" = Linux ] || fail OS_NOT_LINUX; [ "$(uname -m)" = x86_64 ] || fail ARCH_NOT_X86_64; }
sha256_path(){ local p="$1"; [ -f "$p" ] && sha256sum "$p"|awk '{print $1}' || printf 'MISSING\n'; }
forbid_paid_api_environment(){ [ -z "${GEMINI_API_KEY:-}" ] || fail GEMINI_API_KEY_FORBIDDEN; [ -z "${GOOGLE_API_KEY:-}" ] || fail GOOGLE_API_KEY_FORBIDDEN; [ -z "${GOOGLE_GEMINI_BASE_URL:-}" ] || fail CUSTOM_GEMINI_BASE_URL_FORBIDDEN; }

require_zero_cost_account_profile(){
  forbid_paid_api_environment
  local settings="$HOME/.gemini/antigravity-cli/settings.json"
  [ -f "$settings" ] || fail ANTIGRAVITY_SETTINGS_REQUIRED
  python3 - "$settings" <<'PY' || exit 31
import json,sys
p=sys.argv[1]
try:
    with open(p,encoding='utf-8') as f:d=json.load(f)
except Exception as exc:
    print('A2_SETTINGS_INVALID='+type(exc).__name__); raise SystemExit(2)
if d.get('modelProvider')=='gemini': print('A2_BLOCKED=GEMINI_API_PROVIDER_FORBIDDEN'); raise SystemExit(2)
if d.get('useG1Credits') is not False: print('A2_BLOCKED=ANTIGRAVITY_CREDIT_FALLBACK_NOT_EXPLICITLY_DISABLED'); raise SystemExit(2)
PY
  say ANTIGRAVITY_CREDIT_FALLBACK=0
  say "ANTIGRAVITY_SETTINGS_SHA256=$(sha256sum "$settings"|awk '{print $1}')"
}

enforce_zero_cost_account_profile(){
  forbid_paid_api_environment
  local settings="$HOME/.gemini/antigravity-cli/settings.json"
  [ -f "$settings" ] || fail ANTIGRAVITY_SETTINGS_REQUIRED
  python3 - "$settings" <<'PY' || exit 31
import json,os,sys
p=sys.argv[1]
try:
    with open(p,encoding='utf-8') as f:d=json.load(f)
except Exception as exc:
    print('A2_SETTINGS_INVALID='+type(exc).__name__); raise SystemExit(2)
d.pop('modelProvider',None); d['useG1Credits']=False
q=p+'.vos-zero-cost.tmp'
with open(q,'w',encoding='utf-8') as f: json.dump(d,f,sort_keys=True,indent=2); f.write('\n')
os.chmod(q,0o600); os.replace(q,p)
PY
  require_zero_cost_account_profile >/dev/null
}

preflight(){
  require_linux_x86_64; require_zero_cost_account_profile
  command -v python3 >/dev/null || fail PYTHON3_MISSING
  command -v sha256sum >/dev/null || fail SHA256SUM_MISSING
  command -v timeout >/dev/null || fail TIMEOUT_MISSING
  command -v agy >/dev/null || fail AGY_MISSING
  local mem_kib free_kib
  mem_kib="$(awk '/MemTotal:/{print $2}' /proc/meminfo)"; free_kib="$(df -Pk /|awk 'NR==2{print $4}')"
  [ "${mem_kib:-0}" -ge 3500000 ] || fail RAM_LT_3_5_GIB
  [ "${free_kib:-0}" -ge 10485760 ] || fail ROOT_FREE_LT_10_GIB
  say A2_PREFLIGHT=GREEN; say "A2_OS=$(uname -sr)"; say "A2_ARCH=$(uname -m)"; say "A2_MEM_KIB=$mem_kib"; say "A2_ROOT_FREE_KIB=$free_kib"
}

agy_present(){ command -v agy >/dev/null || fail AGY_MISSING; agy --version; }
require_model(){
  local model="${VOS_AGY_MODEL:-}" models
  [ -n "$model" ] || fail VOS_AGY_MODEL_REQUIRED
  enforce_zero_cost_account_profile
  if ! models="$(agy models 2>/dev/null)"; then enforce_zero_cost_account_profile; fail MODEL_LIST_FAILED; fi
  enforce_zero_cost_account_profile
  printf '%s\n' "$models"|awk '{print $1}'|grep -Fx "$model" >/dev/null || fail REQUESTED_MODEL_NOT_AVAILABLE
}

classify_failure(){
  local events="$1" err="$2" haystack
  haystack="$(cat "$events" "$err" 2>/dev/null || true)"
  if printf '%s' "$haystack"|grep -Eqi 'quota|rate[ -]?limit|resource[_ -]?exhausted|out of credits|usage limit'; then say ANTIGRAVITY_QUOTA_STATE=BLOCKED_QUOTA; fail ANTIGRAVITY_QUOTA; fi
  if printf '%s' "$haystack"|grep -Eqi 'authentication required|sign[ -]?in|required.*auth|unauthorized'; then say ANTIGRAVITY_AUTH_STATE=BLOCKED_AUTH; fail ANTIGRAVITY_AUTH_REQUIRED; fi
  fail ANTIGRAVITY_RUNTIME_ERROR
}

schema_for_proof(){ printf '%s\n' '{"type":"object","properties":{"proof":{"type":"string"}},"required":["proof"],"additionalProperties":false}'; }

parse_stream(){
  python3 - "$1" "$2" "${3:-}" "${4:-}" <<'PY'
import json,os,sys
path,expected,expected_conversation,expected_file=sys.argv[1:]
init_event=None; result=None; tools=[]; write_ok=False; read_ok=False
with open(path,encoding='utf-8') as fh:
    for raw in fh:
        raw=raw.strip()
        if not raw: continue
        event=json.loads(raw)
        if event.get('event')=='init': init_event=event
        elif event.get('event')=='step_update':
            s=event.get('step_update') or {}
            if s.get('step_type')=='tool' and s.get('state')=='DONE':
                name=s.get('tool_name'); tools.append(name)
                ti=s.get('tool_info') or {}
                if ti.get('error'): continue
                params=ti.get('parameters') or {}
                init=(init_event or {}).get('init') or {}
                cwd=init.get('cwd') or os.getcwd()
                for k,v in params.items():
                    if not isinstance(v,str) or not ('path' in k.lower() or 'file' in k.lower()): continue
                    actual=os.path.abspath(v if os.path.isabs(v) else os.path.join(cwd,v))
                    if expected_file and actual==os.path.abspath(expected_file):
                        if name=='write_to_file': write_ok=True
                        if name=='view_file': read_ok=True
        elif event.get('event')=='result': result=event.get('result') or {}
if not init_event or not result: raise SystemExit('missing init/result events')
init=(init_event.get('init') or {})
if expected_file:
    if os.path.abspath(init.get('cwd') or '')!=os.path.abspath(os.path.dirname(expected_file)): raise SystemExit('cwd mismatch')
    if not write_ok: raise SystemExit('workspace write tool path mismatch')
    if not read_ok: raise SystemExit('workspace read tool path mismatch')
if result.get('status')!='SUCCESS': raise SystemExit('terminal status is not SUCCESS')
structured=result.get('structured_output')
if not isinstance(structured,dict) or structured.get('proof')!=expected: raise SystemExit('structured proof mismatch')
conversation_id=result.get('conversation_id') or init_event.get('conversation_id')
if not isinstance(conversation_id,str) or not conversation_id: raise SystemExit('conversation_id missing')
if expected_conversation and conversation_id!=expected_conversation: raise SystemExit('conversation_id changed on resume')
print('CONVERSATION_ID='+conversation_id)
print('TOOL_NAMES='+','.join(x for x in tools if isinstance(x,str)))
PY
}

assert_workspace_effect(){ local p="$1" expected="$2"; [ -f "$p" ] || fail WORKSPACE_TOOL_EFFECT_MISSING; [ "$(cat "$p")" = "$expected" ] || fail WORKSPACE_TOOL_EFFECT_MISMATCH; }
run_timed(){ local tf="$1"; shift; local seconds="${VOS_AGY_TURN_TIMEOUT_SECONDS:-180}"; if [ -x /usr/bin/time ]; then /usr/bin/time -v -o "$tf" timeout -k 15s "${seconds}s" "$@"; else timeout -k 15s "${seconds}s" "$@"; : >"$tf"; fi; }

qualify(){
  enforce_zero_cost_account_profile; preflight >/dev/null; agy_present >/dev/null; require_model
  local evidence_ref="${VOS_AGY_ZERO_COST_EVIDENCE_REF:-}"; [ -n "$evidence_ref" ] || fail ZERO_COST_ACCOUNT_EVIDENCE_REF_REQUIRED
  local model="$VOS_AGY_MODEL" agy_bin agy_version agy_sha schema
  agy_bin="$(command -v agy)"; agy_version="$(agy --version|head -1)"; agy_sha="$(sha256sum "$agy_bin"|awk '{print $1}')"; schema="$(schema_for_proof)"
  local run_dir; run_dir="$(mktemp -d -t vos-fabric-a2.XXXXXX)"; trap 'rm -rf "$run_dir"' RETURN; mkdir -p "$run_dir/work"

  local nonce expected proof_path first_json first_err first_time first_rc first_prompt
  nonce="VOS_AGY_NONCE_$(python3 - <<'PY'
import secrets
print(secrets.token_hex(12))
PY
)"
  expected="VOS_ANTIGRAVITY_PING=$nonce"; proof_path="$run_dir/work/proof.txt"
  first_json="$run_dir/first.jsonl"; first_err="$run_dir/first.stderr"; first_time="$run_dir/first.time"; first_prompt="$run_dir/first.prompt"
  cat >"$first_prompt" <<PROMPT
Your active workspace is exactly: $run_dir/work
Use the write_to_file workspace tool to create EXACTLY this absolute path and no other proof file:
$proof_path
The entire file content must be exactly:
$nonce
Then use view_file on that exact absolute path to read it back. Your structured output field named proof must be exactly:
$expected
Do not use Antigravity scratch space. Do not access files outside the active workspace. Do not use network tools or shell commands.
PROMPT
  enforce_zero_cost_account_profile
  first_rc=0
  ( cd "$run_dir/work"; run_timed "$first_time" agy -p "$(cat "$first_prompt")" --model "$model" --output-format stream-json --json-schema "$schema" --sandbox --print-timeout "${VOS_AGY_PRINT_TIMEOUT:-2m}" ) >"$first_json" 2>"$first_err" || first_rc=$?
  enforce_zero_cost_account_profile
  if [ "$first_rc" -ne 0 ]; then say "ANTIGRAVITY_FIRST_EVENTS_SHA256=$(sha256_path "$first_json")"; say "ANTIGRAVITY_FIRST_STDERR_SHA256=$(sha256_path "$first_err")"; classify_failure "$first_json" "$first_err"; fi

  local parsed conversation_id tool_names
  parsed="$(parse_stream "$first_json" "$expected" '' "$proof_path")" || fail FIRST_STREAM_VALIDATION_FAILED
  conversation_id="$(printf '%s\n' "$parsed"|awk -F= '/^CONVERSATION_ID=/{print $2}')"; tool_names="$(printf '%s\n' "$parsed"|awk -F= '/^TOOL_NAMES=/{sub(/^TOOL_NAMES=/,"");print}')"
  [ -n "$conversation_id" ] || fail FIRST_CONVERSATION_ID_MISSING; assert_workspace_effect "$proof_path" "$nonce"

  local resume_json="$run_dir/resume.jsonl" resume_err="$run_dir/resume.stderr" resume_time="$run_dir/resume.time" resume_rc=0 resume_expected="VOS_ANTIGRAVITY_RESUME=OK"
  enforce_zero_cost_account_profile
  ( cd "$run_dir/work"; run_timed "$resume_time" agy -p "Your structured output field named proof must be exactly: $resume_expected" --conversation "$conversation_id" --model "$model" --output-format stream-json --json-schema "$schema" --sandbox --print-timeout "${VOS_AGY_PRINT_TIMEOUT:-2m}" ) >"$resume_json" 2>"$resume_err" || resume_rc=$?
  enforce_zero_cost_account_profile
  if [ "$resume_rc" -ne 0 ]; then say "ANTIGRAVITY_RESUME_EVENTS_SHA256=$(sha256_path "$resume_json")"; say "ANTIGRAVITY_RESUME_STDERR_SHA256=$(sha256_path "$resume_err")"; classify_failure "$resume_json" "$resume_err"; fi
  parse_stream "$resume_json" "$resume_expected" "$conversation_id" '' >/dev/null || fail RESUME_STREAM_VALIDATION_FAILED

  local max_rss_kib=UNKNOWN
  if [ -s "$first_time" ]; then max_rss_kib="$(awk -F: '/Maximum resident set size/{gsub(/^[ \t]+/,"",$2);print $2}' "$first_time"|tail -1)"; [ -n "$max_rss_kib" ] || max_rss_kib=UNKNOWN; fi
  require_zero_cost_account_profile >/dev/null
  say "ANTIGRAVITY_VERSION=$agy_version"; say "ANTIGRAVITY_BINARY_SHA256=$agy_sha"; say "ANTIGRAVITY_MODEL_REQUESTED=$model"; say "ANTIGRAVITY_CONVERSATION_ID=$conversation_id"; say "ANTIGRAVITY_TOOL_NAMES=$tool_names"
  say "ANTIGRAVITY_FIRST_EVENTS_SHA256=$(sha256sum "$first_json"|awk '{print $1}')"; say "ANTIGRAVITY_RESUME_EVENTS_SHA256=$(sha256sum "$resume_json"|awk '{print $1}')"; say "ANTIGRAVITY_MAX_RSS_KIB_FIRST_RUN=$max_rss_kib"
  say "ANTIGRAVITY_ZERO_COST_EVIDENCE_REF=$evidence_ref"; say ANTIGRAVITY_API_KEY_FALLBACK=0; say ANTIGRAVITY_CREDIT_FALLBACK=0; say ANTIGRAVITY_HEADLESS_JSON=GREEN; say ANTIGRAVITY_STRUCTURED_OUTPUT=GREEN; say ANTIGRAVITY_WORKSPACE_TOOL_EXECUTION=GREEN; say ANTIGRAVITY_EXACT_RESUME=GREEN; say ANTIGRAVITY_SANDBOX_REQUESTED=GREEN; say ANTIGRAVITY_DIRECT_OFFICIAL_WORKER_LOCAL_QUALIFICATION=GREEN
}

case "$ACTION" in preflight) preflight;; version) agy_present;; qualify) qualify;; *) fail "UNKNOWN_ACTION:$ACTION";; esac
