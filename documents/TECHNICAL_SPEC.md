# Daily Dose — Technical Specification

## 1. Purpose

This document defines the **authoritative technical contract** for Daily Dose.

It specifies:
- data models
- system boundaries
- invariants
- and lifecycle guarantees

Any code that contradicts this document is considered incorrect,
regardless of whether it “works”.

---

## 2. Core Architectural Invariants

These rules are non‑negotiable.

1. No puzzle may be published without passing deterministic validation.
2. AI systems may never assert truth; only code can.
3. Universal Daily puzzles must be identical for all users.
4. Personalisation may only select from pre‑validated puzzles.
5. Social systems must be asynchronous.
6. Daily publication must succeed even if AI pipelines fail.

---

## 3. Domain Entities

### 3.1 Puzzle

A puzzle is immutable after publication.

**Required Fields**
- `id`
- `gameType`
- `variant`
- `schemaVersion`
- `content`
- `solution`
- `difficultyBand`
- `rulesetId`
- `metadata`

**Lifecycle State**
draft → validated → approved → scheduled → published → archived


A puzzle may only move forward in this sequence.

---

### 3.2 GameType

A GameType defines:
- valid rules
- valid variants
- required validators

GameTypes are versioned.
Breaking changes require a new version.

---

### 3.3 User

User state is append‑only where possible.

**Key Attributes**
- `streak`
- `performanceSummary`
- `difficultyTolerance`
- `forgePreferences`
- `tribeMemberships`

Raw interaction logs are not stored indefinitely.

---

### 3.4 Tribe

Tribes are time‑bound social entities.

**Properties**
- `id`
- `seasonId`
- `memberIds`
- `createdAt`
- `status`

Tribes may not span seasons.

---

### 3.5 Season

A Season defines a fixed competition window.

**Properties**
- `id`
- `startDate`
- `endDate`
- `status`

Scores are computed only within these bounds.

---

## 4. Data Storage Model (Firestore)

### 4.1 Collections (Canonical Names)

- `/puzzles`
- `/publishedPuzzles`
- `/users`
- `/dailyStats`
- `/tribes`
- `/seasons`
- `/tribeScores`

Collection names are stable.
Documents may evolve via versioning.

---

## 5. Puzzle Validation System

Each GameType must provide:

- `validateSchema(puzzle)`
- `validateRules(puzzle)`
- `validateSolvability(puzzle)`
- `validateUniqueness(puzzle)` (if applicable)

Validation functions:
- must be deterministic
- must return machine‑readable failure reasons
- must never call AI services

---

## 6. AI Pipeline Contract

AI systems are **stateless helpers**.

### Allowed Responsibilities
- generating candidate content
- scoring or ranking proposals
- formatting into schemas

### Forbidden Responsibilities
- determining correctness
- asserting solution validity
- bypassing validation
- publishing content

AI output is treated as **untrusted input**.

---

## 7. Daily Publication Flow

1. Scheduler selects `approved` puzzle(s).
2. Validator re‑runs checks (safety guard).
3. Puzzle is written to `/publishedPuzzles/{date}`.
4. Old daily puzzles are archived.

At no point may publication depend on:
- live AI calls
- user input
- external services

---

## 8. Universal vs Forge Delivery Rules

### Universal Daily
- Created once per day per game.
- Served identically to all users.
- Source of truth for:
  - streaks
  - sharing
  - tribe scoring

### Forge Mode
- Selects puzzles from validated pool.
- Must respect user difficulty tolerance.
- May never influence Universal puzzles.

---

## 9. Tribal Scoring Logic

Scores are computed via scheduled jobs.

Allowed inputs:
- completion time
- completion rate
- puzzle difficulty

Forbidden inputs:
- premium status
- absolute playtime
- late submissions

Scoring must be reproducible from stored stats.

---

## 10. Versioning & Migration

Breaking changes require:
- schemaVersion increment
- migration plan
- backward compatibility window where feasible

---

## 11. Observability & Safety

The system must surface:
- validation failure rates
- publication failures
- AI generation rejection rates
- abnormal difficulty spikes

Silent failure is unacceptable.

---

## 12. Enforcement Rule

When documents conflict, precedence is:

1. TECHNICAL_SPEC.md
2. SYSTEMS.md
3. GAMES.md
4. README.md
5. CODE

If code violates this spec, fix the code.