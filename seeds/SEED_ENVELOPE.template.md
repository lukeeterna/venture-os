# SEED_ENVELOPE — input della fabbrica VOS (NICHE-FREE)

> **Lo compila Luke. Contiene SOLO vincoli, MAI una nicchia o un prodotto.**
> Principio firewall (`VOS_RUN_SPEC.md`): Luke dà i vincoli, **VOS partorisce la nicchia**, Luke valida l'evidenza ai gate. Se scrivi qui una nicchia/settore-target, VOS la ignora e la flagga come violazione.
> Copia questo file in `seeds/seed_<data>.md` e compila i campi.

```yaml
seed_id: seed_{{YYYYMMDD}}
created_ts: {{TS}}

# --- Vincoli economici ---
budget_max_eur: 0                 # capex aggiuntivo ammesso (default 0, Claude Code già pagato)

# --- Soglia di efficacia (NICHE-FREE: tasso di conversione, non € assoluti) ---
# L'efficacia NON è "quanti €" (dipende dalla nicchia che sceglie VOS) ma "quanti pagano su quanti ne raggiungo".
buyers_reached_target: 50         # N (default ancorato a dati: Mom Test/S.Blank 50-100, YC 10-100). Raggiungibile a mano in 2 sett, abbastanza per pattern non-aneddoto.
min_paying_to_pass: 3             # X = paganti reali NON-affiliati (no amici/famiglia). 3 = minimo statistico che distingue segnale da fortuna (convergenza indie-hacker; tasso "solid" cold-outreach B2B >=2% su 50 = ~1, exceptional >=5%). Fonte: Sopro.io 2026.
                                  # esiti G3: >=3 paga -> SHIPPED | 1-2 paga -> segnale debole (rework offerta o kill, decide Luke) | 0 dopo N -> KILL motivato

# --- Vincoli di capacità (skill, NON settore) ---
skills_available:                 # cosa Luke/VOS sa fare, non in che mercato
  - coding via Claude Code (Python, web, Tauri)
  - {{...}}
time_per_week_hours: 8            # default: timebox validazione = 2 settimane part-time (~8-10h/sett). 1 sett full-time studio (Bundl/Design Sprint) ~= 2 sett part-time. Oltre = il mercato ha detto no.

# --- Vincoli di distribuzione ---
channel_reach: {{0}}              # audience già raggiungibile oggi (0 = Componente 0 da costruire prima)
distribution_no_paid_ads: true   # gate D: primi 100 buyer senza paid ads

# --- Vincoli di esclusione (per non verticalizzare su venture esistenti) ---
excluded_domains:                 # settori che VOS NON deve scegliere
  - automotive / dealer            # = ARGOS
  - gestionali SMB / voice-agent   # = FLUXION
  - elderly-care / phone-cleanup   # = Guardian
  - {{altri da escludere}}

# --- Orientamento (NON è la nicchia) ---
verticale_type_hint: {{null | B2B-globale | servizi-locali | consumer}}
                                  # opzionale: orienta solo le famiglie-tool, non la nicchia

# --- Done-condition esterna (vincolo #1b) ---
terminal_fact: "≥ min_paying_to_pass pagamenti reali (Stripe/Lemon/LOI) su buyers_reached_target raggiunti"
```

## Note (libere, niche-free)
{{vincoli aggiuntivi, preferenze di rischio, timebox della corsa...}}
