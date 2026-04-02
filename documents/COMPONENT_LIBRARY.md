# 📄 `COMPONENT_LIBRARY.md`

## **Daily Dose — Component Library (IMPLEMENTED)**

**Last Updated:** April 2, 2026  
**Status:** Core library complete and in use

This document defines the **foundational component library** for Daily Dose.

***

## 1. Philosophy

Daily Dose uses a **semantic component system** that emphasizes:

- **Intent over appearance** — variants express semantic meaning (primary, danger, success)
- **Composition over configuration** — small, named components combine into features
- **Design tokens as truth** — no magic numbers, all styling flows from `/styles/tokens.css`
- **Motion as first-class** — all interaction uses Framer Motion with consistent curves
- **CSS Modules only** — no Tailwind, no inline styles, no shared global CSS beyond tokens

> **If the component system didn't exist, the code would be beautiful. Our job is not to make it more beautiful, but to prevent it from becoming ugly.**

***

## 2. Architecture Overview

### Layer 1: Primitives (Atoms)
Basic, presentational components with zero domain logic.

- **Text** — Typography with semantic variants
- **Button** — Interactive control with neo-brutalist styling
- **Surface** — Container abstraction (panels, cards)
- **IconButton** — Icon-only interactions
- **Divider** — Visual separators

### Layer 2: Foundations (Molecules)
Composed from primitives, introduce light structure.

- **Card** — Surface with header/footer slots
- **Badge** — Compact status indicators
- **Pill** — Score/streak display (rounded badge variant)
- **ProgressIndicator** — Bar/dots/ring feedback

### Layer 3+: Feature Components
Game-specific, tribe-specific, domain-aware.

- **PuzzleCard** — Puzzle presentation (not in base library)
- **LeaderboardRow** — Tribe competition display
- **GameLayout** — App shell for game pages
- **TribeBanner** — Social group header

---

## 3. Design System Files

### Tokens
**Location:** `/styles/tokens.css`

Semantic design decisions, bound to actual values:

```css
/* Colors (semantic intent) */
--color-text-primary: #181614;         /* Main content */
--color-text-secondary: #5A534A;       /* Secondary, annotations */
--color-bg-primary: #F2EFE9;           /* Paper background */
--color-bg-secondary: #FCFAF5;         /* Card layer */
--color-success: #2D5A27;              /* Growth, positive */
--color-danger: #781D26;               /* Urgent, destructive */
--color-accent-primary: #8A3626;       /* Warmth, highlight */

/* Spacing (4px baseline) */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;

/* Typography */
--font-size-sm: 14px;
--font-size-md: 16px;
--font-size-lg: 18px;
--font-size-xl: 22px;
--font-size-2xl: 28px;

/* Motion */
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;

/* Shadows (letterpress effect) */
--shadow-raised: 4px 4px 0px var(--ink-main);
--shadow-lifted: 6px 6px 0px var(--ink-main);
--shadow-floating: 8px 8px 0px var(--ink-main);
```

### Motion Presets
**Location:** `/styles/motions.ts`

Framer Motion curves and durations aligned to tokens:

```typescript
import { MOTION } from '@/styles/motions';

// In components
<motion.button
  whileHover={MOTION.buttonHover}
  whileTap={MOTION.buttonPress}
  transition={{ type: 'spring', stiffness: 300 }}
>
```

### Global Styles
**Location:** `/styles/globals.css`

- Imports tokens.css
- HTML/body defaults
- Form element resets
- Accessibility (focus states, sr-only)
- Imported by `app/layout.tsx`

---

## 4. Component Inventory

### Layer 1 — Primitives

#### **Text**
**Files:** `components/Text.tsx`, `components/Text.module.css`

Semantic typography with intent-driven variants.

```typescript
<Text variant="heading-md" weight="bold" color="primary">
  Puzzle Title
</Text>

<Text as="p" variant="body-md" color="secondary">
  Instructions go here
</Text>

<Text variant="mono-sm" color="muted">
  12:34 elapsed
</Text>
```

**Props:**
```typescript
interface TextProps {
  variant?: 'heading-lg' | 'heading-md' | 'heading-sm' |
            'body-lg' | 'body-md' | 'body-sm' |
            'mono-md' | 'mono-sm' |
            'label-md' | 'label-sm';
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'inverse' | 'accent';
  align?: 'left' | 'center' | 'right';
  truncate?: boolean;
  lines?: 2 | 3 | 4;  /* Clamp to N lines */
}
```

**Shortcuts:**
```typescript
<Heading1>Large Title</Heading1>
<Heading2>Section Title</Heading2>
```

---

#### **Button**
**Files:** `components/Button.tsx`, `components/Button.module.css`

Primary interaction with neo-brutalist letterpress design.

```typescript
<Button variant="primary" size="md" onClick={handleSubmit}>
  Submit Answer
</Button>

<Button variant="danger">Delete</Button>

<Button variant="secondary" icon={<ChevronRight />} iconOnly />
```

**Props:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'neutral' | 'success' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconOnly?: boolean;
  isLoading?: boolean;
}
```

**Visual Design:**
- Sharp corners (`4px` radius)
- Ink shadows (4px, 6px, 8px offsets)
- Hover: shadow deepens, translates up 2px
- Active: shadow compresses, translates down 4px
- Framer Motion spring for tactile feedback

---

#### **Surface**
**Files:** `components/Surface.tsx`, `components/Surface.module.css`

Container abstraction for panels, cards, elevated content.

```typescript
<Surface elevation="raised" intent="default" bordered padding="md">
  <Text>Card content</Text>
</Surface>

<Surface elevation="flat" intent="accent" padding="lg">
  Highlighted section
</Surface>
```

**Props:**
```typescript
interface SurfaceProps {
  as?: 'div' | 'section' | 'article';
  elevation?: 'flat' | 'raised' | 'lifted' | 'floating';
  intent?: 'default' | 'accent' | 'success' | 'warning' | 'danger';
  bordered?: boolean;
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}
```

**Elevations:**
- **flat:** No shadow, paper background
- **raised:** 4px shadow (initial state)
- **lifted:** 6px shadow (hover/emphasis)
- **floating:** 8px shadow (modals, tooltips)

---

#### **IconButton**
Low-chrome icon controls with accessibility built in.

```typescript
<IconButton icon={<Menu />} aria-label="Open menu" onClick={toggle} />
<IconButton icon={<X />} aria-label="Close" />
```

**Rules:**
- Always requires `aria-label`
- No text content
- Same motion as Button
- Use for toggles, controls, not primary actions

---

#### **Divider**
Simple visual separators.

```typescript
<Divider />
```

No margins, uses border tokens only.

---

### Layer 2 — Foundations

#### **Card**
Specialized Surface with header/footer slots.

```typescript
<Card header={<Text variant="heading-sm">Results</Text>} footer={<Button>Dismiss</Button>}>
  Your score: 2:13
</Card>
```

---

#### **Badge**
Compact status/classification indicators.

**Props:**
```typescript
interface BadgeProps {
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}
```

```typescript
<Badge variant="success">Completed</Badge>
<Badge variant="danger" icon={<AlertIcon />}>Error</Badge>
<Badge variant="accent" size="lg">Pro</Badge>
```

---

#### **Pill**
Rounded badge variant for scores, streaks, counts.

```typescript
<Pill variant="accent">3-day streak 🔥</Pill>
<Pill variant="success">Rank: 12</Pill>
<Pill variant="warning">⏱ 2:45 slow</Pill>
```

Same props as Badge, but circular (`border-radius: 99px`).

---

#### **ProgressIndicator**
Visual progress feedback, multiple forms.

**Bar:**
```typescript
<ProgressBar value={65} variant="default" animated />
```

**Dots:**
```typescript
<ProgressDots max={5} current={3} variant="success" />
```

**Ring:**
```typescript
<ProgressRing value={75} variant="accent" />
```

All types animate smoothly with Framer Motion.

---

## 5. Styling Rules

### CSS Modules Only
Every component gets a `.module.css` file. No cross-component sharing.

```tsx
// ✅ Good
import styles from './Button.module.css';
<button className={styles.primary} />

// ❌ Bad
<button className="flex items-center gap-2" />  /* No Tailwind */
<button style={{ color: 'red' }} />              /* No inline styles */
```

### Design Tokens as Truth
All visual properties come from tokens in `/styles/tokens.css`.

```css
/* ✅ Good */
.button {
  padding: var(--pad-md) var(--pad-lg);
  background-color: var(--color-text-primary);
  border-radius: var(--radius-sharp);
  box-shadow: var(--shadow-raised);
  transition: all var(--duration-fast) var(--ease-standard);
}

/* ❌ Bad */
.button {
  padding: 16px 24px;       /* Magic number */
  background-color: #181614; /* Magic hex */
  border-radius: 4px;       /* Magic pixel */
}
```

### Variant Classification
Variants describe **semantic intent**, not appearance.

```typescript
// ✅ Good
variant="primary"   /* High emphasis, main action */
variant="secondary" /* Lower emphasis */
variant="danger"    /* Destructive, alert user */
variant="success"   /* Affirmative, positive outcome */

// ❌ Bad
variant="big"       /* Vague */
variant="blue"      /* Visual, not semantic */
variant="fancy"     /* Unclear intent */
```

---

## 6. Motion & Interaction

All motion uses **Framer Motion** with consistent curves from `/styles/motions.ts`.

### Standard Curves
```typescript
// Most UI motion
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);

// Exit/decelerate
--ease-out: cubic-bezier(0, 0, 0.2, 1);

// Playful/bounce
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Durations
```typescript
--duration-micro: 100ms   /* Icons, small states */
--duration-fast: 150ms    /* Hover, short transitions */
--duration-normal: 200ms  /* Standard interactions */
--duration-slow: 300ms    /* Page transitions, modals */
```

### Button Motion Example
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}           /* Subtle lift */
  whileTap={{ scale: 0.98 }}             /* Press feedback */
  transition={{
    type: 'spring',
    stiffness: 300,
    damping: 20
  }}
>
```

---

## 7. Accessibility

Every component includes:

- **Focus states:** `outline: 2px solid var(--color-text-primary)`
- **Disabled states:** `opacity: var(--opacity-disabled)`
- **ARIA labels:** Required for icon-only buttons
- **Contrast:** All colors meet WCAG AAA (7:1 minimum)
- **Touch targets:** Minimum 48px × 48px

---

## 8. When NOT to Add to Base Library

The following **do not belong** in this library:

- Game-specific components (`PuzzleCard`, `Timer`)
- Tribe/social features (`LeaderboardRow`, `TribeBanner`)
- Multi-game layouts (`GameLayout` uses primitives but lives in features)
- Analytics components
- Admin-only UI

Those live in feature-specific folders and extend the base library.

---

## 9. Expansion Policy

When adding new components:

1. **Check:** Can it be composed from existing primitives?
2. **Check:** Does it serve multiple features, or just one?
3. **Decide:** Base library or feature-specific?

### Base Library Candidates
✅ Visual primitives (Text, Button, Surface)  
✅ Semantic containers (Card, Badge, Pill)  
✅ Accessibility patterns (IconButton, Divider)  
✅ Motion/feedback (ProgressIndicator, loaders)

### Feature Library Candidates
❌ Game-specific UI  
❌ Domain-specific logic  
❌ One-off visual concepts  
❌ Tightly coupled to features

If unsure, start in a feature folder. Move to base library only after proven reuse.

---

## 10. Documentation Checklist

Every component must have:

- [ ] Clear prop interface with JSDoc
- [ ] Usage examples
- [ ] Variant documentation
- [ ] When *not* to use it
- [ ] Accessibility notes

---

## 11. Enforcement

**Governance Rules (Non-Negotiable)**

- ❌ No Tailwind CSS anywhere
- ❌ No inline styles except dynamic values
- ❌ No magic numbers in components
- ❌ No skipping the component system for "one-off" cases
- ✅ All styling lives in design tokens + CSS Modules
- ✅ All motion uses Framer Motion with standard curves
- ✅ All colors are semantic, not visual

**Code Review Checklist**
- Does the component use CSS Modules?
- Are all colors/spacing from tokens?
- Is motion consistent with `motions.ts`?
- Are variants semantic?
- Is accessibility built in?
- Could it be composed from primitives instead?

---

## 12. Summary

The component library exists to ensure:

- ✅ The UI feels **authored**, not assembled
- ✅ Changes are **global**, not scattered  
- ✅ Complexity grows **slowly and intentionally**
- ✅ New developers can contribute **confidently**
- ✅ The codebase remains **pleasant to work in**

> "A design system should feel calm to read.  
> If it feels frantic, something is already failing."
