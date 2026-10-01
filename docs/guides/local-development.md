# Local Development Guide

AIPanel turns your local development machine into an integrated development & deployment cockpit.

---

## Service Management

When you open a project, AIPanel detects services defined in `aipanel.toml` or `docker-compose.yml`:
- **Databases**: PostgreSQL, MySQL, Redis, MongoDB
- **Application Servers**: Next.js, Vite, Laravel Artisan, FastAPI, Django, Axum
- **Background Workers**: Laravel Horizon/Queue, Celery, BullMQ
- **Schedulers & Cron**: Cron simulators and system cron triggers

### Starting and Stopping Services

In the AIPanel IDE:
1. Open the **Bottom Panel** (`Cmd+J` or toggle bottom bar).
2. Click **"Services"** or **"Workers"**.
3. Toggle individual services or click **"Start All"**.

Or via CLI:
```bash
aipanel dev --services=postgres,redis
aipanel worker start queue
```

---

## Tunnels & Preview URLs

AIPanel includes native support for exposing local ports via secure tunnels:

### Cloudflare Tunnel (Recommended)
- Generates a persistent or ephemeral sub-domain (e.g., `https://my-app.botdigit.site`).
- Encrypted end-to-end with SSL.
- Useful for testing webhook callbacks (Stripe, GitHub, Twilio) and sharing progress with clients.

### Starting a Tunnel
```bash
aipanel tunnel start --port 3000 --provider cloudflare
```
Or click the **Globe / Tunnel icon** in the AIPanel TopBar.

---

## Local Database Management

AIPanel includes an embedded database viewer and client:
- View tables, schemas, and indices without external GUI tools.
- Execute SQL queries directly inside the IDE.
- **Database Cloning**: One-click clone of staging data to your local DEV database with automatic sanitization of sensitive user columns (emails, passwords, tokens).
