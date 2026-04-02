# **Daily Dose — TODO LIST - Execution Roadmap**

***

## How to Use This Document

This file defines **what gets built, in what order, and why**.

Rules:

*   Tasks earlier in the list unblock everything after.
*   Do not skip phases.
*   Do not add features not justified by retention or revenue.
*   If something feels heavy, it is probably Phase‑Too‑Early.

***

# PHASE 0 — FOUNDATIONAL ALIGNMENT (✅ COMPLETE)

> Goal: Lock conceptual clarity so AI tools and future contributors don't drift.

**Status:** Complete (April 2, 2026)

### ✅ Tasks (All Complete)

*   ✅ Finalised and committed:
    *   README.md (Product vision)
    *   SYSTEMS.md (Architecture)
    *   GAMES.md (Game specs)
    *   Business.md (Revenue model)
*   ✅ Created this `TODO.md` as the **single execution authority**
*   ✅ Removed experimental code, mapped all systems
*   ✅ **NEW:** Built complete design system foundation:
    *   `/styles/tokens.css` — all design tokens (colors, spacing, motion, typography)
    *   `/styles/globals.css` — global resets and base styles
    *   `/styles/motions.ts` — Framer Motion presets and curves
    *   **Component Library Complete:**
        *   Layer 1 Primitives: Text, Button, Surface, IconButton, Divider
        *   Layer 2 Foundations: Card, Badge, Pill, ProgressIndicator
    *   All components use CSS Modules + design tokens
    *   All motion uses Framer Motion with Material Design 3-inspired curves
*   ✅ Updated documentation:
    *   COMPONENT_LIBRARY.md (reflects actual implementation)
    *   THEME_AND_STYLING_SPEC.md (system architecture + tokens documented)

### ✅ Exit Criteria (All Met)

*   ✅ Repo clearly communicates **what Daily Dose is**
*   ✅ No ambiguous product direction remains
*   ✅ Design system is **production-ready** (all primitives/foundations built)
*   ✅ Styling rules are **enforceable** (CSS Modules + tokens, no Tailwind, no inline styles)
*   ✅ Component library is **well-documented** with implementation examples
*   ✅ Motion system is **standardized** (Framer Motion + consistent easing/durations)

***

# PHASE 1 — UNIVERSAL DAILY (CORE MVP)

> Goal: Ship a single, satisfying daily puzzle experience that can be shared.

### ✅ Tasks

*   [ ] Implement **one game only** (recommend: Lexicon or Chain)
*   [ ] Build Universal Daily UI:
    *   puzzle display
    *   input mechanism
    *   submission
    *   completion state
*   [ ] Define **canonical puzzle JSON schema**
*   [ ] Implement deterministic **TypeScript validator** for this game
*   [ ] Create manual admin approval flow (even if basic)
*   [ ] Store & fetch “today’s puzzle” from Firestore

### ❌ Explicitly Not Doing

*   No personalisation
*   No AI generation
*   No tribes
*   No multiple games

### ✅ Exit Criteria

*   Anyone can play today’s puzzle
*   Puzzle feels fair, fast, and finishable
*   You can say: *“This already feels good.”*

***

# PHASE 2 — PUZZLE PIPELINE BASICS

> Goal: Separate puzzle content from UI and future‑proof the system.

### ✅ Tasks

*   [ ] Create Puzzle Lifecycle states:
    *   `draft → validated → approved → scheduled → published → archived`
*   [ ] Implement validation middleware:
    *   schema check
    *   solvability
    *   rule compliance
*   [ ] Create fallback “reserve puzzle pool”
*   [ ] Add basic scheduler (date → puzzle mapping)

### ✅ Exit Criteria

*   Daily puzzle can never “go missing”
*   Invalid content cannot leak to users

***

# PHASE 3 — ANALYTICS (LIGHT BUT MEANINGFUL)

> Goal: Measure what matters without destroying margins.

### ✅ Tasks

*   [ ] Track:
    *   puzzle completion
    *   time to complete
    *   win/loss
    *   streak count
*   [ ] Store metrics in aggregated format
*   [ ] Avoid raw action logs for now

### ✅ Exit Criteria

*   You can answer:
    *   Are people finishing puzzles?
    *   Are they returning tomorrow?
    *   Which puzzles feel too hard or too easy?

***

# PHASE 4 — FORGE MODE (PREMIUM CORE)

> Goal: Create real monetisable value beyond the free daily.

### ✅ Tasks

*   [ ] Implement second delivery path: “Forge Mode”
*   [ ] Personalised daily selection logic using:
    *   recent performance
    *   completion time trends
    *   failure frequency
*   [ ] Gate Forge Mode behind premium flag
*   [ ] Implement basic subscription entitlements

### ❌ Explicitly Not Doing

*   No deep AI logic yet
*   No per‑user puzzle generation

### ✅ Exit Criteria

*   Premium users feel a **clear difference**
*   You can explain Forge Mode value in one sentence

***

# PHASE 5 — TRIBAL WARFARE (SEASONAL SOCIAL)

> Goal: Social reinforcement without burnout or infra pain.

### ✅ Tasks

*   [ ] Define Tribe schema:
    *   id
    *   members
    *   season association
*   [ ] Implement seasonal structure (2–4 weeks)
*   [ ] Aggregate Universal Daily stats per tribe
*   [ ] Compute daily tribe scores asynchronously
*   [ ] Display tribe leaderboard

### 🔒 Constraints

*   No real‑time multiplayer
*   No penalties for non‑participation
*   No advantage from premium spend

### ✅ Exit Criteria

*   Tribe participation increases daily return
*   No infra complexity explosion

***

# PHASE 6 — AI GENERATION (LEAN, CONTROLLED)

> Goal: Improve puzzle quality, not chase novelty.

### ✅ Tasks

*   [ ] Implement **batch AI generation job**
*   [ ] Create 2–3 “Creator Profiles”
*   [ ] Pipe AI output → deterministic validators
*   [ ] Discard failures automatically
*   [ ] Add single AI evaluator for quality scoring

### 🔑 Core Rule

> **AI generates. Code validates. Humans approve.**

### ✅ Exit Criteria

*   AI reduces creation time
*   AI never introduces unsolved or ambiguous puzzles
*   Costs remain capped and predictable

***

# PHASE 7 — MULTI‑MODEL COMPETITION (OPTIONAL)

> Goal: Elite puzzle quality without chaos.

### ✅ Tasks

*   [ ] Introduce second AI model for generation diversity
*   [ ] Add **offline benchmarking job**:
    *   compare evaluator predictions to real telemetry
*   [ ] Assign models to roles (not debates)

### ❗ Warning

This phase is **optional** and only justified once:

*   Revenue is stable
*   Retention is proven

***

# PHASE 8 — EXPANSION & POLISH

> Goal: Compound value, not scope creep.

### ✅ Options (Choose Carefully)

*   [ ] Add second game system
*   [ ] Seasonal special events
*   [ ] Workplace tribes (B2B‑lite)
*   [ ] Advanced stats (premium only)
*   [ ] Visual polish & micro‑delight

### ✅ Rule

Only ship features that:

*   increase retention **or**
*   increase subscription value

***

# OPERATIONAL RULES (NON‑NEGOTIABLE)

*   If it breaks the daily ritual → reject it
*   If it adds infra complexity → delay it
*   If it depends on AI correctness → gate it
*   If it doesn’t improve retention → don’t ship it

***

# SUCCESS CHECKPOINTS

Daily Dose is on track if:

*   players return daily
*   puzzles feel fair
*   costs remain flat as users grow
*   premium conversion feels earned
*   you enjoy running the product