# 02-Project-Context Skill

**Version:** 1.0.0
**Compatible:** project_skills >= 1.0
**Requires:** discovery
**Outputs:** project-context.md

---

## Purpose

Build a structured understanding of the project's technology context: languages, frameworks, databases, infrastructure, and tooling. This is the input to stack skill selection.

---

## Process

### 1. Detect programming language(s)

Inspect the signals listed in `00-orchestrator/SKILL.md` (Phase 2, Programming Language table). Record version if detectable:
- `package.json` → engine/node versions
- `Cargo.toml` → rust version in `[package]` orrust-toolchain file
- `go.mod` → go version directive
- `pom.xml` / `build.gradle` → java version
- `Gemfile` → ruby version
- `*.csproj` → target framework
- `pyproject.toml` / `requirements.txt` → python version

### 2. Detect framework(s) and version

Inspect signals from the Framework table. Record major version if detectable.

### 3. Detect database and data stores

- Primary database (from config, env, connection strings, migrations)
- Secondary stores (cache, queue, search, blob storage)
- ORM or query builder in use
- Migration system

### 4. Detect infrastructure and deployment

- Containerization (Docker, none)
- Orchestration (Kubernetes, none, platform-managed)
- Hosting platform (Vercel, Netlify, AWS, GCP, Azure, bare metal, unknown)
- CI/CD system and outline
- Environment configuration pattern (.env, config files, secrets manager)

### 5. Detect third-party services

- Auth provider
- Payment provider
- Email / notification
- Storage (S3, Cloudflare R2, etc.)
- Monitoring / observability
- CDN
- Any API integrations mentioned in code or docs

### 6. Record what is NOT detectable

If something cannot be detected from available signals, record "not detectable from current evidence" rather than guessing.

---

## Output

### project-context.md

```
Project Context
===============
Language: [language] [version if known]
Framework: [framework] [version if known]
Frontend: [framework or "none"]
Backend: [framework or "none"]
Database: [database] [version if known]
ORM: [orm or "none"]
Cache: [redis/none/unknown]
Queue: [system or "none"]
Search: [engine or "none"]
Storage: [system or "none"]
Infrastructure: [docker/k8s/platform/unknown]
Deployment: [platform or "unknown"]
CI/CD: [system or "none"]
Environment: [dotenv/config/secrets-manager/unknown]
Third-party services:
  - [service]: [purpose]
  - ...
Not detectable: [list of things that could not be determined]
```
