# Daily Dose - System Architecture

**Status:** Active  
**Last Updated:** April 2, 2026

## Purpose

This document explains how Daily Dose is structured operationally.

It exists to make architecture decisions understandable, maintainable, and consistent with the technical specification.

## Architectural Goals

The system is designed to be:

- lean to operate
- robust under failure
- maintainable by a solo founder with AI assistance
- easy to evolve without destabilizing the daily ritual
- capable of supporting a large game portfolio without requiring a large human team
- optimized for mobile-first play sessions, including shared play on one phone

## Core Principles

### Determinism over AI authority

AI can generate candidate content and evaluate quality signals. AI cannot define truth. Deterministic code remains the authority for correctness.

### AI-operated, founder-governed

The product may rely on AI for the majority of routine content generation, scoring, and operational recommendations, but system policy, thresholds, and exception handling remain explicitly governed.

This means:

- routine low-risk flows should be automated
- deterministic gates decide correctness and publication eligibility
- founder review is by exception, audit, and system tuning rather than by default for every puzzle
- the system must remain understandable enough that one person can intervene when needed

### Asynchronous by default

The product should avoid real-time dependencies unless a feature proves substantial value. This keeps infrastructure simple and failure modes contained.

### Universal first

Universal Daily is the social anchor. Personalized systems build on top of it but do not replace it.

### Failure-tolerant workflows

If an AI job fails, publication still proceeds. If telemetry is partial, aggregation continues later. If a content batch underperforms, reserve inventory is used.

### Mobile-first playability

Primary gameplay surfaces must be designed for phones first.

Rules:

- no vertical scrolling on core game screens in the default supported mobile viewport
- important game state, inputs, timer/status, and submit flow must fit within one screen
- touch targets must support fast, comfortable play
- two-person pass-and-play on one device is a supported use case

## High-Level Flow

Core content flow:

1. candidate puzzles are authored by humans or AI
2. multiple AI generation profiles may produce competing candidates
3. deterministic validators reject invalid puzzles
4. remaining candidates are scored, ranked, and compared
5. threshold and policy checks determine whether inventory is auto-approved or escalated
6. scheduler assigns dates and modes
7. delivery systems expose the content

## Content Pipeline

### Generation

Generation may use multiple creator profiles or models. Diversity is useful only at candidate creation time.

The intended operating model is competitive generation:

- 2 to 3 model profiles generate candidate sets
- candidates compete on deterministic validity and quality ranking
- the system selects winners from validated inventory, not from raw model confidence

### Validation

Validation is deterministic and game-specific. Invalid puzzles are discarded immediately.

### Evaluation

Evaluation helps rank candidate quality. It does not replace validation or the approval policy.

Evaluation inputs may include:

- structural quality metrics
- diversity relative to recent published content
- playtester telemetry
- retention or completion signals from prior similar puzzles
- model-vs-model historical performance

### Approval

Approval remains a deliberate control point, but it does not need to be fully manual.

Allowed model:

- deterministic validation is mandatory
- policy thresholds may auto-approve routine inventory
- unusual, borderline, or high-risk content is escalated for founder review
- the system must preserve an audit trail for why content was approved

## Delivery Systems

### Universal Daily

Universal Daily should be:

- shared across all users
- cache-friendly
- simple to retrieve
- reliable enough to support streaks, sharing, and tribe scoring
- strong enough to anchor the brand habit on its own

### Forge Mode

Forge Mode should:

- select from pre-validated inventory
- use player performance and preference signals
- create clear premium value without increasing operational chaos

### Variant Delivery

The target product shape is:

- 10 games over time
- up to 3 active variants per game where the extra surface area is justified
- standard players normally receive 1 puzzle per live variant
- playtest cohorts may receive up to 3 puzzles per variant for research purposes

Variants exist to test fun, difficulty, and retention. They should be cheap to ship and cheap to retire.

## Social Layer

Tribes are designed as asynchronous seasonal competition.

Requirements:

- no real-time multiplayer dependency
- no pay-to-win scoring
- no participation penalties that punish casual users
- strong identity and return incentives

Access model:

- anyone can play core games
- verification is required for scoreboards, tribe membership, and richer social/stat surfaces
- tribe creation may be reserved for paid users if it materially reduces spam and improves quality
- verified users may join tribes by invite subject to safety rules

## Analytics Strategy

### Always-on metrics

Capture low-cost product signals:

- completion
- win/loss
- time to complete
- streak activity
- mode usage
- variant performance
- share behavior
- verification conversion
- premium conversion

### Sampled deep telemetry

Use sampled or playtester-only telemetry for richer analysis:

- wrong guesses
- action sequences
- hesitation patterns
- hint usage
- abandon points
- retry behavior
- pass-and-play or share-context signals where feasible

Deep telemetry should be short-lived and aggregated when possible.

### AI Improvement Loop

Telemetry and puzzle outcomes should feed a controlled improvement loop:

1. capture puzzle and variant performance
2. aggregate findings by game type, variant, and audience segment
3. update prompts, ranking heuristics, or generator profiles
4. validate that changes improve outcomes without harming fairness

The system should learn, but only through explicit versioned changes.

## Infrastructure

Current stack:

- Next.js and React for product UI
- TypeScript for application and validation logic
- Firebase Authentication and Firestore for user and content data
- Vercel for hosting and scheduled execution

This stack is chosen for low operational overhead and fast iteration, not novelty.

## Operational Model

### Daily

- verify scheduled content
- review analytics summary
- watch for publication or runtime failures
- review any escalated approvals or anomaly alerts

### Weekly

- review puzzle quality
- review retention and completion signals
- tune difficulty or routing policies
- review model competition outcomes and generator performance

### Monthly

- ship one meaningful improvement
- reassess pricing, packaging, or social mechanics
- remove low-value complexity
- evaluate which variants should be promoted, revised, or retired

## Success Criteria

The architecture is successful if:

- daily publication is calm and predictable
- puzzle fairness is trusted
- AI reduces work without introducing instability
- social systems improve return without operational burden
- costs remain controlled as usage grows
- the founder is not required to supervise every routine content or operational decision
