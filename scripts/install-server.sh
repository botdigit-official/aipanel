#!/usr/bin/env bash
# ==============================================================================
# AIPanel Server Installer Proxy
# Delegates to the unified intelligent installer at scripts/install.sh
# ==============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
exec bash "${SCRIPT_DIR}/install.sh" "$@"
