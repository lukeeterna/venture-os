# Report chiusura — Studio Preventivi sportswear v1

- **Unità**: BUILD studio preventivi interno v1 (run_20260711_161411)
- **Data**: 2026-07-17
- **Deliverable**: `ventures/run_20260711_161411/tools/preventivatore/index.html` (client-side puro, vanilla JS, zero dipendenze/CDN, `file://` + `http.server`, Safari/Big Sur)
- **Righe/peso**: 1753 righe / ~68 KB, singolo file
- **Build**: delegata a subagent `frontend-developer`; verifica eseguita in main context.

## FASE 0
- HEAD `2c2d961` ✓ atteso.
- Path `tools/preventivatore/` ASSENTE ✓ (nessun clobber).
- **DISCORDANZA**: atteso "albero pulito", trovato albero sporco con 3 file di auto-state VOS non correlati (`state/tool-scout-last-run.txt` modificato, `briefs/2026-07-16.md`, `briefs/2026-07-17.md` untracked). Nessuno tocca il path deliverable. Per CLAUSOLA DISCORDANZA (permanente) proceduto col fatto; commit finale limitato ai soli file nuovi dichiarati.

## Confidenzialità (repo PUBBLICO — verificato)
- `github.com/lukeeterna/venture-os` visibility reale = **PUBLIC** (nonostante description "PRIVATE"). Premessa del mandato confermata → clausola confidenzialità necessaria e applicata.
- **Zero valori economici reali** nel codice: listino precaricato = 7 label senza prezzi, tutti `costoUnit:0`, 3 scaglioni vuoti (qMin 1/10/25) — L743-749. Nessun literal prezzo nei default.
- **Dati founder solo in localStorage** + Esporta/Importa JSON. `.gitignore` aggiornato con `**/preventivatore-dati*.json` e `**/*.preventivo.json`.
- **Isolamento margine (assoluto)**: `buildClientOutputData()` (L1252) restituisce struttura client-safe con soli `label/qta/prezzoUnit/totale/subtotale/caparra/note/validita/consegna/attività/logo`; zero accesso a `costoUnit`/`margine`/`tier`. `renderClientOutput()` (L1296) costruisce il DOM cliente esclusivamente da tale struttura → costo/margine **non entrano nel DOM cliente**, non solo nascosti. `generaTestoEmail()` attinge solo da `buildClientOutputData()`. Vista interna costo/margine marcata `data-internal="true"` (L538, L1157-1161) e nascosta anche in `@media print` (L426) come difesa in profondità.

## Checklist requisiti — PRESENTE/ASSENTE (riferimenti codice)
| Requisito | Stato | Rif |
|---|---|---|
| Listino editabile, label senza prezzi, ≥3 scaglioni | PRESENTE | L743-749 |
| Margine % **o** € | PRESENTE | ~9 match `margineTipo`/`pct`/`eur` |
| Arrotondamento configurabile (es. 0,50) | PRESENTE | `arrotond`/`roundTo` |
| Caparra % editabile | PRESENTE | `caparraPct` |
| Validità offerta / tempi consegna / note libere | PRESENTE | tab-parametri |
| Righe voce+qtà → prezzo calcolato + override manuale riga | PRESENTE | `override`/`prezzoManuale` L13 match |
| Numero progressivo (contatore localStorage) | PRESENTE | L770, L1433-1434 |
| Vista interna: costo, prezzo, margine € riga + totale | PRESENTE | L538, L1157-1161 |
| Output cliente pulito + placeholder [ATTIVITA]/[EMAIL_ATTIVITA]/[TEL] | PRESENTE | tab-output, `buildClientOutputData` |
| Logo opzionale caricabile client-side | PRESENTE | `FileReader`/`readAsDataURL` |
| Stampa PDF via print CSS (Safari) | PRESENTE | `@media print` L418-426, `window.print` L1706 |
| "Copia testo email" (nessun invio automatico) | PRESENTE | `generaTestoEmail` L3 match |
| Storico locale con stati bozza/inviato/accettato/caparra | PRESENTE | L1510, ~13 match |
| Salva/carica localStorage + Esporta/Importa JSON | PRESENTE | ~21 match |
| UI italiano, desktop-first, focus visibile, label | PRESENTE | `role="tab"`, `aria-*`, label |

## Addendum (3 integrazioni)
- **A — backup visibile**: `state.lastExportTs` + `state.dirtyAfterExport` (L772-773); `renderBackupStatus()` (L879) mostra "Ultimo export: …" e indicatore dirty non invasivo. Nascosto in stampa (L420).
- **B — contatore nell'export**: `contatore` dentro `state` serializzato (L770), ripristinato integralmente all'import (L1551, alert L1558) → reset storage + reimport non duplica numerazione.
- **C — output cliente blindato**: verificato sopra (isolamento margine). Print e "Copia testo email" attingono solo a dati vista cliente.

## Compatibilità Big Sur / Safari 14
`JSON.parse(JSON.stringify())` al posto di `structuredClone`; no top-level await; solo flexbox/grid; `navigator.clipboard.writeText` con fallback `execCommand('copy')`; `-webkit-print-color-adjust`; sintassi ES2019.

## Sigillo (fatto terminale ESTERNO — pending founder)
La verifica in-sessione copre codice + placeholder. Sigillo = il founder apre `index.html` nel browser, carica i SUOI valori (non riportati a nessuno), genera un preventivo di prova, lo stampa in PDF → "PDF ok" chiude l'unità.

## Rollback
`git revert` del commit dell'unità (deliverable = cartella nuova; i dati del founder stanno fuori da git).
