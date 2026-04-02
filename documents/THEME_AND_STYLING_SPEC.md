# Daily Dose - Theme and Styling Spec

**Status:** Consolidated  
**Last Updated:** April 2, 2026

## Purpose

This file exists as a concise reference for theming policy and styling migration.

The full styling contract lives in `documents/DESIGN_SYSTEM.md`.

## Active Theme Model

Daily Dose uses a semantic-token-first model:

- components consume semantic tokens
- theme packs or scoped overrides provide concrete values
- game identity is expressed through token overrides, not custom component logic

Theme layers:

1. `/styles/tokens.css`
2. scoped route or game overrides where necessary
3. CSS Modules that consume those tokens

## Migration Policy

For any touched file:

- remove legacy token usage where practical
- do not introduce new legacy aliases
- move static inline styles into CSS Modules
- prefer semantic token names over one-off values

## Deprecated Token Families

The following legacy families should be phased out:

- `--ink-*`
- `--bg-*`
- `--accent-*` in old naming
- `--wash-*` in old naming
- `--shadow-ink*`
- `--border-ink` without the current semantic suffixes

## Experiment Policy

For styling experiments:

- prefer token remapping first
- isolate structural layout tests at the feature level
- do not fork the theme system for one-off tests

## Enforcement

Run:

- `npm run lint:styles`
- `npx tsc --noEmit`
- `npm run lint`
