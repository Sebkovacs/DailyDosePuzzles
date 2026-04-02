# Daily Dose — Design System Implementation Guide

**Status**: Phase 1 ✅ Complete | Phase 2 🚀 In Progress (Admin/Stats modules remaining)
**Last Updated**: April 2, 2026
**Aesthetic**: Neo-brutalist letterpress with Framer Motion

### 🎉 Phase 1: Complete
✅ Core component system (8 primitives + GameLayout)
✅ Design tokens (225+ CSS variables, 10 semantic categories)
✅ Framer Motion integration (MOTION constants)
✅ All 9 game CSS modules refactored to tokens

### 🚀 Phase 2: ~95% Complete
✅ Game menu CSS (page.module.css)
✅ Chain game CSS (Chain.module.css)
✅ All 9 game modules: Lexicon, Layers, Numbers, Split, Roots, Shift, Spectrum, Stab, Vault
🔄 Admin/Stats CSS modules (Analytics.module.css, Admin.module.css) - IN PROGRESS
⏳ Game page.tsx variants (blitz, standard, versus) - Remove inline styles

---

## 📁 File Structure

```
/styles/
  tokens.css           # Single source of truth for all design properties
  globals.css          # Base typography, resets, input styling
  motions.ts           # Framer Motion presets (curves, durations, animations)

/components/
  Button.tsx/css       # Primary interaction - 6 semantic variants
  BrutalButton.tsx/css # High-emphasis interaction - aggressive letterpress
  Text.tsx/css         # Typography system - 8 sizes, 4 color variants
  Surface.tsx/css      # Abstract surface - the foundation for cards/panels
  Badge.tsx/css        # Compact status indicators, pills
  ProgressIndicator.tsx/css # Bar, dots, ring progress
  GameLayout.tsx/css   # Page scaffold for game views
  FeedbackModal.tsx/css # Modal with backdrop blur for feedback collection
```

---

## 🎨 Design Tokens (tokens.css)

All visual properties are semantic variables. **Zero magic numbers in code.**

### Color System (Semantic Intent)
- **Backgrounds**: `--color-bg-primary` (paper), `--color-bg-secondary` (card), `--color-bg-tertiary` (depth)
- **Text**: `--color-text-primary` (main), `--color-text-secondary` (faded), `--color-text-muted`, `--color-text-inverse`
- **Semantic**: `--color-success`, `--color-danger`, `--color-warning`, `--color-info`
- **Accents**: `--color-accent-primary` (sanguine), `--color-accent-secondary` (teal), `--color-accent-tertiary` (plum)
- **Wash Layers** (light backgrounds): `--color-wash-primary`, `--color-wash-secondary`, `--color-wash-tertiary`, `--color-wash-success`, `--color-wash-warning`, `--color-wash-danger`, `--color-wash-info`, `--color-wash-ochre`
- **Game Theme Colors** (unique per game):
  - **Split**: `--color-game-viridian` (#1B7F7D), `--color-game-viridian-wash` (#E0F4F3)
  - **Roots**: `--color-game-pine` (#2D6A4F), `--color-game-pine-wash` (#EFF5F0)
  - **Shift**: `--color-game-indigo` (#3B5BA8), `--color-game-indigo-wash` (#EEF2FF)
  - **Stab**: `--color-game-plum` (#4A2B4D), `--color-game-plum-wash` (#F3E8F5)
  - **Numbers/Spectrum**: `--color-game-ochre` (#B8860B), `--color-game-ochre-wash` (#FFF5E6)
  - **Vault**: `--color-game-slate` (#8A8278), `--color-game-slate-wash` (#E8E6E1)

### Typography (4 families, 8 sizes, 4 weights, 3 line heights)
- Families: `--font-serif`, `--font-sans`, `--font-mono`
- Sizes: `--font-size-xs` (12px) → `--font-size-4xl` (48px)
- Weights: regular (400), medium (500), semibold (600), bold (700)
- Lines: tight (1.2), normal (1.5), relaxed (1.75)

### Spacing (8-token system, 4px baseline)
- Base: `--space-1` (4px) → `--space-8` (64px)
- Padding presets: `--pad-xs` → `--pad-xl`
- Layout gaps: `--gap-tight` (8px), `--gap-normal` (16px), `--gap-relaxed` (32px)

### Borders & Radius
- Widths: `--border-width-thin` (1px), `--border-width-regular` (2px), `--border-width-thick` (3px)
- Radius: `--radius-none`, `--radius-sharp` (4px), `--radius-sm` (6px), `--radius-md` (8px), `--radius-lg` (12px)
- Presets: `--border-ink-regular`, `--border-ink-thin`, `--border-subtle`

### Motion (5 easing curves, 6 durations)
- **Curves**: `standard`, `out` (decelerate), `in` (accelerate), `bounce`, `subtle`
- **Durations**: instant (0ms), micro (100ms), fast (150ms), normal (200ms), slow (300ms), glacial (500ms)

### Shadows (Physical letterpress style)
- `--shadow-pressed` (0px offset, flat)
- `--shadow-raised` (4px offset, default)
- `--shadow-lifted` (6px offset, elevated)
- `--shadow-floating` (8px offset, highest)
- Soft variants: `--shadow-soft`, `--shadow-medium`, `--shadow-deep`

### Interactive Targets
- Min touch: `--touch-target-min` (44px)
- Comfortable: `--touch-target-comfortable` (48px)
- Generous: `--touch-target-generous` (56px)

### Button-Specific Tokens
- Offsets: `--button-offset-sm` (2px), `--button-offset-md` (3px), `--button-offset-lg` (4px)
- Sizes: `--button-size-sm-height` (40px), `--button-size-lg-height` (56px)
- Focus ring: `--button-focus-ring-width` (2px), `--button-focus-ring-gap` (4px)
- Hover colors: `--button-accent-hover`, `--button-success-hover`, `--button-danger-hover`, `--button-warning-hover`

### Progress Indicator Tokens
- Bar height: `--progress-bar-height` (8px)
- Dot size: `--progress-dot-size` (12px)
- Ring SVG: `--svg-progress-ring-size` (120px), `--svg-progress-ring-radius` (45px), `--svg-stroke-width` (6px)

### Layout Containers
- Max widths: `--max-width-xs` (320px) → `--max-width-xl` (1440px)
- Container padding: `--container-inline-start` (24px), `--container-inline-end` (24px)

### Z-Index Layers
- Base (0), Dropdown (100), Sticky (200), Fixed (300)
- Modal backdrop (400), Modal (500), Popover (600), Tooltip (700)

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

#### **BrutalButton**
Higher-emphasis variant of Button with aggressive letterpress effect.

```tsx
import { BrutalButton } from '@/components/BrutalButton';

<BrutalButton variant="primary">Confirm Action</BrutalButton>
<BrutalButton variant="danger" fullWidth>Delete Irreversibly</BrutalButton>
<BrutalButton variant="success" icon={<Check />}>Launch Puzzle</BrutalButton>
```

**Props**:
- `variant`: 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
- `fullWidth`: boolean
- `icon`: ReactNode

**Interaction**:
- Hover: Lifts with floating shadow, translates -3px -3px
- Active: Presses hard to 4px 4px offset
- More dramatic than Button—use sparingly for critical actions

---

#### **FeedbackModal**
Modal overlay for feedback collection with backdrop blur.

```tsx
import { FeedbackModal } from '@/components/FeedbackModal';

<FeedbackModal
  isOpen={showFeedback}
  onClose={setShowFeedback(false)}
  gameName="Chain"
  userId={currentUser.id}
/>
```

**Props**:
- `isOpen`: boolean
- `onClose`: () => void
- `gameName`: string (optional, customizes prompt)
- `userId`: string (required for submission)

**Features**:
- Backdrop blur effect
- Success confirmation state
- Integrated with Firebase

---
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

All interactive elements use Framer Motion with MOTION constants for consistency.

### Importing MOTION Constants
```tsx
import { MOTION } from '@/styles/motions';

// Access easing curves, durations, and preset animations
MOTION.ease.standard        // [0.4, 0, 0.2, 1]
MOTION.duration.normal      // 200ms
MOTION.buttonHover          // Pre-built button hover animation
```

### Button Interactions
```tsx
<motion.button
  whileHover={!disabled ? { scale: 1.02 } : undefined}
  whileTap={!disabled ? { scale: 0.98 } : undefined}
  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
/>
```

### Animated Progress
```tsx
<motion.div
  animate={{ width: `${percentage}%` }}
  transition={{
    duration: MOTION.duration.slow,
    ease: MOTION.ease.out,
  }}
/>
```

### Modal Transitions
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: MOTION.duration.fast, ease: MOTION.ease.standard }}
/>
```

### Available Presets
```tsx
MOTION.buttonPress      // scale 0.98
MOTION.buttonHover      // scale 1.02
MOTION.fadeIn           // opacity 1
MOTION.fadeOut          // opacity 0
MOTION.slideInLeft      // x: 0, opacity: 1
MOTION.slideOutRight    // x: 100, opacity: 0
MOTION.slideInRight     // x: 0, opacity: 1
MOTION.slideOutLeft     // x: -100, opacity: 0
MOTION.bounceIn         // scale 1, opacity 1
MOTION.pop              // scale [0.95, 1.05, 1]
MOTION.pulse            // scale [1, 1.05, 1] (infinite)
MOTION.staggerContainer // Staggered children
MOTION.staggerItem      // Individual child
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

1. **Zero Magic Numbers**: All values (colors, spacing, sizes, durations) use CSS tokens
   - `.button { padding: var(--pad-md) var(--pad-lg); }` ✅
   - `.button { padding: 16px 24px; }` ❌

2. **Motion via Constants**: Use MOTION presets in React components
   ```tsx
   import { MOTION } from '@/styles/motions';

   <motion.div
     animate={{ opacity: 1 }}
     transition={{ duration: MOTION.duration.normal, ease: MOTION.ease.standard }}
   />
   ```

3. **Compose, Don't Override**: Build complex UIs by nesting primitives
   ```tsx
   <Card header={<Heading2>Title</Heading2>} footer={<Button>Action</Button>}>
     <Surface elevation="flat"><Body>Content</Body></Surface>
   </Card>
   ```

4. **CSS Modules Only** (no inline Tailwind)
   ```tsx
   // ✅ Good
   import styles from './MyComponent.module.css';
   <div className={styles.container} />

   // ❌ Bad
   <div className="flex items-center px-4 py-2" />
   ```

5. **Variant Over Props**: Use semantic variants instead of raw color props
   ```tsx
   <Button variant="danger" /> // ✅
   <Button style={{ backgroundColor: '#781D26' }} /> // ❌
   ```

6. **Accessibility First**: All components have proper ARIA labels, min touch targets (48px)

7. **Motion is Subtle**: Durations ≤ 300ms for most interactions (use `MOTION.duration.slow` or faster)

8. **Disabled States Protected**: Framer Motion properties guarded with disabled checks
   ```tsx
   whileHover={!disabled ? { scale: 1.02 } : undefined}
   ```

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
