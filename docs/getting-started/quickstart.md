# Quickstart Guide

Get your first project up, running locally, and deployed in less than 5 minutes.

---

## 1. Launch AIPanel

Open the AIPanel application or run:

```bash
aipanel
```

You will be greeted by the Welcome Dashboard.

---

## 2. Open or Create a Project

- **Open Existing Project**: Click **"Open Folder"** or press `Cmd+O` / `Ctrl+O`. Select any web project (e.g. Next.js, Laravel, FastAPI, Axum, Go).
- **Create New Project**: Click **"New Project"** and select a template:
  - `laravel-nextjs` (Laravel 13 API + Next.js frontend + PostgreSQL + Redis)
  - `nextjs` (App Router + Tailwind)
  - `fastapi` (Python backend + SQLite/Postgres)
  - `rust-axum` (High-performance Rust web service)

---

## 3. Automatic Detection

AIPanel scans your repository root and automatically detects:
- **Framework & Runtime**: Node.js, PHP, Python, Rust, Go, etc.
- **Required Services**: PostgreSQL, MySQL, Redis, Queues
- **Entry Points & Scripts**: dev commands, build scripts, migrations
- **Docker Compose Profiles**: If `docker-compose.yml` or `Dockerfile` exists

AIPanel generates a `aipanel.toml` configuration file automatically.

---

## 4. Start Local Development

Click **"Start Development"** or run:

```bash
aipanel dev
```

AIPanel will:
1. Start required infrastructure containers (e.g. PostgreSQL on `:5432`, Redis on `:6379`).
2. Launch your application servers with hot reloading.
3. Start worker processes and schedulers.
4. (Optional) Expose a public preview URL via Cloudflare Tunnel:
   ```
   https://my-app-preview.botdigit.site
   ```

---

## 5. Deploy to Production

When ready to ship:
1. Switch environment dropdown in the top bar to **PRODUCTION**.
2. Run pre-flight health checks via **Deployment Doctor**.
3. Click **"Deploy to Production"** or run:
   ```bash
   aipanel deploy production
   ```
4. AIPanel runs immutable blue-green deployment with automated zero-downtime traffic switching and instant rollback on health check failure.
