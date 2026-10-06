# 00-Orchestrator Skill

**Version:** 1.0.0
**Compatible:** project_skills >= 1.0
**Requires:** discovery
**Outputs:** selected-skills.md, project-classification.md

---

## Purpose

The orchestrator is the entry point and decision engine for all agent work on a project. It:

1. Classifies the project state (greenfield / healthy / partial / broken)
2. Detects the technology stack automatically
3. Detects the project type and business domain
4. Selects the minimum applicable skill set
5. Establishes the workflow for the current task

Every agent session starts here.

---

## Core Principle

**Do not select skills by assumption. Select skills by detection.**

Never say "this is a Laravel project, use the Laravel skill." Instead:

1. Inspect `composer.json`, `artisan`, `app/`, `config/` — confirm it is Laravel
2. Confirm the Laravel version
3. Activate the Laravel adapter
4. Also activate any other detected technologies

---

## Workflow

### Phase 1: Project State Classification

```
                ┌─────────────────────────┐
                │   Is there existing     │
                │   code in the project?  │
                └────────────┬────────────┘
                             │
              ┌──────────────┼──────────────┐
              │ YES                          │ NO
              ▼                              ▼
   ┌───────────────────┐        ┌───────────────────┐
   │ Is the code       │        │ Greenfield        │
   │ healthy, partial, │        │ Workflow          │
   │ or broken?        │        │                   │
   └────────┬──────────┘        │ 1. Establish      │
            │                    │    foundations    │
    ┌──────┼──────┐             │ 2. Choose         │
    │      │      │             │    architecture   │
    ▼      ▼      ▼             │ 3. Set up docs    │
   Healthy Partial Broken       │ 4. Plan first     │
    │      │      │             │    increment      │
    ▼      ▼      ▼             └───────────────────┘
   Improve Reconcile Stabilize
```

#### Healthy

- Code is functional and reasonably structured
- Approach: improve incrementally
- Preserve existing patterns
- Add tests for new changes
- Document as you go
- **Skills:** codebase-audit (light), architecture (if changes affect architecture), security (if applicable), testing, [stack], [framework]

#### Partial

- Code exists but is incomplete, inconsistent, or ambiguous
- Approach: reconcile before redesign
- Map what exists to what is intended
- Identify gaps between implementation and intent
- Do not rewrite working parts
- **Skills:** codebase-audit (full), architecture, business-architecture, documentation, [stack], [framework]

#### Broken

- Code exists but has fundamental problems (security, data integrity, architectural contradictions)
- Approach: stabilize first
- Fix highest-risk issues immediately
- Document problems and fixes as you go
- Do not introduce new features until stable
- **Skills:** security (first), codebase-audit (full), architecture, business-architecture, documentation, [stack], [framework], testing

### Phase 2: Technology Detection

Inspect these files and directories. Record what you find.

#### Programming Language

| Signal | Language | Confidence |
|---|---|---|
| `Cargo.toml` + `src/main.rs` or `src/lib.rs` | Rust | High |
| `go.mod` + `.go` files | Go | High |
| `pom.xml` or `build.gradle` + `.java` files | Java | High |
| `Gemfile` + `.rb` files | Ruby | High |
| `*.csproj` or `*.sln` + `.cs` files | C# / .NET | High |
| `composer.json` + `vendor/` or `artisan` | PHP | High |
| `package.json` + `.ts` files | TypeScript | High |
| `package.json` + `.js` files | JavaScript | High |
| `pyproject.toml` or `requirements.txt` or `setup.py` + `.py` files | Python | High |
| `index.html` + `.css` only | Static site | High |

#### Framework

| Signal | Framework | Confidence |
|---|---|---|
| `next.config` + `app/` or `pages/` + `package.json` (next) | Next.js | High |
| `react` in `package.json` + components + no next config | React (SPA) | High |
| `artisan` + `app/Http/` + `config/` + `resources/views/` | Laravel | High |
| `manage.py` + `django` in `requirements` + `settings.py` | Django | High |
| `fastapi` or `starlette` in imports + `main.py` with `FastAPI()` | FastAPI | High |
| `axum` or `tokio` in `Cargo.toml` + `router` | Axum (Rust) | High |
| `rails` command + `app/controllers/` + `config/routes.rb` | Ruby on Rails | High |
| `spring` in `pom.xml`/`build.gradle` + `@RestController` | Spring Boot | High |

#### Database

| Signal | Database | Confidence |
|---|---|---|
| `postgresql` or `postgres` in config | PostgreSQL | High |
| `mysql` or `mariadb` in config | MySQL / MariaDB | High |
| `sqlite` in config or `.sqlite` / `.db` files | SQLite | High |
| `mongo` in config or `mongoose`/`mongodb` imports | MongoDB | High |
| `redis` in config or `redis://` URLs | Redis | High |
| `prisma.schema` or `schema.prisma` | Prisma (ORM, reveals DB) | High |
| `migrations/` or `db/migrate/` or `flyway/` | Migration system (reveals DB) | Medium |
| `models/` with ORM imports | ORM in use (reveals DB) | Medium |

#### Infrastructure

| Signal | Infrastructure | Confidence |
|---|---|---|
| `Dockerfile` | Docker | High |
| `docker-compose.yml` or `docker-compose.yaml` | Docker Compose | High |
| `terraform/` or `.tf` files | Terraform | High |
| `k8s/`, `kubernetes/`, or `*.yaml` with `Deployment` | Kubernetes | Medium |
| `vercel.json` or `vercel` in CI | Vercel | High |
| `.github/workflows/` with deploy steps | GitHub Actions CI/CD | High |
| `netlify.toml` or `netlify` in CI | Netlify | High |
| `cloudflare` mentions | Cloudflare | Medium |
| `nginx` config or `nginx.conf` | Nginx | High |
| `rails`, `artisan`, `manage.py` with server commands | Built-in dev server | Medium |

#### Project Type

| Signal | Project Type | Confidence |
|---|---|---|
| `payment`, `billing`, `subscription`, `stripe`, `pricing` | SaaS / Commercial | Medium |
| `marketplace`, `seller`, `buyer`, `listing`, `escrow` | Marketplace | Medium |
| `product`, `cart`, `checkout`, `inventory` | E-commerce | Medium |
| `bank`, `account`, `transaction`, `ledger`, `compliance` | Fintech | Medium |
| `directory`, `listing`, `search`, `category` | Directory | Medium |
| `auth`, `login`, `session`, `oauth`, `jwt` | Auth system | Medium |
| `admin`, `dashboard`, `cms`, `content` | CMS / Admin | Medium |
| `api`, `rest`, `graphql`, `endpoint` + no frontend | API-only | Medium |
| `crawler`, `scraper`, `spider`, `seed`, `crawl` | Crawler / Scraper | Medium |
| `mobile`, `react-native`, `flutter`, `expo` | Mobile app | Medium |
| `worker`, `job`, `queue`, `cron`, `background` | Background processing | Medium |

### Phase 3: Skill Selection

After detection, select skills using this algorithm:

```
Activate always:
  └── 00-orchestrator   (this skill)
  └── 01-discovery      (to locate and understand the project)
  └── 05-documentation  (every agent leaves docs better)

Activate if business logic exists or is being added:
  └── 03-business-architecture

Activate if architecture decisions are needed:
  └── 04-architecture

Activate if existing code needs inspection:
  └── 06-codebase-audit

Activate if project handles:
  - user data → 07-security
  - payments → 07-security
  - authentication → 07-security
  - external integrations → 07-security
  - PII → 07-security

Activate if code changes are planned:
  └── 08-testing

Activate if performance is a concern or changes affect performance:
  └── 09-performance

Activate if enterprise rigor & strict specification needed:
  └── 11-controlled-source-of-truth

Activate for all multi-step tasks to prevent context rot:
  └── 12-context-engineering

Activate for feature execution & milestone delivery:
  └── 13-phase-loop-delivery (Discuss → Plan → Execute → Verify → Ship)

Activate when debugging unexpected failures or regressions:
  └── 14-forensics-and-debugging

Activate for autonomous execution & anti-overengineering reviews:
  └── 15-autonomous-loop-and-simplification

Activate detected stack skill:
  └── stacks/[detected-language]/

Activate detected framework skill:
  └── frameworks/[detected-framework]/

Activate detected infrastructure skill:
  └── stacks/[detected-db]/     (if database-specific guidance needed)
  └── stacks/[detected-cache]/  (if cache-specific guidance needed)
  └── stacks/[detected-infra]/  (if infra-specific guidance needed)
```

### Phase 4: Workflow Selection

Based on the task type, select the appropriate workflow:

| Task | Workflow |
|---|---|
| New project from scratch | Greenfield workflow (`workflow.md`) + `13-phase-loop-delivery` |
| Add feature to existing project | Improve workflow + `12-context-engineering` + `13-phase-loop-delivery` |
| Autonomous feature execution | Autonomous loop (`15-autonomous-loop-and-simplification`) |
| Pre-merge code simplification | Anti-overengineering review (`15-autonomous-loop-and-simplification`) |
| Fix bug or regression | Forensics workflow (`14-forensics-and-debugging`) + `08-testing` |
| Enterprise documentation / spec | Controlled Source of Truth (`11-controlled-source-of-truth`) |
| Audit existing project | Audit workflow (`10-audit`) |
| Refactor existing code | Reconcile workflow (Partial) + `12-context-engineering` |
| Stabilize broken project | Stabilize workflow (Broken) + `14-forensics-and-debugging` |
| Document existing project | Documentation workflow (`05-documentation`) |
| Security review | Security workflow (`07-security`) |

---

## Decision Trees

### "Should I introduce a new technology?"

```
Is the current technology insufficient for the task?
├── NO → Do not introduce new technology
└── YES
     │
     Is the gap measurable (performance, capability, maintainability)?
     ├── NO → Do not introduce new technology
     └── YES
          │
          Is there an existing technology in the stack that can be extended?
          ├── YES → Extend it first. Propose the extension in an ADR.
          └── NO
               │
               Does the new technology solve a problem the project actually has?
               ├── NO → Do not introduce it
               └── YES
                    │
                    Have you documented the decision in an ADR?
                    ├── NO → Write the ADR first
                    └── YES → Proceed
```

### "Should I rewrite this?"

```
Does the existing code work?
├── YES → Do not rewrite. Improve incrementally.
└── NO
     │
     Is the problem architectural or implementation?
     ├── Implementation → Fix the implementation
     └── Architectural
          │
          Can the architecture be adjusted incrementally?
          ├── YES → Adjust incrementally
          └── NO
               │
               Is a rewrite the only viable path?
               ├── NO → Find another path
               └── YES
                    │
                    Have you documented the current problems, the proposed architecture,
                    the migration plan, and the rollback plan in an ADR?
                    ├── NO → Write the ADR first
                    └── YES → Proceed with migration plan
```

### "Is this AI-appropriate?"

```
Is the task deterministic? (same input → same correct output, always)
├── YES → Use deterministic tools. Do not use AI.
│         Examples: data transformation, validation, formatting, testing,
│                   build steps, migrations, config generation
└── NO (requires judgment, synthesis, or reasoning)
     │
     Does the task benefit from reasoning?
     ├── NO → Use a simpler heuristic or rule-based approach
     └── YES → AI may be appropriate
```

---

## Skill Metadata Schema

Every skill file must begin with this YAML header:

```yaml
skill:
  name: skill-name           # kebab-case, matches directory name
  version: X.Y.Z             # SemVer
  compatible:
    project_skills: ">=1.0"  # min version of this repository
  requires:                  # skills that must be activated first
    - discovery
  outputs:                   # artifacts this skill produces
    - path/to/output.md
  conflicts:                 # skills that should not be active simultaneously
    - unrelated-skill
```

The orchestrator uses `requires` to order activation and `conflicts` to prevent contradictory skill combinations.

---

## What the Orchestrator Produces

After classification and selection, the orchestrator writes:

### `selected-skills.md`

```
Project: [name]
State: [greenfield | healthy | partial | broken]
Detected stack: [language], [framework], [database], [infrastructure]
Detected domain: [project type]
Activated skills:
  - 00-orchestrator
  - 01-discovery
  - 05-documentation
  - 03-business-architecture
  - stacks/typescript
  - frameworks/nextjs
  - stacks/postgresql
Reason for each activation: [brief justification]
```

### `project-classification.md`

```
Project classification
======================
State: [state]
Rationale: [why this state was chosen]
Risk level: [low | medium | high]
Maturity: [new | early | maturing | mature]
Scale: [solo | small team | medium team | large team | unknown]
```

---

## Anti-Patterns

The orchestrator must prevent these:

1. **Stack forcing** — selecting a skill because "this should be a Rust project" instead of because Cargo.toml says so
2. **Over-skilling** — activating 20 skills for a simple script
3. **Under-skilling** — skipping security for a project that handles payments
4. **Assuming architecture** — assuming microservices, monolith, serverless, etc. without evidence
5. **Assuming business model** — assuming SaaS, marketplace, etc. without evidence
6. **Skipping discovery** — jumping to implementation before understanding the project
7. **Master prompt fallacy** — trying to use all skills at once instead of selecting the minimum set
AGENTS_EOF
