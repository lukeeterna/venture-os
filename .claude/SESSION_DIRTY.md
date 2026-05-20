# SESSION DIRTY — chiusura senza commit auto

Sessione: `9bdc858e-577e-47af-892b-dd13e0beedc7`  Timestamp: `2026-05-20T17:44:30Z`

Motivo: `git diff --check` fail (whitespace errors o conflict markers).

## Output git diff --check
```
.claude/NEXT_SESSION_PROMPT.md:25: trailing whitespace.
+[{"tool_use_id":"toolu_01PhHP7doaTBi1372xXvMLp9","type":"tool_result","content":"=== sanitize_image function ===\n528:def sanitize_image(\n\n=== KEEP_WORDS + TRIM ===\nsrc/cove/image_sanitizer.py:102:KEEP_WORDS = frozenset({\nsrc/cove/image_sanitizer.py:308:    Note: vision_ocr.detect_text_regions encapsulates the seller-match + KEEP_WORDS\nsrc/cove/image_sanitizer.py:309:    filter logic. We pass module-level KEEP_WORDS so it stays the single source.\nsrc/cove/image_sanitizer.py:319:           
```

## Status
```
 M .claude/NEXT_SESSION_PROMPT.md
?? .claude/SESSION_DIRTY.md
```

Risolvi manualmente, poi commit. Sessione successiva legge questo file.
