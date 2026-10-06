# 15 — Autonomous Execution Loop & Anti-Overengineering Review

**Version:** 1.0.0  
**Compatible:** agent_blueprint >= 1.0  
**Requires:** orchestrator, context-engineering, phase-loop-delivery, testing  
**Outputs:** plan.md, review-report.md, simplification-audit.md  

---

## Purpose

Inspired by the autonomous **Ralph Loop** in **Ralphex** (`umputun/ralphex`), this skill provides the autonomous execution loop for AI coding agents and introduces a strict **Anti-Overengineering & Simplification Review Pipeline**.

It guarantees two non-negotiable outcomes:
1. **Unattended Execution Reliability:** Agents iteratively process plans task-by-task with fresh session bounds, run validation commands after every step, and commit atomically without token fatigue.
2. **Zero Over-Engineering:** Every pull request and feature diff is audited by a dedicated simplification gatekeeper to strip away speculative abstractions, bloated factories, and premature generalizations.

---

## The Autonomous Execution Loop (Ralph Loop)

```
       ┌────────────────────────────────────────────────────────┐
       │ 1. Read Plan & Extract Next Uncompleted Task           │
       │    (Finds `### Task N:` with `- [ ]` checkboxes)       │
       └──────────────────────────┬─────────────────────────────┘
                                  │
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │ 2. Execute Task in Fresh Bounded Session               │
       │    (Minimal context window; target files only)         │
       └──────────────────────────┬─────────────────────────────┘
                                  │
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │ 3. Run Validation Commands                             │
       │    (e.g., `cargo test`, `npm test`, `golangci-lint`)   │
       └──────────────────────────┬─────────────────────────────┘
                                  │
                     ┌────────────┴────────────┐
                     │ Pass?                   │
                     ▼                         ▼
             [YES]                      [NO]
        ┌──────────────┐         ┌────────────────────────┐
        │ Mark `[x]`   │         │ Forensics & Retry      │
        │ Atomic Commit│         │ (Max 3 retries before  │
        └──────┬───────┘         │  graceful pause)       │
               │                 └────────────────────────┘
               ▼
     All Tasks Completed?
     ├── NO  ──► Loop back to Step 1 with fresh session
     └── YES ──► Advance to Multi-Agent Review Pipeline
```

---

## The 5-Agent Review Pipeline

Once all plan tasks pass their validation commands, the changes undergo an automated 5-agent review before declaring completion:

```
                          ┌────────────────────────┐
                          │ FEATURE DIFF FOR REVIEW│
                          │ (`git diff main...HEAD`)│
                          └───────────┬────────────┘
                                      │
         ┌──────────────┬─────────────┼──────────────┬──────────────┐
         ▼              ▼             ▼              ▼              ▼
   ┌───────────┐  ┌───────────┐ ┌───────────┐ ┌──────────────┐ ┌───────────┐
   │  QUALITY  │  │IMPLEMENT. │ │  TESTING  │ │SIMPLIFICATION│ │DOCUMENTAT.│
   │           │  │           │ │           │ │(Anti-Overeng)│ │           │
   │ Bugs,     │  │ Verifies  │ │ Coverage, │ │ Strips bloat,│ │ Syncs     │
   │ security, │  │ stated    │ │ edge cases│ │ premature    │ │ docs/ and │
   │ race cond.│  │ goals only│ │ & mocks   │ │ abstractions│ │ CHANGELOG │
   └─────┬─────┘  └─────┬─────┘ └─────┬─────┘ └──────┬───────┘ └─────┬─────┘
         └──────────────┴─────────────┼──────────────┴───────────────┘
                                      │
                                      ▼
                        ┌────────────────────────┐
                        │ Consolidated Fix Wave  │
                        │ (Apply surgical fixes) │
                        └────────────────────────┘
```

| Review Agent | Core Mandate | Failure Trigger |
|---|---|---|
| **`quality`** | Memory safety, race conditions, OWASP Top 10, error handling | Uncaught promises, unwrap(), missing auth |
| **`implementation`**| Validates code fulfills the plan specifications | Scope creep, missing acceptance criteria |
| **`testing`** | Verifies automated unit & regression coverage | Missing tests for new logic, weak assertions |
| **`simplification`**| **Guards against over-engineering and premature generalization** | **Unnecessary layers, generic factories, YAGNI violations** |
| **`documentation`** | Confirms living docs, API contracts, and changelog sync | Outdated `docs/`, missing `[Unreleased]` changelog entry |

---

## The Anti-Overengineering Standard (`simplification`)

AI coding agents have a notorious tendency to over-engineer: generating generic interfaces for single implementations, complex event buses for simple function calls, and multi-tier abstractions where a 10-line helper suffices.

The **`simplification` review rule** must evaluate every modified file against these 6 Anti-Bloat Laws:

### 1. The YAGNI Law (You Aren't Gonna Need It)
- Do not build extensibility hooks for hypothetical future features.
- Build strictly for the stated requirement today.

### 2. Concrete Over Abstract
- If an interface or trait has only **one** implementation, remove the interface and use the concrete struct/function directly.
- Avoid abstract factory patterns, strategy objects, and generic middleware unless at least 3 distinct consumers exist right now.

### 3. Fewer Lines, Zero Cleverness
- Prefer 20 lines of clear, standard sequential code over 5 lines of dense functional metaprogramming or complex reflection.
- Code should be immediately readable by a junior engineer without external documentation.

### 4. Zero Unnecessary Dependencies
- Do not add a new npm package, crate, or Python package for utilities that take 5 lines of native standard library code (e.g. `left-pad`, trivial string manipulations, basic HTTP clients).

### 5. Net Deletion is a Feature
- When refactoring, if the code size increased by 50% without new functional capabilities, the refactor is considered a failure.
- Actively delete dead code, unused parameters, obsolete comments, and redundant wrappers.

### 6. Minimal Sufficient Architecture
```
Over-Engineered (REJECT):
Controller ──► DTOAssembler ──► ServiceFacade ──► DomainService ──► GenericRepositoryInterface ──► SqliteRepo

Minimal & Clean (APPROVE):
Route Handler ──► Query/Service Function ──► Database
```

---

## Loop Guardrails & Stalemate Prevention

To prevent infinite execution loops or circular AI debates:

1. **Max Task Iterations:**
   - Any single plan task is limited to **3 execution attempts**. If validation commands still fail after 3 attempts, pause and prompt the developer.
2. **Review Patience Limit (`review-patience`):**
   - If 2 consecutive review cycles produce **zero file modifications or zero git commits**, terminate the review loop immediately.
3. **Graceful Pause & Plan Editing:**
   - Developers can edit `TASK.md` or the plan file between iterations. When resumed, the loop re-reads the plan with fresh context.
4. **Plan Archiving:**
   - Once all tasks and reviews pass, move or tag the plan under `docs/plans/completed/` or mark complete in `TASK.md`.
