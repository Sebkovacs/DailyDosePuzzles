# Daily Dose - Game Systems

**Status:** Active  
**Last Updated:** April 2, 2026

## Purpose

This document defines the game portfolio, shared design standards, and the role each game plays in the product.

It is a product design reference, not a low-level implementation spec.

## Portfolio Thesis

Daily Dose is a portfolio of distinct puzzle systems. The goal is not superficial variety. The goal is complementary mental challenge across multiple forms of reasoning.

Each game must justify its place through clarity, replayability, and fit with the Daily Dose ritual.

Portfolio target:

- 12 core games
- up to 3 live variants per game where that surface area earns its keep

## Standards for Every Game

Every game must satisfy these standards before it is considered core:

- understandable without heavy tutorial dependence
- grounded in deterministic logic
- clear about win and fail states
- scalable in difficulty without sudden spikes
- suitable for Universal Daily and Forge Mode
- compatible with measurable validation and quality review
- playable comfortably on a phone without vertical scrolling on the core game screen
- interesting enough to spark conversation, sharing, or co-play

If a game cannot meet these standards, it should not ship broadly.

## Game Catalog

### 1. Vault
- **Description:** Crack a hidden code or cipher based on constrained logic and feedback.
- **Why it's fun:** Appeals to the inner detective; provides a strong mastery loop and high ceiling for expert players. The "aha" moment of breaking a code delivers a massive dopamine hit.
- **How to play:** You are presented with a locked vault and a set of clues or previous attempts with feedback. Deduce the correct combination to open the vault.
- **Initial Variants:**
  1. **Standard (Base):** Classic constrained code-cracking logic.
  2. **Corrupted (Test dimension - Reliability):** One piece of feedback or clue is a lie, testing deduction under uncertainty.
  3. **Blitz (Test dimension - Pressure):** Solve as many vaults as possible against a ticking clock.

### 2. Numbers
- **Description:** Reach as close as possible to a random target number using arithmetic operations on a set of 6 random numbers (3 small, 3 big).
- **Why it's fun:** Pure analytical appeal and precise feedback. Satisfies the human urge to organize and manipulate systems to find a perfect, clean & elegant solution.
- **How to play:** You are given a target number and 6 starting numbers. Use addition, subtraction, multiplication, and division to reach the target exactly.
- **Initial Variants:**
  1. **Standard (Base):** 30 sec times, Use any combination of operations to get as close as possible to the target.
  2. **Exacta (Test dimension - Perfection):** You must use *every* single provided number to get as close as possible to the target.
  3. **Chain-Op (Test dimension - Constraint):** Operations must be performed in a strict required sequence (e.g., +, -, *, /).

### 3. Lexicon
- **Description:** All about mastery of language! Guess the correct definition or use of an extremely rare, crazy, or archaic word. It could also include combinations of commonly missused or misdefined or word incorrectly used synomolously words such as effect vs affect, scepiticism vs cyncism, empathy vs sympathy, nepotism vs cornyism, etc.
- **Why it's fun:** Tests intuition and vocabulary, making players feel cultured and smart. Highly shareable as trivia that sparks conversation.
- **How to play:** A highly unusual word is presented alongside several plausible definitions or contextual sentences. Choose the true meaning.
- **Initial Variants:**
  1. **Standard (Base):** Timed 30 sec count down, with pressure generating sounds and visuals - Pick the correct definition from a multiple-choice list.
  2. **Reverse (Test dimension - Recall):** Given a bizarre definition, construct or select the correct word.
  3. **Alter Ego (Test dimension - Correctly Select VS pairs):** Timed 30sec count down, with pressure generating sounds and visuals - Pick the correct definition / use of the word with its against its alter ego.

### 4. Root
- **Description:** Deduce a modern word starting from its ancient etymological root, where every fail reveals a new clue.
- **Why it's fun:** Distinctive mental framing that rewards lateral thinking. Players feel incredibly smart when they connect ancient origins to modern language.
- **How to play:** You are given an ancient root word and its basic meaning. Guess the modern English word derived from it. Every incorrect guess reveals an additional contextual clue.
- **Initial Variants:**
  1. **Standard (Base):** Progressive clues revealed upon failure.
  2. **Tree (Test dimension - Breadth):** Given a root, find *three* different modern words that stem from it.
  3. **Obscured (Test dimension - Difficulty):** The root's meaning is partially redacted until the 3rd guess.

### 5. Chain
- **Description:** Connect a start concept to an end concept using an order of 4-5 intermediate strongly-linked words.
- **Why it's fun:** High clarity and strong social comparison. Tests associative logic and provides a perfect daily social anchor to compare thought paths with friends.
- **How to play:** You are given a Start Word and an End Word. You must place intermediate words in the correct sequence so that each word strongly associates with the one before and after it.
- **Initial Variants:**
  1. **Standard (Base):** Order the provided intermediate words correctly.
  2. **Blind Link (Test dimension - Generation):** You must type in your *own* intermediate words to form a valid, AI-verified chain.
  3. **Versus (Test dimension - Competition):** Find the shortest possible chain between two vastly distant concepts.

### 6. Stab
- **Description:** Wordle-style deduction, but you are given a start and end word and have 5 chances in between.
- **Why it's fun:** Immediate tension and fast rounds. It evolves the classic 5-letter guessing format by adding directional framing and a specific destination.
- **How to play:** You are given a Start Word and an End Word. You have 5 chances to guess intermediate words. Each guess gives letter-matching feedback to help you hone in on the exact target word hidden in the middle.
- **Initial Variants:**
  1. **Standard (Base):** 5 chances to find the single hidden middle word.
  2. **Ladder (Test dimension - Constraint):** Each guess must logically change exactly one letter from the previous guess to eventually reach the end word.
  3. **Anagram (Test dimension - Mechanics):** The intermediate guesses must be anagrams or use a specific evolving pool of letters.

### 7. Layers
- **Description:** Categorize a 4x4 grid of words into distinct groups of 4 based on hidden themes.
- **Why it's fun:** Deep strategic feel. The overlapping definitions and red herrings create brilliant "aha" moments that are incredibly satisfying to unravel.
- **How to play:** Presented with a grid of 16 words. Select groups of 4 words that share a common theme. Once all 4 groups are found, identify the overarching meta-theme connecting the groups.
- **Initial Variants:**
  1. **Standard (Base):** 4x4 grid, find the 4 groups and the meta-theme.
  2. **Stacked (Test dimension - Complexity):** 5x5 grid with overlapping red herring groups that must be resolved in a specific order.
  3. **Sequence (Test dimension - Logic):** The words in each group must also be placed in a specific logical order once grouped.

### 8. Spectrum
- **Description:** Order items correctly along a hidden or abstract dimension.
- **Why it's fun:** Intuitive drag-and-drop interaction with satisfying placement feedback. Elegant difficulty scaling based on the abstraction of the dimension.
- **How to play:** You are given 5-7 items. You must arrange them into the correct sequence based on a specific criteria (e.g., historical timeline, physical weight, or a hidden abstract scale like "most liquid to most solid").
- **Initial Variants:**
  1. **Standard (Base):** Order items along a stated dimension.
  2. **Blind (Test dimension - Deduction):** The dimension itself is hidden; you must figure out *how* they relate while ordering them.
  3. **2D Grid (Test dimension - Complexity):** Place items on an X/Y axis based on two intersecting dimensions.

### 9. Split
- **Description:** Group or partition a chaotic grid of elements into valid structures (6x6 for 18 pairs).
- **Why it's fun:** Combines language and visual logic perfectly. Highly satisfying resolution as the board clears up, appealing to the desire for order.
- **How to play:** Given a 6x6 grid containing 36 halves of words or concepts, pair them up to form 18 valid wholes (e.g., matching "Hot" and "Dog", "Race" and "Car").
- **Initial Variants:**
  1. **Standard (Base):** 6x6 grid, find the 18 specific pairs.
  2. **Triplets (Test dimension - Depth):** 6x6 grid, find 12 sets of 3 linked elements instead of pairs.
  3. **Chain-Split (Test dimension - Sequence):** Forming a pair unlocks the next layer of words beneath them, requiring strategic sequential clearing.

### 10. Shift
- **Description:** Manipulate columns of letters to align valid words across rows, like twisting a combination lock.
- **Why it's fun:** Highly tactile, mechanical feel. It brings a spatial puzzle element into a word game, making it uniquely engaging on a mobile device.
- **How to play:** You see a grid (e.g., 5 columns by 6 rows) of letters. Each row must form a valid word. You can shift columns vertically up or down to align the letters correctly.
- **Initial Variants:**
  1. **Standard (Base):** Shift columns vertically to form words horizontally.
  2. **Locked (Test dimension - Constraint):** Certain tiles are locked in place and cannot be shifted, forcing you to build around them.
  3. **Sync (Test dimension - Interlocking):** Shifting one column automatically shifts adjacent columns in the opposite direction.

### 11. Dilemma
- **Description:** Navigate an ethical or philosophical scenario through a series of choices to discover your meta-result.
- **Why it's fun:** Highly personal, sparks massive social debate, and provides psychological insight. It's a neurotransmitter feast of self-discovery and a perfect catalyst for Tribe discussions.
- **How to play:** You are presented with a complex scenario. Across 5 stages, you must choose between 5 difficult options. Your cumulative choices reveal a meta-result about your philosophical alignment or personality.
- **Initial Variants:**
  1. **Standard (Base):** 5 stages, 5 choices, revealing a single meta-truth result.
  2. **Tribal (Test dimension - Social):** Your choices are immediately compared to your Tribe's averages, highlighting divergence and consensus.
  3. **Consequence (Test dimension - Dynamic):** The choices you make in stage 1 drastically change the scenario presented in stage 2.

### 12. Blind
- **Description:** Synthesize a meta-truth from fragmented, subjective logic questions (inspired by the blind men touching an elephant).
- **Why it's fun:** The ultimate test of logic and perspective-taking. Provides a massive "aha" realization when the fragments coalesce into a single clear picture.
- **How to play:** Answer 5 distinct logic or trivia questions. Each answer acts as a "touch" on an unknown object. Use the 5 answers to deduce what the overarching "meta truth" or hidden object is.
- **Initial Variants:**
  1. **Standard (Base):** 5 questions leading to 1 overarching object guess.
  2. **Liar (Test dimension - Deduction):** One of the 5 "blind men" is lying. You must identify the lie to find the truth.
  3. **Minimalist (Test dimension - Risk/Reward):** Guess the meta-object after only 1 or 2 questions for a massive score multiplier, or wait for all 5 for safety.

## Product Roles

Not every game needs the same job. The portfolio should be balanced across roles:

- social anchor games
- broad-access games
- mastery-oriented games
- premium differentiation games

## Variant Strategy

Variants are not content padding. They exist to test and improve the game family.

Rules:

- each game family should have a clear standard form
- challenger variants may test pacing, framing, feedback, or rule emphasis
- variants should be disposable if they do not improve fun, retention, or shareability
- if a challenger variant wins consistently, it may replace the standard
- if only part of a variant works, that learning should feed back into the core game

At least one game should clearly serve each role.

## Current Product Guidance

The long-term product is multi-game. The short-term execution should still focus on the few games that best prove retention and quality.

Current priority candidates for early hardening:

- Chain
- Lexicon
- Vault

These offer the best mix of clarity, differentiation, and variant potential.

## Quality Gate for Publishable Puzzles

A puzzle is publishable only if:

- it passes deterministic validation
- ambiguity is ruled out
- difficulty is within the intended band
- evaluator and human review both accept it
- it fits the intended mode and audience

## Anti-Patterns

Do not ship games that depend on:

- guesswork disguised as logic
- unclear failure states
- excessive explanation
- novelty without repeat value
- variants that exist only to inflate surface area
