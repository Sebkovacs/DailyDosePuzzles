# Daily Dose - Strategic Plan & Next Steps

**Created:** April 4, 2026
**Status:** Ready for Prioritization

---

## Executive Summary

Daily Dose is a multi-game daily puzzle platform ambitious to rival and exceed NYT Wordle/Connections. You have built a strong foundation: clear product vision, comprehensive documentation system, design tokens, UI component library, and styling architecture.

**Current state:** Phase transition point. UI infrastructure is complete (✅ 100%). Documentation is current. You're ready to shift focus to content pipeline and core gameplay hardening.

**Next priority:** Build the deterministic puzzle pipeline and harden the strongest game loops before expanding further.

---

## What's Complete ✅

### Documentation System (Phase 0: ~90% Complete)
- [x] Document roles and authority defined
- [x] Precedence model clear (TECHNICAL_SPEC > SYSTEMS > DESIGN_SYSTEM > Games > COMPONENT_LIBRARY > Business > TODO > README)
- [x] Major conflicts resolved
- [ ] Ongoing documentation sync (this is a continuous process)

**Current docs:**
- `TECHNICAL_SPEC.md` - 10 core invariants, domain entities, validation contracts
- `SYSTEMS.md` - Architecture, AI pipeline, delivery systems, cost controls
- `Games.md` - 12-game portfolio with standards, early focus on Chain/Lexicon/Vault
- `Business.md` - Revenue model, unit economics, data boundaries
- `DESIGN_SYSTEM.md` - Token system, component standards, UI quality gates
- `COMPONENT_LIBRARY.md` - Primitives, foundations, feature components
- `THEME_AND_STYLING_SPEC.md` - Styling migration policy

### UI System (Phase 2: 100% Complete)
- [x] Design tokens system (225+ CSS variables across 10 categories)
- [x] All 9 game CSS modules fully refactored (Vault, Numbers, Lexicon, Roots, Shift, Spectrum, Stab, Layers, Chain)
- [x] All 10 game page files refactored (zero inline styles)
- [x] Admin/stats pages refactored
- [x] Mobile-first viewport constraints implemented
- [x] CSS Modules + design tokens architecture locked
- [x] Framer Motion integration with motion constants
- [x] Core primitive components (Button, Text, Surface, Badge, ProgressIndicator, etc.)

---

## What Needs Work 🚀

### Phase 1: Puzzle & Automation Foundations (0% Started)

**Goal:** Build deterministic operating contract that lets AI scale without breaking trust.

**Key tasks:**
1. **Define canonical puzzle schema by game family**
   - Currently: puzzles exist but schema varies by game
   - Need: TypeScript interfaces + JSON schema for each game (Vault, Numbers, Lexicon, etc.)
   - Requirement: immutable after publication, versioned schema

2. **Implement deterministic validators**
   - Must exist before any AI generation
   - One validator per game family checking:
     - `validateSchema()` - structure integrity
     - `validateRules()` - game logic compliance
     - `validateSolvability()` - solution exists and is correct
     - `validateUniqueness()` - where applicable (e.g., Vault puzzle difficulty)
   - No AI calls, no external dependencies

3. **Establish puzzle lifecycle states**
   - Flow: `draft → validated → approved → scheduled → published → archived`
   - Forward-only progression
   - Audit trail + timestamp for each state change

4. **Define generator profile versioning**
   - Track which AI model/prompt generated each puzzle
   - Enables A/B testing generators
   - Retire underperforming profiles

5. **Create approval policy**
   - Auto-approval rules for high-confidence puzzles
   - Escalation rules for anomalous content
   - Protection: Never rely on AI self-certification

6. **Reserve inventory & scheduling**
   - 1-2 week rolling reserve
   - Daily publication protected from content failures
   - Fallback pool if generation fails

**Exit criteria:**
- Content can be validated without ad hoc handling
- Daily publication is protected from content failure
- Routine inventory processes automatically with auditability

---

### Phase 2a: UI Operating System - Final Hardening (85% → 100%)

**Goal:** Make UI modular, premium, and fast to improve. Finish the last 15%.

**Remaining tasks:**
1. [ ] Mobile-first no-scroll enforcement on ALL active gameplay routes (verify Vault, Numbers, Lexicon, Chain actively)
2. [ ] Complete remaining token migration (any legacy `--ink-*`, `--bg-*`, `--wash-*` aliases)
3. [ ] Stabilize primitive and foundation APIs (freeze Button, Text, Surface, Badge variants)
4. [ ] Define experiment hooks for high-impact surfaces (share buttons, social elements)
5. [ ] Visual regression coverage for critical components (Button, Text, GameLayout)
6. [ ] Enforce style gates in normal workflow (CI/CD integration for DESIGN_SYSTEM compliance)

**Exit criteria:**
- All UI changes are token/variant/composition updates
- Experiments can ship and remove with low effort
- Regressions easier to detect pre-release
- Active gameplay works on phone without scroll

---

### Phase 3: Core Playable Quality (Next Priority)

**Goal:** Harden the strongest game loops (Chain, Lexicon, Vault) and establish quality baseline before expanding.

**Recommended approach:**

**Priority 1: Vault**
- [x] UI complete
- [ ] Deterministic validator (validateSchema, validateRules, validateSolvability)
- [ ] Sample 10-20 hand-crafted puzzles
- [ ] Quality audit: Is difficulty progression logical?
- [ ] Verify mobile UX: Can solve comfortably on phone screen
- [ ] Test shareability: Does emoji feedback look good?
- [ ] Document puzzle schema and difficulty bands

**Priority 2: Lexicon**
- [x] UI complete
- [ ] Deterministic validator (definition uniqueness, word validity)
- [ ] Sample 10-20 hand-crafted puzzles
- [ ] Verify: No ambiguous definitions exist
- [ ] Test pressure feedback (timer visuals/sounds)
- [ ] Document schema, difficulty bands, variant differences

**Priority 3: Chain**
- [x] UI complete
- [ ] Deterministic validator (word associations, chain validity)
- [ ] Sample 10-20 hand-crafted puzzles
- [ ] Strongest social anchor: Does it spark good conversation?
- [ ] Verify variant (Standard vs Blind Link) clarity
- [ ] Document: What makes a strong chain?

**For each game:**
- Ensure result states are consistent (win/loss/timeout screens)
- Standardize telemetry capture (completion time, attempt count, etc.)
- Test fairness: Is the puzzle solvable for intended difficulty band?
- Validate warmth & shareability
- Document in Games.md any learnings

**Exit criteria:**
- Vault, Lexicon, Chain feel polished and consistent
- Users can complete high-quality daily loop without rough edges
- Variant strategy proven (Standard vs. test variant)

---

### Phase 4: Product Measurement (Can run in parallel with Phase 3)

**Goal:** Measure quality without overbuilding analytics.

**Key tasks:**
1. [ ] Define core metrics (completion rate, solve time, daily return, streak length)
2. [ ] Build basic dashboard (admin view of daily stats)
3. [ ] Capture experiment event taxonomy (variant exposure, outcome)
4. [ ] Separate always-on analytics from sampled playtester telemetry
5. [ ] Define variant comparison reporting

**Exit criteria:**
- Decisions informed by actual user behavior
- Metrics support UI/content iteration without heavy telemetry cost

---

### Phase 5+: Premium & Social (Defer until Phase 3 is solid)

- **Phase 5: Forge Mode** - Personalized puzzle selection from validated inventory
- **Phase 6: Verification & Stats** - Gate higher-trust features (scoreboards, profiles)
- **Phase 7: Tribes** - Asynchronous social competition
- **Phase 8: AI Content Operations** - Batch generation, competitive evaluation, human oversight

---

## Dependency Chain

```
Phase 0: Docs ✅
    ↓
Phase 2b: UI Final (85% → 100%) [2-3 days]
    ↓
Phase 1: Puzzle Pipeline [2-3 weeks]
    ↓
Phase 3: Core Quality (Vault/Lexicon/Chain) [3-4 weeks]
    ↓
Phase 4: Measurement [2 weeks, can overlap with Phase 3]
    ↓
Phase 5: Forge Mode [3 weeks]
    ↓
Phase 6: Verification & Social [2-3 weeks]
    ↓
Phase 7: Tribes [3 weeks]
    ↓
Phase 8: AI Content Ops [4+ weeks]
```

**Estimated timeline to core product (Phases 1-3):** 6-8 weeks
**Estimated timeline to launch-ready (Phases 1-6):** 3-4 months

---

## Immediate Next Actions (Week 1)

### Pick ONE to start with:

**Option A: Complete UI System (least risky, fastest win)**
- Audit all gameplay routes for mobile no-scroll compliance
- Identify any remaining legacy token usage
- Run style lint + type check across codebase
- Freeze primitive component APIs
- **Effort:** 2-3 days
- **Benefit:** Unblocks game hardening work

**Option B: Start Puzzle Schema Design (highest impact)**
- Define Vault puzzle schema (structure + validation rules)
- Build TypeScript interfaces for Vault content model
- Implement Vault deterministic validator functions
- Create 5-10 test puzzles and validate them
- **Effort:** 3-4 days
- **Benefit:** Establishes pattern for other games; enables AI generation pipeline

**Option C: Harden Vault Game Loop (most tangible)**
- Audit current Vault implementation for edge cases
- Create 10-15 hand-crafted Vault puzzles at different difficulty levels
- Test on phone: Can you solve without scrolling?
- Verify emoji feedback is shareable
- Identify any UI glitches or missing states
- **Effort:** 2-3 days
- **Benefit:** Proves quality baseline before AI generation

### Recommendation

**Start with B (Puzzle Schema), then parallelize A+C**

Rationale:
- Schema design unblocks everything downstream
- UI is already 85% done; finishing doesn't unlock much
- Game hardening works faster once schema/validators exist
- You can test validators against hand-crafted puzzles

---

## Governance & Operating Rules

As you proceed:

1. **Documentation is your control plane.** Always update docs when behavior changes.
2. **No feature ships without deterministic validation.** This is non-negotiable.
3. **Variants are disposable.** If a variant underperforms, remove it without guilt.
4. **Mobile-first is hard constraint.** No scrolling on active gameplay.
5. **Quality > Quantity.** Three polished games beat twelve rough ones.
6. **AI is a generator, not a judge.** Code validates, humans approve.
7. **Daily publication is sacred.** It never depends on AI availability.

---

## Key Risks to Watch

1. **Scope creep before core proves.** Resist adding new games/features until Vault+Lexicon+Chain are solid.
2. **Incomplete validators = bad puzzles = trust erosion.** Take validator work seriously.
3. **UI system drift.** Document all new tokens/variants. Don't add side effects.
4. **Data collection without purpose.** Only collect data that drives decisions.
5. **Real-time temptation.** Stick to async architecture. Live multiplayer adds cost+risk.

---

## Success Metrics for Each Phase

### Phase 1 Success
- Vault/Numbers/Lexicon have deterministic schema + validators
- 20+ hand-validated puzzles exist per game
- Approval workflow documented + functional
- Zero puzzles shipped without validation pass

### Phase 2b Success
- All routes pass no-scroll audit
- All legacy tokens removed
- Type check + style lint clean
- Experiment hooks defined for 3 high-impact surfaces

### Phase 3 Success
- Vault/Lexicon/Chain earn quality endorsement
- Players report fairness and clarity
- Variant strategy proven (Standard variant stays, test variant shows learning)
- Daily ritual feels warm and complete

### Phase 4 Success
- Retention curve measurable and trending positive
- Variants comparable via metrics
- Decision-making data-driven, not gut-feel
- Telemetry cost reasonable relative to signal

---

## Questions for You

Before starting execution, clarify:

1. **Timing:** How fast do you want to move? (Intense 8-week push vs. measured 4-month arc?)
2. **Generation:** Will you hand-craft initial Vault/Lexicon/Chain puzzles, or try AI generation immediately?
3. **Verification:** Do you have a signup flow and verification system ready for Phase 6+?
4. **Playtest cohort:** Do you have playtesters lined up to provide signal for Phase 4 measurement?

---

## How to Use This Plan

1. **Read this with fresh eyes.** Does it feel right for your ambition and timeline?
2. **Adjust scope.** Is any phase too big or unnecessary?
3. **Pick the first task.** Choose Option A, B, or C above.
4. **Update MEMORY.md.** Capture decisions for next session.
5. **Keep docs in sync.** As you work, update TECHNICAL_SPEC, SYSTEMS, etc.
6. **Review bi-weekly.** Adjust the roadmap based on learnings.

---

## One Final Note

You've built something real here. The documentation is excellent, the UI system is solid, and the vision is compelling. You're at the inflection point where infrastructure becomes product.

The next 3-4 weeks will determine whether Daily Dose becomes a credible daily ritual or remains a beautiful prototype. Focus ruthlessly on:

1. **One game family at a time.** Vault first.
2. **Deterministic everything.** No shortcuts on validation.
3. **Mobile-first reality.** Test on actual phones.
4. **Quality over speed.** A single perfect puzzle beats ten mediocre ones.

You've got this. 🚀
