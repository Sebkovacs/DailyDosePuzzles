# Daily Dose - Design System

**Status:** Active hardening (in progress)  
**Last Updated:** April 2, 2026  
**Motto:** Slow is smooth, smooth is fast.

## Purpose
This document is the authoritative UI engineering contract for Daily Dose.

It defines:
- the only accepted styling architecture
- token and component usage rules
- quality gates required before merge

If code and docs disagree, this file is the source of truth for styling and component quality.

## Strategic UI Goals
Daily Dose UI must be:
- Premium: visually deliberate, polished interactions, high readability.
- Adaptable: rapid UI evolution without large rewrites.
- Experimentable: safe A/B testing with clear measurement.
- Operable: predictable rules that a small team can sustain.

Product-level success metrics:
- Faster iteration: most UI changes contained to component variants and tokens.
- Safer rollout: visual/system regressions caught before release.
- Better outcomes: experiment velocity improves retention/conversion metrics.

## Architecture
All UI follows this stack, in order:

1. Design tokens: `/styles/tokens.css`
2. Global base styles: `/styles/globals.css`
3. Scoped component/page styles: `*.module.css`
4. Component logic and motion: `.tsx` + `/styles/motions.ts`

Rules:
- No Tailwind.
- No shared utility CSS files outside global base styles.
- No inline style objects except true runtime values that cannot be represented as class variants (for example dynamic width percentages).
- No hard-coded hex/rgb/hsl color values in components or page CSS.
- No undeclared custom properties; all tokens must exist in `tokens.css`.

Strategic rule:
- Visual behavior is configured, not hardcoded. Prefer token updates, semantic variants, and composition-level switches over one-off CSS.

## Token Contract
Semantic token families in use:
- Colors: `--color-*`
- Typography: `--font-*`, `--line-height-*`, `--letter-spacing-*`
- Spacing and size: `--space-*`, `--pad-*`, `--max-width-*`
- Border and radius: `--border-*`, `--radius-*`
- Elevation and shadow: `--shadow-*`
- Motion: `--ease-*`, `--duration-*`
- Interaction: `--touch-target-*`, `--opacity-*`, `--z-*`

Migration note:
- Legacy aliases like `--ink-main`, `--bg-card`, `--accent-*`, `--wash-*`, `--shadow-ink` are deprecated and must be removed during refactors.
- New or refactored UI must use semantic `--color-*` and current token families only.

Theme strategy:
- Keep a stable semantic layer (`--color-text-primary`, `--color-bg-primary`, etc.) consumed by components.
- Map game/brand themes by changing token values, not component internals.
- Add new themes by extending token definitions in `tokens.css`; avoid per-page visual forks.

## Component Standards
Component layers:
1. Primitives: typography, button, surface, icon button, divider
2. Foundations: card, badge, pill, progress indicators
3. Feature components: game/admin/social components built from primitives/foundations

Implementation standards:
- Each component owns its own `*.module.css`.
- Variant names are semantic (`primary`, `danger`, `success`) not visual (`red`, `big`, `fancy`).
- Accessibility is non-negotiable: visible focus states, minimum touch target, semantic markup, aria labels for icon-only actions.
- Motion uses `MOTION` presets or token-aligned timing/easing values.

Composition standards:
- Primitives never know about experiments.
- Foundations may expose semantic variants only.
- Feature components/pages own experiment wiring and choose variants.
- Prefer additive variant APIs (`tone`, `size`, `emphasis`, `state`) over raw class-name injection.

## Experimentation Contract
To support fast A/B testing without codebase churn:

1. Experiment ownership:
- Experiments are wired at route/feature composition level, not inside primitives.

2. Stable targeting:
- Use stable experiment keys and `data-*` hooks on top-level feature containers.
- Avoid CSS selectors coupled to DOM depth.

3. Variant design:
- Each experiment variant should map to existing component variants/tokens where possible.
- Introduce new tokens/variants only when reusable beyond one test.

4. Safety:
- Every experiment has a control fallback.
- Experiments must degrade gracefully if flags fail.
- Never gate core puzzle playability behind client-only experiment logic.

5. Measurement:
- Define primary metric before shipping the variant (retention, completion, conversion, etc.).
- Log exposure and outcome events with consistent naming.
- Remove losing variants quickly to reduce maintenance load.

## Quality Gates
A PR touching UI passes only if all checks below pass:

1. Static style audit:
   - no `style={{` unless runtime-only value
   - no Tailwind utility class strings
   - no unknown CSS variable usage
2. Type checks pass (`npx tsc --noEmit`).
3. Lint passes (`npm run lint`).
4. Manual review confirms:
   - token usage is semantic and consistent
   - component composition is clean
   - accessibility and interaction behavior are preserved
5. If experiment-related:
   - control fallback exists
   - exposure event is emitted once per view
   - success metric and stop condition are documented

## Refactor Workflow
For large styling migrations:

1. Stabilize tokens and class structure in target module.
2. Remove inline styles and move rules to module CSS.
3. Replace legacy token names with semantic tokens.
4. Validate no behavior regressions.
5. Run style audit and type/lint checks.
6. Consolidate repeated patterns into primitives/foundations.
7. Document any new token/variant decisions.

Target order for this repository:
1. Admin and stats pages
2. Shared route menus
3. Remaining game page wrappers and modal copy blocks
4. Legacy token cleanup across modules
5. Experimentation hooks on high-impact funnels (home, onboarding, premium surfaces)

## Definition of Done (UI)
A page/module is "done" when:
- it uses CSS Modules only
- it uses semantic tokens only
- it has no stale aliases or magic values
- it passes style audit, type check, and lint
- it remains readable and easy to extend
- experiments (if present) are reversible, measurable, and isolated
