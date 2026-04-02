# Daily Dose - Technical Specification

**Status:** Active  
**Last Updated:** April 2, 2026

## Purpose

This document is the authoritative technical contract for Daily Dose.

It defines:

- system invariants
- document precedence
- domain entities
- storage expectations
- publication rules
- experimentation constraints

If code or another document conflicts with this file, this file wins.

## Document Precedence

When documents conflict, follow this order:

1. `TECHNICAL_SPEC.md`
2. `SYSTEMS.md`
3. `DESIGN_SYSTEM.md`
4. `GAMES.md`
5. `COMPONENT_LIBRARY.md`
6. `Business.md`
7. `TODO.md`
8. `README.md`
9. code comments and local notes

`TODO.md` is the execution roadmap, not the top-level authority.

## Core Invariants

These rules are non-negotiable:

1. No puzzle may be published without deterministic validation.
2. AI may propose or score content, but may not assert correctness.
3. Universal Daily puzzles must be identical for all users in the same release window.
4. Personalized delivery may only select from pre-validated puzzle inventory.
5. Social systems must remain asynchronous by default.
6. Daily publication must continue even if AI systems fail.
7. Core gameplay must not depend on experiments, flags, or external analytics availability.

## Domain Entities

### Puzzle

A puzzle is immutable after publication.

Required fields:

- `id`
- `gameType`
- `variant`
- `schemaVersion`
- `content`
- `solution`
- `difficultyBand`
- `rulesetId`
- `metadata`
- `status`

Lifecycle:

`draft -> validated -> approved -> scheduled -> published -> archived`

A puzzle may only move forward through this sequence.

### GameType

A game type defines:

- valid variants
- rules and constraints
- validation requirements
- scoring expectations where applicable

Breaking ruleset changes require a new version.

### User

User state should be append-only where practical.

Core fields:

- `id`
- `streak`
- `performanceSummary`
- `difficultyTolerance`
- `forgePreferences`
- `tribeMemberships`
- `entitlements`

Raw event logs should not be retained indefinitely.

### Tribe

Tribes are time-bound social entities.

Core fields:

- `id`
- `seasonId`
- `memberIds`
- `createdAt`
- `status`

Tribes may not span seasons unless an explicit migration model is defined.

### Season

A season defines a bounded competition window.

Core fields:

- `id`
- `startDate`
- `endDate`
- `status`

Score computation must be reproducible within that window.

## Storage Model

Canonical collections:

- `/puzzles`
- `/publishedPuzzles`
- `/users`
- `/dailyStats`
- `/gameStats`
- `/tribes`
- `/seasons`
- `/tribeScores`

Collection names are stable. Documents may evolve through explicit versioning.

## Validation Contract

Each game type must implement deterministic validation functions appropriate to its rules. The minimum contract is:

- `validateSchema(puzzle)`
- `validateRules(puzzle)`
- `validateSolvability(puzzle)`
- `validateUniqueness(puzzle)` where uniqueness matters

Validation rules:

- must be deterministic
- must return machine-readable failure reasons
- must not call AI services
- must be executable in automation

## Publication Flow

Publication flow:

1. select approved puzzle inventory
2. re-run safety validation
3. write published record for the target date
4. expose content to delivery systems
5. archive historical records as needed

Publication must not depend on:

- live AI calls
- player input
- unstable third-party services

## Universal and Forge Rules

### Universal Daily

- produced once per game per day
- shared by all players
- used for streaks, sharing, and tribe scoring

### Forge Mode

- selects from validated puzzle inventory
- uses player performance and preference signals
- must not change or influence Universal Daily output

## Social and Scoring Rules

Tribal scoring must be reproducible from stored data.

Allowed scoring inputs:

- completion rate
- completion time
- difficulty-adjusted performance
- consistency over time

Forbidden scoring inputs:

- premium status
- arbitrary manual boosts
- late mutable data that breaks reproducibility

## Observability and Safety

The system must surface:

- validation failure rates
- publication failures
- AI rejection rates
- unusual difficulty spikes
- missing content or scheduling failures

Silent failure is unacceptable.

## UI Experimentation Invariants

Experiments must obey these constraints:

1. A control experience must always exist.
2. Experiments must not break core puzzle playability.
3. Exposure should be recorded before outcome evaluation.
4. Variant naming must be stable and machine-readable.
5. Losing variants must be removable without component rewrite.

Experiments may optimize:

- retention
- completion
- conversion

Experiments may not weaken:

- accessibility baseline
- deterministic game logic
- fairness or scoring integrity

## Definition of Technical Done

A feature is not technically done unless:

- it satisfies this specification
- deterministic validation exists where required
- failure handling is defined
- storage and entity impact are explicit
- relevant docs are updated
