# Puzzlesaurs - Strategic TODO

This document outlines the detailed, prioritized tasks for the next phases of development.

---

### **Phase 1: Complete the Core Experience (Immediate Priority)**

**Goal:** Integrate the remaining game concepts to provide a complete and varied cognitive workout, enabling the full launch of the "Cognitive Profile" feature.

-   **Task: Integrate `Stab`, `Spectrum`, `Numbers`, `Split`, `Layers`, `Shift`, `Roots`**
    -   **Why:** The platform's core promise is a diverse mental gym. These games are essential to fulfill that promise and gather data across a wider range of cognitive skills.
    -   **What:** For each game, execute the following integration plan:
        1.  **Define Prototypes:** Design 2-3 "disposable prototype" variations (e.g., `Spectrum/Timed`, `Numbers/Reverse`).
        2.  **Teach the AI:** Update the AI Generator (`/api/arena/generate`) to understand the rules and constraints for the base game and its new variants.
        3.  **Build the UI:** Create the frontend menu hub (`/app/[game]/page.tsx`) and the individual prototype pages, following the established architecture.
        4.  **Implement Analytics:** Wire up each prototype to the `saveGameStats` function, ensuring `actionTimeline`, `wrongGuesses`, and `timeToFirstAction` are meticulously tracked.
    -   **When:** This is the next major development cycle.
    -   **How:** Replicate the successful integration pattern established with the `Vault` and `Lexicon` games.

---

### **Phase 2: Enhance Social & Mastery Features (Medium Term)**

**Goal:** Dramatically increase player engagement and retention by deepening the social and personalization layers of the app.

-   **Task: Implement "Social Comparison" on Game-Over Screen**
    -   **Why:** Tapping into the psychological driver of social comparison is a proven method to boost engagement. Showing a player where they stand provides powerful, immediate feedback.
    -   **What:** On the game-over modal, display a percentile rank for the primary success metric (e.g., "You solved this faster than 88% of players today.").
    -   **When:** After more games are integrated, providing a larger dataset for meaningful comparisons.
    -   **How:**
        1.  Create a new API endpoint: `/api/stats/percentile`.
        2.  This endpoint will receive a `gameName`, `date`, and the player's `score`.
        3.  It will query all `gameStats` for that game/date, calculate the player's percentile ranking against the population, and return the value.

-   **Task: Add Cognitive Profile to Tribe Leaderboards**
    -   **Why:** To evolve the leaderboards from a simple "win count" to a nuanced, personalized view of a player's unique cognitive strengths. This fosters a deeper sense of identity and mastery.
    -   **What:** Alongside each player's name on the tribe leaderboard, display a small radar chart or a set of bars representing their relative strength in Logic, Linguistics, and Lateral Thinking.
    -   **When:** After all core games are integrated and mapped to their respective cognitive pillars.
    -   **How:** Develop a server-side aggregation function. This function will process a user's entire `gameStats` history, average their performance on games tagged with each pillar, and generate the normalized scores for their profile. This can be calculated on-demand when the leaderboard is viewed.

---

### **Phase 3: Full Automation & Scalability (Pre-Launch)**

**Goal:** Transition the system from a manually-managed development environment to a fully autonomous, production-ready application.

-   **Task: Activate Vercel Cron Triggers**
    -   **Why:** To remove the need for manual intervention in the core feedback loop. This is the final step to making the system truly "self-improving."
    -   **What:** Enable the cron job definitions in the `vercel.json` configuration file.
    -   **When:** During the final deployment checks before a public launch.
    -   **How:** Configure the `vercel.json` file to call the `/api/cron/evaluate` and `/api/cron/generate` endpoints on a nightly schedule. Ensure these endpoints are hardened with robust error handling and logging.