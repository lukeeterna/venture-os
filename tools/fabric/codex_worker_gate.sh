#!/usr/bin/env bash
# VOS Fabric G2 — run INSIDE the isolated Ubuntu vos-worker only.
# Default action is read-only preflight. No API-key fallback is provided.
set -euo pipefail

ACTION="${1:-preflight}"
CODEX_HOME="${VOS_CODEX_HOME:-$HOME/.codex-vos-fabric}"
export CODEX_HOME

say() { printf '%s\n' "$*"; }
fail() { say "G2_BLOCKED=$*"; exit 2; }

require_linux_x86_64() {
  [ "$(uname -s)" = "Linux" ] || fail "OS_NOT_LINUX"
  [ "$(uname -m)" = "x86_64" ] || fail "ARCH_NOT_X86_64"
}

preflight() {
  require_linux_x86_64
  local mem_kib free_kib
  mem_kib="$(awk '/MemTotal:/ {print $2}' /proc/meminfo)"
  free_kib="$(df -Pk / | awk 'NR==2 {print $4}')"
  [ "${mem_kib:-0}" -ge 3500000 ] || fail "RAM_LT_3_5_GIB"
  [ "${free_kib:-0}" -ge 10485760 ] || fail "ROOT_FREE_LT_10_GIB"
  command -v python3 >/dev/null 2>&1 || fail "PYTHON3_MISSING"
  command -v sha256sum >/dev/null 2>&1 || fail "SHA256SUM_MISSING"
  command -v timeout >/dev/null 2>&1 || fail "TIMEOUT_MISSING"
  say "G2_PREFLIGHT=GREEN"
  say "G2_OS=$(uname -sr)"
  say "G2_ARCH=$(uname -m)"
  say "G2_MEM_KIB=$mem_kib"
  say "G2_ROOT_FREE_KIB=$free_kib"
}

codex_present() {
  command -v codex >/dev/null 2>&1 || fail "CODEX_MISSING"
  codex --version
}

codex_runtime_present() {
  command -v codex-code-mode-host >/dev/null 2>&1 || fail "CODEX_CODE_MODE_HOST_MISSING"
  command -v bwrap >/dev/null 2>&1 || fail "BWRAP_MISSING"
}

codex_login_status_bounded() {
  local seconds="${VOS_CODEX_AUTH_STATUS_TIMEOUT_SECONDS:-15}"
  timeout "${seconds}s" codex login status >/dev/null 2>&1
}

auth_status() {
  require_linux_x86_64
  codex_present >/dev/null
  if codex_login_status_bounded; then
    say "CODEX_CHATGPT_AUTH=GREEN"
    return 0
  fi
  say "CODEX_CHATGPT_AUTH=REQUIRED"
  return 20
}

device_auth() {
  require_linux_x86_64
  codex_present >/dev/null
  say "DEVICE_AUTH_START=EXPLICIT_USER_GATE"
  codex login --device-auth
  codex_login_status_bounded || fail "DEVICE_AUTH_DID_NOT_PERSIST"
  say "CODEX_CHATGPT_AUTH=GREEN"
}

thread_id_from_jsonl() {
  python3 - "$1" <<'PY'
import json, sys
path = sys.argv[1]
thread_id = None
with open(path, "r", encoding="utf-8") as fh:
    for line in fh:
        line = line.strip()
        if not line:
            continue
        obj = json.loads(line)
        if obj.get("type") == "thread.started":
            thread_id = obj.get("thread_id")
            break
if not isinstance(thread_id, str) or not thread_id:
    raise SystemExit(2)
print(thread_id)
PY
}

assert_last_message() {
  python3 - "$1" "$2" <<'PY'
from pathlib import Path
import sys
actual = Path(sys.argv[1]).read_text(encoding="utf-8").strip()
expected = sys.argv[2]
if actual != expected:
    print("LAST_MESSAGE_MISMATCH", file=sys.stderr)
    raise SystemExit(2)
PY
}

assert_real_tool_execution() {
  python3 - "$1" "$2" <<'PY'
import json, sys
path, nonce = sys.argv[1:]
command_seen = False
turn_done = False
with open(path, "r", encoding="utf-8") as fh:
    for raw in fh:
        raw = raw.strip()
        if not raw:
            continue
        event = json.loads(raw)
        if event.get("type") == "turn.completed":
            turn_done = True
        item = event.get("item") or {}
        if (
            event.get("type") == "item.completed"
            and item.get("type") == "command_execution"
            and item.get("exit_code") == 0
            and nonce in (item.get("aggregated_output") or "")
        ):
            command_seen = True
if not (command_seen and turn_done):
    raise SystemExit(2)
PY
}

sha256_path() {
  local path="$1"
  if [ -f "$path" ]; then
    sha256sum "$path" | awk '{print $1}'
  else
    printf 'MISSING\n'
  fi
}

run_timed() {
  local time_file="$1"; shift
  local seconds="${VOS_CODEX_TURN_TIMEOUT_SECONDS:-120}"
  if [ -x /usr/bin/time ]; then
    /usr/bin/time -v -o "$time_file" timeout "${seconds}s" "$@"
  else
    timeout "${seconds}s" "$@"
    : > "$time_file"
  fi
}

qualify() {
  preflight >/dev/null
  codex_present >/dev/null
  codex_runtime_present
  codex_login_status_bounded || fail "CHATGPT_DEVICE_AUTH_REQUIRED"

  local model="${VOS_CODEX_MODEL:-}"
  [ -n "$model" ] || fail "VOS_CODEX_MODEL_REQUIRED_FOR_EXACT_MODEL_CERTIFICATION"

  local codex_bin codex_version codex_sha host_sha bwrap_sha
  codex_bin="$(command -v codex)"
  codex_version="$(codex --version | head -1)"
  codex_sha="$(sha256sum "$codex_bin" | awk '{print $1}')"
  host_sha="$(sha256sum "$(command -v codex-code-mode-host)" | awk '{print $1}')"
  bwrap_sha="$(sha256sum "$(command -v bwrap)" | awk '{print $1}')"

  local run_dir
  run_dir="$(mktemp -d -t vos-fabric-g2.XXXXXX)"
  trap 'rm -rf "$run_dir"' RETURN
  mkdir -p "$run_dir/work"

  local nonce first_json first_msg first_time first_prompt first_stderr first_rc
  nonce="VOS_TOOL_NONCE_$(python3 - <<'PY'
import secrets
print(secrets.token_hex(12))
PY
)"
  printf '%s\n' "$nonce" > "$run_dir/work/probe.txt"
  first_json="$run_dir/first.jsonl"
  first_msg="$run_dir/first.txt"
  first_time="$run_dir/first.time"
  first_prompt="$run_dir/first.prompt"
  first_stderr="$run_dir/first.stderr"
  cat > "$first_prompt" <<'PROMPT'
Use the shell tool to run exactly this command and no other command:
cat ./probe.txt
The command must exit with status 0. You must read the file; do not infer, guess, or skip the command. After it succeeds, reply with exactly VOS_FABRIC_PING= followed immediately by the exact stdout from that command, with no other text.
PROMPT
  first_rc=0
  run_timed "$first_time" \
    codex exec --json --sandbox read-only -c 'approval_policy="never"' --model "$model" \
      --skip-git-repo-check --cd "$run_dir/work" \
      --output-last-message "$first_msg" - \
      < "$first_prompt" > "$first_json" 2> "$first_stderr" || first_rc=$?
  if [ "$first_rc" -ne 0 ]; then
    say "CODEX_FIRST_EVENTS_SHA256=$(sha256_path "$first_json")"
    say "CODEX_FIRST_STDERR_SHA256=$(sha256_path "$first_stderr")"
    fail "FIRST_CALL_CODEX_RC_$first_rc"
  fi
  assert_last_message "$first_msg" "VOS_FABRIC_PING=$nonce" || fail "FIRST_CALL_OUTPUT_MISMATCH"
  assert_real_tool_execution "$first_json" "$nonce" || fail "FIRST_CALL_TOOL_EXECUTION_MISSING"
  local thread_id
  thread_id="$(thread_id_from_jsonl "$first_json")" || fail "FIRST_THREAD_ID_MISSING"

  local resume_json="$run_dir/resume.jsonl"
  local resume_msg="$run_dir/resume.txt"
  local resume_time="$run_dir/resume.time"
  local resume_prompt="$run_dir/resume.prompt"
  local resume_stderr="$run_dir/resume.stderr"
  local resume_rc=0
  printf '%s\n' 'Do not execute commands and do not modify files. Reply exactly: VOS_FABRIC_RESUME=OK' > "$resume_prompt"
  run_timed "$resume_time" \
    codex exec --json --sandbox read-only -c 'approval_policy="never"' --model "$model" \
      --skip-git-repo-check --cd "$run_dir/work" \
      --output-last-message "$resume_msg" \
      resume "$thread_id" - \
      < "$resume_prompt" > "$resume_json" 2> "$resume_stderr" || resume_rc=$?
  if [ "$resume_rc" -ne 0 ]; then
    say "CODEX_RESUME_EVENTS_SHA256=$(sha256_path "$resume_json")"
    say "CODEX_RESUME_STDERR_SHA256=$(sha256_path "$resume_stderr")"
    fail "RESUME_CODEX_RC_$resume_rc"
  fi
  assert_last_message "$resume_msg" 'VOS_FABRIC_RESUME=OK' || fail "RESUME_OUTPUT_MISMATCH"
  local resumed_thread_id
  resumed_thread_id="$(thread_id_from_jsonl "$resume_json")" || fail "RESUME_THREAD_ID_MISSING"
  [ "$resumed_thread_id" = "$thread_id" ] || fail "RESUME_CHANGED_THREAD_ID"

  local fork_json="$run_dir/fork.jsonl"
  local fork_msg="$run_dir/fork.txt"
  local fork_time="$run_dir/fork.time"
  local fork_prompt="$run_dir/fork.prompt"
  local fork_stderr="$run_dir/fork.stderr"
  local fork_rc=0
  printf '%s\n' 'Do not execute commands and do not modify files. Reply exactly: VOS_FABRIC_FORK=OK' > "$fork_prompt"
  run_timed "$fork_time" \
    codex exec --json --sandbox read-only -c 'approval_policy="never"' --model "$model" \
      --skip-git-repo-check --cd "$run_dir/work" \
      --output-last-message "$fork_msg" \
      fork "$thread_id" - \
      < "$fork_prompt" > "$fork_json" 2> "$fork_stderr" || fork_rc=$?
  if [ "$fork_rc" -ne 0 ]; then
    say "CODEX_FORK_EVENTS_SHA256=$(sha256_path "$fork_json")"
    say "CODEX_FORK_STDERR_SHA256=$(sha256_path "$fork_stderr")"
    fail "FORK_CODEX_RC_$fork_rc"
  fi
  assert_last_message "$fork_msg" 'VOS_FABRIC_FORK=OK' || fail "FORK_OUTPUT_MISMATCH"
  local fork_thread_id
  fork_thread_id="$(thread_id_from_jsonl "$fork_json")" || fail "FORK_THREAD_ID_MISSING"
  [ "$fork_thread_id" != "$thread_id" ] || fail "FORK_REUSED_SOURCE_THREAD_ID"

  local max_rss_kib="UNKNOWN"
  if [ -s "$first_time" ]; then
    max_rss_kib="$(awk -F: '/Maximum resident set size/ {gsub(/^[ \t]+/,"",$2); print $2}' "$first_time" | tail -1)"
    [ -n "$max_rss_kib" ] || max_rss_kib="UNKNOWN"
  fi

  say "CODEX_VERSION=$codex_version"
  say "CODEX_BINARY_SHA256=$codex_sha"
  say "CODEX_CODE_MODE_HOST_SHA256=$host_sha"
  say "CODEX_BWRAP_SHA256=$bwrap_sha"
  say "CODEX_MODEL_REQUESTED=$model"
  say "CODEX_SOURCE_THREAD_ID=$thread_id"
  say "CODEX_FORK_THREAD_ID=$fork_thread_id"
  say "CODEX_FIRST_EVENTS_SHA256=$(sha256sum "$first_json" | awk '{print $1}')"
  say "CODEX_RESUME_EVENTS_SHA256=$(sha256sum "$resume_json" | awk '{print $1}')"
  say "CODEX_FORK_EVENTS_SHA256=$(sha256sum "$fork_json" | awk '{print $1}')"
  say "CODEX_MAX_RSS_KIB_FIRST_RUN=$max_rss_kib"
  say "CODEX_EXEC_JSON=GREEN"
  say "CODEX_TOOL_EXECUTION=GREEN"
  say "CODEX_EXACT_RESUME=GREEN"
  say "CODEX_EXACT_FORK=GREEN"
  say "LINUX_CODEX_WORKER_LOCAL_QUALIFICATION=GREEN"
}

case "$ACTION" in
  preflight) preflight ;;
  auth-status) auth_status ;;
  device-auth) device_auth ;;
  qualify) qualify ;;
  *) fail "UNKNOWN_ACTION:$ACTION" ;;
esac
