# CLI Command Reference

AIPanel provides a full-featured CLI companion (`aipanel`) that mirrors all operations available inside the desktop GUI.

---

## Global Options

```bash
aipanel --version       # Show current version
aipanel --help          # Show help information
aipanel --env=<target>  # Specify target environment (dev, staging, production)
```

---

## Project Commands

### `aipanel init`
Initializes AIPanel in the current directory, runs project framework detection, and generates `aipanel.toml`.

```bash
aipanel init
```

### `aipanel dev`
Starts local development environment, services, workers, and optional tunnel.

```bash
aipanel dev
aipanel dev --services=postgres,redis
aipanel dev --no-tunnel
```

### `aipanel build`
Builds release artifact or container image according to the configured runtime strategy.

```bash
aipanel build
```

---

## Server & Infrastructure Commands

### `aipanel server add`
Connects a remote Linux server via SSH and installs the AIPanel agent.

```bash
aipanel server add --host <ip_or_domain> --user root --ssh-key ~/.ssh/id_ed25519
```

### `aipanel server list`
Lists all registered servers and their real-time status.

```bash
aipanel server list
```

---

## Deployment Commands

### `aipanel deploy`
Deploys the current project version to target environment.

```bash
aipanel deploy staging
aipanel deploy production
```

### `aipanel rollback`
Instantly reverts traffic to the previous healthy release.

```bash
aipanel rollback production
```

### `aipanel doctor`
Runs the pre-flight verification checks on project configuration, build integrity, and environment status.

```bash
aipanel doctor
```

---

## Tunnel Commands

### `aipanel tunnel start`
Exposes a local port to a public HTTPS URL.

```bash
aipanel tunnel start --port 3000 --provider cloudflare
```

### `aipanel tunnel stop`
Stops the active tunnel.

```bash
aipanel tunnel stop
```
