# Daily Dose - Execution Roadmap

**Status:** Active  
**Last Updated:** April 2, 2026

## Purpose

This file is the execution roadmap for Daily Dose.

It translates product, technical, and UI strategy into a practical build order. It does not override `TECHNICAL_SPEC.md`.

## Current Strategic Priority

The current priority is not to add more ideas. It is to turn the existing system into a reliable operating model:

1. clear documentation and governance
2. stable UI system
3. one or a few high-quality game loops
4. deterministic content pipeline
5. measurable retention signals

## Phase 0 - Documentation and Governance

Goal: make the documentation trustworthy and aligned.

Tasks:

- [x] establish document roles and authority
- [x] clean major conflicts between product, technical, and UI docs
- [ ] keep docs in sync as implementation changes

Exit criteria:

- the docs are readable, current, and non-contradictory
- contributors can determine what is authoritative quickly

## Phase 1 - UI Operating System

Goal: make the UI modular, premium, and fast to improve.

Tasks:

- [ ] complete token migration across remaining legacy modules
- [ ] stabilize primitive and foundation APIs
- [ ] define experiment hooks for high-impact surfaces
- [ ] add visual regression coverage for critical shared components
- [ ] enforce style, type, and lint gates in normal workflow

Exit criteria:

- UI changes are mostly token, variant, or composition updates
- experiments can be shipped and removed with low effort
- regressions are easier to detect before release

## Phase 2 - Core Playable Quality

Goal: harden the strongest game loops before expanding further.

Tasks:

- [ ] identify the primary quality focus games
- [ ] ensure those games meet the current UI and engineering standard
- [ ] standardize result states, feedback, and telemetry capture
- [ ] verify that the daily experience feels fair and finishable

Recommended early focus:

- Chain
- Lexicon
- Vault

Exit criteria:

- the strongest game surfaces feel polished and consistent
- users can complete a high-quality daily loop without rough edges

## Phase 3 - Puzzle Pipeline Basics

Goal: separate content operations from page code.

Tasks:

- [ ] define canonical puzzle schema by game family
- [ ] implement deterministic validators
- [ ] establish lifecycle states from draft to published
- [ ] create reserve inventory and scheduling rules

Exit criteria:

- content can be validated and scheduled without ad hoc handling
- daily publication is protected from content failure

## Phase 4 - Product Measurement

Goal: measure product quality without overbuilding analytics.

Tasks:

- [ ] capture core metrics
- [ ] aggregate useful product signals
- [ ] define experiment event taxonomy
- [ ] track retention and completion trends for decision-making

Exit criteria:

- decisions are informed by actual user behavior
- metrics support product and UI iteration without heavy telemetry cost

## Phase 5 - Forge Mode

Goal: turn premium into a clear and defensible value layer.

Tasks:

- [ ] define Forge selection logic
- [ ] gate premium entitlements cleanly
- [ ] make the value proposition obvious in the product
- [ ] avoid per-user generation unless justified later

Exit criteria:

- premium value is clear in one sentence
- Forge feels meaningfully better, not merely different

## Phase 6 - Tribes

Goal: add social reinforcement only after the core loop is reliable.

Tasks:

- [ ] define season and tribe data contracts
- [ ] implement asynchronous scoring
- [ ] ensure scoring is reproducible and fair
- [ ] build the social surfaces only after the underlying model is sound

Exit criteria:

- tribes increase return without turning the product into a live-service burden

## Phase 7 - AI Content Operations

Goal: use AI to reduce production cost without giving up control.

Tasks:

- [ ] batch-generate candidate puzzle inventory
- [ ] run deterministic validation automatically
- [ ] score surviving candidates
- [ ] keep humans in the approval loop

Exit criteria:

- AI reduces manual content workload
- AI does not weaken trust in puzzle quality

## Operating Rules

Use these rules to keep scope under control:

1. If it weakens the daily ritual, reject it.
2. If it adds complexity before quality is proven, delay it.
3. If it depends on AI correctness, gate it behind deterministic checks.
4. If it does not improve retention, trust, or premium value, question it hard.
