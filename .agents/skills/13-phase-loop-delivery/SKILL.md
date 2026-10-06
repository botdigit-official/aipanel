# 13 — 5-Phase GSD Delivery Loop

**Version:** 1.0.0  
**Compatible:** agent_blueprint >= 1.0  
**Requires:** orchestrator, context-engineering, testing, documentation  
**Outputs:** phase-spec.md, verification-evidence.md  

---

## Purpose

The **5-Phase Delivery Loop (Discuss → Plan → Execute → Verify → Ship)** is the universal execution cadence for AI coding agents. Originating in spec-driven development and context-engineering frameworks (such as Open GSD), it guarantees that agents never jump straight into blind code edits, hallucinate completions, or ship unverified changes.

---

## The 5-Phase Delivery Lifecycle

```
    ┌──────────┐
    │ DISCUSS  │ ──► Clarify ambiguities & lock architecture decisions
    └────┬─────┘
         │
         ▼
    ┌──────────┐
    │   PLAN   │ ──► Research codebase & decompose into atomic task waves
    └────┬─────┘
         │
         ▼
    ┌──────────┐
    │ EXECUTE  │ ──► Fresh-context subagents implement wave-by-wave
    └────┬─────┘
         │
         ▼
    ┌──────────┐
    │  VERIFY  │ ──► Run tests, build checks, and produce empirical evidence
    └────┬─────┘
         │
         ▼
    ┌──────────┐
    │   SHIP   │ ──► Atomic git commit, sync living docs, update CHANGELOG
    └──────────┘
```

---

## Phase 1: Discuss (Decide Before Planning)

**Objective:** Extract full context and eliminate assumptions before touching code.

1. **Clarify Requirements:** Ask specific multiple-choice or direct questions about underspecified requirements.
2. **Lock Trade-Offs:** Agree on performance vs. simplicity, dependencies to allow or disallow, and breaking-change tolerance.
3. **Confirm Existing Invariants:** Check `AGENTS.md` and `docs/02-architecture/` for existing architectural rules that must never be violated.
4. **Output:** A concise Decision Record or task statement added to `TASK.md`.

> **Rule:** Never start planning or writing code if the core user intent is ambiguous.

---

## Phase 2: Plan (Decompose into Atomic Waves)

**Objective:** Map dependencies and write an executable checklist before modifying files.

1. **Perform Discovery:** Search and inspect affected files using line-sliced `view_file` or `grep_search`.
2. **Structure Task Waves:** Group work into strictly bounded, incremental waves:
   - **Wave 1:** Core models, data structures, migrations
   - **Wave 2:** Business logic services, domain operations
   - **Wave 3:** Controllers, endpoints, user interfaces
   - **Wave 4:** End-to-end tests, edge case coverage, doc sync
3. **Populate `TASK.md`:** Write out each item with explicit checkboxes (`- [ ] Wave 1.1: Add schema...`).
4. **Output:** Updated `TASK.md` ready for review.

---

## Phase 3: Execute (Wave-by-Wave Execution)

**Objective:** Implement code modifications within strict context and file boundaries.

1. **Fresh Context Isolation:** If the task is large, delegate each wave to a subagent or start with a bounded task specification.
2. **Minimal Necessary Edits:** Change only the lines and files required for the current wave.
3. **Check Off Progress:** Update `TASK.md` (`- [x] Step completed`) as each unit is completed.
4. **Preserve Coding Style:** Match formatting, casing, naming conventions, and typing patterns already present in the codebase.

---

## Phase 4: Verify (Zero False Accomplishment)

**Objective:** Prove correctness with empirical runtime evidence.

1. **Run Automated Test Suite:**
   - Execute project tests (e.g., `npm test`, `cargo test`, `pytest`).
   - Ensure **0 errors** and **0 regressions**.
2. **Compile / Lint / Typecheck:**
   - Run linter/compiler (e.g., `tsc --noEmit`, `cargo clippy`, `eslint`).
3. **Perform Smoke Verification:**
   - Verify server startup, API responses, or UI rendering where applicable.
4. **Produce Verification Evidence:** Record exact command line and exit status in the task report.

> **The Zero False Accomplishment Rule:** An agent must NEVER output "The feature is complete" without displaying the actual passing terminal logs or test proofs in the conversation.

---

## Phase 5: Ship (Atomic Commit & Living Docs Sync)

**Objective:** Leave the repository in a pristine, audit-ready state.

1. **Sync Living Documentation (`docs/`):**
   - If an endpoint was added/changed $\to$ update `docs/03-engineering/api.md` or `docs/10_API_AND_INTEGRATIONS.md`.
   - If a table or schema changed $\to$ update database docs and migrations.
   - If a business rule changed $\to$ update business docs.
2. **Update `CHANGELOG.md`:**
   - Add an entry under `## [Unreleased]` with:
     - `### Added`, `### Changed`, `### Fixed`, or `### Removed`
     - Exact file paths touched
     - User rationale
3. **Check Branch Governance:**
   - Ensure the commit is on a semantic branch (`feat/...`, `fix/...`, `chore/...`).
   - Create an atomic commit using Conventional Commits standard:
     ```bash
     git commit -m "feat(billing): add stripe webhook idempotent processor"
     ```
4. **Final Checklist Verification:**
   - [ ] `TASK.md` is 100% checked off
   - [ ] `docs/` reflects the updated reality
   - [ ] `CHANGELOG.md` audit entry logged
   - [ ] Automated tests passing
