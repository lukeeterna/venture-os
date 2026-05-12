# S163 resume — post-Colab decision

**Contesto**: notebook `sanitizer_colab/s163_compare_inpaint.ipynb` eseguito su Colab T4 (LaMa vs Qwen-Image-Edit), zip risultati scaricato in `~/Downloads/s163_results.zip`.

## Prompt copia-incolla

```
Riapro S163 post-esecuzione Colab. Il file ~/Downloads/s163_results.zip contiene:
- inputs/ (3 sample auto dealer)
- masks/ (mask manuali LaMa)
- outputs_lama/ (LaMa inpaint con --concat triple)
- outputs_qwen/ (Qwen-Image-Edit prompt-based)
- compare_*.png (strip side-by-side original|LaMa|Qwen)

Procedi:
1. Unzip in sanitizer_colab/outputs/ (mantieni separati lama/ e qwen/)
2. Apri i 3 compare_*.png con `open` per audit visivo Luke
3. Aspetta verdetto Luke (GO LaMa / GO Qwen / NO-GO entrambi)
4. Base alla decisione:
   - GO LaMa -> crea prompts/s164_detection_auto_mask.md (script Florence-2 detection, target: bypass mask manuale)
   - GO Qwen -> crea prompts/s165_qwen_argos_integration.md (wrap pipeline ARGOS con Qwen prompt-based, no detection step)
   - NO-GO entrambi -> crea prompts/s163_bis_brushnet_powerpaint.md (test --model brushnet + --model powerpaint stesso IOPaint)

Vincoli sessione:
- NO modifiche pipeline ARGOS produzione finche' GO esplicito Luke
- NO download modelli extra senza autorizzazione (Qwen 20GB gia' su Colab)
- Context budget: chiudi sotto 60%

Sample disponibili extra in dossiers/safe_images/argos_autoscout24_de_*.jpg (60+ foto reali) per second-round test se decisione 51/49.
```

## Stato deliverable S163 (da ricordare)

- `sanitizer_colab/s163_compare_inpaint.ipynb` — notebook 18 celle, pronto Colab T4
- `sanitizer_colab/s163_lama_mvp.ipynb` — versione baseline solo LaMa (legacy, deferito a compare_inpaint)
- `sanitizer_colab/inputs/sample_A/B/C.jpg` — 3 foto AutoScout24 reali (watermark + targa)
- `sanitizer_colab/outputs/` — vuota, da popolare con unzip post-Colab
- `sanitizer_colab/README.md` — istruzioni Luke

## Memorie chiave

- `memory/s163_preflight_blocked.md` — perche' skill free-gpu-api non e' stata estesa
- `memory/feedback_scope_creep_on_ambiguous_request.md` — lezione 14:45 (non re-interpretare piani fissati)

## Vincoli persistenti

- Day 1 dealer reale bloccato fino sanitizer GO
- iMac AVX1 = path locale ML morto (S159-S162 + S163 14:45 confermato)
- Qwen-Image-Edit ~20GB richiede T4 CPU offload (no opzione locale)
