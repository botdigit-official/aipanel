# 11 — Controlled Source of Truth Skill

**Version:** 1.0.0  
**Compatible:** agent_blueprint >= 1.0  
**Requires:** discovery, project-context, documentation  
**Outputs:** 00_MASTER_INDEX.md through 18_FEATURE_CHECKLIST.md  

---

## Purpose

Enforce the **19-Document Enterprise Controlled Source of Truth Standard**. 
This skill eliminates AI hallucinations, architectural drift, and phantom feature claims by anchoring all engineering work in empirical code and runtime evidence.

---

## Cardinal Rules

1. **Code & Runtime Evidence are Stronger than Documentation Claims**:
   - Never accept documentation at face value.
   - If a document claims an API, payment flow, or security check exists, inspect the source code and run the test suite.
   - If the code does not prove it, mark the document item as `INCOMPLETE` or `PENDING`.

2. **The 5-Stage Approval & Execution Lifecycle**:
   Every feature, fix, or refactor must transition through these strict states in `14_PROGRESS_TRACKER.md`:
   - `[DISCOVERED]` — Identified during audit or user prompt.
   - `[PLANNED]` — Scoped with specific target files and test criteria.
   - `[IN_PROGRESS]` — Actively undergoing code modifications.
   - `[RUNTIME_EVIDENCE]` — Verified via automated tests (`cargo test`, `npm test`) with logs.
   - `[APPROVED/DONE]` — Both implementation and documentation are synchronized.

3. **No Phantom Changes**:
   - Every modified file must be listed in `17_CHANGELOG.md` under `## [Unreleased]`.
   - Any architectural decision must be logged in `02_ARCHITECTURE.md` or as an ADR.

---

## The 19 Controlled Documents Suite

Whenever a project requires enterprise-grade rigor, maintain these 19 files in `docs/`:

1. `README.md` — Root orientation, quickstart, environment setup.
2. `00_MASTER_INDEX.md` — Central documentation hub linking all controlled documents with verification status.
3. `01_PROJECT_BASELINE.md` — Problem statement, target market, KPIs, and scope boundaries.
4. `02_ARCHITECTURE.md` — High-level component topology, component diagrams, invariants.
5. `03_PORTALS.md` — Portal workflows (Public Directory, User Portal, Owner Dashboard, Admin Launcher).
6. `04_NAVIGATION_MASTER.md` — Complete route tree, dynamic parameters, and SEO canonical rules.
7. `05_LEGACY_FEATURE_MAPPING.md` — Deprecated systems, migration audit, and technical debt log.
8. `06_MODULE_CATALOG.md` — Subsystem inventory, service layers, and crate/package boundaries.
9. `07_DATA_MODEL_MASTER.md` — PostgreSQL schemas, PostGIS spatial models, ERD, and migrations (001–018).
10. `08_FINANCIAL_CORE.md` — Plans catalog, Razorpay billing, recurring subscriptions, invoices.
11. `09_SECURITY_RBAC_WORKFLOW.md` — Argon2id, CSRF protection, sliding rate limiter, SSRF SafeFetcher.
12. `10_API_AND_INTEGRATIONS.md` — REST API reference, webhooks, and third-party adapters (OSM, Google Places).
13. `11_JOBS_AND_AUTOMATION.md` — Background daemons (Scanner Cron, Notification Worker).
14. `12_TESTING_AND_VERIFICATION.md` — Automated test suite matrix and verification commands.
15. `13_IMPLEMENTATION_ROADMAP.md` — Phase progression from Phase 0 to Phase 5.
16. `14_PROGRESS_TRACKER.md` — Real-time progress tracker with checkbox status.
17. `15_GAP_AND_RISK_REGISTER.md` — Known limitations, risk mitigations, and technical debt.
18. `16_DEFINITION_OF_DONE.md` — Non-negotiable quality and release criteria.
19. `17_CHANGELOG.md` — Release history and session audit trail.
20. `18_FEATURE_CHECKLIST.md` — Comprehensive feature matrix with code-level proof of implementation.

---

## Execution Checklist for Agents

When instructed to maintain or audit a project:
- [ ] Inspect the repository and verify if `docs/00_MASTER_INDEX.md` exists.
- [ ] Compare documented claims against active code in `src/`.
- [ ] Record any unverified claims in `docs/15_GAP_AND_RISK_REGISTER.md`.
- [ ] Maintain the active plan in `docs/14_PROGRESS_TRACKER.md`.
- [ ] Gather runtime evidence before marking any task as complete.
- [ ] Append all changes to `docs/17_CHANGELOG.md`.
