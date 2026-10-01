# 🚀 AIPanel

<div align="center">

**The Unified AI Developer IDE & VPS Server Management Platform**

*Code locally in Desktop IDE mode. Manage fleets in VPS Server Mode. An open-core, developer-first alternative to aaPanel & cPanel.*

[![Release](https://img.shields.io/badge/version-v0.1.0-6366f1.svg?style=for-the-badge)](https://github.com/botdigit-official/aipanel)
[![License](https://img.shields.io/badge/license-MIT%20%2F%20Commercial-emerald.svg?style=for-the-badge)](LICENSE)
[![Desktop](https://img.shields.io/badge/desktop-macOS%20%7C%20Linux%20%7C%20Windows-sky.svg?style=for-the-badge)](https://github.com/botdigit-official/aipanel)
[![Server](https://img.shields.io/badge/server-Ubuntu%20%7C%20Debian%20%7C%20RHEL-amber.svg?style=for-the-badge)](https://github.com/botdigit-official/aipanel)

</div>

---

## 🌟 What is AIPanel?

**AIPanel** is a unified, local-first platform that merges two traditionally separated worlds:
1. **The Modern AI Development Environment** (like VS Code / Cursor with intelligent agents, BYOK AI, containerized local dev stacks, and tunnels).
2. **The Modern VPS Control Plane** (like aaPanel / Coolify / RunCloud with realtime server telemetry, app fleet orchestration, Caddy TLS reverse proxy, Docker daemon management, automated backups, and hosting client management).

Instead of running separate software for coding, server management, and deployment pipelines, **AIPanel runs the same unified codebase in two operating modes**:

```
                                     AIPANEL
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
    🖥️ DESKTOP MODE                                           🌐 SERVER MODE
  (Local Application)                                      (VPS Cloud Dashboard)
           │                                                         │
  • Full Native IDE & Editor                                • Real-time Host Telemetry
  • BYOK AI Multi-Provider Engine                            (CPU, RAM DDR5, NVMe, Net I/O)
  • Local Container Dev Stacks                              • Hosted Applications Fleet
  • Zero Trust Cloudflare Tunnels                           • Caddy Reverse Proxy & TLS 1.3
  • Git Cockpit & Pre-Flight Doctor                         • Docker Daemon & Stacks
  • 1-Click Atomic Server Deployment                        • PostgreSQL / Redis Daemons
  • Remote Server Agent Connection                          • Multi-tenant Hosting & Reseller
```

---

## ⚡ Core Features

### 1. Dual Operating Modes + Hybrid Remote Connect
- **Desktop Mode**: Installed on macOS, Windows, or Linux via Tauri v2. Works 100% offline, local-first with filesystem-backed project workspaces.
- **Server Mode**: Installed on any cloud VPS (Ubuntu, Debian, AlmaLinux). Accessed via browser over HTTPS (`:9876`), providing an aaPanel-style dashboard.
- **Connect to Existing Server**: Desktop client connects securely over mTLS to remote VPS instances running the AIPanel Go daemon.

### 2. Modern Server Fleet & Telemetry Dashboard
- Real-time 6-card host telemetry: CPU load with per-core gauges, RAM DDR5 utilization, NVMe storage pool, 10Gbps Network I/O, SSL certificate status, and automated backup health.
- Applications Fleet Manager: status monitors, instant start/stop, domain bindings, upstream port routing, and live logs.
- Infrastructure Stacks: Caddy HTTP/3 reverse proxy, Docker daemon container supervisor, and PostgreSQL/Redis database cockpit.

### 3. Centralized Control Center & Modular Plugins
- **Decoupled Architecture**: Development views remain uncluttered; auxiliary tools are loaded on-demand via the Control Center.
- **Plugin Marketplace**:
  - Hosting Operations & Reseller Package Provisioning
  - Client CRM & Invoicing
  - Domain & SSL Expiry Notification Cascades (90, 60, 30, 14, 7, 3, 1 day)
  - Cloudflare Zero Trust Tunnels & DNS Automation
  - Encrypted S3 / Cloudflare R2 Backups
  - Email Management (Mailcow / Postfix / Dovecot)
- **Declared Security Permissions**: Every plugin declares explicit capability masks before installation.

### 4. Bring Your Own Key (BYOK) AI Engine
- First-class support for **Anthropic Claude 3.7**, **OpenAI GPT-4o**, **Google Gemini 2.5 / 3.0**, **DeepSeek**, **Groq**, and **Local Ollama**.
- Keys are encrypted locally at rest in hardware keyrings; never transmitted to third-party telemetry servers.
- Context-aware code assistance, architecture analysis, deployment doctor checks, and automated unit test generation.

### 5. Production Protection Safe Mode
- Strict visual and behavioral gating when switched to the **Production** environment.
- Destructive actions (dropping database schemas, container termination, live reverts) require explicit multi-step confirmation.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AIPANEL FRONTEND                                │
│       React 19 + TypeScript + Tailwind CSS v4 + Plus Jakarta Sans      │
└───────────────────▲────────────────────────────────▲───────────────────┘
                    │                                │
    (Desktop: Tauri IPC Bridge)            (Server: REST & WebSocket)
                    │                                │
┌───────────────────▼─────────────┐   ┌──────────────▼───────────────────┐
│     TAURI v2 / RUST CORE        │   │       AIPANEL GO AGENT           │
│  • Native OS file access        │   │  • gopsutil telemetry engine     │
│  • PTY Terminal subsystem       │   │  • Unix socket Docker controller │
│  • Local secure keystore        │   │  • Caddy in-memory config reloader│
│  • Process daemon controller    │   │  • Atomic symlink zero-downtime  │
└─────────────────────────────────┘   └──────────────────────────────────┘
```

---

## 🚀 Quick Start

### A. Run Desktop Application (Local Development)

#### Prerequisites
- **Node.js**: v20 or higher
- **Rust**: 1.80+ (optional, required for compiling native desktop binary)
- **npm** or **pnpm**

```bash
# 1. Clone the repository
git clone git@github.com:botdigit-official/aipanel.git
cd aipanel

# 2. Install dependencies
npm install

# 3. Launch in Web Development Mode
npm run dev

# 4. Or launch as Native Desktop Application (Tauri)
npm run tauri dev
```

The desktop app runs locally on `http://localhost:1420`.

---

### B. Install on VPS Server (Server Mode)

Install the lightweight, single-binary AIPanel Server Agent on your cloud VPS (Ubuntu 22.04 / 24.04, Debian 12):

```bash
curl -fsSL https://get.aipanel.dev/install.sh | sudo bash
```

Once installed, access your Server Web Control Panel at:
```
https://<YOUR_VPS_IP>:9876
```

Your initial admin authorization key will be stored securely in:
```
/etc/aipanel/admin_token.key
```

---

## 🧩 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite 8 |
| **Design System** | Tailwind CSS v4, Plus Jakarta Sans, Inter, JetBrains Mono |
| **Icons & Visuals** | Lucide React |
| **Desktop Runtime** | Tauri v2 (Rust backend, macOS / Windows / Linux) |
| **Server Agent** | Go 1.22 (gopsutil, Docker SDK, systemd) |
| **Web Server / Proxy** | Caddy v2.8 (Automated TLS 1.3, HTTP/3, Zero-Downtime Reloads) |
| **Databases** | PostgreSQL 16, Redis 7.2 |

---

## 📁 Repository Structure

```
aipanel/
├── agent-go/               # High-performance Go VPS Server Agent
│   ├── go.mod
│   └── main.go             # Realtime telemetry & Docker daemon listener
├── scripts/
│   └── install-server.sh   # 1-click curl | bash server provisioning script
├── src/
│   ├── components/
│   │   ├── ai/             # BYOK AI Panel & Prompt Assistant
│   │   ├── control-center/ # Plugins, Marketplace, Security & Audit Hub
│   │   ├── deploy/         # Atomic Deployment & Rollback Cockpit
│   │   ├── editor/         # Code Editor & Monaco buffer views
│   │   ├── hosting/        # Hosting Plans & Client CRM
│   │   ├── layout/         # TopBar, Progressive Sidebar, Mode Selector
│   │   ├── panels/         # Services, Database, Domains, Monitoring
│   │   └── server/         # aaPanel-style VPS Server Dashboard
│   ├── lib/
│   │   ├── plugins.ts      # Default Plugin Registry
│   │   ├── tauri.ts        # IPC bridge & native bindings
│   │   └── types.ts        # Core TypeScript domain models
│   └── styles/
│       └── globals.css     # Obsidian dark design tokens
├── src-tauri/              # Native Tauri v2 Rust project
├── package.json
└── README.md
```

---

## 🔒 Security & Safe Mode

AIPanel is engineered for production safety:
- **Production Safe Mode**: In the production environment, all mutating actions (migrations, drops, restarts) require verification.
- **Air-Gapped Keys**: API keys for external models (Anthropic, OpenAI, Gemini) remain in the local hardware keystore and never pass through AIPanel cloud servers.
- **Immutable Release Paths**: Releases are stored in `/opt/aipanel/releases/<version>`, with symlink swapping for instant `< 500ms` zero-downtime rollbacks.

---

## 🤝 Contributing & License

Contributions are welcome! Please feel free to submit pull requests, report issues, or suggest new plugins.

Licensed under the **MIT License**. Created with ❤️ by **BotDigit**.
