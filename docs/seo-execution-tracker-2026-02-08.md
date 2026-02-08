# SEO & Monetization Execution Tracker (Mid-Review)

Last updated: 2026-02-08
Owner split: `Codex` (code/data tasks) + `You` (platform console tasks)

## 1) Baseline Snapshot (from current Excel exports)

- GSC total (2025-04-03 to 2026-02-04): clicks `6408`, impressions `316521`, CTR `2.02%`, avg position `21.86`.
- GSC trend (latest 28d vs previous 28d): clicks `+75.1%`, impressions `+55.1%`, avg position improved (`17.30` vs `18.22`).
- GSC US slice (2025-11-06 to 2026-02-05): clicks `479`, impressions `78850`, CTR `0.61%`, avg position `21.51`.
- AdSense 28d: earnings `$6.61`, pageviews `7165`, impressions `17025`, clicks `78`.
- AdSense 28d weighted metrics: Page RPM `$0.92`, Impression RPM `$0.39`, CTR `0.46%`, CPC `$0.08`, Viewability `59.44%`.

## 2) Executable Task Board

| ID | Priority | Task | Owner | Status | Deliverable |
|---|---|---|---|---|---|
| A1-1 | P0 | Money-page metadata/content copy refresh (`compare`, `standard-resolutions`, `aspect-ratio-calculator`, `average-laptop-screen-size-2025`) | Codex | Done | Updated copy in translations + blog source |
| A2-1 | P0 | URL normalization in configs (`canonical`, `og_url`) to clean URLs (no `.html`, no `/en/`) | Codex | Done | `build/pages-config.json` normalized |
| A2-2 | P0 | English blog URL canonical/share/breadcrumb normalization (`/blog/...` not `/en/blog/...`) | Codex | Done | `build/blog-builder.js` patched |
| A2-3 | P0 | Internal links config URL normalization (clean URLs) | Codex | Done | `data/internal-links-config.json`, `js/internal-links.js` fallback |
| A3-1 | P0 | Internal-link anchor text optimization for EN | Codex | Done | `locales/en/translation.json` updated |
| GSC-1 | P0 | Legacy URL cleanup in GSC (manual, one-by-one) | You | Todo | Use checklist doc below |
| ADS-1 | P1 | Re-export AdSense 90d correct range (current file only 7 days) | You | Todo | New CSV in `excel/` |
| ADS-2 | P1 | Export AdSense by `Page + Country` (28d + 90d) | You | Todo | New CSV in `excel/` |
| GA4-1 | P1 | Export GA4 `Landing Page + Country` engagement metrics | You | Todo | New CSV in `excel/` |

## 3) What Was Changed (This Round)

### A1 - Page optimization
- Updated EN copy for high-value pages in `locales/en/translation.json`:
  - `compare_page_*`
  - `standard_resolutions_page_*`
  - `aspectRatioCalculator.page*`
- Updated blog source title/H1/description in `blog-content/en/average-laptop-screen-size-2025.md`.

### A2 - URL cleanup hardening
- Normalized `canonical_url` + `og_url` in `build/pages-config.json` to clean URLs.
- Fixed blog builder EN URL generation paths in `build/blog-builder.js`:
  - share URLs
  - canonical URLs
  - OG URLs
  - blog breadcrumb parent URL
- Normalized internal-links URLs to clean paths in:
  - `data/internal-links-config.json`
  - `js/internal-links.js` fallback config

### A3 - Internal-link SEO anchors
- Updated EN anchor labels in `locales/en/translation.json`:
  - `compare_tool`
  - `standard_resolutions`
  - `aspect_ratio_calculator`
  - `projection_calculator`
  - `ppi_calculator`
  - `responsive_tester`
  - `lcd_screen_tester`
- Increased internal-link prominence for commercial pages in `data/internal-links-config.json`.

## 4) Manual GSC Cleanup Checklist (Your action)

- Use: `docs/gsc-legacy-url-cleanup-checklist-2026-02-08.md`
- Total legacy URLs detected from exports: `71`
- Suggested execution order:
  1. Finish all `P1` rows (impressions >= 500)
  2. Then `P2` (100-499)
  3. Then `P3`

## 5) Verification Steps (after deploy)

1. Run `npm run multilang-build` and deploy.
2. Re-check sample pages:
   - `/devices/compare`
   - `/devices/standard-resolutions`
   - `/devices/aspect-ratio-calculator`
   - `/blog/average-laptop-screen-size-2025`
3. Confirm share buttons on EN blog pages no longer generate `/en/blog/...`.
4. In GSC, track weekly:
   - impressions/clicks/CTR for above pages
   - legacy URL impressions decline
5. In AdSense, compare next 28d vs baseline:
   - RPM / CPC / Viewability

## 6) KPI Targets (next 30 days)

- Ranking: move at least `8-12` high-value keywords from position `11-30` into `Top10`.
- CTR: improve CTR for tool pages by `+20%` relative.
- Monetization: raise weighted Page RPM from `$0.92` to `>= $1.30`.
- Viewability: from `59.44%` to `>= 65%`.

