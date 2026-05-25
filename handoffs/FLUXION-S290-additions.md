# FLUXION S290 — Additions da incollare in NEXT_SESSION_PROMPT.md S291

**Source**: VOS audit cross-session 2026-05-25T17:30Z
**Sessione VOS**: audit triggered by Luke prompt "context 71% + hooks check"

---

## ⚠️ Override Task #0 — Privkey Ed25519 PERSA

**Stato verificato empiricamente da VOS**: `/tmp/fluxion-ed25519-priv-pkcs8.b64` **NON ESISTE PIÙ** al timestamp audit. /tmp/ flushato (reboot o cleanup macOS). Privkey **definitivamente persa**.

**Pubkey `0616ecd7a332de86a984dfafa87eb64915c47fecca7a3b82058a2d56e01ad5d9`** = **kid v1 BURNED**, non riutilizzabile.

**Task #0 obbligatorio S291** (precede genera-nuovo-CF-token):

1. **Genera nuova keypair Ed25519 come kid v2** — comando atomico, NON in /tmp/:
   ```bash
   # Esempio canonico Node.js (verificare adattamento allo stack FLUXION reale):
   node -e "
   const c = require('crypto');
   const { publicKey, privateKey } = c.generateKeyPairSync('ed25519');
   const priv = privateKey.export({type:'pkcs8',format:'der'}).toString('base64');
   const pub = publicKey.export({type:'spki',format:'der'}).toString('base64');
   console.log('PRIV_B64=' + priv);
   console.log('PUB_B64=' + pub);
   "
   ```

2. **Privkey va in Cloudflare Worker secret** (canonico per Workers, encrypted at rest CF-side, persistente, audit-able):
   ```bash
   wrangler secret put ED25519_PRIV_KID_V2 --env <env>
   # incolla PRIV_B64 quando richiesto
   ```
   Se token CF ancora senza permesso Workers Scripts:Edit → genera token completo PRIMA (vedi Task #1 originale handoff S290).

3. **Backup ridondante in macOS Keychain locale** (sopravvive a CF outage durante setup):
   ```bash
   security add-generic-password \
     -a "luke" \
     -s "fluxion-ed25519-priv-kid-v2" \
     -w "$PRIV_B64" \
     -T /usr/bin/security \
     -U
   # Read: security find-generic-password -a luke -s fluxion-ed25519-priv-kid-v2 -w
   ```

4. **MAI PIÙ /tmp/ per asset crittografici** — audit deviation `fluxion-privkey-tmp-generation-antipattern` registrato in `~/venture-os/state/blueprint-deviations.jsonl`.

---

## ✅ Fix infrastrutturale già applicato da VOS (no action richiesta S291)

VOS ha modificato `/Volumes/MontereyT7/FLUXION/.claude/hooks/context_budget_gate.py`:

1. **macOS Notification** osascript per CLOSING_ONLY/HARD_STOP (throttle 300s/sessione). Visibile al founder fuori chat, non dipende da attention del main. Testato Big Sur 11.7.10 ✓.
2. **Bridge file race-condition mitigation**: write ora è read-modify-write merge — cc-statusline npm legacy writer non sovrascrive più `budget_state`. Statusline FLUXION ora mostrerà badge `🟠 CLOSING` / `💀 HARD-STOP` correttamente.

**Per validare in S291**: appena context arriva a 70% dovresti ricevere notifica desktop macOS "FLUXION Context Gate — CLOSING_ONLY 70%". Se non arriva, fix muto = riapri investigazione.

---

## Stato Task originali S290 (invariato)

- ✅ FASE 2.1 stripe-webhook.ts + lib/ed25519.ts letti
- 🔴 FASE 2.2 → **REGEN obbligatorio (kid v2)** come Task #0 sopra
- 🔴 FASE 2.3 blocked — CLOUDFLARE_API_TOKEN scope D1:Edit + Workers Scripts:Edit + User:Read mancanti
- ⏸️ FASE 2.4-2.8 pending blocker token

**Token CF nuovo permessi richiesti**: Account → D1 → Edit + Account → Workers Scripts → Edit + User → User Details → Read **+ Account → Workers KV Storage → Edit** (se non già) **+ secrets** (per `wrangler secret put`).
