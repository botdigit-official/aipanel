#!/usr/bin/env bash
# AIPanel Server Agent Bootstrap & Installer
# Usage: curl -fsSL https://get.aipanel.io | bash

set -e

echo "══════════════════════════════════════════════════════════════"
echo "  AIPanel Server Agent Installer"
echo "  Target Host: $(hostname)"
echo "══════════════════════════════════════════════════════════════"

# 1. Check Root
if [ "$EUID" -ne 0 ]; then
  echo "Error: Please run as root or with sudo"
  exit 1
fi

# 2. Setup Directories
echo "==> Creating /opt/aipanel directory hierarchy..."
mkdir -p /opt/aipanel/releases
mkdir -p /opt/aipanel/shared/storage
mkdir -p /opt/aipanel/shared/logs
mkdir -p /opt/aipanel/agent
mkdir -p /etc/aipanel

# 3. Install Prerequisite: Caddy Reverse Proxy
if ! command -v caddy &> /dev/null; then
  echo "==> Installing Caddy reverse proxy..."
  apt-get update -y && apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y && apt-get install -y caddy
fi

# 4. Install Prerequisite: Docker Engine
if ! command -v docker &> /dev/null; then
  echo "==> Installing Docker Engine..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
fi

# 5. Place AIPanel Agent Binary
if [ -f "./aipanel-agent" ]; then
  cp ./aipanel-agent /opt/aipanel/agent/aipanel-agent
  chmod +x /opt/aipanel/agent/aipanel-agent
fi

# 6. Configure Systemd Service
cat << 'EOF' > /etc/systemd/system/aipanel-agent.service
[Unit]
Description=AIPanel Remote Server Agent Daemon
After=network.target docker.service caddy.service
Requires=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/aipanel
ExecStart=/opt/aipanel/agent/aipanel-agent
Restart=always
RestartSec=5s
LimitNOFILE=65535
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable aipanel-agent

# 7. Configure Firewall
if command -v ufw &> /dev/null; then
  echo "==> Configuring firewall rules (80, 443, 9876)..."
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw allow 9876/tcp comment 'AIPanel Agent mTLS'
fi

echo "══════════════════════════════════════════════════════════════"
echo "  ✓ AIPanel Server Agent successfully configured!"
echo "  Agent port: 9876 (mTLS encrypted)"
echo "  Deployment root: /opt/aipanel"
echo "══════════════════════════════════════════════════════════════"
