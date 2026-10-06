# 07-Security Skill

**Version:** 1.0.0
**Compatible:** project_skills >= 1.0
**Requires:** discovery, project-context, business-architecture
**Outputs:** security.md, security-findings.md

---

## Purpose

Review the project's security posture. Security and data integrity come before features.

This skill is mandatory for projects that handle user data, payments, authentication, PII, or external integrations. It is optional for static sites and tools that do not handle sensitive data.

---

## Process

### 1. Identify the attack surface

- What endpoints or interfaces accept input?
- What data is collected, stored, or transmitted?
- What authentication and authorization exist?
- What third-party services are integrated?
- What data crosses trust boundaries?
- What is exposed to the internet?
- What is internal-only?

### 2. Review authentication

- How do users authenticate?
- Are credentials stored securely?
- Are sessions managed correctly?
- Is MFA available where it should be?
- Are password policies reasonable?
- Are there default or backdoor accounts?
- Is there an admin authentication path? Is it appropriately protected?

### 3. Review authorization

- Can users access data they do not own?
- Can users perform actions they should not?
- Are authorization checks on every endpoint, or only some?
- Is there privilege escalation risk?
- Are roles and permissions clearly defined?
- Can permissions be bypassed by changing parameters, IDs, or paths?

### 4. Review input handling

- Is all input validated?
- Is validation on the client sufficient? (it is not)
- Are SQL queries parameterized?
- Are queries using an ORM correctly (no raw SQL where avoidable)?
- Is output encoded for its context (HTML, JSON, SQL, shell)?
- Are file uploads handled safely?
- Are file types validated server-side?
- Are file sizes limited?

### 5. Review data protection

- Is sensitive data encrypted at rest?
- Is data encrypted in transit?
- Are secrets in code, config files, or env vars? (all are problems; env vars are the least bad)
- Are API keys and tokens exposed in client-side code?
- Is PII handled according to the project's obligations?
- Is data retention defined and implemented?
- Can data be deleted when required?

### 6. Review dependencies

- Are dependencies up to date?
- Are there known vulnerabilities in dependencies?
- Are unused dependencies removed?
- Are dependencies from trusted sources?
- Are lockfiles committed?

### 7. Review logging and monitoring

- Are security events logged?
- Are logs free of sensitive data?
- Is there alerting for suspicious activity?
- Can you detect a breach?

### 8. Review business logic security

Business logic vulnerabilities are not caught by generic scanners. Examine:
- Can pricing be manipulated?
- Can workflows be bypassed?
- Can state transitions be forced out of order?
- Can users affect data they should not?
- Are there race conditions in critical operations?
- Can features be accessed before they should be?
- Can free users access paid features?
- Can admin features be accessed by non-admins?

### 9. Review infrastructure security

If infrastructure is detectable:
- Are containers run as root?
- Are secrets in environment variables or mounted files?
- Are security groups / firewalls appropriate?
- Is TLS configured?
- Are backups encrypted?
- Are there unnecessary exposed ports or services?

---

## Severity Levels

| Severity | Meaning | Response |
|---|---|---|
| Critical | Active exploit possible; data breach or system compromise likely | Fix immediately; block release if unfixed |
| High | Significant risk; exploitation likely with some effort | Fix before next release; prioritize |
| Medium | Notable risk; exploitation possible but constrained | Fix in current or next sprint |
| Low | Minor issue; hard to exploit or low impact | Track and fix when convenient |
| Informational | Worth noting; not a vulnerability | Document |

---

## Output

### security.md

```
Security
========
Attack surface: [description]
Authentication: [mechanism, assessment]
Authorization: [mechanism, assessment]
Data protection: [assessment]
Dependencies: [assessment]
Logging: [assessment]
Infrastructure: [assessment if detectable]
Business logic security: [assessment]
```

### security-findings.md

```
Security Findings
=================
[Finding ID]: [description]
Severity: [critical | high | medium | low | informational]
Location: [where found]
Impact: [what can happen]
Recommendation: [what to do]
```

---

## Critical Rules

- Never hardcode secrets. Ever.
- Never trust client-side validation alone.
- Never skip authorization checks on any endpoint that touches sensitive data.
- Never store passwords in plaintext.
- Never expose internal errors to users.
- Never ignore known vulnerabilities in dependencies.
