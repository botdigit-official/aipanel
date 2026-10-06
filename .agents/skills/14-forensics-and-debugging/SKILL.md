# 14 — Forensics & Root-Cause Debugging Skill

**Version:** 1.0.0  
**Compatible:** agent_blueprint >= 1.0  
**Requires:** discovery, project-context, testing  
**Outputs:** incident-report.md, reproduction-test.md  

---

## Purpose

When software breaks or regressions occur, unstructured trial-and-error by AI agents causes context churn, destructive random edits, and secondary bugs. 

This skill provides a rigorous **Forensics & Root-Cause Analysis (RCA)** protocol: isolate the failure with empirical reproducers, trace state transitions, and fix the root defect while leaving an automated regression test behind.

---

## The 4-Stage Forensic Protocol

```
┌────────────────────────────────────────────────────────┐
│ 1. ISOLATE & REPRODUCE                                 │
│    Capture logs, extract exact inputs, write a minimal │
│    failing reproduction script or unit test.           │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 2. TRACE & AUDIT                                       │
│    Examine state transitions, stack traces, git diffs, │
│    and commit history (`git log -S` / `git bisect`).   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 3. ROOT-CAUSE VERIFICATION                             │
│    Prove the failure mechanism scientifically.         │
│    Rule out environment, caching, and race conditions. │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 4. TARGETED FIX & REGRESSION SHIELD                    │
│    Apply surgical, minimal code fix.                   │
│    Prove the reproduction test now passes.             │
│    Document in Risk/Gap register and CHANGELOG.md.     │
└────────────────────────────────────────────────────────┘
```

---

## Forensic Checklist

### Step 1: Isolate & Reproduce
- [ ] Do not guess the cause.
- [ ] Reproduce the failure with a single shell command or test run:
  ```bash
  # Example: run the single failing test
  cargo test test_stripe_webhook_idempotency -- --nocapture
  ```
- [ ] If no test exists, write a minimal reproduction test in `scratch/` or in the test suite that reliably fails with the exact bug behavior.

### Step 2: Trace & Audit
- [ ] Inspect error stack traces and find the exact file and line number.
- [ ] Run `git log -S "<function_or_symbol>" -p` to see when the behavior last changed.
- [ ] Inspect recent git commits: `git diff HEAD~1`.
- [ ] Verify environment variables, database connections, and port bindings.

### Step 3: Root-Cause Proof
- [ ] Formulate a testable hypothesis: *"The database transaction is rolled back because the foreign key is null when payload X is received."*
- [ ] Inspect the relevant code snippet (`view_file`).
- [ ] Verify why other tests didn't catch it (test coverage gap).

### Step 4: Targeted Fix & Regression Shield
- [ ] Make the smallest necessary code edit (`replace_file_content`).
- [ ] Re-run the reproduction test: verify it now passes.
- [ ] Re-run the entire test suite: verify no regressions were introduced.
- [ ] Update `CHANGELOG.md` under `### Fixed`.
- [ ] Log the incident and remediation in `docs/15_GAP_AND_RISK_REGISTER.md` if an enterprise controlled doc set is used.

---

## What Never to Do During Debugging

- **Never rewrite working modules** when debugging a targeted defect.
- **Never suppress errors** with empty `catch` blocks or `unwrap()` workarounds.
- **Never restart shared infrastructure** (e.g., PostgreSQL, Redis, Cloudflare tunnels) without confirming with the team.
- **Never conclude "it works now"** without showing passing terminal logs.
