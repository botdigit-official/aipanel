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
- **Documentation**:
  - Updated `README.md` and `docs/getting-started/installation.md` with VPS installation instructions and post-install CLI guide.
