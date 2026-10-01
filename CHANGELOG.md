# Changelog

All notable changes to the AIPanel platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Intelligent 1-Click Server Auto-Installer (`scripts/install.sh`, `install.sh`)**:
  - Zero-prompt, non-interactive installation process tailored for VPS and dedicated cloud servers.
  - Automatic host audit: OS distribution, CPU cores, architecture, RAM, and disk storage.
  - Intelligent hardware auto-tuning:
    - Auto-provisions 2GB swap space and sets `vm.swappiness=15` for low-memory VPS (<2GB RAM) to eliminate OOM container crashes.
    - Balanced container concurrency profile for Standard Cloud VPS (2GB–8GB RAM).
    - Unlocks high-concurrency network backlogs (`somaxconn`, `tcp_max_syn_backlog`) for High-Performance Dedicated Fleet (>8GB RAM).
  - Automated dependency provisioning (Docker Engine, Caddy reverse proxy, `curl`, `jq`, `net-tools`).
  - Intelligent port allocation: verifies port 9876 availability and auto-probes fallback ports if busy.
  - Automated firewall whitelisting for `ufw`, `firewalld`, and `iptables` without user intervention.
  - aaPanel-grade security entrance generator (e.g. `/aipanel_xxxx`), high-entropy passwords, and token vault stored in `/etc/aipanel/credentials.txt` (`chmod 600`).
  - Master Server CLI utility (`/usr/local/bin/aipanel`) with `info`, `status`, `restart`, `logs`, and `reset-password` commands.
  - Formatted completion banner displaying public/LAN access URLs, credentials, and profile summary.
- **Permanent Design System & UI/UX Professionalization**:
  - Authored `/docs/UI_UX_STANDARD.md` establishing design principles, layered dark palette, typography scale, spacing grid, and accessibility standards.
  - Implemented centralized design system in `src/design-system/`:
    - Layered surfaces (`#08090D`, `#0C0D12`, `#0B0C11`, `#11131A`, `#161923`, `#1B1E28`), 4px grid spacing, typography tokens, border radii, and shadows.
    - Standardized components: `Button`, `IconButton`, `Badge` (status/env/type), `StatusIndicator`, `Card`, `Input`, `Dialog`, `EmptyState`, `Skeleton`, `DangerConfirmDialog`.
  - Rebuilt progressive disclosure `Sidebar.tsx`:
    - Structured into WORKSPACE, DEVELOPMENT, DELIVERY, INFRASTRUCTURE, CLIENTS, CONTROL.
    - Persistent collapse/expand group memory via `localStorage`.
    - Standardized 240px expanded vs 64px collapsed icon rail with consistent 16px Lucide icons.
  - Redesigned `TopBar.tsx`:
    - Clean visual hierarchy with brand, project badge, environment dropdown, centered ⌘K search bar, and action-oriented `[ Deploy ▾ ]` split button.
    - Production Safe Mode gating modal requiring typed confirmation for live cluster operations.
  - Built unified Command Palette (`CommandPalette.tsx`) with global `⌘K` / `Ctrl+K` shortcut, search indexing, and full keyboard navigation.
  - Replaced oversized empty welcome screen with high-density developer dashboard in `WelcomePage.tsx`:
    - Contextual greeting, real Recent Projects cards with framework badges and 1-click open.
    - System Capabilities status-oriented telemetry grid (Environment, AI, Source Control, Server Fleet).
    - Quick Action navigation to Code Editor, AI Agent, Git, and Servers.
  - Refactored `StatusBar.tsx` into structured interactive status items with popover triggers for environment, git, and individual services.
- **Documentation**:
  - Updated `README.md` and `docs/getting-started/installation.md` with VPS installation instructions and post-install CLI guide.

### Fixed
- **Surface Contrast & Visual Containment**:
  - Replaced flat low-contrast card backgrounds (`#11131A`) with distinct elevated surfaces (`#121624` and `#171b2b`) and visible borders (`#23293d` / `#2a324b`) with top edge shine rings, eliminating the "floating text on black void" problem.
- **Viewport Layout & Bottom Void Elimination**:
  - Expanded `WelcomePage.tsx` with a full-width bottom section featuring a real-time **Infrastructure Mesh & Port Governance** grid (ports :5432, :6379, :80/:443, :1420) and a **Quick DevOps Pipeline** action bar, filling the 1080p/Retina viewport naturally.
- **Sidebar Progressive Disclosure Defaults**:
  - Configured default collapse state so only core IDE sections (WORKSPACE and DEVELOPMENT) are open on load, while DELIVERY, INFRASTRUCTURE, CLIENTS, and CONTROL are collapsed by default to avoid the 20-item admin menu clutter.
  - Added auto-expansion whenever an active route lives within a collapsed group.
- **Editor Locking & Navigation Bug**:
  - Fixed condition in `src/App.tsx` where `!projectPath` forced the app to always render the Welcome dashboard when clicking "Code" (`activePanel === "explorer"`).
  - Configured current workspace path `/Volumes/Mac2TB/Botdigit/Developer/Projects/aipanel` as the active project, and automatically opens the file tree and `README.md` in Monaco upon clicking "Code".
- **Permanent Badge, Sidebar & Card Spacing Overhaul**:
  - Expanded Sidebar width to standard 288px (`w-72`) with `px-3 py-3.5` container padding and `px-3.5 py-2.5` item padding, giving labels and badges ample horizontal space.
  - Added `mr-1` to sidebar badges and accordion chevrons, securing a full 30px buffer from the sidebar right border so nothing touches the edge.
  - Overhauled core `Badge.tsx` design tokens with `px-2.5 py-1 text-[10.5px] leading-tight tracking-wide rounded-md`, permanently preventing text from hitting the borders across all badges.
  - Upgraded starter template cards in `WelcomePage.tsx` to `p-5 space-y-3` with generous `w-8 h-8` icon containers and breathable `px-2.5 py-1` language tags (e.g. `TypeScript`).
  - Upgraded Local Dev Daemons, AI Gateway, and modal template badges with `px-2.5 py-1 rounded-md`.

