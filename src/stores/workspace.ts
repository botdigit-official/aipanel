import { create } from "zustand";
import type { ProjectInfo } from "../lib/tauri";
import type { OperatingMode } from "../lib/types";

// ── Types ────────────────────────────────────────────────────────

export interface RecentProject {
  name: string;
  path: string;
  framework?: string;
  lastOpened?: string;
}

interface WorkspaceState {
  // Operating mode
  operatingMode: OperatingMode;
  setOperatingMode: (mode: OperatingMode) => void;

  // Project
  projectPath: string | null;
  projectInfo: ProjectInfo | null;
  showDetectionBanner: boolean;
  setProjectPath: (path: string | null) => void;
  setProjectInfo: (info: ProjectInfo | null) => void;
  setShowDetectionBanner: (show: boolean) => void;

  // Environment
  environment: "dev" | "staging" | "production";
  currentBranch: string;
  setEnvironment: (env: "dev" | "staging" | "production") => void;
  setCurrentBranch: (branch: string) => void;

  // Canonical Workspace Directories
  defaultWorkspaceDir: string;
  setDefaultWorkspaceDir: (dir: string) => void;
  defaultDeploymentsDir: string;
  setDefaultDeploymentsDir: (dir: string) => void;
  isFirstInstall: boolean;
  completeFirstInstall: () => void;

  // Recent projects
  recentProjects: RecentProject[];
  saveRecentProject: (info: ProjectInfo) => void;

  // Close project
  closeProject: () => void;
}

// ── Load persisted state ─────────────────────────────────────────

function loadOperatingMode(): OperatingMode {
  try {
    const saved = localStorage.getItem("aipanel_operating_mode") as OperatingMode;
    if (saved && ["desktop", "server", "remote_client"].includes(saved)) return saved;
  } catch {}
  return "desktop";
}

function loadDefaultWorkspaceDir(): string {
  try {
    return localStorage.getItem("aipanel_default_workspace_dir") || "/Volumes/Mac2TB/Botdigit/Developer/Projects";
  } catch {
    return "/Volumes/Mac2TB/Botdigit/Developer/Projects";
  }
}

function loadDefaultDeploymentsDir(): string {
  try {
    return localStorage.getItem("aipanel_default_deployments_dir") || "/Volumes/Mac2TB/Botdigit/Developer/Live";
  } catch {
    return "/Volumes/Mac2TB/Botdigit/Developer/Live";
  }
}

function loadIsFirstInstall(): boolean {
  try {
    return localStorage.getItem("aipanel_setup_completed") !== "true";
  } catch {
    return false;
  }
}

function loadRecentProjects(): RecentProject[] {
  try {
    const saved = localStorage.getItem("aipanel_recent_projects");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [
    {
      name: "aipanel",
      path: "/Volumes/Mac2TB/Botdigit/Developer/Projects/aipanel",
      framework: "React 19 (Vite + Tauri)",
      lastOpened: "Just now",
    },
    {
      name: "yaarpahari.com",
      path: "/Volumes/Mac2TB/Botdigit/Developer/Live/yaarpahari.com",
      framework: "Node.js + Telegram Bot",
      lastOpened: "15 mins ago",
    },
  ];
}

// ── Store ────────────────────────────────────────────────────────

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  // Operating mode
  operatingMode: loadOperatingMode(),
  setOperatingMode: (mode) => {
    localStorage.setItem("aipanel_operating_mode", mode);
    set({ operatingMode: mode });
  },

  // Project
  projectPath: "/Volumes/Mac2TB/Botdigit/Developer/Projects/aipanel",
  projectInfo: null,
  showDetectionBanner: false,
  setProjectPath: (path) => set({ projectPath: path }),
  setProjectInfo: (info) => set({ projectInfo: info }),
  setShowDetectionBanner: (show) => set({ showDetectionBanner: show }),

  // Environment
  environment: "dev",
  currentBranch: "main",
  setEnvironment: (env) => set({ environment: env }),
  setCurrentBranch: (branch) => set({ currentBranch: branch }),

  // Canonical Workspace Directories
  defaultWorkspaceDir: loadDefaultWorkspaceDir(),
  setDefaultWorkspaceDir: (dir) => {
    localStorage.setItem("aipanel_default_workspace_dir", dir);
    set({ defaultWorkspaceDir: dir });
  },
  defaultDeploymentsDir: loadDefaultDeploymentsDir(),
  setDefaultDeploymentsDir: (dir) => {
    localStorage.setItem("aipanel_default_deployments_dir", dir);
    set({ defaultDeploymentsDir: dir });
  },
  isFirstInstall: loadIsFirstInstall(),
  completeFirstInstall: () => {
    localStorage.setItem("aipanel_setup_completed", "true");
    set({ isFirstInstall: false });
  },

  // Recent projects
  recentProjects: loadRecentProjects(),
  saveRecentProject: (info) =>
    set((state) => {
      const filtered = state.recentProjects.filter((p) => p.path !== info.path);
      const updated = [
        {
          name: info.name,
          path: info.path,
          framework: info.framework || undefined,
          lastOpened: new Date().toISOString(),
        },
        ...filtered,
      ].slice(0, 10);
      try {
        localStorage.setItem("aipanel_recent_projects", JSON.stringify(updated));
      } catch {}
      return { recentProjects: updated };
    }),

  // Close
  closeProject: () =>
    set({
      projectPath: null,
      projectInfo: null,
      showDetectionBanner: false,
    }),
}));
