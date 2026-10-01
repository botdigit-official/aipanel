# 📋 AIPanel — Master Roadmap, Shipped Features & Contributor Backlog

> **Current Milestone**: v0.1.0-beta  
> **Repository Model**: Open-Core (MIT Core, Apache-2.0 Agent, Commercial Cloud)  
> **Status**: In Active Development  
> **Contributing Guide**: See [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 🚦 High-Level Status Summary

| System Domain | Status | Operational Capability |
| :--- | :---: | :--- |
| **Desktop IDE Shell & Code Editor** | 🟢 Complete | Native Tauri v2 window, Auto-Save, Debounced Disk Sync, Monaco/Textarea buffer, Search & Replace |
| **Autonomous AI Development Engine**| 🟢 Complete | Zero-click Auto-Apply, AST Smart Target Resolver, BYOK Multi-Model Hub (Gemini, DeepSeek, Claude, Ollama) |
| **Visual Diff & Changes History** | 🟢 Complete | Line-by-line diff viewer, immutable snapshot history, 1-click revert/undo with disk rollback |
| **Workspace Governance & Nav** | 🟢 Complete | In-App Directory Navigator, Canonical folder scaffolding, First-Run Wizard, Clean Project Ideation |
| **Environment Engine & Tunnels** | 🟢 Complete | Dev/Staging/Production mode isolation, Cloudflare & ngrok tunnels, Port governance (41000–41799) |
| **Git Cockpit & Source Control** | 🟢 Complete | Staging/unstaging, visual diffs, branch management, commit timeline, immutable version tags |
| **VPS Server Agent & Telemetry** | 🟢 Complete | Go 1.22 daemon, real-time host telemetry (CPU/RAM/NVMe/Net), 1-click zero-prompt curl installer |
| **Database Studio & Services** | 🟢 Complete | SQLite, PostgreSQL, Redis local managers, live logs, background workers supervisor |
| **cPanel / aaPanel Migration Hub** | 🟡 In Progress | Basic vHost exporter exists; full automated `.tar.gz` parser pending |
| **Plugin Ecosystem Expansion** | 🟡 In Progress | Core CRM, Domains, Hosting, Tunnels active; WordPress & PM2 pending |

---

## ✅ What We Have Shipped (Completed Features)

### 1. 🖥️ Desktop IDE & Autonomous Editor
- [x] **Autonomous Auto-Save**: Debounced (800ms) automatic disk sync via `writeFile`; no manual `⌘S` required.
- [x] **Autonomous AI Auto-Apply**: Generates code and automatically applies to target editor file without manual clicking.
- [x] **Smart AST Target Resolver (`src/lib/codeResolver.ts`)**: Content-aware detection prevents overwriting mismatched files (e.g. routing `package.json` to `package.json`, `TASK.md` to `TASK.md`, `schema.sql` to `schema.sql`).
- [x] **Line-by-Line Visual Diff Viewer (`EditorPanel.tsx`)**: Real-time diff comparison with green additions and red deletions.
- [x] **Changes History & Undo Snapshots**: Persistent session history with 1-click revert that automatically restores disk contents.
- [x] **Find & Replace (`⌘F`)**: Match highlighting, next/previous occurrence jumping, replace current, and replace all.

### 2. 🤖 Multi-Provider AI Assistant Engine (`src/components/ai/AIPanel.tsx`, `src/lib/ai.ts`)
- [x] **BYOK Multi-Model Selector**:
  - Google Gemini 2.0 Flash (Free)
  - Kilo Code / OpenRouter Free (DeepSeek R1 Free, Llama 3.3 70B Free)
  - Local Ollama (`qwen2.5-coder`, `llama3.2`) with auto-discovery and tag switcher
  - Groq LPU (500 tokens/sec high-speed)
  - Anthropic Claude 3.7 Sonnet / Extended Thinking, Claude 3.5 Sonnet
  - OpenAI GPT-4o, GPT-4o Mini, o3-mini
- [x] **Project-Isolated Multi-Thread Sessions**: Persistent session management with rename, delete, and token counters.
- [x] **Context Awareness**: Captures active file buffer, git branch, modified files count, and service architecture.

### 3. 📁 Workspace Governance & Setup Onboarding
- [x] **In-App Directory Navigator (`DirectoryPickerModal.tsx`)**: Replaces browser file dialogs with native breadcrumbs and folder navigation.
- [x] **Canonical Workspace Scaffolding**: Automatically creates standard folders (`Projects/`, `Live/`, `Staging/`, `Static/`, `Infrastructure/`, `Backups/`) and `WORKSPACE.md`.
- [x] **First-Time Installation Wizard (`FirstRunWizardModal.tsx`)**: Guides users through prerequisite CLI tools (`node`, `git`, `docker`, `ollama`), workspace paths, and AI keys.
- [x] **Clean Project (AI Ideation) Blueprint**: Create fresh idea-driven projects that scaffold `README.md`, `TASK.md`, `TODO.md`, `ARCHITECTURE.md`, `.agents/skills`, and AI ideation threads.

### 4. 🌐 VPS Server Fleet & aaPanel-Style Dashboard
- [x] **Host Telemetry Gauges**: Real-time CPU, RAM DDR5, NVMe, and Network I/O metrics.
- [x] **Intelligent 1-Click Server Auto-Installer (`install.sh`)**: Zero-prompt hardware audit, swapfile creation on <2GB RAM, firewall whitelisting, aaPanel-grade random security entrance, and CLI helper (`aipanel status`, `aipanel restart`).
- [x] **Standalone Server Agent Daemon (`agent-go/`)**: High-performance Go telemetry engine.

---

## 🚀 What We Need More (Pending Backlog & Roadmap)

Contributors and AI Agents can pick any of the following items to build. Each item includes the suggested implementation path!

### 🟢 Good First Issues (Beginner Friendly)
- [ ] **Shortcut Palette Trigger (`src/components/layout/TopBar.tsx`)**:
  - Add quick keyboard modal overlay showing all hotkeys (`⌘S`, `⌘F`, `⌘B`, `⌘K`, `⌘P`).
- [ ] **Editor Word Wrap & Font Size Controls (`src/components/editor/EditorPanel.tsx`)**:
  - Add quick dropdown in the editor toolbar to toggle word wrap and adjust editor font size (11px, 12px, 13px, 14px, 16px).
- [ ] **Syntax Grammars for Additional Languages (`src/components/editor/EditorPanel.tsx`)**:
  - Add syntax keyword highlighting tokens for PHP, Ruby, Dart, Go, and Shell scripts in `highlightLine()`.
- [ ] **AI Model Latency Benchmark Badge (`src/components/ai/AIPanel.tsx`)**:
  - Display actual response time (e.g. `⚡ 420ms`) under each assistant message.

---

### 🟡 Core Features (Intermediate)
- [ ] **Live Token Streaming (`src/components/ai/AIPanel.tsx`, `src/lib/ai.ts`)**:
  - Upgrade LLM callers from batch completion to server-sent events (SSE) streaming so tokens render letter-by-letter in real time.
- [ ] **Multi-File Atomic AI Modifications (`src/stores/editor.ts`, `src/lib/codeResolver.ts`)**:
  - Support AI responses that output multiple code blocks with file headers (e.g. `### file: src/App.tsx` and `### file: src/index.css`), applying and saving all files atomically with a unified diff preview.
- [ ] **WordPress 1-Click App Plugin (`src/components/control-center/`)**:
  - Implement WordPress container installer plugin with automated wp-config.php generation, MySQL database pairing, and Redis Object Cache toggle.
- [ ] **Node.js PM2 Process Manager Plugin (`src/components/panels/ServicesPanel.tsx`)**:
  - Add visual table displaying active PM2 processes, uptime, memory, restart count, and live log tail.
- [ ] **Database CSV/JSON Exporter (`src/components/panels/DatabasePanel.tsx`)**:
  - Add 1-click table data export to CSV and JSON formats in the Database Studio.

---

### 🔴 Systems & Infrastructure (Advanced)
- [ ] **cPanel / aaPanel Full Migration Parser (`src/components/modals/CPanelExportModal.tsx`, `agent-go/`)**:
  - Build an automated `.tar.gz` cPanel backup extractor that parses `userdata`, moves document roots, migrates MySQL `.sql` dumps, and auto-generates Caddy reverse proxy virtual hosts.
- [ ] **Let's Encrypt Wildcard DNS-01 Challenge (`agent-go/`, `src/components/panels/DomainsPanel.tsx`)**:
  - Integrate Cloudflare and Route53 API token authentication for automated issuance of wildcard SSL certificates (`*.yourdomain.com`).
- [ ] **PTY Terminal Subsystem with xterm.js (`src/components/panels/BottomPanel.tsx`)**:
  - Replace static command prompt with a true interactive pseudo-terminal supporting full interactive CLI utilities (`top`, `htop`, `vim`, `nano`).
- [ ] **Automated Blue-Green Deployment Symlink Swapping (`agent-go/`, `src/components/deploy/DeployPanel.tsx`)**:
  - Wire automated zero-downtime traffic cutover: spin up candidate on standby port, verify HTTP 200, swap `/opt/aipanel/live` symlink in <500ms, and gracefully drain old process.

---

## 🤖 Guide for LLMs & AI Coding Agents

When working on tasks in this repository:
1. Always check [CONTRIBUTING.md](CONTRIBUTING.md) for architectural rules.
2. Read the file path mentioned in the task before making changes.
3. Make atomic, focused edits preserving existing comments and TypeScript types.
4. Run `npm run build` to confirm 0 compilation errors.
5. Record your changes in [CHANGELOG.md](CHANGELOG.md) under `## [Unreleased]`.
