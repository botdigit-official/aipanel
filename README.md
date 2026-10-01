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

### 4. Autonomous Development Engine & Smart Code Editor
- **Autonomous Auto-Save (Default ON)**: Changes from both AI generation and user typing are saved automatically to disk (`writeFile`) with debounced synchronization, eliminating manual "Accept & Save" prompts.
- **Autonomous Auto-Apply (Gemini & Cursor Mode)**: AI-generated code automatically streams into target editor files with zero manual clicks required.
- **Smart Target File Resolution**: AST and syntax inspection ensures code routes automatically to `package.json`, `Cargo.toml`, `Dockerfile`, `schema.sql`, `TASK.md`, `ARCHITECTURE.md`, `src/App.tsx`, or `src/index.css` without overwriting mismatched active tabs.
- **Instant Revert & Visual Diff**: Real-time line-by-line visual diff comparison with 1-click revert to disk original or changes history snapshot restoration.

### 5. Bring Your Own Key (BYOK) Multi-Model AI Hub
- First-class support for **Google Gemini 2.0 Flash (Free)**, **Kilo Code / OpenRouter (DeepSeek R1 Free, Llama 3.3 70B Free)**, **Groq LPU (500 T/S)**, **Anthropic Claude 3.7 Sonnet**, **OpenAI GPT-4o / o3-mini**, and **Local Ollama** (`qwen2.5-coder`, `llama3.2`).
- Keys are encrypted locally at rest in hardware keyrings; never transmitted to third-party telemetry servers.
- Context-aware code assistance, architecture analysis, deployment doctor checks, and automated unit test generation.

### 6. In-App Directory Navigator & Workspace Governance
- Replaces generic browser upload dialogues with a native-feeling, in-app **Directory Navigator Modal** with BotDigit quick presets (`Projects/`, `Live/`, `Staging/`, `Static/`, `Infrastructure/`, `Backups/`).
- Automatic canonical workspace scaffolding when targeting new or empty directories.
- **First-Time Installation Onboarding Wizard**: Automated checklist for required system dependencies (`Node.js`, `Git`, `Docker`, `Ollama`), workspace storage locations, and AI provider selection.

### 7. Clean Project & AI-Guided Ideation Blueprint
- Start clean projects without forced templates. Describe your product vision upfront to automatically generate `README.md`, `TASK.md`, `TODO.md`, `ARCHITECTURE.md`, and `.agents/skills`.
- Seeds a dedicated AI Ideation thread comparing **Budget Lean Stack** vs **Enterprise Scalable Stack** with instant database schema recommendations.

### 8. Production Protection Safe Mode
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

### B. Install on VPS Server (Intelligent 1-Click Auto-Installer)

Install the lightweight, unified AIPanel Server Control Plane on any Linux cloud VPS (Ubuntu, Debian, CentOS, RHEL, AlmaLinux, Rocky Linux, Alpine):

```bash
curl -fsSL https://raw.githubusercontent.com/botdigit-official/aipanel/develop/install.sh | sudo bash
```
*or via wget:*
```bash
wget -O install.sh https://raw.githubusercontent.com/botdigit-official/aipanel/develop/install.sh && sudo bash install.sh
```

#### ⚡ What the Auto-Installer Does (Zero User Questions):
1. **Host Hardware & OS Audit**: Detects CPU cores, RAM size, root disk storage, and public/LAN IP addresses.
2. **Intelligent Hardware Auto-Tuning**:
   - **Low-Memory (<2GB RAM)**: Auto-creates a 2GB swapfile to prevent OOM errors, applies conservative kernel buffers.
   - **Standard Cloud VPS (2GB–8GB RAM)**: Configures balanced high-throughput container & proxy limits.
   - **High-Performance Fleet (>8GB RAM)**: Unlocks high-concurrency network backlogs and max worker queues.
3. **Automated Firewall Configuration**: Automatically detects and whitelists control port (`9876`), HTTP (`80`), and HTTPS (`443`) in `ufw`, `firewalld`, or `iptables`.
4. **aaPanel-Grade Security Credentials**: Generates a private security entrance (e.g. `/aipanel_a8f2`), random strong password, and auth token saved in `/etc/aipanel/credentials.txt`.
5. **Systemd Service & CLI Companion**: Registers `aipanel-agent.service` and installs the `/usr/local/bin/aipanel` management CLI tool.

#### 💡 Post-Install CLI Commands:
```bash
aipanel info            # Re-display panel URLs, username & password
aipanel status          # Check daemon health & telemetry
aipanel restart         # Restart control plane daemon
aipanel reset-password  # Instantly generate a new admin password
aipanel logs            # Stream real-time agent logs
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
│   │   ├── ai/             # Multi-Provider AI Panel & Prompt Assistant
│   │   ├── control-center/ # Plugins, Marketplace, Security & Audit Hub
│   │   ├── deploy/         # Atomic Deployment & Rollback Cockpit
│   │   ├── editor/         # Code Editor with Auto-Save, Diff & Revert
│   │   ├── git/            # Git Cockpit, Visual Diff & Commit Timeline
│   │   ├── hosting/        # Hosting Plans & Client CRM
│   │   ├── layout/         # TopBar, Progressive Sidebar, Mode Selector
│   │   ├── modals/         # DirectoryPicker, FirstRunWizard, ServerConverter
│   │   ├── panels/         # Services, Database, Domains, Monitoring, DocAgent
│   │   └── server/         # aaPanel-style VPS Server Dashboard
│   ├── design-system/      # Centralized UI tokens, components & palette
│   ├── lib/
│   │   ├── ai.ts           # Multi-provider LLM calling engine
│   │   ├── codeResolver.ts # Smart content-aware target file detector
│   │   ├── plugins.ts      # Default Plugin Registry
│   │   ├── tauri.ts        # IPC bridge, filesystem & native bindings
│   │   └── types.ts        # Core TypeScript domain models
│   ├── stores/             # Zustand state management (editor, workspace, ui)
│   └── styles/
│       └── globals.css     # Obsidian dark design tokens
├── src-tauri/              # Native Tauri v2 Rust project (macOS/Win/Linux)
├── docs/                   # Living specifications, UI/UX standard & guides
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
