# 09-Performance Skill

**Version:** 1.0.0
**Compatible:** project_skills >= 1.0
**Requires:** discovery, project-context, architecture
**Outputs:** performance.md, performance-findings.md

---

## Purpose

Review the project's performance characteristics and identify bottlenecks, inefficiencies, and risks. Performance only matters where it matters — do not optimize prematurely, but do not ignore real problems.

---

## Process

### 1. Identify performance requirements

- What is the expected load?
- What are the response time expectations?
- What is the cost of being slow? (user experience, money, infrastructure)
- Are there SLAs or SLOs?
- If unknown, record "not specified" — do not assume.

### 2. Identify potential bottlenecks

- Database queries (N+1, missing indexes, slow queries, unbounded result sets)
- External API calls (latency, rate limits, failure handling)
- File operations (size, frequency, storage backend)
- Computation (expensive operations, unbounded loops, missing caching)
- Memory usage (leaks, large allocations, unbounded growth)
- Network (chatty interfaces, large payloads, missing compression)
- Concurrency (blocking operations, thread pool exhaustion, lock contention)
- Startup time (if relevant — serverless cold start, CLI tool)
- Background jobs (queue backlog, job duration, retry storms)

### 3. Assess caching

- What is cached?
- What cache layer is used?
- Is cache invalidation correct?
- What happens on cache failure?
- Are there stampedes or thundering herd risks?

### 4. Assess data access patterns

- How is the database accessed?
- Are queries efficient?
- Are indexes present where needed?
- Are transactions used correctly?
- Is N+1 a problem?
- Are large queries paginated?

### 5. Assess scalability

- What happens when load increases?
- Are there single points of failure?
- Can components scale independently?
- Are there resource limits?
- What is the current ceiling? (if detectable)

### 6. Assess cost of performance

- Will optimizing this actually matter at the project's scale?
- Is the optimization worth the complexity it adds?
- Is there a simpler fix (index, query change, caching) before a major refactor?

---

## Output

### performance.md

```
Performance
===========
Requirements: [specified | not specified]
Expected load: [description or "unknown"]
Bottlenecks identified: [list]
Caching: [assessment]
Data access: [assessment]
Scalability: [assessment]
```

### performance-findings.md

```
Performance Findings
====================
[Finding ID]: [description]
Severity: [critical | high | medium | low]
Impact: [what it causes]
Recommendation: [what to do]
Evidence: [query, trace, observation]
```
