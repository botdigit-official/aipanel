import { create } from "zustand";

// ── Types ────────────────────────────────────────────────────────

type ActivePanel =
  | "dashboard"
  | "explorer"
  | "control-center"
  | "hosting"
  | "clients"
  | "servers"
  | "releases"
  | "rollbacks"
  | "doctor"
  | "docker"
  | "workers"
  | "git"
  | "versions"
  | "monitoring"
  | "settings"
  | "database"
  | "tunnels"
  | "billing"
  | "domains"
  | "doc-agent"
  | "terminal";

interface UIState {
  // Sidebar & panels
  sidebarCollapsed: boolean;
  activePanel: ActivePanel;
  bottomExpanded: boolean;
  showAI: boolean;
  showDevOpsDock: boolean;

  // Modals
  showCommandPalette: boolean;
  showWorkspaceSwitcher: boolean;
  showFreeAIModal: boolean;
  showModeModal: boolean;
  showLocalServerModal: boolean;
  showGuideModal: boolean;

  // Resizable dimensions (persisted)
  explorerWidth: number;
  aiWidth: number;
  bottomHeight: number;

  // Actions — layout
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setActivePanel: (panel: ActivePanel) => void;
  setBottomExpanded: (expanded: boolean) => void;
  toggleBottom: () => void;
  setShowAI: (show: boolean) => void;
  toggleAI: () => void;
  setShowDevOpsDock: (show: boolean) => void;
  toggleDevOpsDock: () => void;

  // Actions — modals
  setShowCommandPalette: (show: boolean) => void;
  toggleCommandPalette: () => void;
  setShowWorkspaceSwitcher: (show: boolean) => void;
  setShowFreeAIModal: (show: boolean) => void;
  setShowModeModal: (show: boolean) => void;
  setShowLocalServerModal: (show: boolean) => void;
  setShowGuideModal: (show: boolean) => void;

  // Actions — resize
  resizeExplorer: (delta: number) => void;
  resetExplorerWidth: () => void;
  resizeAI: (delta: number) => void;
  resetAIWidth: () => void;
  setBottomHeight: (height: number) => void;
  resetBottomHeight: () => void;
}

// ── Persisted dimension helpers ──────────────────────────────────

function loadDimension(key: string, min: number, max: number, fallback: number): number {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const val = parseInt(saved, 10);
      if (!isNaN(val) && val >= min && val <= max) return val;
    }
  } catch {}
  return fallback;
}

function loadBoolean(key: string, fallback: boolean): boolean {
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) return saved === "true";
  } catch {}
  return fallback;
}

function saveDimension(key: string, value: number): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {}
}

// ── Store ────────────────────────────────────────────────────────

export const useUIStore = create<UIState>((set) => ({
  // Layout
  sidebarCollapsed: false,
  activePanel: "dashboard",
  bottomExpanded: false,
  showAI: loadBoolean("aipanel_show_ai", true),
  showDevOpsDock: false,

  // Modals
  showCommandPalette: false,
  showWorkspaceSwitcher: false,
  showFreeAIModal: false,
  showModeModal: false,
  showLocalServerModal: false,
  showGuideModal: false,

  // Dimensions (persisted)
  explorerWidth: loadDimension("aipanel_explorer_width", 180, 600, 288),
  aiWidth: loadDimension("aipanel_ai_width", 260, 700, 340),
  bottomHeight: loadDimension("aipanel_bottom_height", 120, 600, 224),

  // Layout actions
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setBottomExpanded: (expanded) => set({ bottomExpanded: expanded }),
  toggleBottom: () => set((s) => ({ bottomExpanded: !s.bottomExpanded })),
  setShowAI: (show) => {
    localStorage.setItem("aipanel_show_ai", String(show));
    set({ showAI: show });
  },
  toggleAI: () =>
    set((s) => {
      const next = !s.showAI;
      localStorage.setItem("aipanel_show_ai", String(next));
      return { showAI: next };
    }),
  setShowDevOpsDock: (show) => set({ showDevOpsDock: show }),
  toggleDevOpsDock: () => set((s) => ({ showDevOpsDock: !s.showDevOpsDock })),

  // Modal actions
  setShowCommandPalette: (show) => set({ showCommandPalette: show }),
  toggleCommandPalette: () => set((s) => ({ showCommandPalette: !s.showCommandPalette })),
  setShowWorkspaceSwitcher: (show) => set({ showWorkspaceSwitcher: show }),
  setShowFreeAIModal: (show) => set({ showFreeAIModal: show }),
  setShowModeModal: (show) => set({ showModeModal: show }),
  setShowLocalServerModal: (show) => set({ showLocalServerModal: show }),
  setShowGuideModal: (show) => set({ showGuideModal: show }),

  // Resize actions
  resizeExplorer: (delta) =>
    set((s) => {
      const next = Math.max(180, Math.min(600, s.explorerWidth + delta));
      saveDimension("aipanel_explorer_width", next);
      return { explorerWidth: next };
    }),
  resetExplorerWidth: () => {
    saveDimension("aipanel_explorer_width", 288);
    set({ explorerWidth: 288 });
  },
  resizeAI: (delta) =>
    set((s) => {
      const next = Math.max(260, Math.min(700, s.aiWidth - delta));
      saveDimension("aipanel_ai_width", next);
      return { aiWidth: next };
    }),
  resetAIWidth: () => {
    saveDimension("aipanel_ai_width", 340);
    set({ aiWidth: 340 });
  },
  setBottomHeight: (height) => {
    saveDimension("aipanel_bottom_height", height);
    set({ bottomHeight: height });
  },
  resetBottomHeight: () => {
    saveDimension("aipanel_bottom_height", 224);
    set({ bottomHeight: 224 });
  },
}));
