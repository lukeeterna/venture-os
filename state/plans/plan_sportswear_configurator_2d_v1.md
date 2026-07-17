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
Commit `auto-close session ...` = MAI discordanza. Qualunque commit NON auto-close successivo a `8be510e` che NON sia un MT a registro = DISCORDANZA e STOP.

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
- [ ] **MT-2D.1** TEMPLATE NUDO (gate founder). SVG flat-apparel professionale: MAGLIA fronte+retro (girocollo, maniche corte raccordate, spalle realistiche, proporzioni teamwear stile VX3/Macron — non clipart/squadrato) + PANTALONCINI + CALZETTONI. Vista fronte/retro affiancata o toggle. Zone = path/gruppi SVG con id `body, sleeves, collar, shorts, socks` (≥5), colori neutri default. Shell UI scura. NESSUN controllo, solo template grande + header. Evidenza: screenshot headless fronte/retro in `verify/mt1/`. STOP: screenshot al founder → SÌ/NO. Al NO: STOP, decide il giudice.
- [ ] **MT-2D.2** COLORI: picker per ogni zona (5+), `input type=color`, fill live. Verify: script cambia 2 zone, legge computed fill, screenshot.
- [ ] **MT-2D.3** PATTERN sul body: tinta unita, strisce V/H, fascia, banda diagonale, metà, chevron (SVG defs). Verify: 3 pattern applicati, screenshot ciascuno.
- [ ] **MT-2D.4** NOME+NUMERO sul retro, 4-6 font sportivi license-safe (system stack o font liberi embeddati; licenza in `configurator-2d/ASSET_LICENSE.md`). Verify: testo+font applicati, screenshot.
- [ ] **MT-2D.5** UPLOAD SPONSOR client-side (PNG/JPG/SVG via FileReader, validazione formato/peso, posizionamento sul petto, ZERO upload server). Verify: PNG di prova generato in locale, caricato, screenshot.
- [ ] **MT-2D.6** RIEPILOGO + CTA "Richiedi preventivo gratuito": raccoglie società/quantità/recapito, apre `mailto:[EMAIL_ATTIVITA]` con la config. **NO-PREZZO assoluto**. Verify: grep case-insensitive `prezzo|costo|eur|€` = 0 match nell'output cliente + screenshot.
- [ ] **MT-2D.7** RESPONSIVE 375px + accessibilità (focus visibile, label/aria, prefers-reduced-motion) + se banale: export PNG "scarica il tuo kit". Verify: screenshot mobile + tab-nav dichiarata.
- [ ] **MT-2D.8** DEPLOY PREP: struttura statica per Cloudflare Pages + `README-DEPLOY.md` (connessione repo da dashboard, root directory, zero build step). Nessuna credenziale gestita da CC: STOP, consegna i click al founder. Sigillo finale founder su URL deployato (browser+mobile) = fine catena.

## FASE CHIUSURA per ogni MT
Aggiorna questo piano + `git add` SOLO file deliverable + verify → commit `sportswear: 2D MT-2D.N <cosa>` → git status pulito dalle proprie modifiche → hash → verifica push (`state/git-push.log` o `ls-remote`) → report in `docs/judge/` (scelta dichiarata: **un file di catena aggiornato** `docs/judge/2026-07-17-sportswear-configurator-2d.md`, una sezione per MT). MAI `state/*.jsonl` in git add.

## Discipline invariate
DISCORDANZA · Rule 1d su ogni file esistente (backup verificato per stat prima di Edit) · soglia contesto 50% con chiusura ordinata · accept-edits OFF ('1' a ogni edit, 'allow all' VIETATA) · nel report niente stato mode né stime contesto · STOP tra unità verso il giudice, non verso il founder.

## Resume point (2026-07-17, chiusura per soglia contesto 50%)
FASE 0 completata, piano scritto. **Nulla ancora costruito.** Prossima sessione: eseguire **MT-2D.1** (build via frontend-developer → screenshot headless fronte/retro in `verify/mt1/` → verify verde → FASE CHIUSURA commit+push → STOP: screenshot al founder per SÌ/NO). Il configuratore 3D e il preventivatore `8be510e` non si toccano.

## Rollback
File/cartelle nuove → `git revert` del commit d'unità MT.
