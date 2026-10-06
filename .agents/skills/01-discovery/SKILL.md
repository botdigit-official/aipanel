# 01-Discovery Skill

**Version:** 1.0.0
**Compatible:** project_skills >= 1.0
**Requires:** (none — this is the first skill)
**Outputs:** project-location.md, repository-map.md

---

## Purpose

Find the project within the repository. A repository may contain a single project at root, a monorepo, a partial project, or no code at all. Discovery locates what actually exists before anything else happens.

---

## Process

### Step 1: Map the repository

List the top-level structure. Look for:

- Single project at root (most common)
- `apps/`, `services/`, `packages/`, `modules/` → monorepo
- `src/`, `app/`, `backend/`, `frontend/`, `api/` → separated concerns
- `docs/` only → documentation project, no code yet
- Nothing recognizable → may be a design or planning repo

### Step 2: Identify project boundaries

For monorepos, identify which sub-projects exist and which one the current task relates to.

For separated structures, identify frontend vs backend vs shared.

### Step 3: Record what is found

For each project or sub-project, record:

- Path
- What it appears to be (frontend, backend, worker, library, etc.)
- Any detection signals present (package.json, Cargo.toml, etc.)
- Whether code exists or only design/docs

### Step 4: Identify the target

Determine which project the current task applies to. If ambiguous, report the ambiguity rather than guessing.

---

## Outputs

### project-location.md

```
Discovery Results
=================
Repository: [url or path]
Structure: [single | monorepo | separated | design-only | unknown]
Projects found:
  - [path]: [type], [code: yes/no], [signals: ...]
Target project: [path or "not yet determined"]
Rationale: [why this target]
```

### repository-map.md

A tree or list of the repository structure with annotations about what each directory appears to contain.
