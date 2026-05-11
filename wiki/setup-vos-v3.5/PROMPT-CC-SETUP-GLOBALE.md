# Prompt CC — Setup completo vincoli globali Claude Code

> **Da incollare in nuova sessione Claude Code dalla home `~/`.**
> **Allega `CLAUDE.md` (122 righe) E `settings.json` (62 righe).**
> **Tempo: 10 minuti.**

---

Sono Luke. In questa sessione installi i vincoli globali Claude Code in due file:
1. `~/.claude/CLAUDE.md` — vincoli comportamentali (auto-loaded ogni sessione)
2. `~/.claude/settings.json` — hooks deterministici (applicano i vincoli, non interpretano)

Entrambi i file sono allegati a questo messaggio. Tu li metti nel posto giusto, verifichi, testi che funzionino, mi confermi.

## Task in ordine

### 1. Verifica/crea directory `~/.claude/`

```bash
ls -la ~/.claude/ 2>/dev/null && echo "EXISTS" || (mkdir -p ~/.claude && echo "CREATED")
ls -la ~/.claude/
```

### 2. Backup eventuali file esistenti

```bash
TS=$(date +%Y%m%d-%H%M%S)
[ -f ~/.claude/CLAUDE.md ] && cp ~/.claude/CLAUDE.md ~/.claude/CLAUDE.md.bak-$TS && echo "backed up CLAUDE.md"
[ -f ~/.claude/settings.json ] && cp ~/.claude/settings.json ~/.claude/settings.json.bak-$TS && echo "backed up settings.json"
```

### 3. Merge esplicito (NON overwrite) dei due file

**REGOLA**: i file `~/.claude/CLAUDE.md` e `~/.claude/settings.json` esistenti **non vanno sovrascritti**. Vanno fatti merge preservando i blocchi esistenti di Luke (Enterprise Suite agent dispatch, statusLine, autoUpdates) + aggiungendo i blocchi VOS.

#### 3a. Merge `CLAUDE.md` (concatenazione con marker)

```bash
NEW_VOS=/path/to/CLAUDE.md.allegato   # path al file allegato a questo messaggio
OLD=~/.claude/CLAUDE.md
TARGET=~/.claude/CLAUDE.md
TS=$(date +%Y%m%d-%H%M%S)

# Se old esiste: merge. Se non esiste: copia diretta.
if [ -f "$OLD" ]; then
  # Verifica marker non già presenti (idempotenza)
  if grep -q "INIZIO BLOCCO VOS v1.1" "$OLD" 2>/dev/null; then
    echo "MERGE GIÀ FATTO — skip (marker presente)"
  else
    {
      echo "<!-- INIZIO BLOCCO VOS v1.1 -->"
      cat "$NEW_VOS"
      echo ""
      echo "<!-- FINE BLOCCO VOS v1.1 -->"
      echo ""
      echo "<!-- INIZIO BLOCCO ENTERPRISE SUITE (preservato $TS) -->"
      cat "$OLD"
      echo "<!-- FINE BLOCCO ENTERPRISE SUITE -->"
    } > "$TARGET.merged"
    mv "$TARGET.merged" "$TARGET"
    echo "MERGE FATTO — totale righe: $(wc -l < $TARGET)"
  fi
else
  cp "$NEW_VOS" "$TARGET"
  echo "INSTALL NUOVO — $(wc -l < $TARGET) righe"
fi
```

Atteso: file totale ~190 righe (122 VOS + 68 Enterprise + marker), sotto soglia 200 righe auto-load.

#### 3b. Merge `settings.json` (jq deep-merge preservando top-level)

```bash
NEW_VOS_JSON=/path/to/settings.json.allegato
OLD=~/.claude/settings.json
TARGET=~/.claude/settings.json

if [ -f "$OLD" ]; then
  # Verifica già fatto (idempotenza): cerca chiave hooks.SessionStart con marker VOS
  if jq -e '.hooks.SessionStart[0].hooks[0].command | test("Vincoli sessione attivi")' "$OLD" >/dev/null 2>&1; then
    echo "MERGE settings.json GIÀ FATTO — skip"
  else
    # Deep merge: nuovo file aggiunge solo .hooks, esistente preserva statusLine + autoUpdates*
    jq -s '.[0] * .[1]' "$OLD" "$NEW_VOS_JSON" > "$TARGET.merged"
    jq . "$TARGET.merged" > /dev/null && mv "$TARGET.merged" "$TARGET" && echo "MERGE settings.json FATTO" || (echo "JSON INVALIDO POST-MERGE — abort" && rm "$TARGET.merged" && exit 1)
  fi
else
  cp "$NEW_VOS_JSON" "$TARGET"
  echo "INSTALL NUOVO settings.json"
fi
```

Atteso: top-level keys = `["$schema","autoUpdates","autoUpdaterStatus","autoUpdatesChannel","comment","hooks","statusLine"]` (o subset esistente + `hooks` aggiunto). Verifica:

```bash
jq 'keys' ~/.claude/settings.json
jq '.hooks | keys' ~/.claude/settings.json   # atteso 5 eventi
```

#### 3c. Diff esplicito a Luke prima di scrivere (manuale)

Prima di eseguire 3a/3b: mostra a Luke il diff `diff $OLD $TARGET.merged` (o `diff <(cat $OLD) <(cat $NEW_VOS)` per CLAUDE.md), ricevi conferma "ok merge" testuale. Solo dopo conferma: `mv .merged → $TARGET`.

### 4. Verifica scrittura

```bash
ls -la ~/.claude/CLAUDE.md ~/.claude/settings.json
wc -l ~/.claude/CLAUDE.md ~/.claude/settings.json
head -10 ~/.claude/CLAUDE.md
head -10 ~/.claude/settings.json
```

Atteso post-merge:
- `CLAUDE.md`: ~190 righe se merge (122 VOS + 68 Enterprise + marker), oppure 122 se install nuovo. Header preservato.
- `settings.json`: JSON valido. Top-level keys = subset di `[$schema, comment, hooks, statusLine, autoUpdates, autoUpdaterStatus, autoUpdatesChannel]`. Chiave `hooks` contiene SessionStart, PreToolUse, PostToolUse, PreCompact, Stop.

### 5. Validazione JSON settings.json

```bash
jq . ~/.claude/settings.json > /dev/null && echo "JSON valido" || echo "JSON INVALIDO - blocca"
jq '.hooks | keys' ~/.claude/settings.json
```

Atteso: 5 hook events listati (SessionStart, PreToolUse, PostToolUse, PreCompact, Stop).

### 6. Verifica dipendenza jq

I hooks usano `jq` per parsing JSON. Verifica:

```bash
which jq && jq --version || (brew install jq && echo "jq installato")
```

`jq` è leggero standard, install via brew se manca (no preflight check necessario per jq).

### 7. Test funzionale PreToolUse hook (CRITICO)

Verifica che il hook PreToolUse blocchi davvero `pip install` librerie blacklist senza `--dry-run`. NON eseguire mai il comando reale, solo simulazione:

```bash
# Test 1: deve BLOCCARE
INPUT='{"tool_input": {"command": "pip install paddlepaddle"}}'
echo "$INPUT" | bash -c 'INPUT=$(cat); CMD=$(echo "$INPUT" | jq -r ".tool_input.command // \"\""); BLACKLIST='\b(paddlepaddle|paddleocr|tensorflow|torch|torchvision|opencv-contrib-python|mediapipe|onnxruntime-gpu)\b'; if echo "$CMD" | grep -qE "pip install" && echo "$CMD" | grep -qE "$BLACKLIST"; then if ! echo "$CMD" | grep -q -- "--dry-run"; then echo "HOOK BLOCKED: install librerie blacklist senza --dry-run intercettato"; exit 0; fi; fi; echo "HOOK ALLOWED"'
```

Atteso: `HOOK BLOCKED: install librerie blacklist senza --dry-run intercettato`.

```bash
# Test 2: deve PERMETTERE
INPUT='{"tool_input": {"command": "pip install requests"}}'
echo "$INPUT" | bash -c 'INPUT=$(cat); CMD=$(echo "$INPUT" | jq -r ".tool_input.command // \"\""); BLACKLIST='\b(paddlepaddle|paddleocr|tensorflow|torch|torchvision|opencv-contrib-python|mediapipe|onnxruntime-gpu)\b'; if echo "$CMD" | grep -qE "pip install" && echo "$CMD" | grep -qE "$BLACKLIST"; then if ! echo "$CMD" | grep -q -- "--dry-run"; then echo "HOOK BLOCKED"; exit 0; fi; fi; echo "HOOK ALLOWED"'
```

Atteso: `HOOK ALLOWED`.

```bash
# Test 3: deve PERMETTERE (paddlepaddle CON --dry-run)
INPUT='{"tool_input": {"command": "pip install --dry-run paddlepaddle"}}'
echo "$INPUT" | bash -c 'INPUT=$(cat); CMD=$(echo "$INPUT" | jq -r ".tool_input.command // \"\""); BLACKLIST='\b(paddlepaddle|paddleocr|tensorflow|torch|torchvision|opencv-contrib-python|mediapipe|onnxruntime-gpu)\b'; if echo "$CMD" | grep -qE "pip install" && echo "$CMD" | grep -qE "$BLACKLIST"; then if ! echo "$CMD" | grep -q -- "--dry-run"; then echo "HOOK BLOCKED"; exit 0; fi; fi; echo "HOOK ALLOWED"'
```

Atteso: `HOOK ALLOWED` (preflight rispettato).

### 8. Conferma a me

In 5-7 righe italiano:
- File `CLAUDE.md` installato (sì/no, righe)
- File `settings.json` installato (sì/no, JSON valido)
- 5 hook events presenti
- `jq` disponibile o installato
- Test 1 (paddlepaddle senza dry-run) → BLOCKED
- Test 2 (requests) → ALLOWED
- Test 3 (paddlepaddle CON dry-run) → ALLOWED
- Backup eventuali file pre-esistenti (path .bak-*)

### 9. Dichiarazione applicazione vincoli

Dichiara esplicitamente in italiano: "Da questo momento in tutte le sessioni Claude Code future applico i 12 vincoli di `~/.claude/CLAUDE.md`. In particolare riconosco: vincolo n.1 (verifica fattuale prima di scrivere), n.3 (mai liste A/B/C su decisioni tecniche), n.4 (critica strutturale obbligatoria), n.6 (mai stati PARTIAL), n.8 (preflight env check obbligatorio rinforzato dal hook deterministico settings.json), n.9 (mai 'hai ragione' diplomatico), n.10 (output verificato > verosimile), n.12 (scope globale `~/.claude/`, mai project-scoped per VOS). I hooks deterministici in `settings.json` applicano vincolo n.8 (PreToolUse blocca install librerie blacklist) e iniettano riassunto vincoli a SessionStart."

### 10. Avviso riavvio Claude Code

Segnala a Luke che per attivare i hooks deve riavviare Claude Code (chiudere sessione corrente, aprirne una nuova). I hooks sono caricati al startup. CLAUDE.md viene riletto a ogni nuova sessione automaticamente.

## Vincoli operativi questa sessione

- Italiano sempre
- Tempo totale: massimo 10 minuti
- Niente domande di conferma a Luke prima di partire (task deterministici)
- Se test hook fallisce: NON installare comunque, fermati, riporta errore italiano
- Se `jq` non installabile via brew: fermati, riporta errore (hooks dipendono da jq)

## Attendi mio "vai"

Conferma in 3 righe che hai letto questo prompt + hai accesso ai due file allegati `CLAUDE.md` e `settings.json`. Poi attendi mio "vai" per partire dal task 1.
