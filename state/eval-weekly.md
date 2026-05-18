⚠️ ALERT — success rate globale 66.7% < 80%

# VOS Eval Dashboard — ultimi 7gg

_Generato: 2026-05-18T09:09:43Z | EUR/USD rate: 1.1 (hardcoded, TODO: move to config)_

---

## Summary

| metrica | valore |
|---------|--------|
| Total delegations | 3 |
| Total cost | $0.000391 USD / €0.000430 EUR |
| Avg latency | 1013 ms |
| Global success rate | 66.7% (2/3) |

---

## Per agent

| agent | invocations | success_rate | avg_cost_usd | avg_latency_ms |
|---------|-------------|--------------|--------------|----------------|
| code-reviewer | 1 | 100.0% | $0.000182 | 1340 |
| decision-validator | 1 | 0.0% | $0.000091 | 720 |
| research-fact-checker | 1 | 100.0% | $0.000118 | 980 |

---

## Per task type

| task_type | invocations | success_rate | avg_cost_usd | avg_latency_ms |
|---------|-------------|--------------|--------------|----------------|
| code_review | 1 | 100.0% | $0.000182 | 1340 |
| decision_validation | 1 | 0.0% | $0.000091 | 720 |
| fact_check | 1 | 100.0% | $0.000118 | 980 |

---

### Anti-pattern detected

Nessun anti-pattern (nessun task_type fallito ≥3x nello stesso giorno).

### Quota check

Gemini Flash ultimi 24h: **2/250** RPD (1%) — OK

---

_Fonte: `state/eval.jsonl` | Cutoff 7gg: 2026-05-11T09:09:43Z_
