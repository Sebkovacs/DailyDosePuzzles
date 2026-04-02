# Daily Dose - Theme and Styling Spec

**Status:** Consolidated  
**Last Updated:** April 2, 2026

This document is intentionally concise.

The active styling contract now lives in:
- `documents/DESIGN_SYSTEM.md`

This file exists to preserve historical naming and migration context only.

## Active Theme Model
The active model is semantic-token-first:
- Components consume semantic tokens only.
- Theme packs map semantic tokens to concrete values.
- Game-specific accents are implemented as scoped token overrides.

Theme layers:
1. Core semantic tokens (`/styles/tokens.css`)
2. Optional route/game scoped token overrides
3. Component CSS Modules consuming semantic tokens

Do not skip layers by hardcoding values in component styles.

## Deprecated References
The following legacy variable families may still appear in old modules and should be migrated:
- `--ink-*`
- `--bg-*`
- `--accent-*` (legacy naming)
- `--wash-*` (legacy naming)
- `--shadow-ink*`
- `--border-ink` (without `-regular` or `-thin`)

## Migration Policy
- New UI work must use semantic token names from `/styles/tokens.css`.
- Refactors should replace deprecated tokens in touched files.
- Do not introduce new legacy aliases.

Theme evolution policy:
- Add new semantic tokens only when an existing token cannot express a reusable intent.
- Prefer extending token scales (`--space-*`, `--color-*`) over introducing one-off names.
- Document every new token family in `DESIGN_SYSTEM.md`.

Experiment policy:
- Test theme changes through token overrides first.
- If a test requires structural layout change, isolate it at feature composition level.

## Enforcement
Run:
- `npm run lint:styles`

Then verify:
- `npx tsc --noEmit`
- `npm run lint`
