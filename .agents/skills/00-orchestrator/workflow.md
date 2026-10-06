# Greenfield Workflow

## When to use

No existing code. Starting a project from scratch.

## Sequence

1. **Discover** — understand the domain, the actors, the business
2. **Architect** — choose architecture deliberately (not by default)
3. **Document foundations** — write PROJECT.md, ARCHITECTURE.md, the docs you will need
4. **Plan first increment** — what is the smallest useful version?
5. **Implement** — follow the architecture
6. **Test** — verify each increment
7. **Document** — update docs with what you built

## Rules

- Choose the simplest architecture that can work.
- Do not choose microservices by default.
- Do not choose a database by trend. Choose by fit.
- Do not add a framework you do not need.
- Every architectural decision gets an ADR.
- Set up documentation structure before writing code.
- Write tests alongside code, not after.
