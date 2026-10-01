# Installation Guide

AIPanel provides multiple installation methods depending on your operating system and preferred workflow.

---

## Quick Install

### macOS (Recommended)

Install via Homebrew:

```bash
brew tap botdigit/aipanel
brew install aipanel
```

Or download the native Apple Silicon (`aarch64`) or Intel (`x86_64`) `.dmg` directly from the [Releases](https://github.com/botdigit/aipanel/releases) page.

### Linux

Download the AppImage or install the Debian package:

```bash
# AppImage
curl -LO https://github.com/botdigit/aipanel/releases/latest/download/aipanel-x86_64.AppImage
chmod +x aipanel-x86_64.AppImage
./aipanel-x86_64.AppImage

# Debian / Ubuntu (.deb)
curl -LO https://github.com/botdigit/aipanel/releases/latest/download/aipanel_amd64.deb
sudo dpkg -i aipanel_amd64.deb
```

### CLI Companion Only

If you only want the headless command-line interface:

```bash
cargo install aipanel-cli
```

---

## Build from Source

### Prerequisites

Ensure you have installed:
- **Rust & Cargo** (v1.80+): `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- **Node.js** (v20+): `brew install node` or via `nvm`
- **Docker** (optional, recommended for database and container services)

### Build Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/botdigit/aipanel.git
   cd aipanel
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run tauri dev
   ```

4. Build release bundle:
   ```bash
   npm run tauri build
   ```

The compiled native binary will be located in `src-tauri/target/release/bundle/`.
