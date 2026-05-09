# Seed S6 — Blueprint update sezione "Componenti backup"

**Generato**: 2026-05-09 (sessione S5-prep, post-fix GH backup multi-remote)
**Scope S6**: formalizzare in `wiki/BLUEPRINT-JD-v3.4.md` quanto codificato ad-hoc oggi + decidere su `gdrive-backup-per-project` + extension `disk-keeper` con quarantine.
**Trigger**: dopo S5 Karpathy chiusa verde. Mai prima.

## Contesto (da non ri-ricavare)

Sessione S5-prep ha:
- aggiunto remote `github` (PRIVATE) come secondo backup off-site
- esteso `post-commit` hook a multi-remote con log per-remote
- fixato HEAD bare repo iMac (era `main` inesistente, ora `master`)
- tracciato deviation in `state/blueprint-deviations.jsonl` entry `git-backup-multi-remote-codified-ad-hoc` (2026-05-09T16:18Z)

Convenzione codificata da promuovere a blueprint:
- Default branch = `master` ovunque (locale + imac bare + github), no rename a main
- Push fire-and-forget per remote indipendente (un remote down non blocca l'altro)
- Log format `<ts_utc> <remote> OK|FAIL <hash> [msg=...]`
- Brief mattutino segnala drift se ls-remote per qualunque remote indietro >1 commit

## STEP S6 (in ordine)

### 1. Blueprint update minimale (obbligatorio)
Aggiungere a `wiki/BLUEPRINT-JD-v3.4.md` sezione "Componenti backup":
- `git-backup-multi-remote` con convenzioni sopra (testo letterale da deviation entry)
- Regola applicabile a ogni repo VOS-managed (venture-os + ARGOS + FLUXION + Guardian quando avranno repo formalizzato)

### 2. Decidere `gdrive-backup-per-project` (NON automatico)
Prima di implementare, misurare baseline reale:
```bash
du -sh ~/Documents/combaretrovamiauto-enterprise /Volumes/MontereyT7/FLUXION ~/Documents/pulizia-smartphone
```
Se baseline <500MB totale → GDrive overkill, basta rsync iMac→HD esterno già esistente.
Se baseline >2GB → vale la pena. Decidere allora cosa backuppare per progetto.

**Vincoli da rispettare se si procede:**
- 1 account Google primario, NO multi-account (over-engineering oggi, scope creep)
- ARGOS dealer_network.sqlite **MAI** su GDrive del tuo account (ToS violation scraping = ban Gmail = perdita tutto). Se servisse off-site per ARGOS: account dedicato o cifrato age/gpg prima di upload
- Whitelist `backup_include` per progetto, no by-default. Mai `node_modules/`, `target/`, `__pycache__/`, `.venv/`, `dist/`, `build/`, `.env*`
- File >50MB singoli: forza compressione o split

### 3. Decidere extension `disk-keeper` con quarantine (NON automatico)
Logica proposta (da validare con dati prima di codificare):
- Whitelist `disk-keeper-include.yaml` già esistente
- File fuori whitelist + età >N giorni + pattern junk → MV in `state/quarantine/<YYYY-MM-DD>/<path>`, retention 7 giorni, poi `rm`
- Mai delete diretto
- Brief mostra "spazio recuperabile: X MB su Y file" → conferma con `disk-keeper --apply`
- Schedule: LaunchAgent RunAtLoad (no cron — pattern operativo MacBook spento la notte)

**Pre-requisito misurare**: `disk-keeper` attuale già fa qualcosa di simile? Leggere `components/disk-keeper/` PRIMA di estendere. Se già implementa quarantine, S6 step 3 = no-op.

## Anti-pattern da evitare in S6

1. **Bundlare blueprint update + nuovo componente gdrive in stessa sessione** → split. Blueprint prima, gdrive dopo solo se baseline lo giustifica.
2. **Multi-account GDrive** → no, 1 account basta finché Luke non ha esplicito bisogno di separare.
3. **"Periodicamente"** in blueprint → fissa cadenza esatta o non scrivere.
4. **Implementare gdrive-backup come "good practice" senza dato di failure scenario** → costo >0 in complessità, beneficio marginale se rsync iMac→HD esterno già copre disaster recovery LAN.

## Definizione completato S6

- [ ] `wiki/BLUEPRINT-JD-v3.4.md` aggiornato con sezione "Componenti backup" (step 1 obbligatorio)
- [ ] Decisione documentata su gdrive-backup: GO con baseline numerica, oppure NO-GO con motivazione (step 2)
- [ ] Decisione documentata su disk-keeper quarantine: GO se attuale non copre, NO-GO se già coperto (step 3)
- [ ] Entry `state/blueprint-deviations.jsonl` con `task=blueprint-backup-codified` e `resolves: git-backup-multi-remote-codified-ad-hoc`

Se step 2 o 3 dimostra non vale la pena: documenta NO-GO e chiudi S6 verde. Mai PARTIAL.
