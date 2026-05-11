# S83 — Phase 3 + Phase 4 Execution

## Stato
- Phase 1 COMPLETATA: 9 tool testati, 3 INTEGRATE (NHTSA, KBA, RDW), 5 SKIP
- Phase 2 COMPLETATA: db_schema.py + detail_enricher_v2.py, 68+4 listing in vehicle_listings
- FRESH SCRAPE: 4 PROCEED BMW X3 vivi con immagini reali
- Phase 3 PLANNED: 2 piani pronti in .planning/phases/03-argos-grade-pdf-enterprise-v2/
- Phase 4: da pianificare

## Target Listing
- listing_id: `fresh_84aec3405b5d`
- BMW X3 xDrive30e 2022 | 50.058km | €34.140 DE
- Immagine: https://prod.pictures.autoscout24.net/listing-images/e81bae5e-415d-4819-a884-84aec3405b5d_575dae74-1
- VIN: non disponibile (AS24 non espone VIN per dealer listings)
- Dealer target: Stile Car (Orta Nova FG), Domenico, NARCISO, WA 333-4254654

## Comandi da eseguire
```
/gsd:execute-phase 3
/gsd:plan-phase 4 --skip-research --skip-verify
/gsd:execute-phase 4
```

## Regole
- Usare GSD per tutto
- Aggiornare memory/handoff ogni task
- cove_engine_v4.py NON MODIFICARE
- Zero source nel PDF (no "AutoScout24", "CoVe", "Claude")
- VIN: "disponibile su richiesta" (onesto)
- Warranty: "richiedere al venditore" (nessun API free)
- WA daemon: verificare http://192.168.1.2:9191/status prima di inviare
