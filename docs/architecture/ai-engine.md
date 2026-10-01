# Architecture: AI Agent & Multi-Provider System

AIPanel features a deeply contextual AI system that understands the complete application lifecycle—from source code and database migrations to runtime logs and deployment health.

---

## 1. Provider Abstraction Architecture

```
                       ┌─────────────────────────┐
                       │     Developer Prompt    │
                       └────────────┬────────────┘
                                    │
                       ┌────────────▼────────────┐
                       │  AIPanel Context Engine │
                       │  • Project AST & Schema │
                       │  • Git Diffs & History  │
                       │  • Active Server Logs   │
                       └────────────┬────────────┘
                                    │
                       ┌────────────▼────────────┐
                       │  AI Provider Interface  │
                       └────────────┬────────────┘
                                    │
        ┌───────────────┬───────────┴───────────┬───────────────┐
        │               │                       │               │
┌───────▼───────┐┌──────▼───────┐       ┌───────▼───────┐┌──────▼───────┐
│  AIPanel AI   ││     BYOK     │       │ Local Models  ││   Custom     │
│(Managed Cloud)││(OpenAI/Claude│       │ (Ollama CLI / ││(OpenAI-Compat│
│               ││ /Gemini API) │       │   Embedded)   ││   Gateway)   │
└───────────────┘└──────────────┘       └───────────────┘└──────────────┘
```

---

## 2. Context Collection Engine

Traditional AI coding extensions only see open files or simple workspace text grep results. AIPanel constructs a multi-layered context graph:

1. **Static Project Analysis**:
   - Manifest data (`package.json`, `Cargo.toml`, `composer.json`, `aipanel.toml`).
   - Database schema models and migration files.
   - API route declarations and interface typings.
2. **Dynamic Operational Context**:
   - Output from recent test runs.
   - Recent server stderr/stdout logs and crash stack traces.
   - Active environment status (running services, port allocations).
3. **Version Control Context**:
   - Current git branch and uncommitted staged/unstaged diffs.
   - Recent commit messages and author intentions.

---

## 3. Autonomous Execution & Diff Review

When an AI prompt requests a complex full-stack feature:
1. **Planning**: The AI generates a structured plan outlining modified and created files.
2. **Execution**: The agent generates unified diffs for each target file.
3. **Human Gate**: Diffs are presented in Monaco side-by-side diff viewers. No change is committed or written to disk without developer review.
4. **Automated Verification**: AIPanel runs tests and pre-flight checks against modified code before suggesting a commit or deployment.

---

## 4. Privacy & Enterprise Boundaries

- **Zero Data Leakage with Ollama**: Teams handling proprietary code or regulated data can select local models via Ollama. All embeddings, tokens, and inference remain entirely local.
- **BYOK Direct Connection**: When using personal API keys (Anthropic, OpenAI, Google), the desktop app communicates directly with provider endpoints over HTTPS without relaying code through AIPanel servers.
