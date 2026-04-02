# Daily Dose — Design System Implementation Guide

**Status**: Complete - All core primitives and foundations built
**Last Updated**: April 2, 2026
**Aesthetic**: Neo-brutalist letterpress with Framer Motion

---

## 📁 File Structure

```
/styles/
  tokens.css           # Single source of truth for all design properties
  globals.css          # Base typography, resets, input styling

/components/
  Button.tsx/css       # Primary interaction - 6 semantic variants
  Text.tsx/css         # Typography system - 8 sizes, 4 color variants
  Surface.tsx/css      # Abstract surface - the foundation for cards/panels
  Badge.tsx/css        # Compact status indicators, pills
  ProgressIndicator.tsx/css # Bar, dots, ring progress
  GameLayout.tsx/css   # Page scaffold for game views
```

---

## 🎨 Design Tokens (tokens.css)

All visual properties are semantic variables. No magic numbers in components.

### Color System (10 tokens)
- **Backgrounds**: `--color-bg-primary` (paper), `--color-bg-secondary` (card), `--color-bg-tertiary` (depth)
- **Text**: `--color-text-primary` (main), `--color-text-secondary` (faded), `--color-text-muted`, `--color-text-inverse`
- **Semantic**: `--color-success`, `--color-danger`, `--color-warning`, `--color-info`
- **Accents**: `--color-accent-primary` (sanguine), `--color-accent-secondary` (teal), `--color-accent-tertiary` (plum)

### Typography (4 families, 8 sizes, 4 weights)
- `--font-serif`, `--font-sans`, `--font-mono`
- Sizes: `--font-size-xs` (12px) → `--font-size-4xl` (48px)
- Weights: regular, medium, semibold, bold

### Spacing (8-token system, 4px baseline)
- `--space-1` (4px) → `--space-8` (64px)
- Presets: `--pad-xs` → `--pad-xl`

### Motion (5 easing curves, 5 durations)
- **Curves**: standard, bounce, in, out, subtle
- **Durations**: instant, micro (100ms), fast (150ms), normal (200ms), slow (300ms), glacial (500ms)

### Shadows (3 styles: physical letterpress)
- `--shadow-pressed` (flat)
- `--shadow-raised` (4px offset)
- `--shadow-lifted` (6px offset)
- `--shadow-floating` (8px offset)

---

## 🧩 Component Hierarchy

### Layer 1: Primitives (No domain logic)

#### **Text**
Typography control. Centralizes all font sizing and hierarchy.

```tsx
import { Text, Heading1, Body, Label, Caption } from '@/components/Text';

<Heading1>Main Title</Heading1>
<Body>Regular paragraph text</Body>
<Label>Form label</Label>
<Caption variant="muted">Hint text</Caption>
```

**Props**:
- `as`: 'p' | 'span' | 'div' (default: 'p')
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
- `variant`: 'primary' | 'secondary' | 'muted' | 'inverse'
- `weight`: 'regular' | 'medium' | 'semibold' | 'bold'
- `align`: 'left' | 'center' | 'right'

**Presets**: `Heading1-4`, `Body`, `Label`, `Caption`, `Mono`

---

#### **Button**
Primary interaction element. Full semantic variant system with Framer Motion hover.

```tsx
import { Button } from '@/components/Button';

<Button variant="primary">Save Puzzle</Button>
<Button variant="danger" size="lg">Delete</Button>
<Button variant="success" icon={<Check />}>Confirm</Button>
<Button fullWidth disabled>Locked</Button>
```

**Props**:
- `variant`: 'primary' | 'secondary' | 'neutral' | 'success' | 'danger' | 'accent'
- `size`: 'sm' | 'md' | 'lg'
- `fullWidth`: boolean
- `icon`: ReactNode
- `isLoading`: boolean (aria-busy)

**Interaction**: 
- Hover: Lifts with shadow, translates -2px -2px
- Active: Presses down to 4px 4px offset
- Disabled: Faded, not-allowed cursor

---

#### **Surface**
Abstract "UI surface" - the foundation for cards, panels, containers.

```tsx
import { Surface, Card, Divider } from '@/components/Surface';

<Surface elevation="raised" intent="default" bordered>
  Content here
</Surface>

<Card header={<h2>Title</h2>} footer={<Button>OK</Button>}>
  Card content
</Card>

<Divider />
```

**Props**:
- `elevation`: 'flat' | 'raised' | 'lifted' | 'floating' (physical depth)
- `intent`: 'default' | 'accent' | 'success' | 'warning' | 'danger'
- `bordered`: boolean
- `padding`: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `as`: 'div' | 'section' | 'article'

---

#### **Badge** / **Pill**
Compact status/count indicators.

```tsx
import { Badge, Pill } from '@/components/Badge';

<Badge variant="success">Solved</Badge>
<Badge variant="danger" icon={<AlertIcon />}>5 Wrong</Badge>

<Pill variant="accent">1,234</Pill>
<Pill variant="danger">Hard</Pill>
```

**Props**:
- `variant`: 'neutral' | 'accent' | 'success' | 'warning' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `icon`: ReactNode (badge only)

---

#### **ProgressIndicator**
Game state progression. Three types: bar, dots, ring.

```tsx
import { ProgressBar, ProgressDots, ProgressRing } from '@/components/ProgressIndicator';

<ProgressBar value={75} variant="success" />
<ProgressDots max={5} current={3} variant="default" />
<ProgressRing value={60} variant="accent" />
```

**Props**:
- `variant`: 'default' | 'success' | 'warning' | 'danger'
- `value`: 0-100 for bar/ring
- `max`, `current`: for dots
- `animated`: boolean (default true)

---

### Layer 2: Foundations (Molecules)

Composed from primitives, light structure, no product logic.

#### **Card**
Specialization of Surface with header/footer slots.

```tsx
<Card 
  header={<Heading3>Puzzle 5</Heading3>}
  footer={<div><Button>Skip</Button> <Button variant="primary">Solve</Button></div>}
>
  <PuzzleDisplay />
</Card>
```

---

### Layer 3+: (Out of Scope Here)

Game-specific components that compose from Layer 1-2:
- `ChainPuzzle`, `LexiconPuzzle`, `VaultPuzzle` (game displays)
- `TribeBanner`, `LeaderboardRow` (social)
- `PuzzleCard`, `Timer` (gameplay)

These must NOT override or redefine primitives.

---

## 🎬 Framer Motion Integration

All interactive elements use Framer Motion for premium micro-interactions.

### Button Hover/Tap
```tsx
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
transition={{ type: 'spring', stiffness: 300, damping: 20 }}
```

### Animated Progress
```tsx
animate={{ width: `${percentage}%` }}
transition={{ duration: 0.6, ease: 'easeOut' }}
```

### Badge Pulse (future)
```tsx
animate={{ scale: [1, 1.1, 1] }}
transition={{ repeat: Infinity, duration: 2 }}
```

---

## 🚀 Usage Examples

### Full Page Layout
```tsx
"use client";

import { Heading1, Body } from '@/components/Text';
import { Button } from '@/components/Button';
import { Surface, Card } from '@/components/Surface';
import { Badge, Pill } from '@/components/Badge';
import { ProgressBar } from '@/components/ProgressIndicator';
import { GameLayout } from '@/components/GameLayout';

export default function ChainsPage() {
  return (
    <GameLayout title="Chain" subtitle="Build a logical path">
      <Surface elevation="raised" padding="lg">
        <Heading1>Today's Chain</Heading1>
        
        <Card>
          <PuzzleDisplay />
          <ProgressBar value={45} variant="default" />
        </Card>
        
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <Button variant="secondary">Skip</Button>
          <Button variant="primary" fullWidth>Solve</Button>
        </div>

        <Badge variant="accent">Solving #3,451</Badge>
      </Surface>
    </GameLayout>
  );
}
```

---

## ✅ Best Practices

1. **Always use tokens**, never hardcoded colors/sizes
2. **Compose, don't override**: Build complex UIs by nesting primitives
3. **Variant > Config**: Use semantic variants (danger, success) not raw props
4. **Accessibility First**: All components have proper ARIA labels, min touch targets
5. **Motion is subtle**: Durations ≤ 300ms for most interactions
6. **No dark mode yet**: Tokens ready for it, but single-theme for MVP

---

## 📝 Maintenance

When adding new components:
1. Extend tokens if needed (add to tokens.css)
2. Create `.tsx` file (component logic)
3. Create `.module.css` file (component styles)
4. Use CSS variables, never hardcoded values
5. Add to this guide with examples
6. Ensure accessibility (focus states, ARIA)

---

## 🎯 Roadmap

- [ ] Dark mode theme variants
- [ ] Responsive utilities (media queries via design)
- [ ] Animation library (pulse, bounce, shake)
- [ ] Form components (Input, Select, Checkbox, Radio)
- [ ] Navigation (Tabs, Breadcrumbs)
- [ ] Modals & Popovers
