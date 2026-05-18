#!/usr/bin/env bash
# eval-dashboard.sh — VOS WAVE 3 P8 (S181)
# Aggrega eval.jsonl ultimi 7gg → state/eval-weekly.md
# Logrotate eval.jsonl e delegation-enforcement.jsonl se >10MB
# Alert in state/eval-alerts.jsonl se success_rate <80% o quota Gemini Flash >225 RPD
#
# Idempotente: lancia 10x, stessa semantica.
# Big Sur / macOS compatible: Python 3.9+, bash 3.2+.
# Lock via mkdir atomico (POSIX-garantito, no flock util-linux).
#
# Usage: ./eval-dashboard.sh [--dry-run] [--help]

set -euo pipefail

# ---------------------------------------------------------------------------
# Costanti
# ---------------------------------------------------------------------------
T7_MOUNT="/Volumes/MontereyT7"
VOS_ROOT="${T7_MOUNT}/venture-os"
CORE_PY="${VOS_ROOT}/components/eval-tracker/eval_dashboard_core.py"
# Lock via mkdir atomico — macOS compatible (flock è util-linux, non disponibile Big Sur)
LOCK_DIR="/tmp/vos-eval-dashboard.lockdir"
# Log dir NON su T7 — vincolo S176: launchd exit 78 EX_CONFIG se StandardOutPath su volume non-root
LOG_DIR="${HOME}/Library/Logs/VOS"
LOG_FILE="${LOG_DIR}/eval-dashboard.out.log"
ERR_FILE="${LOG_DIR}/eval-dashboard.err.log"

PYTHON3="$(command -v python3 2>/dev/null || true)"
DRY_RUN=false
SCRIPT_TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# ---------------------------------------------------------------------------
usage() {
    cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Aggrega state/eval.jsonl (ultimi 7gg), genera state/eval-weekly.md,
alert su eval-alerts.jsonl, logrotate jsonl se >10MB.

Opzioni:
  --dry-run   Mostra cosa farebbe senza scrivere file
  --help      Mostra questo messaggio ed esce

File prodotti:
  \${VOS_ROOT}/state/eval-weekly.md
  \${VOS_ROOT}/state/eval-alerts.jsonl        (solo se alert)
  \${VOS_ROOT}/state/eval-<YYYY-WW>.jsonl.gz  (solo se logrotate)
EOF
    exit 0
}

log() {
    local msg="${SCRIPT_TS} [eval-dashboard] $1"
    echo "${msg}"
    mkdir -p "${LOG_DIR}" && echo "${msg}" >> "${LOG_FILE}" 2>/dev/null || true
}

die() {
    echo "${SCRIPT_TS} [eval-dashboard] ERROR: $1" >&2
    exit 1
}

cleanup_lock() {
    rmdir "${LOCK_DIR}" 2>/dev/null || true
}

# ---------------------------------------------------------------------------
# Parse args
# ---------------------------------------------------------------------------
for arg in "$@"; do
    case "${arg}" in
        --dry-run) DRY_RUN=true ;;
        --help|-h) usage ;;
        *) die "Argomento sconosciuto: ${arg}" ;;
    esac
done

# ---------------------------------------------------------------------------
# 1. Setup log dir
# ---------------------------------------------------------------------------
mkdir -p "${LOG_DIR}" || true

# ---------------------------------------------------------------------------
# 2. T7 mount check
# ---------------------------------------------------------------------------
if ! python3 -c "import os,sys; sys.exit(0 if os.path.ismount('${T7_MOUNT}') else 1)" 2>/dev/null; then
    log "WARN T7 non montato (${T7_MOUNT}). Skip."
    exit 0
fi
log "T7 montato OK"

# ---------------------------------------------------------------------------
# 3. Lock esclusivo via mkdir atomico (macOS compatible, no flock util-linux)
#    mkdir è atomico per POSIX — se la dir esiste già, ritorna errore.
#    Registra trap per cleanup automatico.
# ---------------------------------------------------------------------------
if ! mkdir "${LOCK_DIR}" 2>/dev/null; then
    log "WARN altra istanza in corso (lock ${LOCK_DIR}). Skip."
    exit 0
fi
trap cleanup_lock EXIT INT TERM
log "Lock acquisito (${LOCK_DIR})"

# ---------------------------------------------------------------------------
# 4. Verifica Python e script core
# ---------------------------------------------------------------------------
[[ -z "${PYTHON3}" ]] && die "python3 non trovato in PATH"
[[ ! -f "${CORE_PY}" ]] && die "Core Python non trovato: ${CORE_PY}"

# ---------------------------------------------------------------------------
# 5. Esegui core Python
# ---------------------------------------------------------------------------
log "Avvio eval_dashboard_core.py (dry_run=${DRY_RUN})"

if [[ "${DRY_RUN}" == "true" ]]; then
    EVAL_DRY_RUN=1 "${PYTHON3}" "${CORE_PY}" 2>>"${ERR_FILE}"
else
    EVAL_DRY_RUN=0 "${PYTHON3}" "${CORE_PY}" 2>>"${ERR_FILE}"
fi

EXIT_CODE=$?
if [[ ${EXIT_CODE} -ne 0 ]]; then
    log "WARN core Python uscito con codice ${EXIT_CODE} — vedi ${ERR_FILE}"
else
    log "Core Python completato OK"
fi

log "eval-dashboard.sh completato"
# trap cleanup_lock chiamato automaticamente su EXIT
