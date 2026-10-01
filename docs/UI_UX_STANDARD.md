# AIPanel — Master UI/UX Design System Standard

This document establishes the permanent visual, behavioral, and architectural guidelines for AIPanel. All present and future components, layouts, and views must adhere to this standard.

---

## 1. Core Design Principles

1. **Developer-First & Technical**: Designed for engineers and sysadmins who value clarity, density, high information throughput, and zero visual clutter.
2. **Dense but Readable**: No oversized decorative voids. Text elements maintain rigorous typography scale with line-height ratios that avoid clipped descenders or cramped text.
3. **Calm, Layered Dark Surfaces**: Instead of flat black, depth is achieved through layered matte dark surfaces with subtle border delineations (`rgba(255, 255, 255, 0.08)`).
4. **Restrained Accent Hierarchy**: Purple is the primary accent (active navigation, primary buttons, AI features, focus rings). It does NOT dominate every widget. Status states use functional colors (Green, Amber, Red, Blue).
5. **Progressive Disclosure**: High-frequency tools are accessible in 1 click; complex or secondary tools are tucked into clean collapsible drawers with memory.
6. **Keyboard-First Ergonomics**: Every primary workflow is navigable via keyboard shortcuts and the unified Command Center (`⌘K`).
7. **Production Safety First**: Destructive actions (dropping database schemas, deleting servers, live production deployments) always require multi-step explicit confirmation.

---

## 2. Layered Dark Surface Palette

| Token | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| `--bg-base` | `#08090D` | Canvas & Root Application Background |
| `--bg-sidebar` | `#0C0D12` | Navigation Sidebar Surface |
| `--bg-topbar` | `#0B0C11` | Header / Command Bar Surface |
| `--bg-surface` | `#11131A` | Cards, Panels & Workspace Buffers |
| `--bg-elevated` | `#161923` | Modals, Dropdowns, Tooltips & Floating Docks |
| `--bg-hover` | `#1B1E28` | Hover & Active Interaction State |
| `--border-subtle` | `rgba(255, 255, 255, 0.06)` | Secondary item dividers |
| `--border-default` | `rgba(255, 255, 255, 0.09)` | Standard container & card borders |
| `--border-active` | `rgba(139, 92, 246, 0.40)` | Active focus or selected border |

### Functional & Semantic Colors

| Semantic | Token / Hex | Purpose |
| :--- | :--- | :--- |
| **Primary** | `#8B5CF6` (Violet-500) | Brand accent, active tabs, primary actions, AI agent |
| **Success** | `#10B981` (Emerald-500) | Online status, healthy metrics, passing tests, active tunnels |
| **Warning** | `#F59E0B` (Amber-500) | Staging environment, high memory load, restart pending |
| **Danger** | `#EF4444` (Rose-500) | Production gates, failed deployments, error alerts, destructive ops |
| **Info** | `#3B82F6` (Blue-500) | Information banners, telemetry network metrics |
| **Neutral** | `#94A3B8` (Slate-400) | Metadata, secondary labels, icons |

---

## 3. Typography Hierarchy

Never apply ad-hoc pixel font sizes. Use standard typography tokens:

| Level | Size | Weight | Line Height | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `28px – 32px` | Bold (`700`) | `1.2` | Hero welcoming headers |
| **Page Title** | `20px – 24px` | SemiBold (`600`) | `1.3` | Section headings, modal titles |
| **Heading** | `16px – 18px` | SemiBold (`600`) | `1.4` | Card titles, group headers |
| **Section Label**| `11px – 12px` | Bold (`700`) | `1.4` | Uppercase tracked sidebar group headers |
| **Body** | `13px – 14px` | Normal (`400`) | `1.5` | Standard UI content, descriptions, inputs |
| **Secondary** | `12px – 13px` | Normal (`400`) | `1.5` | Supporting labels, table cells, hints |
| **Caption / Code**| `11px – 12px` | Medium (`500`) | `1.4` | Badges, timestamps, file paths, coordinates |

*Rule*: Never render interactive UI text below **11px**.

---

## 4. Spacing System

All paddings, margins, and layout gaps must derive from the 4-pixel grid:

| Token | Pixels | Application |
| :--- | :--- | :--- |
| `--space-1` | `4px` | Micro-spacing, badge padding, icon-to-label gap |
| `--space-2` | `8px` | Button padding vertical, list item spacing, form field gap |
| `--space-3` | `12px` | Card internal content gap, sidebar button padding |
| `--space-4` | `16px` | Standard container padding, modal header gap |
| `--space-5` | `20px` | Section separation inside cards |
| `--space-6` | `24px` | Page grid margins, dashboard widget gap |
| `--space-8` | `32px` | Major section vertical breathing room |
| `--space-10`| `40px` | Hero container vertical margin |
| `--space-12`| `48px` | Welcome screen header spacing |

---

## 5. Border Radius Standards

| Element | Radius Token | Value |
| :--- | :--- | :--- |
| Small tags, status dots, micro-badges | `rounded-sm` | `4px` – `6px` |
| Buttons, text inputs, dropdown triggers | `rounded-md` | `8px` |
| Cards, list item containers, code buffers | `rounded-lg` | `10px` – `12px` |
| Modals, floating drawers, command palette | `rounded-xl` | `14px` – `16px` |
| Large application shell borders | `rounded-2xl` | `16px` |

---

## 6. Iconography Standards

1. **Family**: Use **Lucide React** exclusively. Never mix with third-party or arbitrary SVG sets.
2. **Sizes**:
   - Navigation & Sidebar: `16px`
   - Buttons & Form controls: `14px` – `16px`
   - Card headers & Group indicators: `16px` – `18px`
   - Modal icons & Quick-start cards: `20px` – `24px`
3. **Intentionality**: Never place decorative icons without purpose. Every icon represents a tangible tool, action, or status.

---

## 7. Standardized Badge System

Badges belong strictly to three semantic categories:

### A. Status Badges (with pulsing/solid status dot)
- `● Active` (Emerald)
- `● Connected` (Sky)
- `● Running` (Cyan)
- `● Degraded` (Amber)
- `● Offline` (Slate)
- `🔒 Protected` (Rose)

### B. Environment Badges
- `DEV` (Indigo badge, dot indicator)
- `STAGING` (Amber badge, preview indicator)
- `PRODUCTION` (Rose badge, lock icon indicator)

### C. Feature & Type Badges
- `PRO`, `CORE`, `SSL`, `CRM`, `DOCKER`
- Clean monochrome Slate styling with subtle border: `bg-white/5 text-zinc-300 border border-white/10 text-[10px] font-semibold tracking-wider`

---

## 8. Navigation & Progressive Disclosure

### Progressive Sidebar
1. Width:
   - **Expanded**: `240px – 260px`
   - **Collapsed**: `64px – 72px` (Icon-only mode with tooltips)
2. Group Hierarchy:
   - **WORKSPACE**: Overview, Code, AI Agent, Source Control
   - **DEVELOPMENT**: Services, Database, Workers, Terminal
   - **DELIVERY**: Preview, Environments, Releases, Deployments
   - **INFRASTRUCTURE**: Servers, Domains & SSL, Monitoring, Backups
   - **CLIENTS**: Hosting, CRM
   - **CONTROL**: Control Center, Settings
3. Persistence: Group collapse/expand states are stored in `localStorage`.

---

## 9. Command Palette & Global Search (`⌘K`)

The Command Palette acts as the unified cockpit for AIPanel:
- Activated via `Cmd+K` (macOS) or `Ctrl+K` (Linux/Windows) or top search bar.
- Unified categories:
  - **Commands** (Dev, Build, Doctor, Tunnel, Deploy)
  - **Navigation** (Jump to Code, Database, Releases, Servers, Settings)
  - **Recent Projects** (1-click project switching)
  - **AI Actions** ("Explain architecture", "Audit security", "Generate test")
- Supports full keyboard traversal (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`).

---

## 10. Security & Destructive Action Safeguards

For any high-consequence operation:
- **Production Deployments**: Shows warning banner: *"Production is locked. Releases must pass pre-flight doctor checks."*
- **Drop Database / Delete Server**: Requires explicit typing confirmation or 2-step verification modal.
- **AI Tool Execution**: When AI intends to run shell commands or mutate configurations, AIPanel displays an **AI Action Approval Card**:
  - What the AI wants to execute
  - Target environment & server
  - Risk rating
  - `[ Deny ]` / `[ Approve & Execute ]`
