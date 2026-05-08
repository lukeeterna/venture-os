# scripts/ — Bootstrap deterministico VOS

Artefatti versionati che vivono fuori dal working tree git (`.git/hooks/`, `~/Library/LaunchAgents/`)
ma sono critici per il funzionamento di VOS. Da eseguire **una volta dopo ogni clone fresco**.

## Post-clone

```bash
cd ~/venture-os
bash scripts/install-hooks.sh
bash scripts/install-launchagents.sh
```

## Cosa installa

- `hooks/post-commit` → `.git/hooks/post-commit` — push automatico fire-and-forget al bare repo iMac (`imac:~/git-backups/venture-os.git`).
- `launchagents/com.luke.vos.host-monitor.plist` — probe risorse MacBook ogni N min.
- `launchagents/com.luke.vos.morning-brief.plist` — brief markdown italiano in `briefs/`.
- `launchagents/com.luke.vos.claude-memory-backup.plist` — rsync memorie Claude → iMac al login.
- `launchagents/com.luke.vos.runatload-check.plist` — heartbeat startup MacBook.

## Idempotenza

Entrambi gli script sono idempotenti: rieseguibili in sicurezza per allineare i file installati alla
sorgente versionata dopo modifiche a `scripts/hooks/` o `scripts/launchagents/`.
