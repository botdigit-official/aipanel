import { create } from "zustand";
import { readFile, writeFile } from "../lib/tauri";

// ── Types ────────────────────────────────────────────────────────

export interface FileHistoryEntry {
  id: string;
  timestamp: number;
  author: string;
  summary: string;
  beforeContent: string;
  afterContent: string;
}

export interface EditorTab {
  path: string;
  name: string;
  language: string;
  content: string;
  originalContent: string;
  isDirty: boolean;
  aiEditSummary?: string;
  aiEditAuthor?: string;
  history?: FileHistoryEntry[];
}

interface EditorState {
  tabs: EditorTab[];
  activeTab: string | null;

  // Auto-Save & AI Autonomy
  autoSave: boolean;
  setAutoSave: (enabled: boolean) => void;
  autoApplyAI: boolean;
  setAutoApplyAI: (enabled: boolean) => void;
  saveStatus: "idle" | "saving" | "saved" | "error";
  setSaveStatus: (status: "idle" | "saving" | "saved" | "error") => void;

  // Tab operations
  openTab: (tab: EditorTab) => void;
  closeTab: (path: string) => void;
  setActiveTab: (path: string | null) => void;
  setTabs: (tabs: EditorTab[]) => void;

  // Content operations
  updateContent: (path: string, content: string) => void;
  applyAIEdit: (path: string, newContent: string, author?: string, reason?: string) => Promise<void>;
  dismissAIEditSummary: (path: string) => void;
  revertFile: (path: string) => void;
  saveFile: (path: string) => Promise<void>;

  // File open helper
  openFileByPath: (fullPath: string) => Promise<void>;

  // Reset
  closeAllTabs: () => void;
}

// ── Persistence Helpers ──────────────────────────────────────────

function loadAutoSave(): boolean {
  try {
    const val = localStorage.getItem("aipanel_autosave");
    if (val !== null) return val === "true";
  } catch {}
  return true; // Enabled by default like modern IDEs
}

function loadAutoApplyAI(): boolean {
  try {
    const val = localStorage.getItem("aipanel_auto_apply_ai");
    if (val !== null) return val === "true";
  } catch {}
  return true; // Auto-apply enabled by default
}

let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

// ── Store ────────────────────────────────────────────────────────

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [],
  activeTab: null,
  autoSave: loadAutoSave(),
  autoApplyAI: loadAutoApplyAI(),
  saveStatus: "idle",

  setAutoSave: (enabled: boolean) => {
    try {
      localStorage.setItem("aipanel_autosave", String(enabled));
    } catch {}
    set({ autoSave: enabled });
  },

  setAutoApplyAI: (enabled: boolean) => {
    try {
      localStorage.setItem("aipanel_auto_apply_ai", String(enabled));
    } catch {}
    set({ autoApplyAI: enabled });
  },

  setSaveStatus: (saveStatus) => set({ saveStatus }),

  openTab: (tab) =>
    set((state) => {
      const exists = state.tabs.find((t) => t.path === tab.path);
      if (exists) {
        return { activeTab: tab.path };
      }
      return {
        tabs: [...state.tabs, tab],
        activeTab: tab.path,
      };
    }),

  closeTab: (path) =>
    set((state) => {
      const remaining = state.tabs.filter((t) => t.path !== path);
      const newActive =
        state.activeTab === path
          ? remaining.length > 0
            ? remaining[remaining.length - 1].path
            : null
          : state.activeTab;
      return { tabs: remaining, activeTab: newActive };
    }),

  setActiveTab: (path) => set({ activeTab: path }),

  setTabs: (tabs) => set({ tabs }),

  updateContent: (path, content) => {
    const { autoSave } = get();

    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.path === path
          ? {
              ...t,
              content,
              isDirty: !autoSave && content !== t.originalContent,
            }
          : t
      ),
    }));

    // Auto-save with 800ms debounce
    if (autoSave) {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      set({ saveStatus: "saving" });

      autoSaveTimer = setTimeout(async () => {
        try {
          await writeFile(path, content);
          set((s) => ({
            saveStatus: "saved",
            tabs: s.tabs.map((t) =>
              t.path === path
                ? { ...t, originalContent: content, isDirty: false }
                : t
            ),
          }));
          setTimeout(() => {
            if (get().saveStatus === "saved") {
              set({ saveStatus: "idle" });
            }
          }, 2000);
        } catch (err) {
          console.error("Auto-save failed:", err);
          set({ saveStatus: "error" });
        }
      }, 800);
    }
  },

  applyAIEdit: async (path, newContent, author = "AIPanel AI", reason?: string) => {
    const state = get();
    let tab = state.tabs.find((t) => t.path === path);

    // If tab not open, open it first
    if (!tab) {
      await state.openFileByPath(path);
      tab = get().tabs.find((t) => t.path === path);
    }
    if (!tab) return;

    const historyEntry: FileHistoryEntry = {
      id: `hist-${Date.now()}`,
      timestamp: Date.now(),
      author,
      summary: reason || "AI Code Refactor & Optimization",
      beforeContent: tab.content,
      afterContent: newContent,
    };

    const isAutoSave = state.autoSave;

    // Update in-memory buffer
    set((s) => ({
      activeTab: path,
      tabs: s.tabs.map((t) =>
        t.path === path
          ? {
              ...t,
              content: newContent,
              originalContent: isAutoSave ? newContent : t.originalContent,
              isDirty: !isAutoSave,
              aiEditSummary: reason || "AI Code Refactor & Optimization",
              aiEditAuthor: author,
              history: [historyEntry, ...(t.history || [])],
            }
          : t
      ),
    }));

    // If autoSave, immediately write to disk without forcing manual Accept & Save
    if (isAutoSave) {
      set({ saveStatus: "saving" });
      try {
        await writeFile(path, newContent);
        set({ saveStatus: "saved" });
        setTimeout(() => {
          if (get().saveStatus === "saved") {
            set({ saveStatus: "idle" });
          }
        }, 3000);
      } catch (err) {
        console.error("Auto-save failed on AI edit:", err);
        set({ saveStatus: "error" });
      }
    }
  },

  dismissAIEditSummary: (path) =>
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.path === path
          ? {
              ...t,
              aiEditSummary: undefined,
              aiEditAuthor: undefined,
            }
          : t
      ),
    })),

  revertFile: (path) => {
    const state = get();
    const tab = state.tabs.find((t) => t.path === path);
    if (!tab) return;

    // Use latest history entry beforeContent if available, else originalContent
    const revertTargetContent =
      tab.history && tab.history.length > 0
        ? tab.history[0].beforeContent
        : tab.originalContent;

    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.path === path
          ? {
              ...t,
              content: revertTargetContent,
              originalContent: revertTargetContent,
              isDirty: false,
              aiEditSummary: undefined,
              aiEditAuthor: undefined,
            }
          : t
      ),
    }));

    // If autoSave was active, restore the original content to disk immediately
    if (state.autoSave) {
      writeFile(path, revertTargetContent).catch((err) =>
        console.error("Failed to restore file on disk during revert:", err)
      );
    }
  },

  saveFile: async (path) => {
    const state = get();
    const tab = state.tabs.find((t) => t.path === path);
    if (!tab) return;

    set({ saveStatus: "saving" });
    try {
      await writeFile(path, tab.content);
      set((s) => ({
        saveStatus: "saved",
        tabs: s.tabs.map((t) =>
          t.path === path
            ? { ...t, originalContent: t.content, isDirty: false }
            : t
        ),
      }));
      setTimeout(() => {
        if (get().saveStatus === "saved") {
          set({ saveStatus: "idle" });
        }
      }, 2000);
    } catch (err) {
      console.error("Failed to save file:", err);
      set({ saveStatus: "error" });
    }
  },

  openFileByPath: async (fullPath) => {
    const state = get();
    const exists = state.tabs.find((t) => t.path === fullPath);
    if (exists) {
      set({ activeTab: fullPath });
      return;
    }

    try {
      const file = await readFile(fullPath);
      const fileName = fullPath.split("/").pop() || "file";
      const newTab: EditorTab = {
        path: file.path,
        name: fileName,
        language: file.language,
        content: file.content,
        originalContent: file.content,
        isDirty: false,
      };
      set((s) => ({
        tabs: [...s.tabs, newTab],
        activeTab: file.path,
      }));
    } catch (err) {
      console.error("Failed to open file by path:", err);
    }
  },

  closeAllTabs: () => set({ tabs: [], activeTab: null }),
}));
