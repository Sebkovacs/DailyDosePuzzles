# 📄 `THEME_AND_STYLING_SPEC.md`

## **Daily Dose — Styling, Theme & UI System**

**⚡ STATUS**: ✅ **FULLY IMPLEMENTED** (April 2, 2026)

**Location**: 
- `/styles/tokens.css` — Single source of truth for all design properties
- `/styles/globals.css` — Base typography and element styles
- `/components/*.module.css` — Component-specific styles

For implementation details and usage, see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).

***

## 1. Design Philosophy (Non‑Negotiable)

Daily Dose styling follows these principles:

1.  **All visual meaning flows from design tokens**
2.  **Components never define raw colors, spacing, or fonts**
3.  **Theme lives in one place**
4.  **CSS must read like prose, not machine output**
5.  **No duplication of visual intent**
6.  **If it can’t be named, it doesn’t belong**

> Styling is architecture, not decoration.

***

## 2. Anti‑Patterns (Explicitly Forbidden)

The following are **not allowed** in this codebase:

*   ❌ Tailwind or utility‑first CSS
*   ❌ Inline styles (except extremely rare dynamic cases)
*   ❌ Magic numbers for spacing or colors
*   ❌ Re‑declaring colors in components
*   ❌ 500‑line CSS files
*   ❌ Framework‑dependent theming abstractions
*   ❌ “design by div soup”

If a change requires editing multiple files to adjust visual identity, the system has failed.

***

## 3. High‑Level Strategy

We use **four layers**, in descending order of authority:

    1. Design Tokens (CSS Variables)
    2. Global Theme Styles
    3. Component Styles (CSS Modules)
    4. Component Logic (React)

**Nothing skips a layer.**

***

## 4. Design Tokens (Single Source of Truth)

### 4.1 Token Location

All tokens live in **one file**:

    /styles/tokens.css

This file controls **the entire look and feel**.

### 4.2 Token Categories

Tokens are grouped by intent, not appearance.

```css
:root {
  /* Color — semantic, not visual */
  --color-bg-primary;
  --color-bg-secondary;
  --color-bg-surface;
  --color-bg-elevated;

  --color-text-primary;
  --color-text-secondary;
  --color-text-muted;
  --color-text-inverse;

  --color-accent;
  --color-accent-soft;
  --color-accent-strong;

  --color-border;
  --color-border-subtle;
  --color-danger;
  --color-success;

  /* Typography */
  --font-sans;
  --font-mono;

  --text-xs;
  --text-sm;
  --text-md;
  --text-lg;
  --text-xl;
  --text-xxl;

  --font-weight-regular;
  --font-weight-medium;
  --font-weight-semibold;
  --font-weight-bold;

  /* Spacing */
  --space-1;
  --space-2;
  --space-3;
  --space-4;
  --space-5;
  --space-6;

  /* Radius */
  --radius-sm;
  --radius-md;
  --radius-lg;

  /* Motion */
  --ease-standard;
  --duration-fast;
  --duration-normal;
  --duration-slow;

  /* Layout */
  --max-width-content;
}
```

**Important:**  
Tokens describe **meaning**, not hex codes or pixels.

***

## 5. The Theme Layer

### 5.1 Theme File

Create:

    /styles/theme.css

This file binds **tokens to actual values**.

Example (simplified):

```css
:root {
  --color-bg-primary: #0f1115;
  --color-bg-surface: #161a22;

  --color-text-primary: #eef1f6;
  --color-text-secondary: #a3adc2;

  --color-accent: #7aa2ff;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;

  --radius-md: 8px;

  --duration-fast: 120ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
}
```

### 5.2 Dark / Light / Seasonal Themes

Themes **override tokens**, not components.

Example:

```css
[data-theme="light"] {
  --color-bg-primary: #ffffff;
  --color-text-primary: #111111;
}
```

This allows:

*   Dark mode
*   Seasonal themes
*   Tribe themes
*   Event skins

**Without touching component code.**

***

## 6. Global Styles (Minimal, Intentional)

### 6.1 Global CSS File

    /styles/global.css

Purpose:

*   reset inconsistencies
*   define base typography
*   apply theme tokens

```css
body {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  margin: 0;
}
```

Global styles must be **under 200 lines**.

***

## 7. Component Styling (CSS Modules Only)

### 7.1 File Structure (Strict)

    /components/
      Button/
        Button.tsx
        Button.module.css
      PuzzleCard/
        PuzzleCard.tsx
        PuzzleCard.module.css

✔ Component owns its styles  
✔ No shared junk  
✔ No implicit cascade

***

### 7.2 Component CSS Rules

Component styles must:

*   Use **tokens only**
*   Use **layout classes, not utility classes**
*   Be readable top‑to‑bottom

Example:

```css
.container {
  padding: var(--space-4);
  background: var(--color-bg-surface);
  border-radius: var(--radius-md);
}

.title {
  font-size: var(--text-lg);
  margin-bottom: var(--space-2);
}

.meta {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}
```

If you see hex codes or pixels in components, it’s a failure.

***

## 8. Variants Without Class Explosion

### 8.1 Variant via Data Attributes

Instead of utility classes:

```tsx
<div data-variant="highlighted" />
```

```css
[root][data-variant="highlighted"] {
  background: var(--color-accent-soft);
}
```

This scales without class bloat.

***

## 9. Layout Components (The Secret to Clean UI)

Create **layout primitives**:

    /components/layout/
      Stack
      Row
      Grid
      Container

These components handle spacing & alignment **once**.

Example:

*   `Stack` → vertical rhythm
*   `Row` → horizontal alignment

This removes 80% of spacing duplication.

***

## 10. Motion & Interaction

### 10.1 Animation Rules

*   Motion is subtle
*   No bounce or novelty easing
*   Changes must reinforce clarity

All motion values come from tokens:

```css
transition: background-color var(--duration-fast) var(--ease-standard);
```

***

## 11. Accessibility & Legibility (Built In)

*   Color contrast controlled at token level
*   Font sizes scale via tokens
*   Focus states styled once globally
*   No invisible interactive controls

Accessibility is **not a retro‑fit**.

***

## 12. Styling Governance Rules

If you ask:

> “Where should I change X?”

There must be **one obvious answer**:

| Thing to Change   | Location          |
| ----------------- | ----------------- |
| App mood          | `theme.css`       |
| Colors            | `tokens.css`      |
| Typography scale  | `tokens.css`      |
| Component spacing | Component CSS     |
| Layout behaviour  | Layout components |
| Seasonal skin     | Theme override    |

If there are two answers, refactor.

***

## 13. Why This Beats Tailwind (For You)

Tailwind is:

*   great for teams
*   fast for iteration
*   noisy for cognition
*   hostile to long‑term coherence

This system is:

*   slower to start
*   faster to maintain
*   readable at 3am
*   resilient to scope creep
*   friendly to AI assistants
*   worthy of a premium product

***

## 14. Final Rule

> **If a visual change requires touching more than one file, the system has failed.**

Fix the system, not the symptom.
