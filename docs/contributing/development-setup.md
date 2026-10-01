# Contributing & Development Setup

Thank you for contributing to AIPanel! This guide helps you set up a local development environment to work on the AIPanel core repository.

---

## Architecture Layout

AIPanel is built with:
- **Desktop Shell**: Tauri v2 + Rust (`src-tauri/`)
- **Frontend IDE UI**: React 19 + TypeScript + Vite + Tailwind CSS (`src/`)
- **Communication Layer**: Strongly typed Tauri IPC commands and event streaming

---

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/botdigit/aipanel.git
   cd aipanel
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Verify Rust toolchain**:
   ```bash
   cd src-tauri
   cargo check
   cd ..
   ```

4. **Run Vite frontend only (browser preview)**:
   ```bash
   npm run dev
   ```

5. **Run native desktop app in development mode**:
   ```bash
   npm run tauri dev
   ```

---

## Coding Standards

- **TypeScript**: Strict type checking enabled (`strict: true`, `noUnusedLocals: true`).
- **Rust**: Format with `cargo fmt` and check lints with `cargo clippy`.
- **Git Commits**: Use Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`).
- **Core License**: All contributions to this repository fall under the **Apache-2.0** license.
