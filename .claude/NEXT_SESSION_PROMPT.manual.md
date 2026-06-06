# Resume VOS — fabbrica generalista (chiuso VERDE 2026-06-06, context 60% vincolo #7)

Handoff completo: `handoffs/HANDOFF-VOS-factory-executable-2026-06-06.md`.

## Stato: fabbrica ESEGUIBILE (era solo DESIGN)
Tutti gli step 1-5 del resume precedente FATTI. Verifica empirica + 5 artefatti coerenti + runner testato + default ancorati a dati reali.

- Verifica empirica (vincolo #1): `vos-auto-router`=skill-protocollo (non motore); `research.py`=deep-research generico; `vos-childwatch`=ARGOS/FLUXION-specifico NON usabile.
- `VOS_RUN_SPEC.md` — 3 stazioni eseguibili, gate esterni-binari, provenienza obbligatoria, principio FIREWALL.
- `templates/venture-dossier.md` — scocca S0→S6, `provenance:` per sezione.
- `seeds/SEED_ENVELOPE.template.md` — input niche-free, default data-anchored (N=50, paganti≥3, 8h/sett).
- `components/distribution-station.md` — stazione-vincolo (3ª, per prima) + Componente 0.
- `bin/vos-factory-run` — runner CLI stdlib testato (firewall blocca advance senza provenienza, exit 2).

## Default ancorati (delega trend-researcher, fonti nei commenti envelope)
N=50 (Mom Test/Blank/YC), paganti≥3 non-affiliati (anti-fortuna; tasso B2B "solid" ≥2% Sopro.io), timebox 2 sett ~8h/sett. "3 paganti" = convergenza indie-hacker (flaggato non-primario).

## PROSSIMO STEP — lancia prima corsa (autorizzato da Luke)
Lancia la prima corsa fabbrica VOS. Leggi `VOS_RUN_SPEC.md`. Copia `seeds/SEED_ENVELOPE.template.md` in `seeds/seed_<oggi>.md` (default già pronti: N=50, paganti≥3, 8h/sett, esclusi ARGOS/FLUXION/Guardian, channel_reach 0, budget 0), poi `bin/vos-factory-run init`. Esegui stazione 1 Discovery con research reale delegata a trend-researcher/deep-research (REGOLA #0): VOS partorisce 3 nicchie candidate con segnali di spesa esistente (URL), porta la scocca a S2/G1. G3 resta BLOCKED-ON pagamento reale (vincolo #1b).

## Non ridiscutere
- Principio firewall: Luke dà vincoli niche-free, VOS partorisce nicchia, Luke valida evidenza (non sceglie nicchia).
- Generalista: mai verticalizzare su ARGOS/FLUXION/Guardian.
- Il "nastro" è main Claude + protocollo vos-auto-router + Task agents, non uno script.
