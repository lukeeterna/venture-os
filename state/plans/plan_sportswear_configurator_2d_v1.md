# Piano — CATENA VIA 3: Configuratore 2D vettoriale (v1)

> Fonte di verità durevole per riprendere fuori dal contesto di sessione.
> Mandato: giudice, 2026-07-17. Deliverable NEW: `ventures/run_20260711_161411/configurator-2d/`.
> Il configuratore 3D esistente (`configurator/`) NON si tocca.

## FASE 0 — esito (2026-07-17)
- `git log -1` = `12811fa auto-close session @2026-07-17T19:37:57Z` (auto-close → non discordanza).
- `git status --short` = pulito.
- Tra `8be510e` e HEAD: solo `12811fa` auto-close → **nessuna DISCORDANZA**.
- Target `configurator-2d/` = ASSENTE (nessun clobber).
- Headless Chrome verificato: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` presente (per evidenza screenshot).
- Riferimento stile: shell UI scura di `configurator/index.html` (3D) — il subagent la legge per coerenza cromatica/header, NON la modifica.

## Baseline discordanza per la catena
**FASE 0 HEAD atteso = `580c704`** (report integrazione al giudice — commit legittimo a registro, ratificato ADDENDUM v2 §D). Commit `auto-close session ...` successivi = tollerati, MAI discordanza. Qualunque ALTRO commit non a registro = DISCORDANZA e STOP.

## Ratifica integrazione (giudice, ADDENDUM v2 — 2026-07-17)
Report `580c704` = **APPROVATO**. Configuratore pubblico → preventivatore backoffice, zero-backend, zero-cost. SOLO dati non economici attraversano il confine; i prezzi nascono esclusivamente nel backoffice, dopo. Conseguenze recepite: MT-2D.6 ridefinito (payload JSON client-safe), MT-2D.9 nuovo (import nel preventivatore). NEXT_SESSION_PROMPT del run (fermo 15/07, FASE B GLTF) = **SUPERATO**; verdetto gate A2 3D = NEGATIVO; via ratificata = VIA 3 (2D).

## Stack fissato (identico al preventivatore)
Single-file `configurator-2d/index.html`, vanilla JS, **ZERO CDN**, SVG inline, `file://`+`http.server`, Safari 14/Big Sur + mobile. ES2019-safe. localStorage per stato client.

## Regime v2 (ratificato giudice)
- Unico gate founder intermedio = **MT-2D.1** (screenshot template nudo → SÌ/NO).
- Dopo il SÌ: CC avanza MT→MT **in autonomia** SOLO se TUTTE: verify verde committato+pushato · contesto <50% · nessuna DISCORDANZA. Qualunque rosso/dubbio/soglia → STOP verso giudice.
- Correzioni = unità nuove TRA gli MT.
- Fine catena (MT-2D.8): sigillo finale founder su URL deployato (browser+mobile).

## Regola di evidenza (vincolante)
Ogni verify = script ESEGUIBILE con esito leggibile dal giudice sul mirror:
`configurator-2d/verify/mtN/` con report testuale + screenshot **committati**. Niente `console.assert` invisibili. Headless Chrome OK.
Comando screenshot di riferimento (adattare):
`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --screenshot=out.png --window-size=1200,1000 --hide-scrollbars <url o file>`

## Delega (REGOLA #0, autorizzata dal giudice)
- Build MT → subagent `frontend-developer`.
- Deploy prep MT-2D.8 → subagent `devops-automator`.
- Verifiche, Rule 1d, FASE CHIUSURA restano in main context: il main verifica l'output subagent PRIMA di committare.

## Confidenzialità (repo PUBLIC — invariante dal preventivatore)
Nessun valore economico reale in codice/default/commenti/commit. Placeholder attività `[ATTIVITA]/[EMAIL_ATTIVITA]/[TEL]`. **VINCOLO NO-PREZZO** sull'output cliente (MT-2D.6): grep case-insensitive `prezzo|costo|eur|€` = zero match nell'output cliente.

## Microtask — stato
- [x] **MT-2D.1** TEMPLATE NUDO (gate founder). — **STATO 2026-07-17: BUILT (delega frontend-developer, 2 iterazioni: silhouette maglia rifatta da clipart→teamwear set-in), verify VERDE indipendente (5/5 zone id, NO-PREZZO=0, NO-CDN=0, 0 `<script>`, screenshot fronte/retro in `verify/mt1/`), committato+pushato. IN ATTESA gate founder SÌ/NO — nulla avanza a MT-2D.2 prima del SÌ.** SVG flat-apparel professionale: MAGLIA fronte+retro (girocollo, maniche corte raccordate, spalle realistiche, proporzioni teamwear stile VX3/Macron — non clipart/squadrato) + PANTALONCINI + CALZETTONI. Vista fronte/retro affiancata o toggle. Zone = path/gruppi SVG con id `body, sleeves, collar, shorts, socks` (≥5), colori neutri default. Shell UI scura. NESSUN controllo, solo template grande + header. Evidenza: screenshot headless fronte/retro in `verify/mt1/`. STOP: screenshot al founder → SÌ/NO. Al NO: STOP, decide il giudice.
- [ ] **MT-2D.2** COLORI: picker per ogni zona (5+), `input type=color`, fill live. Verify: script cambia 2 zone, legge computed fill, screenshot.
- [ ] **MT-2D.3** PATTERN sul body: tinta unita, strisce V/H, fascia, banda diagonale, metà, chevron (SVG defs). Verify: 3 pattern applicati, screenshot ciascuno.
- [ ] **MT-2D.4** NOME+NUMERO sul retro, 4-6 font sportivi license-safe (system stack o font liberi embeddati; licenza in `configurator-2d/ASSET_LICENSE.md`). Verify: testo+font applicati, screenshot.
- [ ] **MT-2D.5** UPLOAD SPONSOR client-side (PNG/JPG/SVG via FileReader, validazione formato/peso, posizionamento sul petto, ZERO upload server). Verify: PNG di prova generato in locale, caricato, screenshot.
- [ ] **MT-2D.6** RIEPILOGO + CTA "Richiedi preventivo gratuito" (RIDEFINITO, ADDENDUM v2 §B). La CTA produce un **payload JSON compatto client-safe**: `v:1` · `cliente {societa, referente, recapito}` · `righe [{voce-label, quantita}]` · `design {zone/colori, pattern, nome, numero, font, sponsor:si/no}`. **SENZA alcun campo economico, nemmeno vuoto o placeholder.** Schema **congelato** in `configurator-2d/PAYLOAD_SPEC.md`, committato NELLO STESSO MT. Due canali di consegna al founder: blocco `--- CONFIG ---` nel corpo del `mailto:[EMAIL_ATTIVITA]` + bottone "Copia codice preventivo" (clipboard con fallback `execCommand`). **NO-PREZZO assoluto esteso al payload machine-readable**. Verify: grep case-insensitive `prezzo|costo|margine|eur|€` = 0 match sull'output cliente E sul payload + screenshot.
- [ ] **MT-2D.7** RESPONSIVE 375px + accessibilità (focus visibile, label/aria, prefers-reduced-motion) + se banale: export PNG "scarica il tuo kit". Verify: screenshot mobile + tab-nav dichiarata.
- [ ] **MT-2D.8** DEPLOY PREP: struttura statica per Cloudflare Pages + `README-DEPLOY.md` (connessione repo da dashboard, root directory, zero build step). Nessuna credenziale gestita da CC: STOP, consegna i click al founder. Sigillo finale founder su URL deployato (browser+mobile).
- [ ] **MT-2D.9** IMPORT NEL PREVENTIVATORE (NUOVO, ADDENDUM v2 §C — dopo MT-2D.8, stesso regime autonomo). Nel backoffice `ventures/run_20260711_161411/tools/preventivatore/index.html`: nuova funzione **"Importa da configuratore"** che legge il payload `v:1` e **PRECOMPILA un NUOVO preventivo** (cliente + righe con label e quantità, **prezzi VUOTI** — il founder li mette dopo). È un **MERGE**, capability diversa da `importaJson` (backup/restore dell'intero stato) che resta **INVARIATO**. **Rule 1d** su `tools/preventivatore/index.html` (backup verificato per stat prima di Edit). Il preventivatore **NON si tocca prima di questo MT**. Verify: payload di prova → import → preventivo precompilato (screenshot vista preventivo con cliente+righe, prezzi vuoti) + report committati.

## FASE CHIUSURA per ogni MT
Aggiorna questo piano + `git add` SOLO file deliverable + verify → commit `sportswear: 2D MT-2D.N <cosa>` → git status pulito dalle proprie modifiche → hash → verifica push (`state/git-push.log` o `ls-remote`) → report in `docs/judge/` (scelta dichiarata: **un file di catena aggiornato** `docs/judge/2026-07-17-sportswear-configurator-2d.md`, una sezione per MT). MAI `state/*.jsonl` in git add.

## Discipline invariate
DISCORDANZA · Rule 1d su ogni file esistente (backup verificato per stat prima di Edit) · soglia contesto 50% con chiusura ordinata · accept-edits OFF ('1' a ogni edit, 'allow all' VIETATA) · nel report niente stato mode né stime contesto · STOP tra unità verso il giudice, non verso il founder.

## Resume point (2026-07-17, post-ratifica giudice ADDENDUM v2)
Ratifica integrazione recepita nel piano (MT-2D.6 ridefinito, MT-2D.9 aggiunto, FASE 0 HEAD=`580c704`). **Nulla ancora costruito** lato configuratore-2D. Prossima sessione: FASE 0 (HEAD atteso `580c704`, auto-close successivi tollerati) → eseguire **MT-2D.1** (build via frontend-developer → screenshot headless fronte/retro in `verify/mt1/` → verify verde → FASE CHIUSURA commit+push → STOP: screenshot al founder per SÌ/NO). Riferimenti visivi MT-2D.1 (look, don't copy — VIETATO scaricare/ricalcare/riprodurre asset/loghi/brand di terzi): realizesport.com, vx-3.com, spized — SOLO proporzioni, silhouette, ordine passi UX. Il configuratore 3D e il preventivatore `8be510e` non si toccano (preventivatore fino a MT-2D.9).

## Rollback
File/cartelle nuove → `git revert` del commit d'unità MT.
