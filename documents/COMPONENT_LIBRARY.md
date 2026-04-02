# Daily Dose - Component Library

**Status:** Active and evolving  
**Last Updated:** April 2, 2026

## Purpose
Define reusable UI building blocks that keep the product consistent, testable, and easy to evolve.
The library exists to maximize UI quality and iteration speed at the same time.

## Library Layers
1. Primitives
- `Text`
- `Button`
- `Surface`
- `IconButton`
- `Divider`

2. Foundations
- `Card`
- `Badge`
- `Pill`
- `ProgressIndicator` (`ProgressBar`, `ProgressDots`, `ProgressRing`)

3. Feature components
- Domain-specific components live outside the base library and compose primitives/foundations.

## Rules
- CSS Modules only.
- Semantic variants only (`primary`, `secondary`, `danger`, `success`, `warning`, `accent`).
- Design tokens only from `/styles/tokens.css`.
- No inline style props for static styling.
- Motion must use `/styles/motions.ts` presets or token-aligned values.

Strategic rules:
- Keep primitives small and strict; place flexibility at composition boundaries.
- Prefer extending variants/tokens over creating new bespoke components.
- Avoid "prop explosion"; if a component needs many visual knobs, split responsibilities.

## Public API Guidance
- Keep component props small and intention-revealing.
- Avoid exposing visual implementation knobs unless required.
- Prefer variant enums over raw color/size strings.
- Preserve accessibility defaults in every primitive.

Recommended primitive API shape:
- `variant`: semantic intent (`primary`, `secondary`, etc.)
- `size`: standardized scale (`sm`, `md`, `lg`)
- `state`: behavioral state (`default`, `loading`, `disabled`, `error`)
- `as`/`asChild` only when semantic element swapping is needed

Avoid in base components:
- Raw `color`, `bg`, `padding`, `shadow` props
- One-off booleans that duplicate variant/state semantics
- Feature-specific props (keep those in feature components)

## Experiment-Friendly Composition
Rules for A/B testing without destabilizing the library:
- Experiments must be composed in feature modules/pages, not primitives.
- Use stable wrapper selectors (`data-component`, `data-variant`) for analytics and testing.
- Keep control and variant branches close together and minimal.
- Prefer a small number of reusable experiment-ready layouts over one-off test components.

## Testing Guidance
For library changes, validate:
1. Rendering and variant behavior
2. Disabled/focus/keyboard behavior
3. Token-driven appearance (no hardcoded visual values)
4. No regressions in consuming pages
5. Contract stability (existing props remain backward-compatible unless versioned)
6. Visual regression snapshots for high-impact primitives/foundations

## When to Add a New Base Component
Add to base library only when all are true:
1. Needed in at least two feature areas
2. Represents a stable interaction pattern
3. Can be domain-agnostic

Otherwise keep it feature-local.

## Quality Checklist
- Component has explicit props and default behavior.
- Component has module CSS with semantic class names.
- Accessibility behavior is documented and verified.
- Usage examples compile and avoid inline styling.
- No token drift or legacy aliases in new code.
- Story/demo includes at least control + one alternative variant.
- Test IDs/selectors are stable only where automation needs them.
