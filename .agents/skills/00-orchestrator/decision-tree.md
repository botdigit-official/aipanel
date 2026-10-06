# Decision Tree Reference

This file consolidates the decision trees from SKILL.md into a quick-reference format.

## Project State

```
Existing code?
├── NO → Greenfield
└── YES
     │
     Is the code working and well-structured?
     ├── YES → Healthy → Improve
     ├── SOME (mixed) → Partial → Reconcile
     └── NO (fundamentally broken) → Broken → Stabilize
```

## New Technology

```
Current technology insufficient?
├── NO → Stop
└── YES
     │
     Gap measurable?
     ├── NO → Stop
     └── YES
          │
          Existing technology extendable?
          ├── YES → Extend + ADR
          └── NO
               │
               New technology solves actual problem?
               ├── NO → Stop
               └── YES
                    │
                    ADR written?
                    ├── NO → Write ADR
                    └── YES → Proceed
```

## Rewrite

```
Code works?
├── YES → Do not rewrite
└── NO
     │
     Problem type?
     ├── Implementation → Fix implementation
     └── Architectural
          │
          Incremental adjustment possible?
          ├── YES → Adjust incrementally
          └── NO
               │
               Rewrite only viable path?
               ├── NO → Find another path
               └── YES
                    │
                    ADR with problems + proposal + migration + rollback?
                    ├── NO → Write ADR
                    └── YES → Proceed
```

## AI Appropriateness

```
Task deterministic?
├── YES → Deterministic tools only
└── NO
     │
     Benefits from reasoning?
     ├── NO → Heuristic / rule-based
     └── YES → AI may be appropriate
```

## Skill Activation

```
Always: orchestrator, discovery, documentation
Business logic? → + business-architecture
Architecture decisions? → + architecture
Existing code inspection? → + codebase-audit
User data / payments / auth / PII? → + security
Code changes planned? → + testing
Performance concern? → + performance
Comprehensive review? → + audit (06+07+04+03)
───
Detected language → + stacks/[language]
Detected framework → + frameworks/[framework]
Detected infra → + stacks/[infra]
```
