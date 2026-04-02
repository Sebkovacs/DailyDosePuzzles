# Daily Dose

Daily Dose is a mobile-first daily puzzle product designed to exceed the standard set by Wordle and Connections through stronger game variety, warmer social play, and a better long-term habit loop.

The product is built around three pillars:

- Universal Daily: a shared puzzle ritual that everyone can play.
- Forge Mode: personalized difficulty, progression, and deeper insight for committed users.
- Tribes: asynchronous social competition designed to increase return without burnout.

The product is designed to be:

- fair and intellectually satisfying
- mobile-first and comfortable to play together on one phone
- operationally lean
- scalable without real-time infrastructure
- adaptable through strong documentation, deterministic systems, and modular UI

## Repository Purpose

This repository contains the application code, product specifications, UI system, and execution roadmap for Daily Dose.

The documentation is structured so each file has a clear role:

- `documents/TECHNICAL_SPEC.md`: authoritative engineering contract and document precedence
- `documents/SYSTEMS.md`: architecture and operational design
- `documents/Games.md`: game portfolio and design standards
- `documents/Business.md`: business model and strategic constraints
- `documents/DESIGN_SYSTEM.md`: UI engineering contract
- `documents/COMPONENT_LIBRARY.md`: reusable component rules
- `documents/THEME_AND_STYLING_SPEC.md`: styling migration and token policy
- `documents/TODO.md`: execution roadmap

If documents conflict, follow the precedence in `documents/TECHNICAL_SPEC.md`.

## Product Summary

Daily Dose is not a single puzzle mechanic stretched across many surfaces. It is a portfolio of puzzle systems that support:

- a high-quality daily habit
- measurable progression
- selective social competition
- premium monetization without pay-to-win behavior

The target portfolio is:

- 10 core games
- 3 live variants per game where justified
- 1 puzzle per variant for standard players
- 3 puzzles per variant for playtest cohorts

AI is used as a content accelerator and operating layer, not as a source of truth. Deterministic systems define correctness. Founder review is reserved for high-risk changes, exceptions, and periodic quality audit rather than every routine decision.

## Product Principles

- Retention over acquisition
- Clarity over complexity
- Determinism over AI authority
- Asynchronous systems over live operational risk
- Quality over content volume
- Mobile-first playability over desktop-first complexity
- Warm social ritual over cold leaderboard mechanics

## Technology Stack

- Frontend: Next.js, React, TypeScript
- Backend: Firebase Authentication, Firestore, scheduled jobs
- Hosting: Vercel
- AI: batch generation and evaluation behind deterministic validators

## Current Focus

Current work is focused on:

- tightening the documentation so the vision and execution model match
- hardening the UI system for mobile-first, no-scroll gameplay
- stabilizing quality gates and engineering standards
- building the deterministic puzzle pipeline that can support AI-assisted scale

## Status

The product is under active development. Documentation is intended to function as an operating system for product, engineering, and design decisions.
