# Prompt Claude Code — Sessione 1 MVP: Bootstrap Venture OS

> **Da incollare in nuova sessione Claude Code, fuori da progetti specifici (es. dalla home `~/`).**
> **Allega il file `BLUEPRINT-JD-v3.4.md` come riferimento.**
> **Scope: SOLO Sessione 1 della Fase A MVP (sezione 11 del blueprint v3.4).**
> **Non andare oltre. Non implementare disk-keeper Python (è in Fase C).**

---

## Contesto

Sono Luke (Gianluca Di Stasi). ARGOS / FLUXION / Guardian. Lavello (PZ), Italia. Risposta in italiano.

Blueprint v3.4 ha integrato review CC: piano costruzione ristrutturato in **MVP 2 sessioni → Validation Window 7-14gg → 4 sessioni Fase C decise dopo validazione**. Questa è la **Sessione 1 della Fase A MVP**, scope ridotto rispetto a versioni precedenti del prompt.

**Obiettivo Sessione 1 MVP**: cleanup SSD shell-only + struttura VOS su T7 + project-scanner. Niente disk-keeper Python (sposato a Sessione 3 Fase C). Niente LLM router. Niente Streamlit.

**Vincolo session-health**: questa sessione chiude verde (gate raggiunto) o handoff strutturato (prompt resume). Mai "PARTIAL".

---

## Task — esattamente questi, in quest'ordine

### 0. Recovery scope se VOS misplaced (5 min)

```bash
echo "=== FLUXION/.claude scope check ==="
ls -la /Volumes/MontereyT7/FLUXION/.claude/ 2>/dev/null | grep -iE "(venture-os|vos|wiki-curator|brief-narrator|disk-keeper|host-monitor|llm-router)" || echo "FLUXION clean"

echo "=== ARGOS/.claude scope check ==="
ls -la ~/Documents/combaretrovamiauto-enterprise/.claude/ 2>/dev/null | grep -iE "(venture-os|vos|wiki-curator|brief-narrator|disk-keeper|host-monitor|llm-router)" || echo "ARGOS clean"

echo "=== Guardian/.claude scope check ==="
ls -la ~/Documents/pulizia-smartphone/.claude/ 2>/dev/null | grep -iE "(venture-os|vos|wiki-curator|brief-narrator|disk-keeper|host-monitor|llm-router)" || echo "Guardian clean"

echo "=== ~/.claude/ stato attuale ==="
ls -la ~/.claude/ 2>/dev/null || echo "~/.claude/ non esiste, da creare"
```

Se trovi file VOS misplaced: applica recovery secondo blueprint sezione 3.3 (`mv` verso `~/.claude/`). Mostrami cosa sposti prima di farlo.

### 1. Verifica pre-requisiti (5 min)

```bash
df -h | tee ~/Downloads/disk-state-pre-vos.txt
ls /Volumes/MontereyT7/ && echo "T7_OK" || echo "T7_MISSING"
brew --version
which python3 && python3 --version
```

Se T7_MISSING → fermati, chiedimi di collegarlo.

### 2. Cleanup SSD MacBook shell-only (15 min)

**No disk-keeper Python in questa sessione**. Cleanup diretto via 4 comandi standard sui path della whitelist Big Sur compatibile (blueprint v3.4 sezione 7.3):

```bash
# Mostrami stato pre-cleanup di ogni path
du -sh ~/Library/Developer/Xcode/DerivedData 2>/dev/null
du -sh ~/Library/Caches/Homebrew 2>/dev/null
du -sh ~/Library/Caches/{pip,uv} 2>/dev/null
du -sh ~/.npm/_cacache 2>/dev/null
du -sh ~/.cargo/registry/cache 2>/dev/null
du -sh ~/.Trash 2>/dev/null
```

Aggregato totale liberabile mostrato in italiano. **Aspetto mia approvazione esplicita** ("ok procedi" o "salta path X").

Poi:

```bash
brew cleanup --prune=all
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ~/Library/Caches/{pip,uv}/*
rm -rf ~/.npm/_cacache/* 2>/dev/null
xcrun simctl delete unavailable 2>/dev/null
```

**NON includere `~/Library/Caches/com.apple.dt.Xcode/Indexes`** — review CC v3.4 punto 8: causa rebuild lento next session.

### 3. Verifica gate cleanup (2 min)

```bash
df -h | tee ~/Downloads/disk-state-post-cleanup.txt
df -h /System/Volumes/Data | awk 'NR==2 {print $5}'
```

**Gate hard**: SSD MacBook **volume Data** (`/System/Volumes/Data`) deve essere sotto 85%. APFS Big Sur separa System sealed read-only (sempre ~17% di `/`, ~72% capacity column ma irrilevante) da Data read-write (~92% reale pre-cleanup verificato AUDIT 2026-05-07). Cleanup `~/Library/Caches/...` libera spazio in `/System/Volumes/Data`, non in `/`. Misurare `df -h /` darebbe falso positivo. Se sopra 85%, applica PBO sezione 13bis: ricerca con dati altri path safe, proponi raccomandazione singola motivata, attendi mia approvazione, riprova.

### 4. Crea struttura VOS sul T7 (5 min)

```bash
mkdir -p /Volumes/MontereyT7/venture-os/{config,components,state,wiki,briefs,projects,templates,agents,bridges}
mkdir -p /Volumes/MontereyT7/venture-os/components/_shared
mkdir -p /Volumes/MontereyT7/venture-os/components/{project-scanner,host-monitor,morning-briefer}
mkdir -p /Volumes/MontereyT7/venture-os/wiki/{decisions/open,decisions/approved/strategic,decisions/approved/operational,decisions/archived-ideas,projects,workflows,research,raw}
ls -la /Volumes/MontereyT7/venture-os/
```

### 5. Symlink ergonomia (2 min)

```bash
ln -s /Volumes/MontereyT7/venture-os ~/venture-os
ls -la ~/venture-os && cd ~/venture-os && pwd -P
```

`pwd -P` deve mostrare path reale `/Volumes/MontereyT7/venture-os`.

### 6. Crea ~/.claude/ globale + CLAUDE.md root VOS (10 min)

Vincolo blueprint sezione 3.3: VOS è scope GLOBALE.

```bash
mkdir -p ~/.claude/{skills,agents}
ls -la ~/.claude/
```

Crea `~/.claude/CLAUDE.md` (sotto 200 righe, italiano) come L1 cache del VOS:
- Chi è Luke (3-4 righe)
- Vincoli invarianti (zero-cost, max 3 venture, mai Telegram VOS, T7 storage, Big Sur LTS pinning)
- Anti-Scarico-Decisioni hard rule (3 righe richiamando PBO sezione 13bis del blueprint)
- Indice puntatori L2: "wiki/projects/ per ARGOS/FLUXION/Guardian, components/ per moduli, config/routing.yaml per LLM, /Volumes/MontereyT7/venture-os/ è root"

### 7. Implementa is_t7_mounted shared (5 min)

Crea `/Volumes/MontereyT7/venture-os/components/_shared/mount_check.py`:

```python
"""Verifica T7 montato. Ogni componente VOS chiama require_t7_or_exit() all'avvio."""
import os
import sys
import json
from datetime import datetime

T7_MOUNTPOINT = "/Volumes/MontereyT7"
FALLBACK_LOG = os.path.expanduser("~/.venture-os-disconnected.log")

def is_t7_mounted() -> bool:
    return os.path.ismount(T7_MOUNTPOINT)

def require_t7_or_exit(component_name: str):
    if is_t7_mounted():
        return
    msg = {
        "ts": datetime.utcnow().isoformat() + "Z",
        "component": component_name,
        "event": "t7_disconnected",
        "action": "exit"
    }
    with open(FALLBACK_LOG, "a") as f:
        f.write(json.dumps(msg) + "\n")
    print(f"[{component_name}] T7 non montato su {T7_MOUNTPOINT}. Esco.", file=sys.stderr)
    sys.exit(1)

if __name__ == "__main__":
    print("T7 montato:", is_t7_mounted())
```

Test: `python3 ~/venture-os/components/_shared/mount_check.py` → output `T7 montato: True`.

### 8. Implementa project-scanner v0 (30 min)

Crea `config/projects-whitelist.yaml`:
```yaml
active_projects:
  - name: ARGOS
    path: ~/Documents/combaretrovamiauto-enterprise
    stack: python+sqlite
  - name: FLUXION
    path: /Volumes/MontereyT7/FLUXION
    stack: tauri+react+sqlite
  - name: Guardian
    path: ~/Documents/pulizia-smartphone
    stack: python+sqlite
```

Crea `components/project-scanner/scanner.py`:
- Importa `mount_check` shared
- Legge `projects-whitelist.yaml`
- Per ogni progetto: verifica path esiste, cerca marker `CLAUDE.md`, conta righe HANDOFF*.md / MEMORY*.md / STATO_CORRENTE*.md (handoff debt)
- Output: `state/projects-inventory.yaml` con per ogni progetto: path, exists, has_claude_md, db_files (lista `.sqlite`/`.duckdb` trovati), handoff_debt_lines, last_modified
- Stub markdown in `wiki/projects/<NAME>/index.md` con sintesi

Test: `python3 components/project-scanner/scanner.py` → 3 progetti rilevati.

### 9. Git init + primo commit (5 min)

```bash
cd ~/venture-os
cat > .gitignore <<EOF
state/*.jsonl
state/*.log
.env
.env.*
__pycache__/
*.pyc
.DS_Store
EOF

git init
git add -A
git status
git commit -m "Sessione 1 MVP: bootstrap VOS T7 + project-scanner v0 + ~/.claude global"
git log --oneline
```

### 10. Verifica gate finale Sessione 1 MVP

```bash
echo "=== GATE 1: SSD volume Data sotto 85% (APFS) ==="
df -h /System/Volumes/Data | awk 'NR==2 {print $5}'

echo "=== GATE 2: struttura VOS T7 ==="
ls -la /Volumes/MontereyT7/venture-os/

echo "=== GATE 3: symlink ==="
ls -la ~/venture-os && cd ~/venture-os && pwd -P

echo "=== GATE 4: ~/.claude global creato ==="
ls -la ~/.claude/

echo "=== GATE 5: mount_check ==="
python3 ~/venture-os/components/_shared/mount_check.py

echo "=== GATE 6: project-scanner trova 3 progetti ==="
python3 ~/venture-os/components/project-scanner/scanner.py

echo "=== GATE 7: git ==="
cd ~/venture-os && git log --oneline
```

Tutti e 7 i gate devono passare verde. Mostrameli.

---

## Vincoli operativi NON negoziabili

1. **Italiano sempre**, inglese solo per nomi tecnici/comandi/path

2. **PBO sezione 13bis vincolante**: davanti a un blocker, ricerca con dati prima → decisione automatica con regole fisse → procedi nei casi previsti, mai opzioni A/B/C scaricate su di me. Audit in `state/blueprint-deviations.jsonl`.

3. **Mai stato PARTIAL/ARANCIONE**: chiusura verde o handoff strutturato in `~/Downloads/HANDOFF-VOS-S1-{ts}.md` con prompt resume per Sessione 1-bis.

4. **Mai install di librerie pesanti** in questa sessione (solo Python stdlib + comandi shell). Niente pip install di X.

5. **Mai tocchi codice di ARGOS/FLUXION/Guardian**. VOS è separato. Solo Task 0 sposta file VOS misplaced.

6. **Mai stack trace verso di me**: errori interpretati in italiano, originale in `state/errors.jsonl`.

7. **Vincolo scope GLOBALE** (blueprint sezione 3.3): file `.claude/...` VOS vanno in `~/.claude/`, mai in `<progetto>/.claude/`. Discriminante: serve a tutti i progetti? globale.

8. **Context budget**: usa `/context` periodicamente, sopra 60% fai handoff strutturato e fermati. Mai sforare.

9. **Approvazioni mie esplicite richieste solo a**:
   - Task 0 (prima di `mv` recovery)
   - Task 2 (prima di cleanup `rm -rf`)
   - Task 10 (gate finale)

10. **Documentazione**: ogni file nuovo ha header italiano 1-3 righe.

---

## Conferma prima di partire

In 6-8 righe italiano:
- Hai letto BLUEPRINT-JD-v3.4.md integralmente, in particolare 3.3 / 7.6 / 11 / 13bis
- Hai capito che questa è SOLO Sessione 1 MVP della Fase A (cleanup shell + struttura T7 + project-scanner). Niente disk-keeper Python, niente LLM router, niente Streamlit
- Hai capito i 7 gate finali
- Hai capito PBO: ricerca con dati prima di chiedermi cose, mai A/B/C
- Hai capito vincolo scope GLOBALE (~/.claude/ non `<progetto>/.claude/`)
- Hai capito approvazioni richieste solo a Task 0/2/10
- Hai capito che dopo questa sessione segue Sessione 2 MVP (host-monitor + morning-briefer v0), poi Validation Window 7-14gg di USO REALE prima di decidere se costruire Fase C

Poi attendi mio "vai" prima di iniziare il Task 0.

