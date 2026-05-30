#!/usr/bin/env bash
# Audit delegation rate ultimi N giorni (default 7) dal jsonl.
# Uso: delegation-rate.sh [giorni]
DAYS="${1:-7}"
python3 - "$DAYS" << 'PY'
import json,sys
from datetime import datetime,timezone,timedelta
days=int(sys.argv[1]); cut=datetime.now(timezone.utc)-timedelta(days=days)
from pathlib import Path
p=Path.home()/"venture-os"/"state"/"delegation-enforcement.jsonl"
c={"nudge":0,"strict":0,"bypassed":0,"delegated":0,"legacy_suggest":0}
for ln in p.read_text(encoding="utf-8").splitlines():
    ln=ln.strip()
    if not ln: continue
    try: e=json.loads(ln)
    except: continue
    try: ts=datetime.fromisoformat(e["ts"])
    except: continue
    if ts<cut: continue
    ev=e.get("event")
    if ev in c: c[ev]+=1
    elif ev is None and e.get("agent_suggested") not in (None,"MAIN_CONTEXT"):
        c["legacy_suggest"]+=1   # entry pre-upgrade senza campo event
sugg=c["nudge"]+c["strict"]+c["legacy_suggest"]
denom=sugg  # bypassed escluso (opt-out esplicito utente)
rate=(c["delegated"]/denom*100) if denom else 0.0
print(f"finestra: ultimi {days}gg")
print(f"suggeriti: {sugg} (nudge={c['nudge']} strict={c['strict']} legacy={c['legacy_suggest']})")
print(f"bypassed:  {c['bypassed']}  delegated: {c['delegated']}")
print(f"DELEGATION_RATE = {rate:.1f}%  (delegated/suggeriti)")
print("gate 7gg: <40% -> retune keyword ; >80% -> espandi HIGH_CONFIDENCE_PHRASES")
PY
