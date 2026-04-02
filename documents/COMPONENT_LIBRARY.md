# Daily Dose - Component Library

**Status:** Active  
**Last Updated:** April 2, 2026

## Purpose

This document defines the reusable component model for Daily Dose.

The goal is to keep the UI:

- consistent
- modular
- testable
- easy to improve without large rewrites

## Library Layers

### Primitives

Small, reusable building blocks with minimal policy.

Current examples:

- `Text`
- `Button`
- `Surface`
- `IconButton`
- `Divider`

### Foundations

Composed patterns built from primitives.

Current examples:

- `Card`
- `Badge`
- `Pill`
- `ProgressIndicator`

### Feature Components

Domain-specific components that belong to a route or product area rather than the shared library.

## Rules

- CSS Modules only
- semantic variants only
- token-driven styling only
- no static inline styles
- no feature-specific props in base primitives

## API Guidance

Base components should expose intention, not raw styling knobs.

Preferred prop categories:

- `variant`
- `size`
- `state`
- `as` or `asChild` only where semantic element switching is needed

Avoid:

- raw color props
- raw spacing props
- raw shadow props
- boolean prop sprawl that duplicates semantic variants

## Composition Guidance

Use this decision rule:

- if it is reused across multiple product areas and is domain-agnostic, it may belong in the library
- if it is specific to a game, admin flow, tribe flow, or other feature area, keep it local

Start local by default. Promote to the library only when reuse and stability are clear.

## Experimentation Guidance

Experiments should not be embedded into primitives.

Rules:

- keep experiment logic at the page or feature level
- map variants onto existing component APIs where possible
- avoid creating throwaway components for every test

The library should enable experimentation, not become entangled with it.

## Testing Expectations

For shared components, validate:

1. visual variants
2. disabled and focus behavior
3. keyboard and accessibility behavior
4. token-driven styling
5. backward compatibility of the public API

High-impact shared components should eventually have visual regression coverage.

## Quality Checklist

A shared component is ready when:

- props are explicit and intention-revealing
- CSS class names are semantic
- accessibility behavior is verified
- examples compile
- no legacy token usage is introduced
- the component is easier to extend than the ad hoc code it replaces
