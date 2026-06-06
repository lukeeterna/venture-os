# HANDOFF — Fabbrica VOS resa ESEGUIBILE (2026-06-06)

**Stato**: VERDE. Fabbrica generalista passata da DESIGN a ESEGUIBILE + firewall-corretta + default data-anchored.

## Cosa è stato fatto
- **Verifica empirica** (vincolo #1): `vos-auto-router` = skill-protocollo (non motore autonomo); `research.py` = deep-research (generico); `vos-childwatch` = ARGOS/FLUXION-specifico, NON usabile in fabbrica.
- **5 artefatti coerenti** (firewall: Luke dà vincoli niche-free, VOS partorisce nicchia, Luke valida evidenza):
  - `VOS_RUN_SPEC.md` — 3 stazioni eseguibili, gate esterni-binari, provenienza obbligatoria.
  - `templates/venture-dossier.md` — la scocca S0→S6, blocco `provenance:` per sezione.
  - `seeds/SEED_ENVELOPE.template.md` — input niche-free, default data-anchored.
  - `components/distribution-station.md` — stazione-vincolo (3ª, costruita per prima) + Componente 0 (canale durevole).
  - `bin/vos-factory-run` — runner CLI stdlib (init/advance/status), testato: firewall blocca advance senza provenienza con exit 2.
- **Default ancorati a dati reali** (delega trend-researcher): N=50 (Mom Test/Blank/YC), paganti≥3 non-affiliati (anti-fortuna; tasso B2B "solid" ≥2% Sopro.io 2026), timebox 2 sett ~8h/sett (Bundl/Design Sprint scaled part-time). Confidence flaggata onestamente: "3 paganti" = convergenza indie-hacker non fonte primaria.

## Verità non-derivabili
- G3 (pagamento reale) è strutturalmente **BLOCKED-ON un buyer nel mondo reale** — non simulabile in-sessione (vincolo #1b). La corsa porta la scocca fino a dove l'evidenza è raggiungibile (G1 research, G2 build).
- Il "nastro" NON è uno script: è main Claude + protocollo vos-auto-router + Task agents.

## PROSSIMO STEP — lancio prima corsa (autorizzato da Luke)
> Lancia la prima corsa fabbrica VOS. Leggi VOS_RUN_SPEC.md. Copia seeds/SEED_ENVELOPE.template.md in seeds/seed_<oggi>.md (default già pronti: N=50, paganti≥3, 8h/sett, esclusi ARGOS/FLUXION/Guardian, channel_reach 0, budget 0), poi `bin/vos-factory-run init`. Esegui stazione 1 Discovery con research reale delegata a trend-researcher/deep-research (REGOLA #0): VOS partorisce 3 nicchie candidate con segnali di spesa esistente (URL), porta la scocca a S2/G1. G3 resta BLOCKED-ON pagamento reale (vincolo #1b).
