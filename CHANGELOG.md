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
