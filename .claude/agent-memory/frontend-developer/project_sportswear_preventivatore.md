---
name: Sportswear preventivatore tool
description: Single-file HTML quote builder for sportswear micro-business, deployed at ventures/run_20260711_161411/tools/preventivatore/index.html
type: project
---

Vanilla JS preventivatore (quote/estimate builder) built as a single self-contained HTML file. Zero external dependencies. Runs from file:// or http.server. Safari 14 / macOS 11 Big Sur compatible.

**Why:** Internal tool for the sportswear kit calcio venture (scuole calcio/ASD target). Founder-only, not exposed to clients.

**How to apply:** If asked to extend or fix this tool, always Read the file first — it is a single ~700-line HTML file with inline CSS and JS. The client output function is `buildClientOutputData()` and has zero access to cost/margin data by design. State is stored in localStorage under key `preventivatore_v1`.
