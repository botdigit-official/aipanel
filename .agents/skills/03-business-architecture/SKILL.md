# 03-Business-Architecture Skill

**Version:** 1.0.0
**Compatible:** project_skills >= 1.0
**Requires:** discovery, project-context
**Outputs:** business-model.md, actors.md, business-rules.md, workflows.md, state-machines.md (as applicable)

---

## Purpose

Understand the business before touching code. This skill directs the agent to discover and document what the project does, who it is for, what rules govern it, and how it works — as a business system, not as code.

Business logic comes before code structure.

---

## Process

### 1. Identify the actors

Who interacts with this system?

- End users (what kind?)
- Administrators
- Customers
- Sellers / providers
- Visitors (unauthenticated)
- System actors (cron, webhooks, integrations)
- Third-party systems

For each actor, record:
- Who they are
- What they can do
- What they can see
- What they cannot do

### 2. Identify the business model

How does this project create or capture value?

- What is being sold, provided, or tracked?
- Is it a product, service, marketplace, platform, tool?
- What is the unit of transaction?
- Is there pricing? How does it work?
- Is there revenue? From what?
- Is there a free tier, trial, or alternative access model?

If pricing exists, find the single source of truth for it. If pricing is scattered across code, flags, spreadsheets, and hardcoded values — record that as a finding, not a normal state.

### 3. Identify business entities

What are the core things the business tracks?

Examples: User, Account, Product, Listing, Order, Payment, Subscription, Scan, Report, Document, Invoice, Credential.

For each entity, record:
- What it represents
- What data it holds
- Who owns it
- What creates it
- What modifies it
- What deletes it (if anything)
- What its lifecycle is

### 4. Identify business processes

What does the business actually do, step by step?

For each process:
- Who initiates it
- What happens at each step
- What data changes
- What can go wrong
- What happens when it fails
- Who is notified
- What the end state is

### 5. Identify business rules

What are the constraints the business operates under?

Record rules in this form:

```
RULE: [description]
IF [condition]
THEN [outcome]
EXCEPT [exceptions]
NEVER [what must not happen]
```

Examples of rule categories:
- Authorization (who can do what)
- Validation (what data is acceptable)
- State transitions (what can change to what)
- Pricing rules (how prices are calculated)
- Access rules (who can see what)
- Compliance rules (what must be preserved, retained, or restricted)
- Integrity rules (what must never be inconsistent)

### 6. Identify state machines

What entities have a lifecycle with distinct states?

For each state machine:
- What entity
- What states
- What transitions are allowed
- What triggers each transition
- What is validated before each transition
- What happens after each transition
- What states are terminal

### 7. Identify edge cases and exceptional flows

What happens when:
- A payment fails?
- A user is banned?
- Data is missing?
- A third-party service is down?
- A race condition occurs?
- A user tries to do something they should not?
- The same action is performed twice?

### 8. Identify domain boundaries

Where does one domain end and another begin?

- What data belongs to what subsystem?
- What cross-domain interactions exist?
- What integrations cross boundaries?
- What should NOT cross boundaries?

---

## Reasoning Questions

The agent must be able to answer these before implementing business logic changes:

- WHO performs this action?
- WHAT does the action do?
- WHY does it exist?
- WHEN does it run?
- UNDER WHAT CONDITIONS?
- WHAT CAN CHANGE?
- WHAT MUST NEVER CHANGE?
- WHO OWNS THE DATA?
- WHO CAN PERFORM THE ACTION?
- WHAT HAPPENS WHEN IT FAILS?
- WHAT IS THE WORST CASE?
- WHAT IS THE COST OF BEING WRONG?

---

## Output

### business-model.md

```
Business Model
==============
What this project does: [description]
Value proposition: [what value is created]
Revenue model: [how money flows, or "not applicable"]
Pricing: [how pricing works, or "not applicable"]
Single source of truth for pricing: [location or "MISSING"]
Core entities: [list]
Actors: [list with brief description]
```

### actors.md

```
Actors
======
[For each actor:]
- Name: [actor name]
- Type: [user | admin | system | third-party | ...]
- Can do: [actions]
- Can see: [data]
- Cannot do: [restricted actions]
- Authentication: [how this actor is authenticated]
```

### business-rules.md

```
Business Rules
==============
[For each rule:]
ID: [BR-001]
Category: [authorization | validation | pricing | state | access | compliance | integrity]
Rule: [description]
Condition: [when it applies]
Outcome: [what happens]
Exception: [exceptions]
Invariant: [what must never happen]
Source: [where this rule is implemented or documented]
```

### workflows.md

```
Workflows
=========
[For each workflow:]
Name: [workflow name]
Actor: [who initiates]
Steps:
  1. [step description]
     - Data changes: [what changes]
     - Failures: [what happens on failure]
  2. ...
End state: [final state]
Error handling: [how errors are handled]
```

### state-machines.md

```
State Machines
==============
[For each state machine:]
Entity: [entity name]
States: [list]
Transitions:
  [state A] → [state B]: [trigger], [validation], [side effects]
  ...
Terminal states: [list]
```
