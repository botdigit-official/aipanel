# Skill Selection

## Algorithm

```
1. Run discovery → locate the project
2. Detect technology → language, framework, database, infrastructure
3. Detect project type → domain and business model
4. Classify state → greenfield / healthy / partial / broken
5. Select core skills → always-on + contextually required
6. Select stack skills → detected language, framework, infrastructure
7. Select workflow → based on task type and project state
8. Write selected-skills.md
```

## Always-On Skills

These are active for every project, every session:

| Skill | Why |
|---|---|
| 00-orchestrator | This skill — the decision engine |
| 01-discovery | Locate and understand the project |
| 05-documentation | Every agent leaves docs better |

## Conditional Core Skills

| Condition | Skill |
|---|---|
| Business logic exists or is being added | 03-business-architecture |
| Architecture decisions needed | 04-architecture |
| Existing code needs inspection | 06-codebase-audit |
| User data, payments, auth, PII, external integrations | 07-security |
| Code changes planned | 08-testing |
| Performance concern or changes affecting performance | 09-performance |
| Comprehensive review requested | 10-audit |

## Stack Skills

Activated by detection only:

| Detected | Skill |
|---|---|
| JavaScript | stacks/javascript |
| TypeScript | stacks/typescript |
| Python | stacks/python |
| PHP | stacks/php |
| Rust | stacks/rust |
| Go | stacks/go |
| Java | stacks/java |
| Ruby | stacks/ruby |
| C# / .NET | stacks/dotnet |
| React | frameworks/react |
| Next.js | frameworks/nextjs |
| Laravel | frameworks/laravel |
| Django | frameworks/django |
| FastAPI | frameworks/fastapi |
| Axum | frameworks/axum |
| Ruby on Rails | frameworks/rails |
| Spring Boot | frameworks/spring |

## Infrastructure Skills

| Detected | Skill |
|---|---|
| PostgreSQL | stacks/postgresql (or database adapter) |
| Redis | stacks/redis |
| Docker | stacks/docker |
| AWS | stacks/aws |
| Vercel | stacks/vercel |

## Selection Rules

1. **Minimum set.** Activate only what is needed. A 200-line script needs README + discovery, not 15 skills.
2. **Detection over assumption.** Never select a stack skill without detection evidence.
3. **Security is conditional but important.** Skip it for a static site. Never skip it for a project handling payments or user data.
4. **Documentation is mandatory.** Always active. Non-negotiable.
5. **Testing is conditional on code changes.** No code changes = no testing skill needed. Planning a change = testing skill needed.
6. **Audit is a composite.** 10-audit activates 06, 07, 04, and 03 in sequence. Do not activate all four individually if 10-audit is selected.

## Anti-Patterns

- Selecting all skills "just in case"
- Selecting a stack skill before detecting the stack
- Skipping security for a project that handles user data
- Skipping documentation "because it's a small change"
- Activating framework skill when no framework is detected
