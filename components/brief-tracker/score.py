#!/usr/bin/env python3
# Brief-tracker score: verdetto Validation Window 7-14gg (blueprint sez. 11 Fase B).
# Calcola contatori source_match/brief_read e mappa su tabella decisionale.
"""Output stdout italiano. Nessuna decisione automatica di costruzione, solo segnale per Luke."""

import json
import re
import sys
from datetime import date, timedelta
from pathlib import Path

JSONL = Path("/Volumes/MontereyT7/venture-os/state/brief-actions.jsonl")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def _load_valid_entries() -> list:
    if not JSONL.exists():
        return []
    out = []
    with open(JSONL) as f:
        for line in f:
            s = line.strip()
            if not s:
                continue
            try:
                d = json.loads(s)
            except json.JSONDecodeError:
                continue
            if not isinstance(d, dict):
                continue
            if not all(k in d for k in ("date", "brief_read", "action_taken", "source_match", "notes")):
                continue
            if not isinstance(d["date"], str) or not DATE_RE.match(d["date"]):
                continue
            if not isinstance(d["brief_read"], bool) or not isinstance(d["source_match"], bool):
                continue
            try:
                d["_date"] = date.fromisoformat(d["date"])
            except ValueError:
                continue
            out.append(d)
    return out


def _window(entries: list, today: date, days: int) -> list:
    cutoff = today - timedelta(days=days - 1)
    return [e for e in entries if cutoff <= e["_date"] <= today]


def _verdict(entries_all: list, today: date) -> dict:
    entries_all = sorted(entries_all, key=lambda e: e["_date"])
    if not entries_all:
        first_day = None
        days_observed = 0
    else:
        first_day = entries_all[0]["_date"]
        days_observed = (today - first_day).days + 1

    w7 = _window(entries_all, today, 7)
    w14 = _window(entries_all, today, 14)

    sm7 = sum(1 for e in w7 if e["source_match"])
    sm14 = sum(1 for e in w14 if e["source_match"])
    br7 = sum(1 for e in w7 if e["brief_read"])

    # Tabella decisionale blueprint
    if days_observed < 7:
        verdict = "INSUFFICIENT_DATA"
        recommendation = "Continua Validation Window — servono almeno 7 giorni di entries."
    elif sm7 >= 3 or sm14 >= 5:
        verdict = "BRIEF_UTILE"
        recommendation = "Brief utile → Sessione 3-6 (Fase C) hanno valore. Procedi con disk-keeper, LLM router, wiki Karpathy, decision template."
    elif sm7 == 0 or br7 < 4:
        verdict = "BRIEF_INUTILE"
        recommendation = "Brief inutile → fallimento pattern. Stop VOS, valuta handoff manuali cross-progetto."
    elif 1 <= sm7 <= 2 and br7 >= 5:
        verdict = "BRIEF_SUFFICIENTE"
        recommendation = "Brief sufficiente → MVP basta, fermati qui. Risparmiate 13-15h Fase C."
    else:
        verdict = "BORDERLINE"
        recommendation = (
            f"Stato borderline (sm7={sm7}, br7={br7}). Continua 1-2 giorni e ri-misura, "
            "oppure decidi qualitativamente."
        )

    return {
        "today": today.isoformat(),
        "first_day": first_day.isoformat() if first_day else None,
        "days_observed": days_observed,
        "entries_total": len(entries_all),
        "window_7gg": {
            "entries": len(w7),
            "source_match_true": sm7,
            "brief_read_true": br7,
        },
        "window_14gg": {
            "entries": len(w14),
            "source_match_true": sm14,
        },
        "verdict": verdict,
        "recommendation": recommendation,
    }


def main() -> int:
    entries = _load_valid_entries()
    today = date.today()
    res = _verdict(entries, today)

    print(f"Brief-tracker — analisi al {res['today']}")
    print(f"Periodo osservato: {res['days_observed']} giorni "
          f"(primo brief: {res['first_day'] or 'nessuno'})")
    print(f"Entries totali valide: {res['entries_total']}")
    print()
    print("Finestra 7 giorni:")
    print(f"  brief letti: {res['window_7gg']['brief_read_true']}/7")
    print(f"  source_match=true: {res['window_7gg']['source_match_true']}")
    print()
    print("Finestra 14 giorni:")
    print(f"  source_match=true: {res['window_14gg']['source_match_true']}")
    print()
    print(f"Verdetto: {res['verdict']}")
    print(f"Raccomandazione: {res['recommendation']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
