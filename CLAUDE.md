# CLAUDE.md — Agent Blueprint for Claude Code (AIPanel)

This project adheres to **Agent Blueprint** (https://github.com/botdigit-official/agent-blueprint).

## Core Rules
1. **Pre-flight Planning**: Maintain an active checklist in `TASK.md` before making edits.
2. **Anti-Overengineering**: Strictly obey YAGNI. Build minimal sufficient code. No speculative abstractions or unneeded dependencies.
3. **Docs Sync**: Keep `docs/` in sync with changes to APIs, state stores, or architectures.
4. **Audit Trail**: Record every modified file and reason in `CHANGELOG.md` under `## [Unreleased]`.
5. **Zero Regressions**: Verify builds with `npm test` (`tsc --noEmit`) before completing any task.
