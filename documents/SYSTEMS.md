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

## Core Principles

### Determinism over AI authority

AI can generate candidate content and evaluate quality signals. AI cannot define truth. Deterministic code remains the authority for correctness.

### Asynchronous by default

The product should avoid real-time dependencies unless a feature proves substantial value. This keeps infrastructure simple and failure modes contained.

### Universal first

Universal Daily is the social anchor. Personalized systems build on top of it but do not replace it.

### Failure-tolerant workflows

If an AI job fails, publication still proceeds. If telemetry is partial, aggregation continues later. If a content batch underperforms, reserve inventory is used.

## High-Level Flow

Core content flow:

1. candidate puzzles are authored by humans or AI
2. deterministic validators reject invalid puzzles
3. remaining candidates may be scored or ranked
4. humans approve publishable inventory
5. scheduler assigns dates and modes
6. delivery systems expose the content

## Content Pipeline

### Generation

Generation may use multiple creator profiles or models. Diversity is useful only at candidate creation time.

### Validation

Validation is deterministic and game-specific. Invalid puzzles are discarded immediately.

### Evaluation

Evaluation helps rank candidate quality. It does not replace validation or human approval.

### Approval

Approval remains a deliberate control point. No automatic publication from AI output.

## Delivery Systems

### Universal Daily

Universal Daily should be:

- shared across all users
- cache-friendly
- simple to retrieve
- reliable enough to support streaks, sharing, and tribe scoring

### Forge Mode

Forge Mode should:

- select from pre-validated inventory
- use player performance and preference signals
- create clear premium value without increasing operational chaos

## Social Layer

Tribes are designed as asynchronous seasonal competition.

Requirements:

- no real-time multiplayer dependency
- no pay-to-win scoring
- no participation penalties that punish casual users
- strong identity and return incentives

## Analytics Strategy

### Always-on metrics

Capture low-cost product signals:

- completion
- win/loss
- time to complete
- streak activity
- mode usage

### Sampled deep telemetry

Use sampled or playtester-only telemetry for richer analysis:

- wrong guesses
- action sequences
- hesitation patterns

Deep telemetry should be short-lived and aggregated when possible.

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

### Weekly

- review puzzle quality
- review retention and completion signals
- tune difficulty or routing policies

### Monthly

- ship one meaningful improvement
- reassess pricing, packaging, or social mechanics
- remove low-value complexity

## Success Criteria

The architecture is successful if:

- daily publication is calm and predictable
- puzzle fairness is trusted
- AI reduces work without introducing instability
- social systems improve return without operational burden
- costs remain controlled as usage grows
