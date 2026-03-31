# System Architecture Deep Dive

This document provides a technical overview of the core systems that power the Puzzlesaurs platform.

## Tech Stack

-   **Frontend:** Next.js, React, TypeScript, CSS Modules
-   **Backend & Database:** Firebase (Firestore, Authentication)
-   **Hosting & Serverless:** Vercel (including Vercel Cron Jobs)
-   **AI:** Large Language Models (e.g., Google's Gemini) via API for generation and evaluation.

---

## Core System Breakdown

### 1. The Disposable Prototype System

-   **Structure:** Game prototypes are organized by directory: `/app/[game]/[variant]/page.tsx`. This allows for rapid creation and testing of new ideas (e.g., `/vault/blitz`, `/lexicon/reverse`).
-   **Function:** This A/B/C testing framework is the engine of our innovation. We can deploy dozens of experimental variants to playtesters, gather data on what is most engaging, and promote only the "best" variants to the general user base.

### 2. The AI Generator (`/api/arena/generate`)

-   **Trigger:** Can be triggered manually from the Admin Dashboard or automatically by a cron job.
-   **Process:**
    1.  Receives a `gameName` (e.g., `VaultCorrupted`), a `count`, and optional `constraints` (e.g., "theme should be sci-fi").
    2.  Sends a structured prompt to the LLM API to generate a batch of puzzles that conform to the game's rules and constraints.
    3.  Parses the LLM's response and saves each new puzzle as a document in the `arenaPuzzles` collection in Firestore with a `status` of `pending`.

### 3. The Playtesting & Feedback Loop

-   **Serving Puzzles:** When a user with the `tester` role plays a game, the system first attempts to fetch a `pending` puzzle from the `arenaPuzzles` collection for that game variant.
-   **Collecting Feedback:** Upon completion, the playtester's results (`won`, `mistakes`, `timeToComplete`) and their explicit star rating are saved back into that puzzle's document in Firestore. The puzzle's `status` is updated to `completed`.

### 4. High-Fidelity Analytics (`saveGameStats`)

-   **Data Points:** For every game played (by testers and regular users), we save a rich data object to the `gameStats` collection.
-   **Key Metrics:**
    -   `actionTimeline`: A timestamped array of every single interaction (clicks, keypresses, submissions). This is the most valuable data for the AI.
    -   `wrongGuesses`: A structured array of incorrect final answers. This directly feeds our "Trap Metric" analysis.
    -   `timeToFirstAction`: The number of seconds a user hesitates before their first interaction. A powerful proxy for a puzzle's initial "comprehension difficulty."

### 5. The AI Evaluator (`/api/cron/evaluate`)

-   **Trigger:** A nightly cron job.
-   **Process:**
    1.  Fetches all `completed` playtest data from the last 24 hours.
    2.  Groups the data by `gameName`.
    3.  For each game, it analyzes the telemetry to find correlations. For example: "Puzzles with 7-letter words have a 20% higher abandonment rate," or "The most common wrong guess for puzzle X was Y."
    4.  It formulates a "thesis" based on these findings and generates a new set of `constraints` for the AI Generator.
    5.  This creates a fully automated, self-improving loop where the AI learns from player behavior to create better and more engaging puzzles each night.