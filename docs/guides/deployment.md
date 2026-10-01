# Deployment Guide

Deploy your applications to any Linux VPS, dedicated server, or local server with zero downtime.

---

## 1. Add a Server

Connect a remote Linux server via SSH:

```bash
aipanel server add --host 198.51.100.24 --user root --ssh-key ~/.ssh/id_ed25519
```

AIPanel will:
1. Connect via SSH.
2. Detect OS (Ubuntu, Debian, Fedora, Rocky, Arch).
3. Cross-compile or install the lightweight **AIPanel Agent** (Rust daemon).
4. Configure Caddy reverse proxy for automated HTTPS (Let's Encrypt).
5. Prepare releases directory structure (`/opt/aipanel/releases`).

---

## 2. Pre-Flight Checks: Deployment Doctor

Before deploying to production, AIPanel's **Deployment Doctor** runs verification checks:
- **Build verification**: Ensures bundle compiles cleanly without warnings or type errors.
- **Test suite**: Runs unit and integration tests.
- **Database migrations**: Verifies pending migrations and checks for potential lock contention.
- **Secrets audit**: Validates that all required environment variables are set in the target vault.
- **Port conflicts**: Checks that required ports and reverse proxy domains are available.

---

## 3. The Deployment Flow

```
[Local IDE / CLI]
       │
       ▼ (Upload artifact / Trigger Git checkout)
[Server Agent]
       │
       ├─► 1. Extract to /opt/aipanel/releases/v1.8.4
       ├─► 2. Inject environment secrets
       ├─► 3. Run database migrations
       ├─► 4. Start new application containers or processes
       ├─► 5. Health Check Cascade:
       │      • HTTP ping /health → 200 OK
       │      • Database query check
       │      • Redis connection check
       │      • Background worker heartbeat
       │
  (Pass) ──────────┐            (Fail)
       │                        │
       ▼                        ▼
Atomic symlink swap        Instant Rollback to v1.8.3
Traffic switched via Caddy No downtime for live users
```

---

## 4. Rollbacks

If an unexpected runtime bug surfaces after deployment:

```bash
aipanel rollback production
```

Or click **"Rollback"** in the AIPanel UI. The previous release is activated instantly.
