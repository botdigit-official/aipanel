# 04-Architecture Skill

**Version:** 1.0.0
**Compatible:** project_skills >= 1.0
**Requires:** discovery, project-context, business-architecture
**Outputs:** architecture.md, architecture-gaps.md, decisions/ADR-XXX.md

---

## Purpose

Understand, review, and document the project's architecture. This skill directs the agent to assess the existing architecture (if any), identify gaps, and make or record architectural decisions with reasoning.

Every architectural decision needs a reason.

---

## Process

### 1. Map the current architecture

Identify:
- High-level components and their responsibilities
- How components communicate (HTTP, queues, shared DB, events, in-process)
- Data flow between components
- Boundaries between subsystems
- Deployment topology (processes, services, instances)
- External dependencies

### 2. Assess architectural style

Determine what style the project uses or should use:

- Modular monolith
- Microservices
- Serverless functions
- Single process
- Client-server
- Event-driven
- Layered
- Hexagonal / ports and adapters
- Other

Record why this style was chosen (or note "not documented" if unknown).

### 3. Evaluate against principles

For each component and interaction, ask:
- Is this the simplest thing that can work?
- Is this component's responsibility clear and focused?
- Are boundaries well-defined?
- Is the data flow understandable?
- Are dependencies justified?
- Is this architecture appropriate for the project's scale and team?
- Does it match the business domain?

### 4. Identify gaps

Record gaps in these categories:
- Missing documentation
- Unclear boundaries
- Hidden coupling
- Missing error handling strategy
- Missing observability
- Missing security boundaries
- Scaling bottlenecks
- Technology choices that no longer fit
- Missing backward compatibility strategy
- Missing migration strategy for data or schema

### 5. Make or record decisions

Every architectural decision that is not already documented must be recorded as an ADR. See `templates/adr/`.

An ADR must contain:
- Title
- Status (proposed, accepted, deprecated, superseded)
- Context: what problem this decision addresses
- Decision: what was decided
- Consequences: what this decision implies (positive and negative)
- Alternatives considered: what else was considered and why it was not chosen

---

## Architecture Assessment Questions

- What is the simplest architecture that satisfies the business requirements?
- Are we over-engineering? Under-engineering?
- Does the architecture match the team's ability to maintain it?
- Can we deploy independently where it matters?
- Are there single points of failure?
- Is data integrity protected across component boundaries?
- Can we reason about the system? If not, why?
- Are there components that do too much? Too little?
- Are there circular dependencies?
- Is the dependency direction correct (dependencies point toward stability)?

---

## Output

### architecture.md

```
Architecture
============
Style: [architectural style]
Rationale: [why this style, or "not documented"]
Components:
  - [name]: [responsibility], [communicates with: ...]
Data flow: [description or diagram]
Deployment: [how it runs]
External dependencies: [list]
Boundaries:
  - [boundary description]
```

### architecture-gaps.md

```
Architecture Gaps
=================
[Gap ID]: [description]
Severity: [low | medium | high | critical]
Impact: [what this gap causes]
Recommendation: [what to do]
```

### decisions/

Each ADR as a separate file. Use `templates/adr/` as the template.
