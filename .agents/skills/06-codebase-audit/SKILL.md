# 06-Codebase-Audit Skill

**Version:** 1.0.0
**Compatible:** project_skills >= 1.0
**Requires:** discovery, project-context
**Outputs:** codebase-audit.md, code-gaps.md

---

## Purpose

Inspect the existing codebase to understand what is there, how it is structured, what conventions it follows, and what problems exist — before making any changes.

Inspect before assuming.

---

## Process

### 1. Map the code structure

- Directory layout
- Entry points
- Module/package boundaries
- Public vs private interfaces
- Shared code
- Standalone scripts

### 2. Identify conventions

- Naming conventions (files, functions, variables, classes)
- Code style (formatting, linting, imports)
- Architectural patterns in use (MVC, layered, domain-driven, etc.)
- Error handling patterns
- Logging patterns
- Testing patterns (if tests exist)
- Configuration patterns

### 3. Identify entry points and flows

For each major feature or flow:
- Where it enters the system
- What components it touches
- What data it reads and writes
- What external services it calls
- What errors can occur

### 4. Assess code quality

Look for:
- Duplicated code
- Large functions or files
- Mixed responsibilities
- Copy-paste architecture
- Dead code
- commented-out code
- TODOs and FIXMEs (and whether they are tracked)
- Magic values
- Inconsistent error handling
- Missing input validation
- Missing type safety where the language supports it

### 5. Assess test situation

- Do tests exist?
- What is tested?
- What is not tested?
- Test quality (unit, integration, end-to-end)
- Test coverage of critical paths
- Whether tests are run in CI

### 6. Identify technical debt

Record debt in these categories:
- Code-level debt (duplication, complexity, poor naming)
- Architecture-level debt (wrong boundaries, coupling, missing abstractions)
- Test debt (missing tests, brittle tests, no CI)
- Documentation debt (missing, outdated)
- Dependency debt (outdated, unmaintained, too many)
- Security debt (see 07-security for detailed security audit)

---

## Output

### codebase-audit.md

```
Codebase Audit
==============
Project: [name]
Audit date: [date]
Auditor: [agent or person]

Structure:
  [description of code layout]

Conventions:
  [naming, style, patterns detected]

Entry points:
  [list]

Code quality:
  Strengths: [what is good]
  Problems: [what is not good]
  Estimated complexity: [low | medium | high]

Test situation:
  Tests exist: [yes | no]
  Coverage: [description or "unknown"]
  CI: [yes | no | unknown]

Technical debt:
  [list by category]
```

### code-gaps.md

```
Code Gaps
=========
[Gap ID]: [description]
Severity: [low | medium | high]
Category: [code | architecture | test | docs | dependency]
Recommendation: [what to do]
```
