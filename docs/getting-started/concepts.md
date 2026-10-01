# Core Concepts

AIPanel introduces a unified model for connecting development, versioning, and deployment without compromising safety.

---

## 1. The Core Golden Rule: DEV ≠ LIVE

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              DEV can NEVER accidentally modify LIVE         │
│                                                             │
│  This is not a UI guard. This is an ARCHITECTURAL RULE.     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

In traditional tools, a developer might accidentally execute a migration against a production database string or point a local server at live resources.

In AIPanel:
- **DEV**: Has full read/write access to local containers and local files. DEV cannot connect directly to production databases.
- **STAGING**: Managed environment that mirrors production architecture. Used for automated integration tests and QA previews.
- **PRODUCTION**: Read-only by default. Requires explicit confirmation gates, Deployment Doctor pre-flight checks, and immutable versioning. Production secrets are never accessible from local DEV code.

---

## 2. Environments as Isolated Worlds

Each environment has:
- **Dedicated Secrets Vault**: Encrypted using AES-256-GCM.
- **Independent Network Bridges**: Local docker network cannot bridge to remote VPCs.
- **Visual Chrome Indicator**:
  - Green / Neutral for DEV
  - Amber / Warning for STAGING
  - Red / High-Contrast Chrome for PRODUCTION

---

## 3. Deployment Strategies: Docker vs Native

AIPanel supports two first-class deployment workflows:

### A. Docker Strategy
- Packages the application into an immutable container image.
- Ideal for complex dependencies, multi-language stacks, or strict reproducibility.
- Zero-downtime container swap using Caddy reverse proxy.

### B. Native Strategy
- Runs directly on host runtimes (Node, PHP-FPM, Python, compiled Rust/Go binaries).
- Minimizes memory footprint and maximizes raw performance.
- Zero-downtime deployment via atomic symlink directory swapping (`current -> releases/v1.8.4`).

---

## 4. Immutable Releases & Instant Rollback

Every deployment creates an immutable version tag:
```
/opt/aipanel/releases/v1.8.3/
/opt/aipanel/releases/v1.8.4/   <-- current active symlink
```

If a health check fails (HTTP 500, unhandled exception, migration lock, worker crash), AIPanel automatically flips the traffic pointer back to the previous release in **under 500 milliseconds**.
