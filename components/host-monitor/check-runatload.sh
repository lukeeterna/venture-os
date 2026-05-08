#!/bin/bash
# Verifica RunAtLoad post-boot test S2-MVP.
# Uso: ~/venture-os/components/host-monitor/check-runatload.sh
# Lancia DOPO il login post-shutdown, attendendo ~60s che T7 sia montato e launchd abbia processato.

set -u
TODAY=$(date +%Y-%m-%d)
STATE=/Volumes/MontereyT7/venture-os/state
BRIEFS=/Volumes/MontereyT7/venture-os/briefs

echo "================================================================"
echo "VERIFICA RunAtLoad POST-BOOT — $(date)"
echo "================================================================"
echo ""

echo "--- 1. T7 montato ---"
if [ -d /Volumes/MontereyT7 ] && mount | grep -q "MontereyT7"; then
    echo "OK T7 montato"
else
    echo "ABORT T7 NON montato — RunAtLoad ha sicuramente fallito (require_t7_or_exit)"
    exit 1
fi
echo ""

echo "--- 2. Marker pre-shutdown ---"
if [ -f "$STATE/pre-shutdown-marker.txt" ]; then
    cat "$STATE/pre-shutdown-marker.txt"
else
    echo "marker non trovato"
fi
echo ""

echo "--- 3. Brief odierno generato post-boot? ---"
if [ -f "$BRIEFS/$TODAY.md" ]; then
    echo "OK $BRIEFS/$TODAY.md esiste"
    NEW_MTIME=$(stat -f "%Sm" -t "%Y-%m-%dT%H:%M:%S" "$BRIEFS/$TODAY.md")
    echo "Timestamp nuovo brief: $NEW_MTIME"
    PRE_MTIME=$(grep PRE_BRIEF_MTIME "$STATE/pre-shutdown-marker.txt" 2>/dev/null | cut -d= -f2)
    if [ -n "$PRE_MTIME" ] && [ "$NEW_MTIME" != "$PRE_MTIME" ]; then
        echo "OK timestamp diverso da pre-shutdown ($PRE_MTIME) — RunAtLoad ha rigenerato"
    else
        echo "WARN timestamp uguale o pre-marker mancante"
    fi
else
    echo "FAIL brief odierno NON esiste — RunAtLoad ha fallito"
fi
echo ""

echo "--- 4. Brief pre-shutdown preservato? ---"
if [ -f "$BRIEFS/$TODAY.pre-shutdown.md" ]; then
    echo "OK $BRIEFS/$TODAY.pre-shutdown.md preservato (per confronto)"
else
    echo "WARN file pre-shutdown rimosso o assente"
fi
echo ""

echo "--- 5. Host-monitor probe nuovo aggiunto? ---"
PROBE_COUNT_NOW=$(wc -l < "$STATE/host-monitor.jsonl" | tr -d ' ')
PROBE_COUNT_PRE=$(grep PRE_PROBE_COUNT "$STATE/pre-shutdown-marker.txt" 2>/dev/null | cut -d= -f2)
echo "Probe count: pre=$PROBE_COUNT_PRE, ora=$PROBE_COUNT_NOW"
if [ -n "$PROBE_COUNT_PRE" ] && [ "$PROBE_COUNT_NOW" -gt "$PROBE_COUNT_PRE" ]; then
    echo "OK $((PROBE_COUNT_NOW - PROBE_COUNT_PRE)) nuovi probe"
    echo "Ultimo probe:"
    tail -1 "$STATE/host-monitor.jsonl" | python3 -m json.tool 2>/dev/null | head -5
else
    echo "WARN nessun probe nuovo"
fi
echo ""

echo "--- 6. LaunchAgent status ---"
launchctl list | grep com.luke.vos || echo "WARN nessun LaunchAgent VOS caricato"
echo ""

echo "--- 7. errors.jsonl ultime 3 righe ---"
tail -3 "$STATE/errors.jsonl" 2>/dev/null || echo "errors.jsonl non esiste (= nessun errore loggato)"
echo ""

echo "--- 8. Disconnect log ---"
if [ -f ~/.venture-os-disconnected.log ]; then
    echo "ATTENZIONE: ~/.venture-os-disconnected.log non vuoto:"
    tail -3 ~/.venture-os-disconnected.log
    echo ""
    echo "= LaunchAgent ha tentato di girare PRIMA che T7 fosse montato (RunAtLoad troppo presto)"
else
    echo "OK ~/.venture-os-disconnected.log assente (LaunchAgent ha trovato T7 montato al RunAtLoad)"
fi
echo ""

echo "================================================================"
echo "VERDETTO:"
if [ -f "$BRIEFS/$TODAY.md" ] && [ "$PROBE_COUNT_NOW" -gt "${PROBE_COUNT_PRE:-0}" ]; then
    echo "VERDE — RunAtLoad funziona correttamente post-boot reale"
else
    echo "ROSSO — RunAtLoad non ha funzionato. Vedere punti 3, 5, 8 per diagnosi."
fi
echo "================================================================"
