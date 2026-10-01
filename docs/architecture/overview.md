# System Architecture Overview

AIPanel is designed as a **local-first AI development + deployment IDE/OS**. It bridges developer local workflows directly to remote server environments without relying on third-party SaaS middle-layers or compromising system safety.

---

## 1. High-Level System Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                           DEVELOPER MACHINE                            │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                 AIPanel Desktop App (Tauri v2)                 │   │
│   │                                                                │   │
│   │   ┌────────────────────────────────────────────────────────┐   │   │
│   │   │           Frontend (React 19 + TypeScript + Vite)      │   │   │
│   │   │   • Code Editor Tabs       • Project Explorer          │   │   │
│   │   │   • Integrated Terminal    • AI Assistant Panel        │   │   │
│   │   │   • Services / Workers     • Deployment Control Plane  │   │   │
│   │   │   • Environment Switcher   • Database Query Studio     │   │   │
│   │   └───────────────────────────┬────────────────────────────┘   │   │
│   │                               │                                │   │
│   │                        Tauri IPC / Events                      │   │
│   │                               │                                │   │
│   │   ┌───────────────────────────┴────────────────────────────┐   │   │
│   │   │                  Rust Core Engine                      │   │   │
│   │   │   • FS & Project Detection • Process / PTY Manager     │   │   │
│   │   │   • Local Docker API       • Secret Vault (AES-GCM)    │   │   │
│   │   │   • SSH & SCP Client       • Cloudflare Tunnel Driver  │   │   │
│   │   └────────────────────────────────────────────────────────┘   │   │
│   └────────────────────────────────┬───────────────────────────────┘   │
│                                    │                                   │
│                        Local Dev Processes / Docker                    │
│                                    │                                   │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │
                 Encrypted SSH / mTLS Protocol (Port 9876)
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                          REMOTE LINUX SERVER                           │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │               AIPanel Agent (Rust Server Daemon)               │   │
│   │   • Process Orchestrator       • Health Check Cascade          │   │
│   │   • Zero-Downtime Swapper      • Metric Collector (CPU/RAM/IO) │   │
│   │   • Reverse Proxy Manager      • Encrypted Secrets Store       │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│   ┌───────────────────────────────┴────────────────────────────────┐   │
│   │                      Managed Infrastructure                    │   │
│   │   • Caddy Reverse Proxy (Auto-SSL via Let's Encrypt)           │   │
│   │   • Docker Containers (Postgres, Redis, App replicas)          │   │
│   │   • Native Systemd Services & Symlinked Releases               │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Subsystems

### A. Desktop Shell (Tauri v2 + Rust)
- **Zero Overhead**: Unlike Electron, Tauri uses OS-native webviews (WebKit on macOS, WebView2 on Windows, WebKitGTK on Linux), consuming ~40MB idle RAM vs 300MB+ for Electron.
- **Native System Integration**: Direct access to local filesystem, terminal PTY multiplexing, raw TCP/SSH sockets, and hardware security modules.

### B. Frontend Presentation (React 19 + TypeScript + Tailwind CSS)
- **Monaco & Syntax Rendering**: Virtualized syntax rendering and code editing.
- **State Engine**: Context-driven reactivity managing project detection, open tabs, active terminal sessions, service states, and real-time logs.
- **Dynamic Chrome**: Color-coded UI framing that responds to active environments (DEV = calm neutral/green, STAGING = warning amber, PRODUCTION = high-contrast red).

### C. Server Agent (Standalone Rust Daemon)
- **Single Static Binary**: Compiled for Linux (`x86_64` and `aarch64`).
- **Resource Footprint**: Consumes `< 15MB` RAM, 0% idle CPU.
- **Responsibilities**:
  - Accepts atomic deployment instructions over authenticated mTLS.
  - Manages release directory rotations (`/opt/aipanel/releases/<version>`).
  - Executes database migrations in isolated transaction wrappers.
  - Performs health checks prior to cutting live reverse proxy traffic.
  - Streams server metrics (CPU, RAM, disk, network) and process logs back to desktop.

### D. Communication Protocol
- **Local Desktop**: Tauri IPC invokes Rust functions asynchronously; Rust pushes real-time process logs via Tauri events.
- **Desktop to Server**: Primary control via SSH for bootstrapping and updates; real-time telemetry and streaming deployment logs via authenticated HTTPS/WebSocket to Agent (port 9876).
