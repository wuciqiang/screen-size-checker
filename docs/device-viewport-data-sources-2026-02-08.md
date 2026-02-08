# Device viewport data update notes (2026-02-08)

## Scope
Updated data tables for:
- devices/iphone-viewport-sizes
- devices/ipad-viewport-sizes
- devices/android-viewport-sizes

Source files changed:
- components/iphone-content.html
- components/ipad-content.html
- components/android-content.html

## Data sources (official first)

### iPhone
- iPhone 17: https://support.apple.com/en-us/124491
- iPhone 17 Pro: https://support.apple.com/en-us/124492
- iPhone 17 Pro Max: https://support.apple.com/en-us/124494
- iPhone Air: https://www.apple.com/iphone-air/specs/
- iPhone 16e: https://www.apple.com/iphone-16e/specs/

### iPad
- iPad Pro (M4): https://support.apple.com/en-us/121029
- iPad Air (M3): https://support.apple.com/en-us/122243
- iPad (A16): https://support.apple.com/en-us/122155
- iPad mini (A17 Pro): https://support.apple.com/en-us/121936

### Android
- Pixel 10: https://store.google.com/ca/product/pixel_10_specs?hl=en-GB
- Pixel 10 Pro / Pro XL / Pro Fold: https://fi.google.com/about/phones/pixel-10-pro-specs/
- Galaxy Z Fold6 / Z Flip6: https://news.samsung.com/global/enter-the-new-era-of-mobile-ai-with-samsung-galaxy-z-fold6-and-z-flip6
- Galaxy S25 series (panel class and ratios): https://news.samsung.com/global/introducing-galaxy-s25-ultra-the-next-chapter-of-mobile-ai-with-galaxy-ai

## Calculation rules

### iPhone and iPad
- viewport = physical resolution / DPR
- iPhone modern full-screen models generally use DPR 3; iPhone SE (3rd gen) uses DPR 2.
- iPad models in this table use DPR 2.

### Android
- Physical resolution comes from official spec pages above.
- CSS viewport and DPR are listed as practical web-dev reference values.
- Foldables include cover/main viewport pairs.
- Note: Android viewport can change by display-size setting, zoom, browser UI, and ROM behavior.

## Quality notes
- iPad mini rows were corrected from legacy values to 744 x 1133 viewport (1488 x 2266, DPR 2).
- 2024 iPad Pro row was corrected to the new 13-inch panel values (2064 x 2752).
- Added 2025 iPhone and Android flagship rows to keep ranking pages current.
