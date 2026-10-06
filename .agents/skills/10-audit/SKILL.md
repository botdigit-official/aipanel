# 10-Audit Skill

**Version:** 1.0.0
**Compatible:** project_skills >= 1.0
**Requires:** discovery, project-context
**Outputs:** audit-report.md, and outputs from 06, 07, 04, 03 as applicable

---

## Purpose

Run a comprehensive audit of the project. The audit skill is a composite that runs the codebase audit, security review, architecture review, and business architecture review in sequence, then synthesizes findings into a single report.

Use this skill when:
- Taking over an existing project
- Before a major rewrite or refactor
- As part of due diligence
- When a project feels "off" and you need a full picture
- Periodically on mature projects

---

## Process

### Phase 1: Run sub-skills in order

1. **06-codebase-audit** — inspect the code
2. **07-security** — review security posture
3. **04-architecture** — review architecture
4. **03-business-architecture** — understand the business

The order matters. Security is run early because critical findings may stop the audit and require immediate action. Business understanding informs architecture review. Code audit informs both.

### Phase 2: Synthesize

Combine findings into a unified report. Identify:
- Findings that appear across multiple domains (e.g., a security issue caused by an architectural problem)
- The highest-risk items
- The items that block progress
- The items that are quick wins
- The items that require product/business decisions

### Phase 3: Prioritize

Prioritize by risk and effort:

| Priority | Criteria |
|---|---|
| P0 — Immediate | Security critical, data integrity risk, system down, legal/compliance risk |
| P1 — High | Significant risk, blocks major work, fundamental architectural problem |
| P2 — Medium | Notable problem, should be fixed before next release |
| P3 — Low | Improvement, nice to have, no immediate risk |
| P4 — Backlog | Minor, cosmetic, or long-term improvement |

### Phase 4: Report

Write a report that a human can act on. It should answer:
- What is this project?
- What is its state?
- What are the most important findings?
- What should be done first, and why?
- What requires business decisions vs technical decisions?

---

## Output

### audit-report.md

```
Audit Report
============
Project: [name]
Audit date: [date]
Auditor: [agent or person]
Project state: [greenfield | healthy | partial | broken]
Risk level: [low | medium | high]

Summary:
  [2-5 sentence summary of the project and its state]

Findings by priority:
  P0 — Immediate:
    - [finding]
  P1 — High:
    - [finding]
  P2 — Medium:
    - [finding]
  P3 — Low:
    - [finding]

Strengths:
  - [what is good]

Recommended next steps:
  1. [action] — [reason]
  2. ...

Business decisions needed:
  - [decision that requires product/business input]

Technical decisions needed:
  - [decision that is purely technical]
```

### Per-domain findings

The audit also produces the outputs of each sub-skill:
- `codebase-audit.md` and `code-gaps.md` (from 06)
- `security.md` and `security-findings.md` (from 07)
- `architecture.md` and `architecture-gaps.md` (from 04)
- `business-model.md`, `actors.md`, etc. (from 03)
