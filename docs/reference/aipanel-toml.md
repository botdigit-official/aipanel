# aipanel.toml Reference

`aipanel.toml` is the configuration manifest placed at the root of every AIPanel-managed project.

---

## Example Configuration

```toml
[project]
name = "marketplace"
framework = "laravel-nextjs"
version = "1.0.0"

[runtime]
strategy = "docker" # "docker" | "native"

[services]
postgres = { image = "postgres:16-alpine", port = 5432, env = ["POSTGRES_DB=app", "POSTGRES_PASSWORD=secret"] }
redis = { image = "redis:7-alpine", port = 6379 }

[dev]
command = "npm run dev"
port = 3000
tunnel = "cloudflare"

[workers]
queue = { command = "php artisan queue:work", count = 2 }
scheduler = { command = "php artisan schedule:work" }

[build]
command = "npm run build"
output = "dist"

[deploy]
target = "vps"
domain = "marketplace.botdigit.site"
strategy = "blue-green"
health_check = "/health"
timeout_seconds = 60

[environments.staging]
domain = "staging.marketplace.botdigit.site"
branch = "develop"

[environments.production]
domain = "marketplace.botdigit.site"
branch = "main"
approval_required = true
```

---

## Top-Level Sections

### `[project]`
- `name` *(string, required)*: The name of the project.
- `framework` *(string, optional)*: Detected framework (`nextjs`, `laravel`, `fastapi`, `axum`, etc.).
- `version` *(string, optional)*: Project version.

### `[runtime]`
- `strategy` *(string, required)*: Either `docker` or `native`. Controls how local dev and production builds are packaged.

### `[services]`
Map of containerized or local services needed during development and deployment:
- `image`: Docker image tag.
- `port`: Local port mapping.
- `env`: Environment variable overrides.

### `[workers]`
Background workers and processes managed by AIPanel:
- `command`: Execution command.
- `count`: Number of worker replicas to run.

### `[deploy]`
- `target`: Deployment target type (`vps`, `local-server`, `cluster`).
- `domain`: Public domain routed via Caddy reverse proxy.
- `strategy`: Deployment strategy (`blue-green`, `rolling`, `recreate`).
- `health_check`: HTTP health endpoint to verify before switching live traffic.
- `timeout_seconds`: Max duration for health checks before triggering automatic rollback.
