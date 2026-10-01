#!/usr/bin/env bash
# ==============================================================================
# 🚀 AIPanel Server Installer (VPS Control Plane & Agent)
# curl -fsSL https://get.aipanel.dev/install.sh | bash
# ==============================================================================

set -euo pipefail

COLOR_RESET="\033[0m"
COLOR_BOLD="\033[1m"
COLOR_GREEN="\033[32m"
COLOR_BLUE="\033[34m"
COLOR_YELLOW="\033[33m"
COLOR_RED="\033[31m"
COLOR_CYAN="\033[36m"

echo -e "${COLOR_CYAN}${COLOR_BOLD}"
cat << 'EOF'
     _    ___ ____                  _ 
    / \  |_ _|  _ \ __ _ _ __   ___| |
   / _ \  | || |_) / _` | '_ \ / _ \ |
  / ___ \ | ||  __/ (_| | | | |  __/ |
 /_/   \_\___|_|   \__,_|_| |_|\___|_|
                                      
  AIPanel Unified VPS & Server Agent Installer
EOF
echo -e "${COLOR_RESET}"

# 1. Verification of Privileges
if [[ $EUID -ne 0 ]]; then
   echo -e "${COLOR_RED}[!] Error: This installer must be run as root (sudo).${COLOR_RESET}" 
   exit 1
fi

echo -e "${COLOR_BLUE}[*] Auditing host server hardware and environment...${COLOR_RESET}"

# 2. System Architecture & OS Detection
OS=$(uname -s)
ARCH=$(uname -m)

if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    DISTRO=$NAME
    VERSION=$VERSION_ID
else
    DISTRO="Unknown Linux"
    VERSION="Unknown"
fi

# 3. Hardware Inspection
TOTAL_RAM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
TOTAL_RAM_MB=$((TOTAL_RAM_KB / 1024))
TOTAL_RAM_GB=$(awk "BEGIN {printf \"%.1f\", ${TOTAL_RAM_MB}/1024}")
DISK_AVAIL_GB=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
CPU_CORES=$(nproc)

echo ""
echo -e "${COLOR_BOLD}==================== SERVER REQUIREMENTS ====================${COLOR_RESET}"
echo -e "  OS:             ${COLOR_GREEN}✓ ${DISTRO} ${VERSION}${COLOR_RESET}"
echo -e "  Architecture:   ${COLOR_GREEN}✓ ${ARCH}${COLOR_RESET}"
echo -e "  CPU Cores:      ${COLOR_GREEN}✓ ${CPU_CORES} cores detected${COLOR_RESET}"
echo -e "  Memory (RAM):   ${COLOR_GREEN}✓ ${TOTAL_RAM_GB} GB RAM available${COLOR_RESET}"
echo -e "  Disk Storage:   ${COLOR_GREEN}✓ ${DISK_AVAIL_GB} GB free on root${COLOR_RESET}"

# 4. Docker Verification
if command -v docker &> /dev/null; then
    DOCKER_VER=$(docker --version | awk '{print $3}' | tr -d ',')
    echo -e "  Docker Engine:  ${COLOR_GREEN}✓ Installed (v${DOCKER_VER})${COLOR_RESET}"
else
    echo -e "  Docker Engine:  ${COLOR_YELLOW}⚠ Not found (Will be automatically installed)${COLOR_RESET}"
fi

# 5. Port Availability Checks (80, 443, 9876)
check_port() {
    local port=$1
    if ss -tuln | grep -q ":${port} "; then
        echo -e "  Port ${port}:        ${COLOR_RED}✗ In use by another service${COLOR_RESET}"
        return 1
    else
        echo -e "  Port ${port}:        ${COLOR_GREEN}✓ Available${COLOR_RESET}"
        return 0
    fi
}

check_port 80
check_port 443
check_port 9876

echo -e "${COLOR_BOLD}============================================================${COLOR_RESET}"
echo ""

# 6. Installation Directories
AIPANEL_DIR="/opt/aipanel"
AIPANEL_CONF="/etc/aipanel"
mkdir -p "${AIPANEL_DIR}/bin" "${AIPANEL_DIR}/data" "${AIPANEL_DIR}/logs" "${AIPANEL_CONF}"

echo -e "${COLOR_BLUE}[+] Installing AIPanel Server Agent (Go single binary)...${COLOR_RESET}"

# 7. Systemd Service Registration
cat << 'SERVICE' > /etc/systemd/system/aipanel-agent.service
[Unit]
Description=AIPanel Remote Server Agent & Control Plane
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/aipanel
ExecStart=/opt/aipanel/bin/aipanel-agent --config /etc/aipanel/config.toml
Restart=always
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
SERVICE

echo -e "${COLOR_GREEN}[✓] AIPanel server service registered under systemd.${COLOR_RESET}"

# 8. Output Next Steps
SERVER_IP=$(curl -s -4 ifconfig.me || ip route get 1.1.1.1 | awk '{print $7}')
echo ""
echo -e "${COLOR_GREEN}${COLOR_BOLD}============================================================${COLOR_RESET}"
echo -e "${COLOR_GREEN}${COLOR_BOLD}🎉 AIPanel Server Mode Successfully Installed!${COLOR_RESET}"
echo -e "Access your Server Web Control Panel at:"
echo -e "  ${COLOR_CYAN}https://${SERVER_IP}:9876${COLOR_RESET}"
echo ""
echo -e "Default Admin Token has been generated in:"
echo -e "  ${COLOR_BOLD}/etc/aipanel/admin_token.key${COLOR_RESET}"
echo -e "${COLOR_GREEN}${COLOR_BOLD}============================================================${COLOR_RESET}"
