# 05-Documentation Skill

**Version:** 1.0.0
**Compatible:** project_skills >= 1.0
**Requires:** discovery
**Outputs:** documentation-map.md, and any documents from templates/ as appropriate

---

## Purpose

Establish and maintain living documentation for the project. Every agent must leave the project better documented than it found it.

Documentation is not a one-time task. It is a continuous obligation.

---

## Principle: Minimum Sufficient Documentation

Do not create every document. Create the minimum set that allows a person (or agent) to understand, operate, maintain, and safely change the project.

### Documentation Tiers

| Tier | Project Type | Documents |
|---|---|---|
| 1 — Minimal | Script, small tool, simple service | README.md |
| 2 — Standard | Small web app, API, internal tool | README + PROJECT + ARCHITECTURE + DATABASE + API + SECURITY |
| 3 — Full | SaaS, marketplace, commercial product | Tier 2 + BUSINESS + BUSINESS-MODEL + ACTORS + TESTING + DEPLOYMENT + OPERATIONS |
| 4 — Enterprise Controlled | High-scale platforms, SaaS, mission-critical systems | **The 19 Controlled Documents (00_MASTER_INDEX to 18_FEATURE_CHECKLIST)** |

### Cardinal Operating Principles:
1. **Evidence Over Documentation**: Code and runtime evidence are stronger than documentation claims. If documentation claims a feature is complete but implementation or tests do not prove it, mark it as `INCOMPLETE` or `PENDING`.
2. **Strict Verification Lifecycle**: Every feature, fix, or plan item must transition through:
   `DISCOVERED` $\to$ `PLANNED` $\to$ `IN_PROGRESS` $\to$ `RUNTIME_EVIDENCE` $\to$ `VERIFIED_DONE`.
3. **Continuous Synchronization**: Documentation must never drift from actual code.

---

### The 19 Controlled Documents Suite (00–18)

When operating under Tier 4 Enterprise Controlled standard, maintain these exact synchronized files:

- `README.md` — System identity, badges, quickstart, and environment setup
- `00_MASTER_INDEX.md` — Master documentation registry and navigation hub
- `01_PROJECT_BASELINE.md` — Vision, scope boundaries, problem statement, and goals
- `02_ARCHITECTURE.md` — System topology, modular monolith structure, data flows
- `03_PORTALS.md` — Portal workflows (Public Directory, Website Studio, Owner Dashboard, Admin Launcher)
- `04_NAVIGATION_MASTER.md` — Site tree, Next.js routing, and navigation architecture
- `05_LEGACY_FEATURE_MAPPING.md` — Legacy code audit, technical debt, and decommission schedule
- `06_MODULE_CATALOG.md` — Engine modules, service layers, and crate boundaries
- `07_DATA_MODEL_MASTER.md` — PostgreSQL schemas, PostGIS models, ERD, and migrations (001–018)
- `08_FINANCIAL_CORE.md` — Plans catalog, Razorpay billing, recurring subscriptions, invoices
- `09_SECURITY_RBAC_WORKFLOW.md` — Argon2id, CSRF protection, sliding rate limiter, SSRF SafeFetcher
- `10_API_AND_INTEGRATIONS.md` — REST API reference, webhooks, and third-party adapters (OSM, Google Places)
- `11_JOBS_AND_AUTOMATION.md` — Background daemons (Scanner Cron, Notification Worker)
- `12_TESTING_AND_VERIFICATION.md` — Automated test suite matrix and verification commands
- `13_IMPLEMENTATION_ROADMAP.md` — Phase progression from Phase 0 to Phase 5
- `14_PROGRESS_TRACKER.md` — Real-time progress tracker with checkbox status
- `15_GAP_AND_RISK_REGISTER.md` — Known limitations, risk mitigations, and technical debt
- `16_DEFINITION_OF_DONE.md` — Non-negotiable quality and release criteria
- `17_CHANGELOG.md` — Release history and session audit trail
- `18_FEATURE_CHECKLIST.md` — Comprehensive feature matrix with code-level proof of implementation

---

## Documentation Standard

Every project using Agent Blueprint should follow this documentation structure:

```
docs/
├── 00-project/
│   ├── overview.md       # What this project is
│   ├── goals.md          # Why it exists, what it aims to achieve
│   ├── scope.md          # What is in scope and out of scope
│   └── glossary.md       # Domain terms
│
├── 01-business/
│   ├── business-model.md
│   ├── actors.md
│   ├── processes.md
│   ├── business-rules.md
│   └── state-machines.md
│
├── 02-architecture/
│   ├── architecture.md
│   ├── domains.md
│   ├── data-flow.md
│   ├── integrations.md
│   └── decisions/        # ADRs
│
├── 03-engineering/
│   ├── code-structure.md
│   ├── database.md
│   ├── api.md
│   └── frontend.md
│
├── 04-security/
│   └── security.md
│
├── 05-testing/
│   └── testing.md
│
├── 06-performance/
│   └── performance.md
│
├── 07-deployment/
│   └── deployment.md
│
├── 08-operations/
│   └── operations.md
│
├── 09-audits/
│   └── [audit reports]
│
└── 10-roadmap/
    └── roadmap.md
```

Not every project needs every directory. Create only what applies.

---

## Documentation Rules

1. Documentation lives in `docs/` or at the project root for top-level files (README, PROJECT.md, etc.).
2. Every document has a last-reviewed date and reviewer.
3. Every document that describes behavior must be updateable by the agent that changes the behavior.
4. If code and documentation disagree, the agent must resolve the disagreement — not assume the documentation is wrong.
5. Outdated documentation is worse than no documentation. When in doubt, update or remove.
6. Do not duplicate information across documents. Reference instead.

---

## Mandatory Agent Protocol: Task Tracker & Changelog Audit

Whenever an AI agent performs ANY change on a project, it MUST follow this strict 4-step protocol:

### Step 1: Pre-Flight Task List (`TASK.md`)
Before modifying any code, the agent MUST create or update `TASK.md` (or active task tracker) detailing:
- Planned changes broken into discrete checklist items: `- [ ] Task item`
- Mark tasks `- [x]` in real time as work is completed.
- Never make blind edits without a visible plan.

### Step 2: Living Documentation Sync (`docs/`)
If the task introduces or alters system behavior, the agent MUST update the corresponding living document before closing the task:
- New/modified endpoints $\to$ update `docs/03-engineering/api.md`
- New/modified database models or migrations $\to$ update `docs/03-engineering/database.md`
- Changes to pricing or business rules $\to$ update `docs/01-business/business-model.md`
- Architecture or infrastructure shifts $\to$ create an ADR in `docs/02-architecture/decisions/`

### Step 3: Mandatory Changelog Audit Trail (`CHANGELOG.md`)
Every agent MUST append an entry to `CHANGELOG.md` (following the Keep a Changelog standard):
```markdown
## [Unreleased] - YYYY-MM-DD
### Added
- [Feature description] (Files: `path/to/file`)

### Changed
- [Modification description] (Files: `path/to/file`)

### Fixed
- [Bug fix description] (Files: `path/to/file`)

### Documentation
- Updated `docs/...` to reflect [change]
```

### Step 4: Verification & Test Rigor
- Run all automated unit and integration tests (`cargo test`, `npm test`, `pytest`, etc.).
- Ensure zero compile errors, zero linter regressions, and clean test runs before handing back control.

---

## What Every Agent Must Verify Before Exit

- [ ] `TASK.md` has all completed items checked off `[x]`
- [ ] `CHANGELOG.md` has a clear audit trail entry of changes made
- [ ] Living documentation in `docs/` reflects the new reality
- [ ] All automated tests pass with 0 failures
- [ ] No unneeded dependencies or files were created

---

## Output

### documentation-map.md

```
Documentation Map
=================
Tier: [1 | 2 | 3 | 4]
Documents:
  - [path]: [status: present | missing | outdated], [last reviewed]
Gaps:
  - [document that should exist but does not]
Outdated:
  - [document that exists but is outdated]
```
