# Architecture: Security & Threat Model

AIPanel manages sensitive operations—including SSH keys, database credentials, server commands, and production deployments. Security is baked directly into the system architecture.

---

## 1. Threat Matrix & Countermeasures

| Threat Vector | Potential Impact | AIPanel Countermeasure |
| :--- | :--- | :--- |
| **Accidental Production Mutation** | Data loss / live downtime | Strict environment isolation, read-only defaults, explicit approval gates. |
| **Leaked Secrets in Git** | Credential compromise | Secret vaults encrypted via AES-256-GCM; `.env` never checked into git; pre-commit linting. |
| **Man-in-the-Middle (MITM)** | Hijacked server commands | Mutual TLS (mTLS) between desktop and agent; strict SSH host key validation. |
| **Malicious Project Repositories** | Remote Code Execution | Unsandboxed commands require explicit user consent; project detection runs in parser sandbox. |
| **Stolen Developer Laptop** | Production access leak | Local master keys derived with hardware-bound keys; production secrets never stored on client machine. |

---

## 2. Cryptographic Specifications

- **Symmetric Encryption**: AES-256-GCM authenticated encryption for all local and server-side secret vaults.
- **Key Derivation**: Argon2id for password-derived credentials with minimum memory limits (64MB) and multiple iterations.
- **Transport Security**: TLS 1.3 with forward secrecy for all external communications (mTLS for agent, HTTPS for provider APIs).

---

## 3. Server Agent Security Posture

The **AIPanel Agent** on the remote server follows the principle of least privilege:
- Runs as an unprivileged system daemon (`aipanel-agent`) where possible.
- Re-executes only validated operational scripts.
- Logs every command and deployment request into an append-only audit log:
  ```
  /opt/aipanel/shared/logs/audit.log
  ```
- Automatically drops untrusted incoming connections exceeding rate thresholds.
