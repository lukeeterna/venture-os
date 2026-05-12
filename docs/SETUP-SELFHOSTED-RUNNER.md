# Setup GitHub Actions Self-Hosted Runner (MacBook)

> Origine: S207 — Sara Release Gate full (Opzione B). Runner MacBook esegue gate REALE
> con stress test multi-vertical + audit log, chiamando iMac via SSH come fa già lo script.
>
> **Vincoli rispettati**: zero-cost (GitHub free per self-hosted), outbound-only (nessuna porta aperta), Big Sur compatible.

## Cosa fa il runner

1. Resta in idle in attesa di job da GitHub (poll outbound, no porte aperte).
2. Quando arriva un job dal workflow `sara-release-gate.yml`:
   - Clona repo in `~/actions-runner/_work/`
   - Esegue `python3 ~/venture-os/components/sara-gate-orchestrator/orchestrator.py`
   - L'orchestrator chiama `/Volumes/MontereyT7/FLUXION/scripts/sara-release-gate.sh`
   - Lo script SSH-a iMac e gira pipeline live
3. Propaga exit code a GitHub → block merge su FAIL.

## Setup una tantum (15 min)

### 1. Genera token registrazione GitHub

Vai su:
```
https://github.com/<USER>/fluxion/settings/actions/runners/new
```
(sostituisci `<USER>` con il proprio username GitHub)

Copia il comando `./config.sh --url ... --token ...` che mostra (token valido 1h).

### 2. Scarica e installa runner

```bash
cd ~
mkdir -p actions-runner && cd actions-runner

# macOS Intel (Big Sur compatible) — verifica versione corrente su
# https://github.com/actions/runner/releases
RUNNER_VERSION="2.319.1"
curl -o actions-runner-osx-x64.tar.gz -L \
  https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-osx-x64-${RUNNER_VERSION}.tar.gz
tar xzf actions-runner-osx-x64.tar.gz
rm actions-runner-osx-x64.tar.gz
```

### 3. Registra runner con labels FLUXION

Esegui il comando `config.sh` copiato dallo step 1, AGGIUNGENDO i labels:

```bash
./config.sh \
  --url https://github.com/<USER>/fluxion \
  --token <TOKEN_DA_STEP_1> \
  --name macbook-fluxion \
  --labels self-hosted,macbook,fluxion \
  --work _work \
  --unattended
```

Il workflow `sara-release-gate.yml` matcha esattamente questi labels:
```yaml
runs-on: [self-hosted, macbook, fluxion]
```

### 4. Test manuale (verifica funzioni)

```bash
cd ~/actions-runner
./run.sh
```

In altra finestra, su GitHub vai a:
```
Actions → Sara Release Gate (Full) → Run workflow
```

Dovrebbe partire entro 10s, eseguire ~5-12 min, mostrare verdetto.

### 5. Avvio permanente (LaunchAgent on-demand)

Una volta validato:

```bash
cd ~/actions-runner
./svc.sh install     # crea LaunchAgent
./svc.sh start       # avvio runner background
./svc.sh status      # verifica stato
```

**Disinstallare** (se serve):
```bash
cd ~/actions-runner
./svc.sh stop
./svc.sh uninstall
./config.sh remove --token <NUOVO_TOKEN>
```

## Costi & impatto risorse

| Voce | Valore |
|------|--------|
| Costo GitHub | €0 (self-hosted unlimited) |
| RAM idle | ~200 MB |
| RAM peak job | ~500 MB (Python orchestrator + SSH) |
| Disco `_work/` | ~500 MB-2 GB (artifact + clones) |
| Cleanup | Settimanale: `rm -rf ~/actions-runner/_work/_temp/*` |

## Troubleshooting

| Problema | Causa | Fix |
|----------|-------|-----|
| Runner offline | MacBook spento/sleep | `caffeinate -i` durante job critici, oppure ./svc.sh restart |
| Job pending forever | Labels non matchano | Verifica `[self-hosted, macbook, fluxion]` esatti in workflow + config |
| `T7 non montato` exit 2 | Disco T7 unmount | `diskutil mount /dev/diskNs1` |
| SSH iMac fail | iMac unreachable | Verifica `ssh imac echo ok` funziona da terminale |
| Token registrazione scaduto | >1h da generazione | Rigenera token su GH settings |

## Sicurezza

- Runner ha accesso al repo FLUXION → tratta token come segreto
- Non eseguire workflow da fork non trusted (GitHub block default per fork)
- Audit log: ogni run registrato in `~/venture-os/state/sara-gate-runs.jsonl`
- Errori: `~/venture-os/state/errors.jsonl`

## Reference

- GitHub docs self-hosted: https://docs.github.com/en/actions/hosting-your-own-runners
- Workflow: `.github/workflows/sara-release-gate.yml`
- Orchestrator: `~/venture-os/components/sara-gate-orchestrator/orchestrator.py`
- Wrapper: `/Volumes/MontereyT7/FLUXION/scripts/sara-release-gate.sh`
