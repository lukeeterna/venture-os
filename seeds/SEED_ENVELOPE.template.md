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
buyers_reached_target: 50         # N = buyer qualificati raggiunti nella corsa (denominatore, no paid ads)
min_paying_to_pass: 2             # X = paganti reali su N per dire "efficace, scala" (default 2/50 = 4%)
                                  # esiti G3: >=X paga -> SHIPPED | 1 paga -> segnale debole (rework o kill, decide Luke) | 0 -> KILL motivato

# --- Vincoli di capacità (skill, NON settore) ---
skills_available:                 # cosa Luke/VOS sa fare, non in che mercato
  - coding via Claude Code (Python, web, Tauri)
  - {{...}}
time_per_week_hours: {{...}}

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
