# 📄 `THEME_AND_STYLING_SPEC.md`

## **Daily Dose — Styling, Theme & Design System (IMPLEMENTED)**

**Last Updated:** April 2, 2026  
**Status:** System complete and in production

***

## 1. Design Philosophy (Non‑Negotiable)

Daily Dose styling follows these immutable principles:

1. **All visual meaning flows from design tokens** (no magic numbers)
2. **Components never define raw colors, spacing, or fonts** (always token-driven)
3. **Theme lives in one place** (`/styles/tokens.css`)
4. **CSS must read like prose, not machine output** (readable > clever)
5. **No duplication of visual intent** (if you're repeating code, something is wrong)
6. **If it can't be named, it doesn't belong** (clarity > conciseness)
7. **Neo-brutalist aesthetic with premium production value** (distinctive, not trendy)

> **Styling is architecture, not decoration.**

***

## 2. Anti‑Patterns (Explicitly Forbidden)

The following are **NOT allowed** in this codebase:

- ❌ **Tailwind CSS** or any utility-first framework
- ❌ **Inline styles** (except extremely rare dynamic cases)
- ❌ **Magic numbers** for spacing, colors, radii (4px hardcoded instead of `var(--radius-sharp)`)
- ❌ **Re-declaring colors** in components (always use tokens)
- ❌ **CSS files larger than 200 lines** (split them)
- ❌ **Framework-dependent theming abstractions** (CSS Variables only)
- ❌ **Shared "global components.css"** (CSS Modules only)
- ❌ **"Design by div soup"** (markup should be semantic, not semantic-less divs)

If a change requires editing multiple files to adjust visual identity, **the system has failed** and requires refactoring.

***

## 3. High‑Level Strategy

We use **three layers**, in descending order of authority:

```
    1. Design Tokens (CSS Variables)
           ↓
    2. Global Base Styles (resets + font faces)
           ↓
    3. Component Styles (CSS Modules)
           ↓
    4. Component Logic (React/Framer Motion)
```

**Nothing skips a layer.**

***

## 4. File Structure

```
/styles/
  tokens.css           → Design tokens (semantic intent)
  globals.css          → HTML/body resets, imports tokens
  motions.ts           → Framer Motion presets (curves, durations)

/components/
  Button.tsx
  Button.module.css    → Component styles (CSS Modules only)
  Text.tsx
  Text.module.css
  Surface.tsx
  Surface.module.css
  ... (etc)

/app/
  layout.tsx           → Imports '../styles/globals.css' at top
  globals.css          → ⚠️ DEPRECATED, use /styles/globals.css
```

**Import Order:**
```tsx
// app/layout.tsx (CORRECT)
import '../styles/globals.css';  // Single import for all token + global setup
```

---

## 5. Design Tokens (`/styles/tokens.css`)

This file is the **single source of truth** for all visual properties.

### 5.1 Token Categories

Organized by **semantic intent**, not appearance:

#### **Colors (Semantic Intent)**

```css
:root {
  /* Surface colors — background intent */
  --color-surface-primary: #F2EFE9;    /* Paper, main background */
  --color-surface-secondary: #FCFAF5;  /* Cards, elevated content */
  --color-surface-tertiary: #F5F3EC;   /* Subtle depth variation */

  /* Text colors — content hierarchy */
  --color-text-primary: #181614;       /* Main content, maximum contrast */
  --color-text-secondary: #5A534A;     /* Secondary, annotations, faded */
  --color-text-muted: #8A8278;         /* Disabled, hints, very light */
  --color-text-inverse: #FCFAF5;       /* Text on dark accent backgrounds */

  /* Semantic intent colors */
  --color-success: #2D5A27;            /* Growth, completion, positive */
  --color-danger: #781D26;             /* Urgent, destructive, caution */
  --color-warning: #A36F21;            /* Attention needed, slow */
  --color-info: #232F4C;               /* Neutral information, highlight */

  /* Interactive accents (for depth & delight) */
  --color-accent-primary: #8A3626;     /* Sanguine/terracotta — warmth */
  --color-accent-secondary: #195C5E;   /* Teal — cool contrast */
  --color-accent-tertiary: #4A2B4D;    /* Plum — mystique */

  /* Wash/tint layers (soft backgrounds for semantic colors) */
  --color-wash-primary: #F9EAE7;       /* Sanguine wash (accent background) */
  --color-wash-secondary: #E7F3F1;     /* Teal wash */
  --color-wash-tertiary: #EFE8F0;      /* Plum wash */

  /* Borders & dividers */
  --color-border-primary: #181614;     /* Emphasis borders (ink) */
  --color-border-secondary: #D4D0C8;   /* Subtle dividers */
  --color-border-light: #EAE6DE;       /* Very faint separation */
}
```

**Color Philosophy:**
- Names describe **meaning**, not hex values
- `--color-success` vs. `--color-green` (semantic > visual)
- Accents use classical Da Vinci palette (terracotta, teal, plum, indigo, ochre, viridian)
- Washcolors are 70% lighter versions for tinted backgrounds

---

#### **Typography**

```css
:root {
  /* Font families */
  --font-serif: "Crimson Text", Georgia, serif;         /* Formal, headers */
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: "Courier New", monospace;

  /* Font sizes (baseline tied to design) */
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;                                  /* Body baseline */
  --font-size-lg: 18px;
  --font-size-xl: 22px;
  --font-size-2xl: 28px;
  --font-size-3xl: 36px;
  --font-size-4xl: 48px;

  /* Font weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Line heights (for readability) */
  --line-height-tight: 1.2;             /* Headings */
  --line-height-normal: 1.5;            /* Body text */
  --line-height-relaxed: 1.75;          /* Prose */

  /* Letter spacing (visual rhythm) */
  --letter-spacing-tight: -0.01em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.02em;
}
```

**Typography Philosophy:**
- Serif font for neo-brutalist, classical aesthetic
- Sizes follow clear progression (12, 14, 16, 18, 22, 28, 36, 48)
- Line heights depend on font size (tighter for large, normal for body)

---

#### **Spacing (4px Baseline)**

```css
:root {
  --space-1: 4px;                       /* Tiny gaps */
  --space-2: 8px;                       /* Small spacing */
  --space-3: 12px;                      /* Compact */
  --space-4: 16px;                      /* Standard */
  --space-5: 24px;                      /* Comfortable */
  --space-6: 32px;                      /* Generous */
  --space-7: 48px;                      /* Large */
  --space-8: 64px;                      /* XL */

  /* Padding presets (commonly used combinations) */
  --pad-xs: var(--space-2);
  --pad-sm: var(--space-3);
  --pad-md: var(--space-4);
  --pad-lg: var(--space-5);
  --pad-xl: var(--space-6);
}
```

**Spacing Philosophy:**
- Everything is a multiple of 4px (4, 8, 12, 16, 24, 32, 48, 64)
- No arbitrary spacing
- Consistent padding across all components via presets

---

#### **Border & Radius**

```css
:root {
  --radius-none: 0;
  --radius-sharp: 4px;                  /* Structured, letterpress aesthetic */
  --radius-sm: 6px;                     /* Subtle softening */
  --radius-md: 8px;                     /* Standard components */
  --radius-lg: 12px;                    /* Larger surfaces */

  /* Border widths */
  --border-width-thin: 1px;
  --border-width-regular: 2px;          /* Strong letterpress borders */
  --border-width-thick: 3px;

  /* Composite border styles */
  --border-ink-regular: var(--border-width-regular) solid var(--color-border-primary);
  --border-ink-thin: var(--border-width-thin) solid var(--color-border-primary);
  --border-subtle: var(--border-width-thin) solid var(--color-border-secondary);
}
```

---

#### **Shadows & Elevation (Letterpress Model)**

```css
:root {
  /* Physical, structural shadows (hard offset) */
  --shadow-pressed: 0px 0px 0px var(--color-border-primary);    /* Flat, no lift */
  --shadow-raised: 4px 4px 0px var(--color-border-primary);     /* Initial, lifted */
  --shadow-lifted: 6px 6px 0px var(--color-border-primary);     /* Hover, elevated */
  --shadow-floating: 8px 8px 0px var(--color-border-primary);   /* High emphasis */

  /* Alternative: Soft shadows (for subtle depth) */
  --shadow-soft: 2px 2px 4px rgba(24, 22, 20, 0.08);           /* Gentle depth */
  --shadow-medium: 4px 4px 8px rgba(24, 22, 20, 0.12);         /* Normal depth */
  --shadow-deep: 8px 8px 16px rgba(24, 22, 20, 0.16);          /* Pronounced */
}
```

**Shadow Philosophy:**
- **Hard shadows** (offset only, no blur) = letterpress, physical feel
- **Soft shadows** (with blur) = subtle depth, premium feel
- Use hard shadows for buttons, hard-edged components
- Use soft shadows for cards, floating elements

---

#### **Motion & Animation**

```css
:root {
  /* Easing curves (premium motion) */
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);       /* Most UI motion */
  --ease-out: cubic-bezier(0, 0, 0.2, 1);              /* Natural exit */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);               /* Quick entrance */
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Playful */
  --ease-subtle: cubic-bezier(0.25, 0.46, 0.45, 0.94);  /* Micro-interactions */

  /* Durations */
  --duration-instant: 0ms;
  --duration-micro: 100ms;              /* Icons, small state changes */
  --duration-fast: 150ms;               /* Hover states, short transitions */
  --duration-normal: 200ms;             /* Standard interactions */
  --duration-slow: 300ms;               /* Page transitions, modals */
  --duration-glacial: 500ms;            /* Elaborate animations */
}
```

**Motion Philosophy:**
- Curves are Material Design 3 inspired (mathematical, premium)
- Durations follow strict tiers (not arbitrary)
- All motion uses Framer Motion with these presets
- See `/styles/motions.ts` for component integration

---

#### **Layout**

```css
:root {
  --max-width-xs: 320px;
  --max-width-sm: 640px;
  --max-width-md: 960px;
  --max-width-lg: 1200px;
  --max-width-xl: 1440px;

  /* For centered content */
  --container-inline-start: var(--pad-lg);
  --container-inline-end: var(--pad-lg);

  /* Accessibility: touch targets */
  --touch-target-min: 44px;            /* Minimum for iOS */
  --touch-target-comfortable: 48px;    /* Recommended */
}
```

---

#### **Opacity & State**

```css
:root {
  --opacity-disabled: 0.4;              /* Disabled states */
  --opacity-hover: 0.08;                /* Subtle hover overlay */
  --opacity-focus: 0.12;                /* Focus state intensity */
  --opacity-active: 0.16;               /* Pressed/active state */
}
```

---

## 6. Global Styles (`/styles/globals.css`)

This file establishes base typography, resets, and form element styling.

**Imports:**
```css
@import url('https://fonts.googleapis.com/...');  /* Crimson Text */
@import './tokens.css';                             /* All design tokens */
```

**What it does:**
- Font smoothing on html
- Body defaults (margin, padding, colors, fonts)
- Box-sizing reset (`* { box-sizing: border-box }`)
- Heading defaults (all h1-h6)
- Link styling
- Form element defaults (input, button, textarea)
- Focus states (accessible outlines)
- Utility classes (`.sr-only` for screen readers)

**What it does NOT do:**
- Visual component styles (that's CSS Modules)
- Layout grid systems
- Framework abstractions
- Tailwind

---

## 7. Motion Presets (`/styles/motions.ts`)

Predefined Framer Motion animations aligned to tokens.

```typescript
import { MOTION } from '@/styles/motions';

<motion.button
  whileHover={MOTION.buttonHover}      // { scale: 1.02, ... }
  whileTap={MOTION.buttonPress}        // { scale: 0.98, ... }
  transition={MOTION.duration.normal}
/>
```

**Includes:**
- Button interactions (hover, press)
- Fade in/out
- Slide transitions (left/right)
- Bounce in (puzzle solve)
- Pulse (attention)
- Stagger containers (list animations)

See implementation in `/styles/motions.ts`.

---

## 8. CSS Modules Pattern

Every component gets a `.module.css` file. Never share styles between components.

**Button.tsx:**
```tsx
import styles from './Button.module.css';

<motion.button className={styles.button} />
```

**Button.module.css:**
```css
.button {
  padding: var(--pad-md) var(--pad-lg);           /* From tokens */
  font-size: var(--font-size-md);
  border-radius: var(--radius-sharp);
  box-shadow: var(--shadow-raised);
  transition: all var(--duration-fast) var(--ease-standard);
}

.button:hover {
  box-shadow: var(--shadow-lifted);
}

.primary {
  background-color: var(--color-text-primary);   /* Semantic color */
  color: var(--color-text-inverse);
}
```

**Rules:**
- ✅ Use CSS Modules (`.module.css`)
- ✅ All values from tokens (no magic numbers)
- ✅ Semantic variant names (`.primary`, not `.blue`)
- ❌ No cross-component imports
- ❌ No shared "utils.css"
- ❌ No inline styles

---

## 9. Colors in Practice

### Do's ✅
```css
/* Good: Semantic intent */
.button.primary {
  background-color: var(--color-text-primary);   /* "Dark ink on paper" */
}

.badge.success {
  background-color: var(--color-wash-primary);   /* "Success highlighted" */
  color: var(--color-success);
}

/* Good: Read like prose */
.surface.elevated {
  box-shadow: var(--shadow-floating);            /* "Floating high" */
}
```

### Don'ts ❌
```css
/* Bad: Magic hex values */
.button {
  background-color: #181614;     /* What does this mean? Why this color? */
}

/* Bad: Visual token names */
--color-darkblue: #232F4C;       /* "Dark blue" vs. "info/indigo" */

/* Bad: Unclear intent */
--color-accent: #8A3626;         /* Which accent? For what? */
```

---

## 10. Responsive Design (Simple)

No breakpoint tokens. Use simple CSS:

```css
.card {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .card {
    grid-template-columns: 1fr 1fr;
  }
}
```

Keep responsive simple and tied to content, not arbitrary breakpoints.

---

## 11. Accessibility in Styling

### Focus States
```css
button:focus-visible {
  outline: 2px solid var(--color-text-primary);
  outline-offset: 2px;
}
```

### Color Contrast
- **Text on light:** `#181614` (98.5% contrast)
- **Text on dark:** `#FCFAF5` (99.6% contrast)
- **Accent on white:** `#8A3626` (8.6:1 contrast)
All meet WCAG AAA (7:1 minimum).

### Touch Targets
- Buttons: minimum `var(--touch-target-comfortable)` (48px)
- Touch-friendly spacing around interactive elements

### Screen Readers
- Use semantic HTML (button, a, label, etc.)
- `.sr-only` utility for screen-reader-only content
- `aria-label` on icon-only buttons

---

## 12. Common Patterns

### Status/Intent Colors
```typescript
variant="success"   // --color-success, --color-wash-primary
variant="danger"    // --color-danger, light wash
variant="warning"   // --color-warning, light wash
variant="info"      // --color-info, light wash
```

All have:
- Semantic intent
- Light wash background option
- Accessible contrast ratios

### Button States
```
default   → --shadow-raised
hover     → --shadow-lifted, translate(-2px, -2px)
active    → --shadow-pressed, translate(4px, 4px)
disabled  → opacity: 0.4, cursor: not-allowed
focus     → outline: 2px solid var(--color-text-primary)
```

### Card Elevation
```
flat    → no shadow, background: primary
raised  → shadow-raised (default)
lifted  → shadow-lifted (on hover)
floating→ shadow-floating (modals, popups)
```

---

## 13. Maintenance

### When Updating Tokens
1. Change the value in `/styles/tokens.css`
2. That's it. Changes propagate globally.
3. No component-level edits needed.

### When Adding New Colors
Ask: **"What does this color mean semantically?"**
- Success? Use `--color-success`
- Warning? Use `--color-warning`
- New semantic intent? Add to tokens, don't create one-off colors

### When Adding New Sizes
Add to appropriate scale:
- Typography: Add to `--font-size-*`
- Spacing: Add to `--space-*` (multiples of 4px)
- Radii: Add to `--radius-*`

Never create a size without adding it to tokens first.

---

## 14. Enforcement

**Code Review Checklist**

- [ ] Does the component use CSS Modules?
- [ ] Are all colors/spacing/typography from tokens?
- [ ] Are variant names semantic (not visual)?
- [ ] Is motion using Framer Motion + curves from `motions.ts`?
- [ ] Are shadows from token set?
- [ ] Are there any magic numbers (px, hex, etc.) hardcoded?
- [ ] Is accessibility built in (focus, contrast, touch targets)?
- [ ] Could styles be simplified by using existing tokens?

---

## 15. Summary

The styling system ensures:

✅ **Consistency** — all decisions tied to tokens  
✅ **Maintainability** — changes in one place  
✅ **Performance** — no unnecessary CSS, CSS Modules scope  
✅ **Accessibility** — WCAG AAA contrast, touch targets, focus  
✅ **Brand identity** — neo-brutalist aesthetic, cohesive  
✅ **Developer experience** — clear rules, no configuration headaches  

> **Styling is not about decoration. It's about expressing intent through structure.**
