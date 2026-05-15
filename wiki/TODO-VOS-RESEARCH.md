# TODO VOS Research Items

> Items che richiedono research dedicata. Aggiornato durante Q&A founder VOS improvement.
> Format: `[ ] descrizione | trigger | scope`

---

## Pending research

- [ ] **Test Claude Code memory federation fattibilità** | Trigger: prima cosa next VOS session | Scope: VOS Phase 2.2 decision (Q2 founder S170-post-close). Test 15 min: drop 1 file in `~/.claude/projects/-Users-macbook-Documents-combaretrovamiauto-enterprise/memory/feedback_test_federation.md` da script VOS, poi apertura terminal ARGOS verifica se SessionStart lo legge. Se SI → P2.2 fattibile via rsync. Se NO → sostituire con SessionStart hook injection (estensione P2.1).

---

## Closed research

(vuoto — popolato post-research done)

---

## Convenzione

- `[ ]` pending
- `[x]` done (con link a output research file)
- `[~]` in progress
- Trigger: quando research deve scattare (immediate, post-Phase-X, on-demand)
- Scope: quale fase VOS improvement beneficia
