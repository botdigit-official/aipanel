#!/usr/bin/env bash
# ==============================================================================
# 🚀 AIPanel — Fast 1-Click Server & VPS Installer
# curl -fsSL https://raw.githubusercontent.com/botdigit-official/aipanel/develop/install.sh | sudo bash
# ==============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
if [[ -f "${SCRIPT_DIR}/scripts/install.sh" ]]; then
    exec bash "${SCRIPT_DIR}/scripts/install.sh" "$@"
fi

# Fallback: if downloaded standalone via curl
TMP_INSTALLER="/tmp/aipanel_install_$$.sh"
curl -fsSL "https://raw.githubusercontent.com/botdigit-official/aipanel/develop/scripts/install.sh" -o "$TMP_INSTALLER"
chmod +x "$TMP_INSTALLER"
exec bash "$TMP_INSTALLER" "$@"
