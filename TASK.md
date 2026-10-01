# Active Tasks — Intelligent Server Auto-Installer

- [x] Analyze server installer requirements & eliminate manual user prompts
- [x] Implement multi-distro hardware & OS detection (Ubuntu, Debian, RHEL, CentOS, Rocky, Alma, Alpine, macOS)
- [x] Implement intelligent auto-tuning:
  - [x] Auto-provision 2GB swap space for low-memory VPS (<2GB RAM)
  - [x] Configure sysctl swappiness & cache pressure
  - [x] Apply standard and high-performance server tuning profiles
- [x] Implement automated dependency installation (Docker Engine, Caddy, core tools)
- [x] Implement port probing & conflict avoidance for control port 9876
- [x] Implement zero-friction automated firewall setup (UFW, Firewalld, iptables)
- [x] Implement aaPanel-style security entrance, strong credentials & token generation
- [x] Implement `/usr/local/bin/aipanel` server management CLI companion
- [x] Implement aaPanel-style completion banner with external/LAN URLs and credentials
- [x] Provide 1-line root proxy installer `install.sh`
- [x] Update living documentation (`README.md`, `docs/getting-started/installation.md`)
- [x] Record changelog in `CHANGELOG.md`
