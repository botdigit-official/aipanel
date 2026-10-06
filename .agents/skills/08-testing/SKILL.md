# 08-Testing Skill

**Version:** 1.0.0
**Compatible:** project_skills >= 1.0
**Requires:** discovery, project-context, codebase-audit
**Outputs:** testing.md, test-gaps.md

---

## Purpose

Establish a testing strategy and verify that changes are tested. Every major change needs tests.

---

## Process

### 1. Assess current testing

- Do tests exist?
- What kinds? (unit, integration, end-to-end, contract, performance, security)
- What is tested and what is not?
- Is there a testing culture (tests written with features)?
- Are tests run in CI?
- How long do tests take?
- Are tests reliable (flaky or stable)?

### 2. Identify what must be tested

Testing priority:

1. **Business rules** — the rules that make the business work. If these are wrong, the product is wrong.
2. **Data integrity** — operations that create, modify, or delete data. Wrong data is worse than no data.
3. **Security boundaries** — authentication, authorization, access control.
4. **Integration points** — external services, APIs, databases.
5. **Critical user flows** — the paths users take to accomplish core tasks.
6. **Edge cases** — failure modes, boundary conditions, invalid input.

### 3. Define the testing strategy

For each type of test, decide:
- What it covers
- When it runs
- How it is written
- How it is maintained

Testing pyramid (general guidance, adapt to project):

- **Unit tests** — fast, isolated, many. Test business logic, pure functions, transformations.
- **Integration tests** — moderate speed, test component interactions, database, external services with test doubles where appropriate.
- **End-to-end tests** — slow, test complete user flows. Few, focused on critical paths.
- **Contract tests** — if APIs are consumed by other systems.
- **Performance tests** — if performance is a requirement. See 09-performance.

### 4. Define test quality standards

- Tests must be deterministic. A test that fails intermittently erodes trust.
- Tests must assert something meaningful. Assertions that cannot fail are noise.
- Tests should fail for the right reason. A test that passes when it should fail is dangerous.
- Tests should be readable. A test is documentation of expected behavior.
- Tests should be maintainable. Brittle tests that break on every change will be deleted.

### 5. Identify test gaps

Record gaps by priority. Not everything can be tested immediately. Prioritize by risk:
- Untested business-critical logic → highest priority
- Untested security boundaries → high priority
- Untested integrations → high priority
- Untested edge cases → medium priority
- Missing unit tests for non-critical code → lower priority

---

## What to Test

| What | Test Type | Priority |
|---|---|---|
| Business rules | Unit | Highest |
| Data integrity (create/update/delete) | Integration | Highest |
| Authentication | Integration / E2E | Highest |
| Authorization | Integration / E2E | Highest |
| Payment / billing logic | Unit + Integration | Highest |
| API endpoints | Integration / Contract | High |
| User workflows | E2E | High |
| Database migrations | Integration | High |
| File upload / processing | Integration | Medium |
| Email / notifications | Integration (with test double) | Medium |
| Third-party integration Contracts | Contract | Medium |
| Reporting / aggregation | Unit + Integration | Medium |
| UI rendering (non-interactive) | Unit / Component | Lower |
| Visual styling | Manual / visual regression | Lower |

---

## Output

### testing.md

```
Testing
=======
Current state: [assessment]
Test types in use: [list]
Test types missing: [list]
CI integration: [yes | no | partial]
Test reliability: [stable | flaky | unknown]
Critical paths tested: [list]
Critical paths NOT tested: [list]
```

### test-gaps.md

```
Test Gaps
=========
[Gap ID]: [what is not tested]
Priority: [highest | high | medium | lower]
Risk: [what could go wrong]
Recommendation: [what test to write]
```
