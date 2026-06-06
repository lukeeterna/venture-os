# SEED_ENVELOPE — input della fabbrica VOS (NICHE-FREE)

> **Lo compila Luke. Contiene SOLO vincoli, MAI una nicchia o un prodotto.**
> Principio firewall (`VOS_RUN_SPEC.md`): Luke dà i vincoli, **VOS partorisce la nicchia**, Luke valida l'evidenza ai gate. Se scrivi qui una nicchia/settore-target, VOS la ignora e la flagga come violazione.
> Copia questo file in `seeds/seed_<data>.md` e compila i campi.

```yaml
seed_id: seed_{{YYYYMMDD}}
created_ts: {{TS}}

# --- Vincoli economici ---
budget_max_eur: 0                 # capex aggiuntivo ammesso (default 0, Claude Code già pagato)
revenue_floor_eur: {{...}}        # primo pagamento-soglia che conta come SHIPPED (gate F)

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
terminal_fact: "≥1 pagamento reale (Stripe/Lemon/LOI con deposito) ≥ revenue_floor_eur"
```

## Note (libere, niche-free)
{{vincoli aggiuntivi, preferenze di rischio, timebox della corsa...}}
