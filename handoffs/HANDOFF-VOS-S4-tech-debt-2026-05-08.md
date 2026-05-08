# HANDOFF S3 → S4 — Chiusura debiti tecnici

**Generato**: 2026-05-08T17:35Z (fine sessione S3)
**Sessione successiva**: S4 dedicata tech debt closure
**Stato S3 chiuso**: VERDE (8/8 item, vedi ultimo turno sessione S3)

---

## Come riprendere

1. Chiudi sessione S3 corrente (`/exit`)
2. Apri nuova sessione Claude Code da `~/venture-os`
3. Incolla il prompt nel blocco qui sotto

---

## Prompt resume (copia-incolla in nuova sessione)

```
Sessione S4 dedicata: chiusura debiti tecnici S3.

Leggi nell'ordine:
1. ~/.claude/projects/-Users-macbook/memory/MEMORY.md (4 voci, una è VOS git backup)
2. state/blueprint-deviations.jsonl ultime 2 righe (S3, debiti rsync-delete + hook-not-versioned)
3. git log --oneline -3 (ultimo: dd858cf S3 add claude-memory-backup)
4. handoffs/HANDOFF-VOS-S4-tech-debt-2026-05-08.md (questo file)

Affronta in ordine, uno step alla volta con verifica:

STEP 1 — HEAD-based check nel brief
Aggiungere a components/morning-briefer/briefer.py funzione che confronta
HEAD locale vs HEAD remoto imac:~/git-backups/venture-os.git via SSH.
Se diversi, segnala "backup iMac in ritardo, N commit non pushati"
in sezione ## Segnali. Copre scenari dove hook non scatta affatto.

STEP 2 — Install scripts versionati
Creare scripts/install-hooks.sh e scripts/install-launchagents.sh che
copiano file da paths sorgente nel repo (scripts/hooks/post-commit,
scripts/launchagents/*.plist) verso ~/Library/LaunchAgents/ e
.git/hooks/. Include chmod +x e launchctl load -w.
Sposta gli artefatti correnti dentro il repo.

STEP 3 — Snapshot rotation memory backup
Decidere tool (rsnapshot built-in macOS? borg? rsync con hard-link --link-dest?)
e implementare rotation N giornaliere su iMac per ~/backups/claude-memory/.
Trade-off space vs recovery window.

Vincoli: una raccomandazione tecnica per volta, autocritica 4 punti
dopo ogni proposta, push automatico via hook esistente, niente PARTIAL.
```

---

## Contesto già su disk (S4 deve solo leggerlo)

### Memorie persistenti `~/.claude/projects/-Users-macbook/memory/`
- `project_vos_git_backup_imac.md` — pattern push automatico iMac
- `feedback_launchd_volumes_fda.md` — TCC su /Volumes (esteso S3 con bash SIP)
- `feedback_python_cross_host_compat.md` — typing.Optional cross-host
- `user_pattern_operativo_macbook.md` — MacBook spento la notte → RunAtLoad

### Deviations tracciate `state/blueprint-deviations.jsonl`
- S3 entry: `claude-memory-backup-rsync-delete` → STEP 3
- S3 entry: `post-commit-hook-not-versioned` → STEP 2

### Stato git venture-os
- HEAD: `dd858cf` (S3 add claude-memory-backup component)
- Remote `imac`: parità verificata
- Ultimi 3 commit: `dd858cf`, `ad29a7d`, `55dd351`

### Artefatti correnti da spostare nel repo (STEP 2)
- `~/venture-os/.git/hooks/post-commit` → `scripts/hooks/post-commit`
- `~/Library/LaunchAgents/com.luke.vos.claude-memory-backup.plist` → `scripts/launchagents/`
- (altri plist VOS: morning-brief, host-monitor, runatload-check)

---

## Definizione di completato S4 (per non chiudere PARTIAL)

- [ ] STEP 1: brief mostra "backup iMac in ritardo" se HEAD diverge — testato
- [ ] STEP 2: clone fresco di venture-os + esecuzione 2 install scripts ricostruisce tutti i hook + LaunchAgent — testato
- [ ] STEP 3: snapshot rotation attiva su iMac, almeno 7 punti recovery, log rotation visibile

Se uno step si rivela troppo grande in S4, fai handoff S4 → S5 sullo stesso modello.
