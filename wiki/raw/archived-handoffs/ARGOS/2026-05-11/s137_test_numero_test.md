# S137 — Test numero TEST_FOUNDER + Go Live decision

Leggi HANDOFF.md e CURRENT_SPRINT.md prima di tutto.

## Contesto
Sprint S132 DONE. E2E pipeline validata (msg out_1776522749347_25z8o inviato 18/04 16:29).
Obiettivo sessione: test aggiuntivi su 393314928901, poi decisione go-live primo dealer reale.

## Task
1. Verifica stato daemon: `ssh gianlucadistasi@192.168.1.2 "curl -s localhost:9191/status"`
2. Esegui test su TEST_FOUNDER (founder decide cosa testare — sequenze Day 3? varianti template?)
3. Se soddisfacente → identifica primo dealer reale con founder e prepara outreach

## Note
- Max 1 msg Day 1 per numero reale
- Verifica business hours prima di ogni invio
- Se risposta TEST_FOUNDER arrivata → analizza prima di procedere
