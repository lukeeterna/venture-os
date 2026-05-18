---
name: macOS lock pattern — no flock, usa mkdir atomico
description: flock (util-linux) non disponibile su macOS Big Sur, usare mkdir atomico per mutual exclusion in bash
type: feedback
---

Su macOS Big Sur, `flock` non è disponibile (è util-linux, distribuito solo su Linux).

**Why:** tentativo di usare `flock -n 9` in eval-dashboard.sh → command not found. Scoperto durante test E2E WAVE 3 P8 S181.

**How to apply:** ogni script bash che richiede lock esclusivo su macOS:
```bash
LOCK_DIR="/tmp/myscript.lockdir"
if ! mkdir "${LOCK_DIR}" 2>/dev/null; then
    echo "altra istanza in corso, skip"
    exit 0
fi
trap 'rmdir "${LOCK_DIR}" 2>/dev/null || true' EXIT INT TERM
```
`mkdir` è atomico per POSIX — se la dir esiste già ritorna errore, garantendo mutual exclusion senza dipendenze esterne.
