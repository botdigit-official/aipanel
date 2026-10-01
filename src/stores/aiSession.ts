import { create } from "zustand";

// ── Types ────────────────────────────────────────────────────────

export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  codeSnippet?: {
    language: string;
    code: string;
    filePath?: string;
  };
  actions?: Array<{
    label: string;
    action:
      | "deploy_staging"
      | "deploy_production"
      | "open_guide"
      | "apply_code"
      | "open_tunnels"
      | "open_database"
      | "open_skills";
    icon?: string;
  }>;
  timestamp: Date;
}

export interface AISession {
  id: string;
  title: string;
  projectName: string;
  projectPath?: string;
  createdAt: number;
  updatedAt: number;
  messages: AIMessage[];
  tokensUsed: number;
  provider: string;
  model: string;
}

interface AISessionState {
  currentProject: string;
  sessions: AISession[];
  activeSessionId: string | null;

  // Actions
  initProjectSessions: (projectName: string, projectPath?: string) => void;
  createSession: (title?: string) => AISession;
  switchSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  renameSession: (sessionId: string, newTitle: string) => void;
  addMessage: (msg: AIMessage) => void;
  updateTokens: (tokensDelta: number) => void;
  clearActiveMessages: () => void;
  getActiveSession: () => AISession | null;
}

// ── Storage Helpers ──────────────────────────────────────────────

function getStorageKey(projectName: string): string {
  return `aipanel_ai_sessions_${projectName || "default"}`;
}

function loadSessionsFromStorage(projectName: string): AISession[] {
  try {
    const raw = localStorage.getItem(getStorageKey(projectName));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((s) => ({
          ...s,
          messages: (s.messages || []).map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        }));
      }
    }
  } catch (e) {
    console.warn("Failed to load project AI sessions from storage:", e);
  }
  return [];
}

function saveSessionsToStorage(projectName: string, sessions: AISession[]): void {
  try {
    localStorage.setItem(getStorageKey(projectName), JSON.stringify(sessions));
  } catch (e) {
    console.warn("Failed to save project AI sessions to storage:", e);
  }
}

// ── Store ────────────────────────────────────────────────────────

export const useAISessionStore = create<AISessionState>((set, get) => ({
  currentProject: "aipanel",
  sessions: [],
  activeSessionId: null,

  initProjectSessions: (projectName: string, projectPath?: string) => {
    const safeProject = projectName || "aipanel";
    const existing = loadSessionsFromStorage(safeProject);

    if (existing.length > 0) {
      set({
        currentProject: safeProject,
        sessions: existing,
        activeSessionId: existing[0].id,
      });
      return;
    }

    // Create fresh initial session for this project
    const defaultSession: AISession = {
      id: `sess-${Date.now()}`,
      title: "Session 1: Project Kickoff",
      projectName: safeProject,
      projectPath,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      tokensUsed: 0,
      provider: localStorage.getItem("aipanel_ai_provider") || "gemini",
      model: localStorage.getItem("aipanel_ai_model") || "gemini-2.0-flash",
    };

    saveSessionsToStorage(safeProject, [defaultSession]);
    set({
      currentProject: safeProject,
      sessions: [defaultSession],
      activeSessionId: defaultSession.id,
    });
  },

  createSession: (title?: string) => {
    const { currentProject, sessions } = get();
    const count = sessions.length + 1;
    const newSession: AISession = {
      id: `sess-${Date.now()}`,
      title: title || `Session ${count}: New Thread`,
      projectName: currentProject,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      tokensUsed: 0,
      provider: localStorage.getItem("aipanel_ai_provider") || "gemini",
      model: localStorage.getItem("aipanel_ai_model") || "gemini-2.0-flash",
    };

    const updated = [newSession, ...sessions];
    saveSessionsToStorage(currentProject, updated);
    set({ sessions: updated, activeSessionId: newSession.id });
    return newSession;
  },

  switchSession: (sessionId: string) => {
    set({ activeSessionId: sessionId });
  },

  deleteSession: (sessionId: string) => {
    const { currentProject, sessions, activeSessionId } = get();
    const filtered = sessions.filter((s) => s.id !== sessionId);

    let nextActive = activeSessionId;
    if (activeSessionId === sessionId) {
      nextActive = filtered.length > 0 ? filtered[0].id : null;
    }

    if (filtered.length === 0) {
      // Re-create default session
      const fresh: AISession = {
        id: `sess-${Date.now()}`,
        title: "Session 1: Project Kickoff",
        projectName: currentProject,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        tokensUsed: 0,
        provider: "gemini",
        model: "gemini-2.0-flash",
      };
      saveSessionsToStorage(currentProject, [fresh]);
      set({ sessions: [fresh], activeSessionId: fresh.id });
      return;
    }

    saveSessionsToStorage(currentProject, filtered);
    set({ sessions: filtered, activeSessionId: nextActive });
  },

  renameSession: (sessionId: string, newTitle: string) => {
    const { currentProject, sessions } = get();
    const cleanTitle = newTitle.trim();
    if (!cleanTitle) return;

    const updated = sessions.map((s) =>
      s.id === sessionId ? { ...s, title: cleanTitle, updatedAt: Date.now() } : s
    );
    saveSessionsToStorage(currentProject, updated);
    set({ sessions: updated });
  },

  addMessage: (msg: AIMessage) => {
    const { currentProject, sessions, activeSessionId } = get();
    if (!activeSessionId) return;

    const updated = sessions.map((s) => {
      if (s.id !== activeSessionId) return s;

      // Smart auto-titling: if the user sends their first message in a default-titled session
      let autoTitle = s.title;
      if (
        s.messages.length === 0 &&
        msg.role === "user" &&
        (s.title.startsWith("Session") || s.title.startsWith("New"))
      ) {
        autoTitle = msg.content.slice(0, 36).trim() + (msg.content.length > 36 ? "..." : "");
      }

      return {
        ...s,
        title: autoTitle,
        messages: [...s.messages, msg],
        updatedAt: Date.now(),
      };
    });

    saveSessionsToStorage(currentProject, updated);
    set({ sessions: updated });
  },

  updateTokens: (tokensDelta: number) => {
    const { currentProject, sessions, activeSessionId } = get();
    if (!activeSessionId) return;

    const updated = sessions.map((s) =>
      s.id === activeSessionId
        ? { ...s, tokensUsed: (s.tokensUsed || 0) + tokensDelta, updatedAt: Date.now() }
        : s
    );

    saveSessionsToStorage(currentProject, updated);
    set({ sessions: updated });
  },

  clearActiveMessages: () => {
    const { currentProject, sessions, activeSessionId } = get();
    if (!activeSessionId) return;

    const updated = sessions.map((s) =>
      s.id === activeSessionId
        ? { ...s, messages: [], tokensUsed: 0, updatedAt: Date.now() }
        : s
    );

    saveSessionsToStorage(currentProject, updated);
    set({ sessions: updated });
  },

  getActiveSession: () => {
    const { sessions, activeSessionId } = get();
    return sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;
  },
}));
