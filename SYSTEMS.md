# **Daily Dose — System Architecture**

***

## 1. Purpose of the System Architecture

Daily Dose is designed to deliver **high‑quality daily puzzles at scale** while remaining:

*   operationally lean
*   financially predictable
*   robust against AI failure
*   friendly to iterative experimentation
*   maintainable by a single founder

The architecture prioritises **clarity, determinism, and separation of concerns** over novelty or complexity.

***

## 2. Core Architectural Principles

### 2.1 Determinism Over AI Authority

AI is a generator, not a judge.

*   AI may propose puzzles.
*   **Code validates puzzles.**
*   AI may evaluate quality.
*   **Humans approve publication.**

No puzzle ships without deterministic verification.

***

### 2.2 Asynchronous by Default

Daily Dose avoids real‑time systems unless absolutely necessary.

*   No live multiplayer
*   No sockets
*   No synchronous dependency loops
*   No timing pressure on players

This keeps infra cheap, stable, and predictable.

***

### 2.3 Universal First, Personalised Second

The system always supports:

1.  **Universal Daily puzzles** – same for everyone
2.  **Personalised puzzles** – curated per user

The Universal layer is the social anchor.  
The Personalised layer drives retention and revenue.

***

### 2.4 Design for Failure

Every critical workflow must fail gracefully.

*   Missed AI job → fallback puzzle pool
*   Invalid puzzle → discard, regenerate
*   Partial telemetry → ignore, aggregate later

A single failure should **never block daily publication**.

***

## 3. High‑Level System Overview

    [ Puzzle Creators (AI) ]
              |
              v
    [ Deterministic Validators (TS) ]
              |
              v
    [ Evaluator (Single Model) ]
              |
              v
    [ Human Approval ]
              |
              v
    [ Scheduler ]
              |
              v
    [ Universal / Personalised Delivery ]

***

## 4. Puzzle Lifecycle

Every puzzle passes through the same lifecycle:

1.  **Generated** (AI or human authored)
2.  **Validated** (deterministic logic)
3.  **Evaluated** (quality scoring)
4.  **Approved** (human decision)
5.  **Scheduled** (date + mode)
6.  **Published**
7.  **Archived**

This lifecycle is immutable.

***

## 5. AI Puzzle Pipeline (Lean Competitive Model)

### 5.1 Competitive Generation

*   2–4 *creator profiles*
*   Each profile uses a different prompt style or model
*   Outputs multiple candidate puzzles
*   Generation runs in parallel

Competition happens **only at creation time**.

***

### 5-2 Deterministic Validation (Critical)

Validation is **never performed by AI**.

Validators are implemented in TypeScript and check:

*   puzzle schema integrity
*   rule compliance
*   solvability
*   unique solution (where required)
*   bounds and constraints

Invalid puzzles are immediately discarded.

No debate. No retries. No exceptions.

***

### 5.3 Centralised Evaluation

After validation, remaining puzzles are evaluated by **one trusted model**.

The evaluator scores:

*   clarity
*   perceived difficulty
*   fairness
*   novelty
*   engagement likelihood
*   suitability for:
    *   Universal Daily
    *   Personalised Forge Mode
    *   Tribal Warfare

A single evaluator ensures **consistent scoring over time**.

***

### 5.4 Formatting & Storage

Selected puzzles are:

*   normalised into a canonical JSON schema
*   enriched with metadata
*   stored in Firestore

Formatting can be:

*   deterministic, or
*   handled by a fast, cheap AI model

***

### 5.5 Human Approval

No puzzle publishes automatically.

Admin approval includes:

*   sanity check
*   schedule assignment
*   variant selection
*   mode assignment

***

## 6. Modes & Delivery Systems

### 6.1 Universal Daily Delivery

*   One puzzle document per game per day
*   Shared by all users
*   Cache‑friendly
*   Zero personalisation cost

This mode powers:

*   sharing
*   streaks
*   tribe scoring
*   social discussion

***

### 6.2 Forge Mode (Personalised Delivery)

Forge Mode generates a **daily puzzle set per user** using:

*   recent performance
*   completion times
*   failure patterns
*   difficulty tolerance
*   game preferences

Personalised selection happens **after puzzle creation**, not during generation.

The system never generates puzzles *just* for one user unless required.

***

## 7. Tribal Warfare System

### 7.1 Seasonal Structure

*   Seasons last 2–4 weeks
*   Participation is optional
*   Tribes are time‑bound entities

***

### 7.2 Scoring Model

Tribal scores are computed **asynchronously** based on Universal Daily puzzles:

*   completion rate
*   median solve time
*   difficulty‑adjusted performance
*   consistency across days

No real‑time competitive dependency exists.

***

### 7.3 Rewards

Rewards are:

*   cosmetic
*   identity‑driven
*   persistent achievements

There is **no pay‑to‑win advantage**.

***

## 8. Analytics & Telemetry Strategy

### 8.1 Tier 1 — Always On (Cheap)

Collected for all users:

*   completions
*   time‑to‑complete
*   win/loss
*   streak state
*   mode usage

***

### 8.2 Tier 2 — Deep Telemetry (Sampled)

Collected only for:

*   playtesters
*   limited samples

Includes:

*   action timelines
*   hesitation patterns
*   wrong‑guess structures

Raw logs are short‑lived and aggregated.

***

## 9. Infrastructure Stack

*   **Frontend:** Next.js, React, TypeScript
*   **Backend:** Firebase (Firestore, Authentication)
*   **Hosting:** Vercel (serverless + scheduled jobs)
*   **AI:** Multi‑model generation, single evaluator, deterministic validation

The stack is chosen for:

*   minimal DevOps
*   predictable billing
*   excellent developer ergonomics

***

## 10. Cost & Risk Containment

Key cost guards:

*   AI only generates in batches
*   Validators discard early
*   No real‑time infra
*   No per‑user puzzle generation by default
*   Limited deep telemetry retention

The system is explicitly designed to remain profitable at moderate scale.

***

## 11. Founder Operating Model

Daily Dose assumes:

*   one primary human decision‑maker
*   AI coding tools as the development team
*   documentation as the control plane
*   automation as assistance, not dependency

You are the **systems director**, not a bricklayer.

***

## 12. System Success Criteria

The system is successful if:

*   puzzles publish daily without manual stress
*   AI improves quality over time, not chaos
*   users trust puzzle fairness
*   social systems encourage return, not burnout
*   operational costs remain flat as usage grows

***

**This system exists to protect quality, sanity, and margin.**

***
