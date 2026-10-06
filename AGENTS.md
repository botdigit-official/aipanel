# AGENTS.md — AI Agent Operating Standards for AIPanel

> This repository adheres to the **Agent Blueprint** standard (https://github.com/botdigit-official/agent-blueprint).

## 1. Project Overview & Architecture
- **Frontend / Client**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide icons, Zustand state management.
- **Desktop Runtime**: Tauri v2 (`src-tauri` in Rust) with dialog, fs, opener, and shell plugins.
- **Agent Daemons**:
  - `agent-go/`: High-performance Go agent daemon for remote/local server telemetry, metrics, and orchestration.
  - `agent/`: Multi-platform agent harness.
- **Living Documentation**: Maintained in `docs/` (`docs/01-business/`, `docs/02-architecture/`, `docs/03-engineering/`).

---

## 2. Mandatory 5-Phase Delivery Loop

Whenever an AI coding assistant operates in this repository, it MUST execute through the **5-Phase Loop**:

1. **Discuss (Phase 1)**: Clarify requirements, lock architectural decisions, and verify invariants before writing code.
2. **Plan (Phase 2)**: Decompose features into sequential, bounded **Task Waves** in `TASK.md` to prevent **context rot**.
3. **Execute (Phase 3)**: Implement wave-by-wave within strictly scoped file boundaries.
4. **Verify (Phase 4)**: Run automated validation commands (`npm test` $\to$ `tsc --noEmit`). **Zero False Accomplishment Rule**: Never claim done without raw terminal proof.
5. **Ship (Phase 5)**: Commit atomically with Conventional Commits, update `docs/`, and log an audit trail in `CHANGELOG.md` under `## [Unreleased]`.

---

## 3. Strict Anti-Overengineering Standard (YAGNI)

AI agents are strictly forbidden from introducing speculative architecture or code bloat:
1. **YAGNI (You Aren't Gonna Need It)**: Implement strictly what the user asked. No hypothetical extension points.
2. **Concrete Over Abstract**: If a component, hook, or service has only **one** use-case, do not create abstract generic factories or interfaces.
3. **Zero Unnecessary Dependencies**: Never add npm packages or crates when 5–10 lines of standard library or existing dependencies suffice.
4. **Minimal Sufficient Architecture**: Direct, readable, sequential code is always superior to clever metaprogramming.
5. **Code Deletion is a Feature**: Ruthlessly delete dead code, unused props, and obsolete wrappers.

---

## 4. Git Branching Governance
- **DO NOT** push directly to `main` or `develop`.
- **ALWAYS** check out a semantic branch from `develop`:
  - `feat/<short-feature-name>`
  - `fix/<short-bug-name>`
  - `chore/<short-task-name>`

---

## 5. Verification Commands
- **TypeScript Typecheck**: `npm test` (or `npx tsc --noEmit`)
- **Vite Build**: `npm run build`
- **Agent Blueprint Conformance**: `agent-blueprint doctor` & `agent-blueprint verify`
