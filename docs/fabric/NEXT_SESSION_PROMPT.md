# VOS Fabric v2 — Canonical Next-Session Prompt

Riprendi autonomamente **VOS Fabric v2** dal cloud, senza chiedermi di ripetere contesto già certificato.

## Autorità di continuazione

PRIMA DI QUALSIASI AZIONE leggi integralmente, in questo ordine:

1. `docs/fabric/HANDOFF_LATEST.md` sul branch `sol/vos-fabric-antigravity-a2-20260915` di `lukeeterna/venture-os` — è il **LATEST CANONICAL HANDOFF** e prevale sui vecchi handoff per lo stato corrente;
2. `docs/fabric/research/2026-09-15-gemini-deep-review.md` — è la review/falsificazione canonica della ricerca Gemini Deep; non usare il report Gemini grezzo come autorità;
3. `docs/fabric/ARCHITECTURE.md`;
4. `docs/fabric/PACKAGE.md`;
5. `docs/fabric/STATE.md`;
6. `docs/fabric/HANDOFF_2026-09-14_VOS_FABRIC_V2.md` solo per contesto storico non superato.

Subito dopo verifica lo stato GitHub live, perché può essere avanzato dopo l’handoff:

- `venture-os` PR #6;
- `fluxion-desktop` PR #70 — G2 Codex;
- `fluxion-desktop` PR #71 — G4/G5;
- `fluxion-desktop` PR #74 — A2 Antigravity.

Non fidarti dei body PR se contrastano con run/job/SHA più recenti.

## Stato esatto da cui riprendere

### G2 Codex

G2 è certificato GREEN:

`G2=GREEN;run=34964332252;job=certify;fabric=18752fb147f6700d4dc0633a55b9367d00ef0d91;head=4d71653fce595c043636f78ae75aafa7f5612435;runtime_parent_run=34888246045;runtime_parent_job=104321135055`

La capacità Codex successivamente è risultata quota-bounded. Non comprare crediti, non usare API-key fallback e non ruotare account.

### A2 Antigravity

A2 è **FULL GREEN** con split exact-runtime-core + bounded-lifecycle composite.

Runtime core:
- run `35001277172`
- job `104489983602`
- head `404700158ce0effbf79015c43861dc610ea49c09`

Composite/lifecycle:
- run `35001894829`
- job `104492019056`
- head `490bdef15b266c4c21ee6059081a4088bc3cfd05`
- exact gate commit `443d285caff4631de6d0f94d3a28cc765f6b914a`

Qualification ref canonica:

`A2=GREEN;runtime_run=35001277172;runtime_job=104489983602;runtime_head=404700158ce0effbf79015c43861dc610ea49c09;fabric_a2=443d285caff4631de6d0f94d3a28cc765f6b914a;composite_run=35001894829;composite_head=490bdef15b266c4c21ee6059081a4088bc3cfd05`

Worker identity/evidence:
- Antigravity `1.2.3`
- package SHA256 `57afb34f2a4be9296beb477e600761b6ac7401eb3a54a64a0014d573b7fc3af4`
- binary SHA256 `c4c8a6722f9b570e370941b0953ba29051336307d7999ec842bdf7500b0ca7c8`
- gate SHA256 `38b8cabbf3a660fcbf697365a9652d9f8aeb070daa35140280739fdbcd443237`
- model `gemini-3.8-flash-high`
- conversation `a3ff795f-838f-4bdd-aba8-335e5d4c1d4c`
- first events SHA256 `6907bbf506de35666d373cad39848eadbac3b8150026c35b5cbf39b51b711811`
- resume events SHA256 `041c9b20b06c09691cd08cc703f48ead9437ddd4ee8cd86d3c2a7b275f1cd21b`
- real exact-workspace `write_to_file` + `view_file` GREEN
- exact resume GREEN
- persisted direct auth after VM restart GREEN
- `useG1Credits=false` after restart GREEN
- API-key fallback 0
- credit fallback 0
- production mutations 0
- current A2 data-policy ceiling: `PUBLIC`

**Non ripetere il qualifier A2 inference solo per ottenere un job monolitico GREEN.** Il composite ha già revalidato l’exact core e chiuso il lifecycle reale.

### G4/G5

PR #71 ha repo/router contract storico GREEN, ma il real runtime Codex-only è rimasto fail-closed per provider capacity:
- run `34964855224`
- job `104366796337`
- mandate SHA256 `9a7785af557da76405dfd2b28f9a9b481603f51a8e6bd77057132722a36ad46c`

Quindi NON dichiarare ancora G4/G5 GREEN.

## Mandato operativo della nuova sessione

Prosegui senza prompt intermedi dal punto certificato sopra e porta a evidenza reale la **catena multi-worker G4 → G5**.

Sequenza richiesta:

1. Verifica live head/run/check delle quattro PR indicate.
2. Registra/binda nel contratto VOS/router l’exact A2 qualification ref, mantenendo VOS unica root authority.
3. Mantieni A2 `PUBLIC` only.
4. Usa evidenza reale per marcare Codex breaker OPEN quando la sua capacità è indisponibile; non simulare un errore sano come quota.
5. Esegui un vero obiettivo `PUBLIC` attraverso:
   `VOS root -> deterministic router -> A2 DIRECT_OFFICIAL -> normalized result -> deterministic verification -> durable checkpoint`.
6. Prova `FOUNDER_PROMPT_SHUTTLING=0`, `PAID_API_FALLBACK=0`, `PRODUCTION_MUTATIONS=0`.
7. Esegui G5 da un processo/continuation boundary distinto partendo dal checkpoint durevole.
8. Prova exactly-once: una claim isolata deve riuscire una volta e il replay deve essere rifiutato; nessun effetto duplicato.
9. Solo con run/job/SHA reali emetti `G4=GREEN` e `G5=GREEN`.
10. Se un provider è quota-bounded, fail closed e usa solo worker già certificati ed eleggibili; non comprare capacità e non aggirare limiti.
11. Dopo G4/G5, continua la diversificazione secondo `2026-09-15-gemini-deep-review.md`, iniziando da Mistral Vibe Free/PAYG OFF, senza promuovere provider solo da documentazione.
12. Alla fine aggiorna `docs/fabric/HANDOFF_LATEST.md` con il nuovo exact state e lascia un nuovo prompt di continuazione se resta lavoro.

## Vincoli assoluti

- `MAX_COST_USD=0`
- no paid fallback
- no credit purchase/top-up
- no account rotation/quota circumvention
- no unofficial OAuth proxy substitution per worker DIRECT_OFFICIAL
- quattro data class canoniche: `PUBLIC`, `INTERNAL`, `CONFIDENTIAL`, `SECRET`
- `SECRET` non esce da boundary locali esplicitamente certificati
- VOS possiede authorization, state, checkpoint e effect ledger
- unknown eligibility = fail closed
- exact SHA/run/job prima di GREEN
- non mutare Guardian / FLUXION / NAS / telephony / DB / firewall / VPN senza mandato separato
- non fare merge di PR Draft solo per chiudere bookkeeping
- obiettivo operativo: **ZERO gesti founder**, salvo credential/consent gate first-party realmente non automatizzabili

Lavora direttamente con i tool disponibili, conserva evidenze esatte e non chiedermi di ripetere informazioni presenti nell’handoff.