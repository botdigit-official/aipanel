# Contributing to AIPanel 🤝

Thank you for your interest in contributing to **AIPanel**! Whether you are a **human developer** or an **autonomous AI coding agent** (Cursor, Claude, Devin, Antigravity, Copilot), this guide will help you understand the architecture, setup your environment, and submit high-impact contributions quickly.

---

## 🌟 Vision & Architecture

AIPanel is an open-core, unified platform merging the **Modern AI Development IDE** (desktop local-first) and the **VPS Server Management Control Plane** (cloud fleet management).

### Tech Stack Breakdown
| Component | Technology | Primary Directory |
|---|---|---|
| **Frontend UI** | React 19, TypeScript, Vite 8 | `src/` |
| **Design System** | Tailwind CSS v4, Plus Jakarta Sans, JetBrains Mono | `src/design-system/`, `src/styles/` |
| **State Management**| Zustand stores (no prop drilling) | `src/stores/` (`editor.ts`, `workspace.ts`, `ui.ts`, etc.) |
| **Desktop Runtime** | Tauri v2 (Rust IPC bridge) | `src-tauri/` |
| **Server Daemon** | Go 1.22 (`gopsutil`, Docker SDK, systemd) | `agent-go/` |
| **CLI Companion** | Rust | `cli/` |
| **Reverse Proxy** | Caddy v2.8 (Automated TLS 1.3, HTTP/3) | Server agent integration |

---

## ⚡ Quick Start (Setup in 3 Minutes)

### Prerequisites
* **Node.js**: v20 or higher
* **npm** or **pnpm**
* **Rust**: 1.80+ (optional, only needed for compiling native desktop or Tauri binaries)

```bash
# 1. Fork the repo on GitHub, then clone your fork:
git clone git@github.com:<your-username>/aipanel.git
cd aipanel

# 2. Check out develop branch
git checkout develop

# 3. Create your semantic feature branch
git checkout -b feat/your-feature-name

# 4. Install dependencies
npm install

# 5. Launch in Web Development Mode (fastest for UI/AI work)
npm run dev

# 6. Or launch as Native Desktop Application (Tauri v2)
npm run tauri dev
```

The application runs locally on `http://localhost:1420`.

### 🌐 No Collaborator Invite Needed: The Fork & PR Model
External contributors do **not** need to be manually invited as collaborators to contribute:
1. **Fork** `botdigit-official/aipanel` to your GitHub account.
2. Push your feature branch to **your own fork**.
3. Open a **Pull Request (PR)** against `botdigit-official/aipanel` targeting the `develop` branch.
4. Our automated GitHub Actions CI runs `npm test` and `npm run build` on your PR automatically, and maintainers merge it upon review!

---

## 🤖 Instructions for AI Coding Agents & LLMs

If you are an AI assistant helping a developer on this repository, strictly adhere to these operating principles:

1. **State Management**: Use Zustand stores in `src/stores/`. Avoid prop drilling across more than 2 components.
2. **Design System**: Respect dark theme surface tokens in `src/design-system/` and `src/styles/globals.css`. Never introduce generic bright colors or inline ad-hoc CSS.
3. **Autonomous Auto-Save**: Always ensure new editor features honor `useEditorStore.getState().autoSave`.
4. **Smart File Routing**: When adding code generation features, register appropriate file mappings in `src/lib/codeResolver.ts`.
5. **No Secrets**: Never commit `.env` or sensitive API keys.

---

## 🎯 How to Pick a Task (Roadmap & Good First Issues)

Check our active [TODO.md](TODO.md) for the complete backlog. Here are high-impact areas open for contribution:

### 🟢 Good First Issues (Beginner Friendly)
* **Model Presets**: Add quick presets for newly released open-source models in `src/components/ai/AIPanel.tsx`.
* **Keyboard Shortcuts**: Expand shortcut bindings (`⌘K` command palette, `⌘B` sidebar toggle, `⌘P` file finder).
* **Syntax Highlighting**: Add keyword grammars for additional languages (Go, PHP, Ruby, Dart) in `EditorPanel.tsx`.
* **UI Micro-Animations**: Polish subtle transitions on modals and status indicators.

### 🟡 Core Features (Intermediate)
* **Live Token Streaming**: Stream AI tokens directly into editor textarea with animated blinking cursor.
* **Plugin Expansion**: Implement community plugins in `src/components/control-center/` (e.g. WordPress 1-Click Installer, PM2 Manager).
* **Multi-File Diffs**: Enable the AI Assistant to stream multi-file modifications with tabbed diff review.
* **Database Studio Exporters**: Add CSV / JSON data export to `DatabasePanel.tsx`.

### 🔴 Systems & Infrastructure (Advanced)
* **cPanel / aaPanel Importer**: Write a parser in `agent-go/` or `src-tauri/` to extract `.tar.gz` cPanel backups and configure Caddy virtual hosts automatically.
* **Wildcard Let's Encrypt DNS-01**: Support Cloudflare / AWS Route53 API token automated DNS challenge verification.
* **PTY Terminal Subsystem**: Wire full pseudoterminal multiplexer with xterm.js in `src/components/panels/BottomPanel.tsx`.

---

## 📐 Git Workflow & Contribution Rules

### 1. Semantic Branching Rules
* **DO NOT** push directly to `main` or `develop`.
* **ALWAYS** branch off `develop` using semantic naming:
  * `feat/<feature-name>` (e.g. `feat/wordpress-plugin`)
  * `fix/<bug-name>` (e.g. `fix/editor-cursor-scroll`)
  * `chore/<task-name>` (e.g. `chore/upgrade-tailwind`)

### 2. Pre-Commit Verification
Before opening a Pull Request, verify that your code compiles cleanly:
```bash
npm run build
```
Ensure 0 TypeScript errors and 0 lint failures.

### 3. Living Documentation Sync
Every PR that touches functionality must update:
* [CHANGELOG.md](CHANGELOG.md) under `## [Unreleased]` describing what was added, changed, or fixed.
* [TASK.md](TASK.md) checking off completed items.
* Relevant documentation in `docs/` if modifying APIs, architectures, or settings.

---

## 💬 Community & Support

* **Issues & Bug Reports**: Submit an issue on [GitHub Issues](https://github.com/botdigit-official/aipanel/issues).
* **Feature Discussions**: Join discussions on [GitHub Discussions](https://github.com/botdigit-official/aipanel/discussions).
* **Security Advisories**: Email `security@botdigit.com` for vulnerability disclosures.

Thank you for helping make AIPanel the best open developer IDE & VPS control plane! 🚀
