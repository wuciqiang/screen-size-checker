# Mojibake Scan Report (Apply)

- Date: 2026-02-09
- Scope: repository-wide text scan (.js/.html/.css/.md/.json/.yml/.txt)
- Excluded: .git, node_modules

## Scan Rules

This pass treated the following as high-confidence mojibake markers:

1. Replacement character: U+FFFD
2. Common emoji mojibake token family (historical garble forms)
3. Broken runtime separators and garbled UI snippets found in current code paths

## Fixed Items

1. Runtime display separators were normalized to multiplication symbol in viewport/screen resolution rendering.
2. Garbled blog/home nav text matching was repaired for Chinese and English fallback matching.
3. Corrupted production test-page template in build/multilang-builder.js was rewritten with clean strings.
4. CSS optimizer startup log with replacement character was fixed.
5. README mojibake heading icon/title was fixed.
6. Regenerated multilang-build outputs after source fixes.

## Files Updated

- js/app.js
- js/core-optimized.js
- build/multilang-builder.js
- js/css-optimizer.js
- README.md
- multilang-build/js/app.js
- multilang-build/js/core-optimized.js
- multilang-build/performance-test-production.html
- multilang-build/select-language.html

## Validation

- node --check js/app.js : pass
- node --check js/core-optimized.js : pass
- node --check build/multilang-builder.js : pass
- npm run test-build : pass
- npm run multilang-build : pass

## Residual Low-Confidence Candidates

After removing high-confidence markers, remaining suspicious CJK-style tokens are mostly historical comments or legacy log text in these files:

- build/multilang-builder.js
- js/core-optimized.js
- js/app.js
- mirrored generated files under multilang-build/

These residual tokens are low-confidence (not all are guaranteed encoding errors) and were not bulk auto-converted to avoid semantic corruption.
