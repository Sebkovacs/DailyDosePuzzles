
# 🎨 Daily Dose — UI Styling System (Complete)

## What you get in this message

1.  **Base Theme (actual values)**
2.  **Component Library Inventory (what to build, in what order)**
3.  **Layout System Spec (Stack / Row / Grid / Container)**
4.  **Motion & Micro‑interaction Spec**
5.  **Dark / Light / Seasonal Theming Strategy**

No Tailwind. No bloat. No magic numbers. No chaos.

***

## 1) Base Theme — Canonical Values

**Files**

    /styles/tokens.css
    /styles/theme.dark.css
    /styles/theme.light.css
    /styles/global.css

### `tokens.css` (semantic tokens only)

```css
:root {
  /* Typography */
  --font-sans: Inter, system-ui, -apple-system, BlinkMacSystemFont;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas;

  --text-xs: 12px;
  --text-sm: 14px;
  --text-md: 16px;
  --text-lg: 18px;
  --text-xl: 22px;
  --text-xxl: 28px;

  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  /* Spacing (baseline = 4px) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  /* Motion */
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --duration-fast: 120ms;
  --duration-normal: 200ms;
  --duration-slow: 320ms;

  /* Layout */
  --max-width-content: 1080px;
}
```

### `theme.dark.css`

```css
[data-theme="dark"] {
  --color-bg-primary: #0e1016;
  --color-bg-surface: #151826;
  --color-bg-elevated: #1c2032;

  --color-text-primary: #eef1f6;
  --color-text-secondary: #a6aecb;
  --color-text-muted: #70789a;

  --color-accent: #7aa2ff;
  --color-accent-soft: #1e2a4f;
  --color-accent-strong: #9db7ff;

  --color-border: #262b44;
  --color-border-subtle: #1b1f34;

  --color-success: #47c690;
  --color-danger: #ff6b6b;
}
```

### `theme.light.css`

```css
[data-theme="light"] {
  --color-bg-primary: #f7f8fb;
  --color-bg-surface: #ffffff;
  --color-bg-elevated: #f2f3f8;

  --color-text-primary: #121318;
  --color-text-secondary: #4b5170;
  --color-text-muted: #8a90ad;

  --color-accent: #335dff;
  --color-accent-soft: #e6ebff;
  --color-accent-strong: #002aff;

  --color-border: #d9dcef;
  --color-border-subtle: #eceef7;

  --color-success: #1aa36f;
  --color-danger: #d64545;
}
```

### `global.css`

```css
html, body {
  margin: 0;
  padding: 0;
}

body {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  font-size: var(--text-md);
}

* {
  box-sizing: border-box;
}
```

✅ **Change the entire app’s mood by touching one file.**

***

## 2) Component Library Inventory (Build Order)

This avoids UI sprawl and duplication.

### Phase 1 (Required)

*   `Button`
*   `IconButton`
*   `Card`
*   `Divider`
*   `Badge`
*   `Text` (typography wrapper)
*   `Surface` (semantic container)

### Phase 2 (Gameplay)

*   `PuzzleCard`
*   `PuzzleHeader`
*   `InputRow`
*   `ResultState`
*   `Timer`
*   `ProgressDots`

### Phase 3 (Social)

*   `Avatar`
*   `TribeBadge`
*   `LeaderboardRow`
*   `ScorePill`

### Phase 4 (Scaffolding)

*   `Modal`
*   `Tabs`
*   `Tooltip`
*   `Toast`

**Rule:**\
If two components share >30% visual logic, extract a base.

***

## 3) Layout System Spec (The Clean Core)

Never scatter spacing again.

### `/components/layout/Stack`

Vertical rhythm.

```tsx
<Stack gap="4">
  <Title />
  <PuzzleCard />
</Stack>
```

```css
.root {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
```

### `/components/layout/Row`

Horizontal control.

```tsx
<Row justify="between" align="center" gap="2" />
```

### `/components/layout/Grid`

Structured placement (leaderboards, stats).

```tsx
<Grid cols={3} gap="4" />
```

### `/components/layout/Container`

Centers content.

```tsx
.container {
  max-width: var(--max-width-content);
  margin: 0 auto;
  padding: var(--space-4);
}
```

✅ **80% of layout pain disappears here.**

***

## 4) Motion & Micro‑interaction Spec

Motion is **feedback**, not decoration.

### Principles

*   No bounce
*   No spring physics
*   No novelty easing
*   All motion reinforces cause → effect

### Allowed Patterns

```css
transition:
  background-color var(--duration-fast) var(--ease-standard),
  color var(--duration-fast) var(--ease-standard),
  transform var(--duration-fast) var(--ease-standard);
```

### Button Example

```css
.button:hover {
  background: var(--color-accent-strong);
}

.button:active {
  transform: translateY(1px);
}
```

### Puzzle Feedback

*   Correct → brief color reinforce + settle
*   Wrong → subtle shake (1–2px, <200ms)
*   Completion → fade + lift (NOT confetti)

***

## 5) Dark / Light / Seasonal Strategy

### Theme Switch

Theme is a **single attribute**:



### Seasonal Override

Add layered overrides:

```css
[data-theme="dark"][data-season="summer"] {
  --color-accent: #ff8a00;
  --color-accent-soft: #3a240d;
}
```

### Tribe Identity (Optional)

```css
[data-tribe="blue"] {
  --color-accent: #4fa3ff;
}
```

✅ No component knows it’s seasonal or tribal\
✅ No duplication\
✅ No conditionals in component code

***

## Final Rules (Tattoo These)

1.  **Components never use raw colors or pixels**
2.  **If spacing feels wrong, fix the layout primitive**
3.  **If theming feels hard, your tokens are wrong**
4.  **If styles repeat, extract**
5.  **If it needs Tailwind, redesign it**

You now have a **clean, elite UI system** that:

*   scales,
*   stays readable,
*   keeps you sane,
*   and lets you evolve the design without rewrites.

***