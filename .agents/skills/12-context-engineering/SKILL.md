# 12 — Context Engineering & Fresh Subagent Waves

**Version:** 1.0.0  
**Compatible:** agent_blueprint >= 1.0  
**Requires:** orchestrator, discovery, project-context  
**Outputs:** wave-plan.md, subagent-spec.md  

---

## Purpose

Context Engineering is the discipline of protecting an AI coding agent's working memory against **context rot** — the severe degradation of cognitive performance, precision, and instruction-following that occurs as LLM context windows accumulate noise, stale logs, and sprawling file dumps.

This skill equips agents (Antigravity, Claude Code, Cursor, Windsurf, OpenCode) with proven mechanisms from the Open GSD framework to execute complex, multi-day engineering tasks with zero hallucinations and zero context collapse.

---

## The Core Problem: Context Rot

| Symptom | Root Cause | Consequence |
|---|---|---|
| **Instruction Amnesia** | Context > 60k–100k tokens | Agent ignores negative constraints ("Do not touch port 41000") |
| **Phantom Code Claims** | Hallucinated diffs in bloated memory | Agent claims tests pass or files exist without verifying |
| **Looping / Thrashing** | Accumulated error traces in session | Agent re-runs failed commands repeatedly |
| **Regression Bleed** | Unscoped multi-file edits | Fixing one file silently breaks adjacent modules |

---

## The 4 Laws of Context Engineering

### Law 1 — The Lean Supervisor
The orchestrating agent's primary conversation must remain **lean and focused**. It holds:
- Current project classification & active task list (`TASK.md`)
- High-level architectural invariants (`AGENTS.md`)
- Milestone status and next wave boundaries

The supervisor **never** retains:
- Multi-megabyte raw log dumps
- Unfiltered search outputs across 10,000 files
- Bloated build artifacts or minified assets

### Law 2 — Subagent Wave Delegation
Heavy exploratory tasks, file refactorings, test runs, and deep security audits must be delegated to **fresh-context subagents** or bounded, isolated task executions:
- Each subagent begins with a **pristine 200k-token context**.
- Each subagent receives an explicit, bounded **Subagent Spec**:
  - Target files to view and modify
  - Concrete acceptance criteria
  - Commands to execute for verification
- When the subagent finishes, it returns **only the synthesized outcome and proof of verification** back to the supervisor.

### Law 3 — Scoped Read & Search Budget
Never read whole files when line ranges suffice.
- Use `grep_search` with strict glob filters before opening files.
- Use `view_file` with `StartLine` and `EndLine` slices (< 150 lines per view).
- Limit command outputs using `git log -n 5`, `head -n 20`, or pagers.

### Law 4 — Atomic Wave Progression
Large features must be split into sequential, non-overlapping **Execution Waves**:

```
┌─────────────────────────────────────────────────────────────┐
│ Wave 1: Schema, Types & Domain Contracts (Zero side-effects)│
└──────────────────────────────┬──────────────────────────────┘
                               │ Verified & Committed
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Wave 2: Core Business Logic & Data Services                 │
└──────────────────────────────┬──────────────────────────────┘
                               │ Verified & Committed
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Wave 3: API Endpoints, UI Controllers & Client Adapters    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Verified & Committed
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Wave 4: Integration Tests, End-to-End Proofs & Docs Sync    │
└─────────────────────────────────────────────────────────────┘
```

Between each wave:
1. Verify empirical execution (`npm test`, `cargo test`, build commands).
2. Commit changes with a conventional commit message.
3. Flush transient context before advancing to the next wave.

---

## Subagent Spec Template

When spawning or isolating work for a subagent or task runner, structure the prompt with this contract:

```markdown
### Subagent Task Contract: [Wave X.Y - Feature Name]

#### 1. Scope & File Boundaries
- **Target Files (Read/Write):**
  - `src/services/billing.rs`
  - `tests/billing_test.rs`
- **Reference Only (Read-Only):**
  - `src/models/invoice.rs`
- **FORBIDDEN (Do Not Touch):**
  - `src/routes/auth.rs`
  - Any `.env` or configuration secrets

#### 2. Concrete Objective
[Precise 2-3 sentence statement of what must be built or fixed]

#### 3. Verification Commands
- `cargo test --test billing_test`
- `cargo clippy -- -D warnings`

#### 4. Required Output Artifacts
- List of modified files
- Exact test execution log proving 0 failures
- Notes for CHANGELOG.md under [Unreleased]
```

---

## Context Health Checklist

Before accepting any agent task completion, verify:
- [ ] Supervisor context has not accumulated unresolved error loops.
- [ ] Work was broken down into manageable waves (< 5 files per wave).
- [ ] Each wave was tested and verified independently before the next started.
- [ ] No phantom files or undocumented edits were introduced.
