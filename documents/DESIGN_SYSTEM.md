# Daily Dose - Design System

**Status:** Active hardening  
**Last Updated:** April 2, 2026  
**Motto:** Slow is smooth, smooth is fast.

## Purpose

This document is the authoritative UI engineering contract for Daily Dose.

It defines:

- the styling architecture
- token rules
- component composition rules
- experimentation constraints
- UI quality gates

If UI code and UI docs conflict, this file wins unless the technical specification says otherwise.

## Strategic Goals

The UI system must support all of the following at the same time:

- premium presentation
- fast iteration
- safe experimentation
- low rewrite cost
- strong accessibility and maintainability

The system should make UI changes cheaper over time, not more expensive.

## Architecture

All UI follows this stack:

1. design tokens in `/styles/tokens.css`
2. global base styles in `/styles/globals.css`
3. scoped CSS Modules
4. component logic and motion in `.tsx` and `/styles/motions.ts`

Rules:

- no Tailwind
- no shared utility CSS outside the global base layer
- no inline style objects except true runtime-only values
- no hard-coded color values in component or page styles
- no undeclared custom properties

## Token Contract

Token families:

- `--color-*`
- `--font-*`
- `--line-height-*`
- `--letter-spacing-*`
- `--space-*`
- `--pad-*`
- `--max-width-*`
- `--border-*`
- `--radius-*`
- `--shadow-*`
- `--ease-*`
- `--duration-*`
- `--touch-target-*`
- `--opacity-*`
- `--z-*`

Rules:

- components consume semantic tokens, not visual constants
- new tokens must represent reusable intent
- legacy aliases should be removed during refactors

Deprecated token families include:

- `--ink-*`
- `--bg-*`
- `--accent-*` in old naming
- `--wash-*` in old naming
- `--shadow-ink*`

## Theme Model

Daily Dose should use a semantic-token-first theme system.

Theme layers:

1. core semantic tokens
2. route or game scoped token overrides where needed
3. CSS Modules consuming those tokens

Theme rules:

- components should not know concrete brand or game colors directly
- game identity should be expressed through token overrides
- theme experiments should prefer token remapping before structural divergence

## Component Standards

Component layers:

1. primitives
2. foundations
3. feature components

Rules:

- each component owns its own CSS Module
- variant names are semantic, not visual
- accessibility is mandatory
- motion uses token-aligned timing and easing

Composition rules:

- primitives should remain strict and reusable
- foundations may expose semantic variants only
- feature modules own page-specific behavior and experiment branching
- prefer variants and composition over one-off component forks

## Experimentation Contract

Experiments must support fast testing without destabilizing the component system.

Rules:

1. Experiments belong in feature composition, not primitives.
2. A control fallback must always exist.
3. Stable experiment keys and `data-*` hooks should be used for analytics and QA.
4. Prefer token and variant changes over large structural forks.
5. Losing variants should be removable with low effort.

Primary UI experiment metrics may include:

- retention
- completion
- conversion
- click-through on high-impact surfaces

## Quality Gates

A UI change is not done unless all relevant checks pass:

1. `npm run lint:styles`
2. `npx tsc --noEmit`
3. `npm run lint`
4. manual review for accessibility, composition, and interaction quality

If the change is experiment-related, also require:

- a defined control
- a defined success metric
- explicit cleanup expectations

## Refactor Workflow

For styling or component refactors:

1. stabilize structure and intent first
2. move static styling into CSS Modules
3. replace legacy tokens with semantic tokens
4. consolidate repeated patterns into primitives or foundations
5. validate behavior and quality gates
6. update the docs if new variants or tokens are introduced

## Definition of Done

A UI surface is done when:

- it uses CSS Modules only
- it uses semantic tokens only
- it has no stale aliases or magic values
- it passes style audit, type check, and lint
- it is readable and easy to extend
- experiments, if present, are isolated and reversible
