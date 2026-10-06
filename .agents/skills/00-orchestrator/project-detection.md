# Project Detection

## Purpose

Project detection determines what kind of project this is before any work begins. It is the input to skill selection.

## Detection Process

### 1. Locate the project

A repository may contain:
- A single project at the root
- A monorepo with multiple projects
- A partial project (some code, some design)
- A design-only project (no code yet)

Use `01-discovery/SKILL.md` to locate the actual project.

### 2. Detect the technology

Use the detection tables in `SKILL.md` (Phase 2) to identify:
- Programming language
- Framework and version
- Database and ORM
- Cache, queue, search
- Infrastructure and deployment
- CI/CD

### 3. Detect the project type

Use the project-type signals in `SKILL.md` (Phase 2) to identify:
- SaaS / commercial
- Marketplace
- E-commerce
- Fintech
- Directory
- CMS / admin
- API-only
- Crawler / scraper
- Mobile app
- Background processing
- Static site
- Library / SDK
- Internal tool
- Unknown (must not assume)

### 4. Detect the business domain

Read the business signals:
- What is being sold, provided, or tracked?
- Who are the actors?
- What are the transactions?
- What data is central?

### 5. Detect maturity and risk

| Signal | Maturity | Risk |
|---|---|---|
| No code | New | Low (nothing broken yet) |
| Code, no tests | Early | Medium (regressions possible) |
| Code, tests, CI | Maturing | Medium |
| Code, tests, CI, docs, ADR | Mature | Low |
| Security issues found | Any | High |
| Data integrity issues | Any | High |
| No auth on sensitive endpoints | Any | High |
| Hardcoded secrets | Any | High |

### 6. Detect team and scale

| Signal | Scale |
|---|---|
| Single developer, no CI | Solo / small |
| Team, some process | Small team |
| Multiple teams, CI/CD, monitoring | Medium team |
| Explicit scaling infrastructure, on-call | Large team |

If no signals are available, record "unknown" — do not assume.

## Output

The detection produces a structured summary that the orchestrator uses for skill selection. See `SKILL.md` for the output format.
