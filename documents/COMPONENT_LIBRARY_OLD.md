# 📄 `COMPONENT_LIBRARY.md`

## **Daily Dose — Component Library Base Specification**

**⚡ STATUS**: ✅ **FULLY IMPLEMENTED** (April 2, 2026)

👉 **CANONICAL GUIDE**: See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for implementation details, usage examples, and best practices.

This document specifies the philosophy and requirements. The code is in `/components/` and `/styles/`.

***

## 1. Purpose

This document defines the **foundational component library** for Daily Dose.

Its role is to:

*   establish a shared visual and interaction language,
*   ensure consistency across the app,
*   minimise duplication,
*   and provide a stable base that can be expanded without refactoring.

All future UI work must **extend**, not bypass, this library.

***

## 2. Core Principles (Non‑Negotiable)

1.  **Composition over configuration**
2.  **Small, named components over generic blobs**
3.  **Visual meaning flows from tokens, not props**
4.  **Components express intent, not layout hacks**
5.  **Variants are semantic, not technical**
6.  **No component “knows” the theme**7.  **All styles use CSS Modules + design tokens** (no Tailwind, no inline styles)
8.  **Motion is handled by Framer Motion** with consistent easing curves and durations
If a component violates these, it should be refactored or deleted.

***

## 3. Component Hierarchy

The component system is layered:

    1. Primitives (atoms)
    2. Foundations (molecules)
    3. Gameplay blocks
    4. Social blocks
    5. Layout scaffolding

Only Layers 1–2 are defined in this document.  
Higher layers are **built on top**, never merged downward.

***

## 4. Layer 1 — Primitives (Atoms)

These components contain **no domain logic**.  
They are purely presentational and reusable everywhere.

### 4.1 Text

**Purpose**  
Centralised typography control.

**Responsibilities**

*   Map semantic intent to typography tokens
*   Enforce hierarchy consistency

**Examples**

*   `Text`
*   `Title`
*   `Label`
*   `MonoText`

**Rules**

*   No component sets `font-size` directly
*   Text variants align to tokens (`--text-sm`, etc.)
*   No HTML heading tags used directly in feature code

***

### 4.2 Button

**Purpose**  
Primary interaction control.

**Variants (Semantic)**

*   primary
*   secondary
*   neutral
*   danger

**Rules**

*   No pixel styling inside components
*   Hover and active states are mandatory
*   Disabled state must be explicit
*   Icon support without layout duplication

**Non‑Goals**

*   No size props explosion
*   No context‑aware color logic

***

### 4.3 IconButton

**Purpose**  
Low‑chrome icon interactions (controls, toggles).

**Rules**

*   Always accessible (aria‑label required)
*   Never used in place of primary actions
*   Uses same motion tokens as Button

***

### 4.4 Surface

**Purpose**  
Abstract representation of a “UI surface”.

**Examples**

*   panels
*   cards
*   containers
*   elevated sections

**Responsibilities**

*   Background color
*   Border
*   Radius
*   Elevation (if any)

**Rules**

*   Background color always token‑driven
*   Elevation is semantic, not numeric

***

### 4.5 Divider

**Purpose**  
Visual separation without layout implication.

**Rules**

*   No margins baked in
*   Uses border tokens only

***

## 5. Layer 2 — Foundations (Molecules)

These are composed from primitives and introduce **light structure**, but no product logic.

***

### 5.1 Card

**Purpose**  
Standardised container for grouped content.

**Built from**

*   Surface
*   internal spacing
*   optional header/footer slots

**Rules**

*   Padding is consistent across all cards
*   Visual variants are minimal (default / subdued)
*   No grid or layout responsibility

***

### 5.2 Badge

**Purpose**  
Compact status or classification indicator.

**Variants**

*   neutral
*   accent
*   success
*   warning
*   danger

**Rules**

*   Color intent > color value
*   Must remain legible at all sizes
*   Never interactive unless explicitly wrapped

***

### 5.3 Pill / StatPill

**Purpose**
Display compact numeric or status info.

Used for:

*   scores
*   times
*   streak counts
*   tribal metrics

**Rules**

*   No animations by default
*   Optional subtle emphasis only

***

### 5.4 ProgressIndicator

**Purpose**
Visual progression without copying logic everywhere.

**Examples**

*   dots
*   bars
*   segmented indicators

**Rules**

*   Does not own timing logic
*   Consumes stats, does not compute them

***

## 6. Layer 3+ (Out of Scope, but Constrained)

The following **must not** be placed in this base library:

*   `PuzzleCard`
*   `Timer`
*   `LeaderboardRow`
*   `ForgeSummary`
*   `TribeBanner`

Those live in **feature libraries**, and only depend on Layers 1–2.

***

## 7. Layout Components (Special Case)

Layout components are foundational and globally allowed, but **never domain‑specific**.

Included:

*   `Stack`
*   `Row`
*   `Grid`
*   `Container`

Rules:

*   Only spacing and alignment
*   Never visual styling
*   Spacing uses tokens only

***

## 8. Variant Strategy (No Prop Explosion)

Variants are defined using:

*   semantic props (`variant="primary"`)
*   or data attributes where clearer

**Disallowed**

*   boolean styling flags (`isBlue`, `big`, `fancy`)
*   cascading conditional class logic

If a component needs more than \~4 variants, it’s too generic.

***

## 9. Component File Structure

Every component follows this structure:

    ComponentName/
      ComponentName.tsx
      ComponentName.module.css
      index.ts

Rules:

*   CSS Modules only
*   No cross‑component CSS imports
*   No shared “components.css”

***

## 10. Documentation & Expansion Rules

Every base component must include:

*   short doc comment at top of file
*   clear prop interface
*   explanation of when *not* to use it

When adding new components:

1.  Check if it can be composed from primitives
2.  Check if it belongs in a feature layer
3.  Only add to base if reused cross‑domain

***

## 11. Governance Rules (Critical)

*   ❌ No one‑off styling in feature code
*   ❌ No visual differentiation without component support
*   ❌ No duplication of primitives in feature folders
*   ✅ Refactor early, not late

If a feature wants a new visual concept:
→ add or extend a base component **first**

***

## 12. Extension Strategy

This library is deliberately **small**.

Growth happens by:

*   composing primitives into feature blocks,
*   not expanding the base endlessly.

When the base grows:

*   it grows carefully,
*   with intent,
*   and with documentation.

***

## 13. Philosophical Summary

The component library exists to ensure that:

*   the UI feels authored, not assembled,
*   changes are global, not scattered,
*   complexity accumulates *slowly*,
*   and the app remains pleasant to work in.

> **A UI system should feel calm to read.  
> If it feels frantic, it’s already failing.**
