# AI Assistant & Providers Guide

AIPanel's AI Agent is deeply integrated with your code, git history, database schema, and deployment telemetry.

---

## Supported AI Providers

AIPanel offers flexible AI provider options. You are never locked into a single vendor:

### 1. AIPanel AI (Managed Cloud)
- Fully managed context engine optimized for full-stack deployments.
- Free Tier includes 50 AI interactions per month.
- Pro Tier provides unlimited interactions with advanced multi-file coding agent.

### 2. BYOK (Bring Your Own Key)
Use your own API keys directly with:
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus
- **OpenAI**: GPT-4o, o3-mini
- **Google**: Gemini 2.5 Pro, Gemini 2.5 Flash
- **OpenAI-Compatible**: Any endpoint (DeepSeek, Groq, Together, Perplexity, OpenRouter)

### 3. Local & Private AI (Ollama / Embedded)
- Run models locally via **Ollama** (`llama3.2`, `codellama`, `qwen2.5-coder`).
- Zero data leaves your machine or private VPC.
- Ideal for high-security, proprietary, or regulated codebases.

---

## AI Capabilities

### Autonomous Coding & Multi-File Diffs
Ask the AI to implement features across the stack:
- Creates database migrations.
- Implements backend API routes and business logic.
- Updates frontend components and types.
- Generates corresponding unit and integration tests.
- Displays all planned modifications as interactive diffs for human approval.

### Deployment Failure Analysis
When a build or deployment health check fails, the AI Agent:
1. Inspects build logs and system traces.
2. Identifies the root cause (e.g., missing environment variable, migration syntax mismatch, port collision).
3. Suggests a 1-click remediation diff.

### Natural Language Log Search
Ask questions about your live services:
- *"Show me all 5xx errors from the checkout endpoint in the last 2 hours"*
- *"Why is the Redis worker memory consumption spiking?"*
