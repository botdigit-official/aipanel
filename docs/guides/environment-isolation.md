# Environment Isolation Guide

AIPanel enforces strict isolation across development, staging, and production environments to protect production integrity.

---

## The Isolation Matrix

| Capability | DEV (Local) | STAGING | PRODUCTION |
| :--- | :--- | :--- | :--- |
| **Code Execution** | Unrestricted local hot-reload | Deployed branch / image | Immutable verified release |
| **Database Access** | Local container / SQLite | Dedicated staging instance | Production DB (read-only queries via audit log) |
| **Secrets Access** | Local `.env` & DEV Vault | STAGING Vault | Remote agent injection only |
| **Network Path** | Localhost & dev Docker network | Staging VPC / subnet | Isolated production network |
| **Destructive Actions** | Allowed | Allowed with warning | Blocked without explicit approval gate |

---

## Secrets Architecture

Secrets in AIPanel are separated by environment and encrypted using **AES-256-GCM**:

1. **DEV Vault**:
   - Master key derived from the local developer machine's hardware ID.
   - Decrypted only in memory during local dev sessions.

2. **STAGING Vault**:
   - Key managed on the staging server agent.
   - Injected into running processes as environment variables.

3. **PRODUCTION Vault**:
   - Sealed on the remote production server.
   - Local IDE never holds raw production secrets; it only can trigger authorized deployment operations.

---

## Production Protection Mode

When switching the IDE view to **PRODUCTION**:
- The IDE header and border turn high-contrast red.
- Direct code execution, destructive database operations, and ad-hoc file editing are disabled.
- Any deployment request initiates the **Deployment Doctor** pre-flight checklist.
