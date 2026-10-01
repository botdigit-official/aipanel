import { useState, useCallback, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Sparkles, X } from "lucide-react";

import Sidebar from "./components/layout/Sidebar";
import TopBar, { type Environment } from "./components/layout/TopBar";
import StatusBar from "./components/layout/StatusBar";
import { defaultDevServices, type ServiceStatus } from "./lib/services";
import FileExplorer from "./components/explorer/FileExplorer";
import EditorPanel, { type EditorTab } from "./components/editor/EditorPanel";
import AIPanel from "./components/ai/AIPanel";
import BottomPanel from "./components/panels/BottomPanel";
import ServicesPanel from "./components/panels/ServicesPanel";
import GitPanel from "./components/git/GitPanel";
import DeployPanel from "./components/deploy/DeployPanel";
import MonitoringPanel from "./components/panels/MonitoringPanel";
import SettingsPanel from "./components/panels/SettingsPanel";
import DatabasePanel from "./components/panels/DatabasePanel";
import TunnelsPanel from "./components/panels/TunnelsPanel";
import BillingPanel from "./components/panels/BillingPanel";
import DomainsPanel from "./components/panels/DomainsPanel";
import DevOpsControlPanel from "./components/layout/DevOpsControlPanel";
import WelcomePage from "./components/pages/WelcomePage";
import ControlCenter from "./components/control-center/ControlCenter";
import ServerDashboard from "./components/server/ServerDashboard";
import HostingPanel from "./components/hosting/HostingPanel";
import ClientCRMPanel from "./components/hosting/ClientCRMPanel";
import ModeSelectorModal from "./components/layout/ModeSelectorModal";
import WorkspaceSwitcherModal from "./components/modals/WorkspaceSwitcherModal";
import FreeAIModal from "./components/modals/FreeAIModal";
import ResizeHandle from "./components/layout/ResizeHandle";
import { CommandPalette } from "./design-system";
import { initialPlugins } from "./lib/plugins";
import type { OperatingMode, AIPanelPlugin } from "./lib/types";

import {
  isTauri,
  readFile,
  writeFile,
  detectProject,
  generateAIPanelConfig,
  createProjectFromTemplate,
  type FileEntry,
  type ProjectInfo,
} from "./lib/tauri";

// ── Types ────────────────────────────────────────────────────────

interface RecentProject {
  name: string;
  path: string;
  framework?: string;
  lastOpened?: string;
}

// ── App State ────────────────────────────────────────────────────

export default function App() {
  // Operating mode & Plugins
  const [operatingMode, setOperatingMode] = useState<OperatingMode>(() => {
    return (
      (localStorage.getItem("aipanel_operating_mode") as OperatingMode) ||
      (localStorage.getItem("aipanel_operating_mode") as OperatingMode) ||
      "desktop"
    );
  });
  const [showModeModal, setShowModeModal] = useState(false);
  const [plugins, setPlugins] = useState<AIPanelPlugin[]>(initialPlugins);

  const handleTogglePlugin = useCallback((pluginId: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === pluginId ? { ...p, enabled: !p.enabled } : p))
    );
  }, []);

  const handleInstallPlugin = useCallback((pluginId: string) => {
    setPlugins((prev) =>
      prev.map((p) =>
        p.id === pluginId ? { ...p, installed: true, enabled: true } : p
      )
    );
  }, []);

  const handleUninstallPlugin = useCallback((pluginId: string) => {
    setPlugins((prev) =>
      prev.map((p) =>
        p.id === pluginId ? { ...p, installed: false, enabled: false } : p
      )
    );
  }, []);

  const handleSelectMode = useCallback((mode: OperatingMode) => {
    setOperatingMode(mode);
    localStorage.setItem("aipanel_operating_mode", mode);
  }, []);

  // Layout state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePanel, setActivePanel] = useState("dashboard");
  const [bottomExpanded, setBottomExpanded] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showDevOpsDock, setShowDevOpsDock] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showWorkspaceSwitcher, setShowWorkspaceSwitcher] = useState(false);
  const [showFreeAIModal, setShowFreeAIModal] = useState(false);

  // Resizable panel dimensions with local persistence
  const [explorerWidth, setExplorerWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("aipanel_explorer_width");
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 180 && val <= 600) return val;
      }
    } catch {}
    return 288;
  });

  const [aiWidth, setAiWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("aipanel_ai_width");
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 260 && val <= 700) return val;
      }
    } catch {}
    return 340;
  });

  const [bottomHeight, setBottomHeight] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("aipanel_bottom_height");
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 120 && val <= 600) return val;
      }
    } catch {}
    return 224;
  });

  const handleExplorerResize = useCallback((delta: number) => {
    setExplorerWidth((prev) => {
      const next = Math.max(180, Math.min(600, prev + delta));
      try {
        localStorage.setItem("aipanel_explorer_width", String(next));
      } catch {}
      return next;
    });
  }, []);

  const handleAiResize = useCallback((delta: number) => {
    setAiWidth((prev) => {
      // Dragging left (negative delta) increases AI panel width
      const next = Math.max(260, Math.min(700, prev - delta));
      try {
        localStorage.setItem("aipanel_ai_width", String(next));
      } catch {}
      return next;
    });
  }, []);

  const handleBottomHeightChange = useCallback((newHeight: number) => {
    setBottomHeight(newHeight);
    try {
      localStorage.setItem("aipanel_bottom_height", String(newHeight));
    } catch {}
  }, []);

  // Global ⌘K / Ctrl+K Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Project state - default to current workspace
  const [projectPath, setProjectPath] = useState<string | null>(
    "/Volumes/Mac2TB/Botdigit/Developer/Projects/aipanel"
  );
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [showDetectionBanner, setShowDetectionBanner] = useState(false);

  // Environment
  const [environment, setEnvironment] = useState<Environment>("dev");
  const [currentBranch, setCurrentBranch] = useState("main");

  // Editor state
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Services
  const [services] = useState<ServiceStatus[]>(defaultDevServices);

  // Auto-detect project on startup and open primary file
  useEffect(() => {
    const defaultPath = "/Volumes/Mac2TB/Botdigit/Developer/Projects/aipanel";
    detectProject(defaultPath)
      .then(async (info) => {
        setProjectInfo(info);
        // Automatically open the primary project file so Code Studio is ready
        const fileToOpen = info.suggested_file || `${defaultPath}/README.md`;
        try {
          const file = await readFile(fileToOpen);
          const fileName = fileToOpen.split("/").pop() || "README.md";
          const newTab: EditorTab = {
            path: file.path,
            name: fileName,
            language: file.language,
            content: file.content,
            originalContent: file.content,
            isDirty: false,
          };
          setTabs([newTab]);
          setActiveTab(file.path);
        } catch (readErr) {
          console.warn("Could not auto-open primary file on startup:", readErr);
        }
      })
      .catch((e) => console.warn("Initial detect project:", e));
  }, []);

  // Recent projects persisted in localStorage
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>(() => {
    try {
      const saved =
        localStorage.getItem("aipanel_recent_projects") ||
        localStorage.getItem("aipanel_recent_projects");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
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
  });

  const saveRecentProject = useCallback((info: ProjectInfo) => {
    setRecentProjects((prev) => {
      const filtered = prev.filter((p) => p.path !== info.path);
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
      } catch (e) {
        console.error("Failed to save recent projects:", e);
      }
      return updated;
    });
  }, []);

  // ── Project Operations ──────────────────────────────────────────

  const openProject = useCallback(
    async (path?: string) => {
      let selectedPath = path;

      if (!selectedPath) {
        if (!isTauri()) {
          setShowWorkspaceSwitcher(true);
          return;
        }

        try {
          const result = await open({
            directory: true,
            multiple: false,
            title: "Open Project Folder",
          });
          if (result && typeof result === "string") {
            selectedPath = result;
          } else if (Array.isArray(result) && result[0]) {
            selectedPath = result[0];
          }
        } catch (dialogErr) {
          console.warn("Native file picker unavailable, opening workspace switcher:", dialogErr);
          setShowWorkspaceSwitcher(true);
          return;
        }
      }

      if (!selectedPath) return;

      try {
        const info = await detectProject(selectedPath);
        setProjectPath(selectedPath);
        setProjectInfo(info);
        setShowDetectionBanner(!info.has_aipanel_toml);
        setActivePanel("explorer");

        // Automatically open the primary project file so Code Studio is ready
        const fileToOpen = info.suggested_file || `${selectedPath}/package.json`;
        try {
          const file = await readFile(fileToOpen);
          const fileName = fileToOpen.split("/").pop() || "file";
          const newTab: EditorTab = {
            path: file.path,
            name: fileName,
            language: file.language,
            content: file.content,
            originalContent: file.content,
            isDirty: false,
          };
          setTabs([newTab]);
          setActiveTab(file.path);
        } catch {
          setTabs([]);
          setActiveTab(null);
        }

        saveRecentProject(info);
      } catch (err) {
        console.error("Failed to open project:", err);
      }
    },
    [saveRecentProject]
  );

  const handleGenerateConfig = useCallback(async () => {
    if (!projectPath) return;
    try {
      await generateAIPanelConfig(projectPath);
      const updated = await detectProject(projectPath);
      setProjectInfo(updated);
      setShowDetectionBanner(false);
    } catch (err) {
      console.error("Failed to generate aipanel.toml:", err);
    }
  }, [projectPath]);

  const handleCreateProject = useCallback(
    async (targetDir: string, name: string, template: string) => {
      const info = await createProjectFromTemplate(targetDir, name, template);
      setProjectPath(info.path);
      setProjectInfo(info);
      setShowDetectionBanner(false);
      setActivePanel("explorer");
      setTabs([]);
      setActiveTab(null);
      saveRecentProject(info);
    },
    [saveRecentProject]
  );

  // ── File Operations ─────────────────────────────────────────────

  const handleFileClick = useCallback(
    async (entry: FileEntry) => {
      if (entry.is_dir) return;

      const existingTab = tabs.find((t) => t.path === entry.path);
      if (existingTab) {
        setActiveTab(entry.path);
        return;
      }

      try {
        const file = await readFile(entry.path);
        const newTab: EditorTab = {
          path: file.path,
          name: entry.name,
          language: file.language,
          content: file.content,
          originalContent: file.content,
          isDirty: false,
        };
        setTabs((prev) => [...prev, newTab]);
        setActiveTab(entry.path);
      } catch (err) {
        console.error("Failed to read file:", err);
      }
    },
    [tabs]
  );

  const handleOpenFileByPath = useCallback(
    async (relativePath: string) => {
      const fullPath = relativePath.startsWith("/")
        ? relativePath
        : `${projectPath}/${relativePath}`;
      const fileName = fullPath.split("/").pop() || "file";

      const existingTab = tabs.find((t) => t.path === fullPath);
      if (existingTab) {
        setActiveTab(fullPath);
        return;
      }

      try {
        const file = await readFile(fullPath);
        const newTab: EditorTab = {
          path: file.path,
          name: fileName,
          language: file.language,
          content: file.content,
          originalContent: file.content,
          isDirty: false,
        };
        setTabs((prev) => [...prev, newTab]);
        setActiveTab(fullPath);
      } catch (err) {
        console.error("Failed to open file by path:", err);
      }
    },
    [projectPath, tabs]
  );

  const handleTabClose = useCallback(
    (path: string) => {
      setTabs((prev) => prev.filter((t) => t.path !== path));
      if (activeTab === path) {
        const remaining = tabs.filter((t) => t.path !== path);
        setActiveTab(remaining.length > 0 ? remaining[remaining.length - 1].path : null);
      }
    },
    [activeTab, tabs]
  );

  const handleContentChange = useCallback((path: string, content: string) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.path === path
          ? { ...t, content, isDirty: content !== t.originalContent }
          : t
      )
    );
  }, []);

  const handleSave = useCallback(
    async (path: string) => {
      const tab = tabs.find((t) => t.path === path);
      if (!tab || !tab.isDirty) return;

      try {
        await writeFile(path, tab.content);
        setTabs((prev) =>
          prev.map((t) =>
            t.path === path
              ? { ...t, originalContent: t.content, isDirty: false }
              : t
          )
        );
      } catch (err) {
        console.error("Failed to save file:", err);
      }
    },
    [tabs]
  );

  // ── Sidebar Navigation ──────────────────────────────────────────

  const handleSidebarClick = useCallback(
    (id: string) => {
      if (id === "ai") {
        setShowAI(!showAI);
      } else if (id === "explorer") {
        setActivePanel("explorer");
        const currentPath = projectPath || "/Volumes/Mac2TB/Botdigit/Developer/Projects/aipanel";
        if (!projectPath) {
          setProjectPath(currentPath);
        }
        if (tabs.length === 0) {
          handleFileClick({
            name: "README.md",
            path: `${currentPath}/README.md`,
            is_dir: false,
            size: 1024,
          });
        }
      } else {
        setActivePanel(id);
      }
    },
    [showAI, projectPath, tabs.length, handleFileClick]
  );

  // ── Render ──────────────────────────────────────────────────────

  const projectName = projectInfo?.name || "AIPanel";
  const isGlobalToolPanel = [
    "control-center",
    "hosting",
    "clients",
    "servers",
    "releases",
    "rollbacks",
    "doctor",
    "docker",
    "workers",
    "git",
    "versions",
    "monitoring",
    "settings",
    "database",
    "tunnels",
    "billing",
    "domains",
  ].includes(activePanel);
  const showExplorer = operatingMode === "desktop" && activePanel === "explorer";
  const showDashboard = operatingMode === "desktop" && activePanel === "dashboard" && !isGlobalToolPanel;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-bg-base">
      {/* Top Bar */}
      <TopBar
        projectName={projectName}
        projectPath={projectPath}
        environment={environment}
        onEnvironmentChange={setEnvironment}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        operatingMode={operatingMode}
        onOpenModeSelector={() => setShowModeModal(true)}
        onOpenControlCenter={() => setActivePanel("control-center")}
        onDeployClick={(targetEnv) => {
          if (targetEnv) setEnvironment(targetEnv);
          setActivePanel("releases");
        }}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        onOpenWorkspaceSwitcher={() => setShowWorkspaceSwitcher(true)}
        onOpenFreeAI={() => setShowFreeAIModal(true)}
        onCloseProject={() => {
          setProjectPath(null);
          setProjectInfo(null);
          setTabs([]);
          setActiveTab(null);
          setActivePanel("dashboard");
        }}
        onOpenDomains={() => setActivePanel("domains")}
        showDevOpsDock={showDevOpsDock}
        onToggleDevOps={() => setShowDevOpsDock(!showDevOpsDock)}
        showAI={showAI}
        onToggleAI={() => setShowAI(!showAI)}
      />

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <Sidebar
          activeItem={activePanel}
          onItemClick={handleSidebarClick}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          projectName={projectInfo?.name}
          plugins={plugins}
        />

        {/* Center Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Project Detection Alert Banner */}
          {showDetectionBanner && projectInfo && (
            <div className="mx-3 my-2 p-2.5 rounded-xl bg-gradient-to-r from-indigo-950/90 via-zinc-900/90 to-zinc-900/90 border border-indigo-500/30 shadow-lg shadow-black/40 flex items-center justify-between text-xs text-indigo-200 shrink-0 gap-3 backdrop-blur-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
                  <Sparkles size={13} className="text-indigo-400" />
                </div>
                <div className="text-xs truncate">
                  <span>Detected <strong className="text-zinc-100 font-semibold">{projectInfo.framework || projectInfo.runtime}</strong></span>
                  {projectInfo.detected_services.length > 0 && (
                    <span className="text-zinc-300"> with <strong className="text-indigo-300 font-medium">{projectInfo.detected_services.join(", ")}</strong></span>
                  )}
                  <span className="text-zinc-400 ml-1.5 hidden lg:inline">• Configure services & deployment?</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleGenerateConfig}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-950/50 transition-all cursor-pointer whitespace-nowrap"
                >
                  Generate aipanel.toml
                </button>
                <button
                  onClick={() => setShowDetectionBanner(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                  title="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 flex min-h-0">
            {/* File Explorer Panel */}
            {showExplorer && (
              <>
                <div
                  style={{ width: `${explorerWidth}px` }}
                  className="border-r border-border-default shrink-0 overflow-hidden flex flex-col"
                >
                  <FileExplorer
                    projectPath={projectPath}
                    onFileClick={handleFileClick}
                    activeFilePath={activeTab || undefined}
                    onOpenWorkspaceSwitcher={() => setShowWorkspaceSwitcher(true)}
                  />
                </div>
                <ResizeHandle
                  direction="vertical"
                  onResize={handleExplorerResize}
                  onDoubleClick={() => {
                    setExplorerWidth(288);
                    try {
                      localStorage.setItem("aipanel_explorer_width", "288");
                    } catch {}
                  }}
                  title="Drag left/right to resize file explorer • Double-click to reset (288px)"
                />
              </>
            )}

            {/* Editor / Welcome / Services / Server Panel */}
            {operatingMode === "server" && !isGlobalToolPanel ? (
              <ServerDashboard
                onOpenAppDeploy={() => setActivePanel("releases")}
                onOpenTerminal={() => setActivePanel("terminal")}
                onOpenDatabase={() => setActivePanel("database")}
                onOpenDomains={() => setActivePanel("domains")}
                onOpenBackups={() => setActivePanel("releases")}
                onSwitchToDesktop={() => handleSelectMode("desktop")}
              />
            ) : showDashboard ? (
              <WelcomePage
                onOpenProject={() => setShowWorkspaceSwitcher(true)}
                recentProjects={recentProjects}
                onOpenRecent={(path) => openProject(path)}
                onCreateProject={handleCreateProject}
                onNavigateToCode={async () => {
                  setActivePanel("explorer");
                  if (tabs.length === 0 && projectPath) {
                    const info = projectInfo || (await detectProject(projectPath));
                    const fileToOpen = info.suggested_file || `${projectPath}/package.json`;
                    try {
                      const file = await readFile(fileToOpen);
                      const fileName = fileToOpen.split("/").pop() || "file";
                      setTabs([{
                        path: file.path,
                        name: fileName,
                        language: file.language,
                        content: file.content,
                        originalContent: file.content,
                        isDirty: false,
                      }]);
                      setActiveTab(file.path);
                    } catch {
                      // ignore
                    }
                  }
                }}
                onNavigateToAI={() => {
                  setActivePanel("explorer");
                  setShowAI(true);
                }}
                onNavigateToGit={() => setActivePanel("git")}
                onNavigateToServers={() => setActivePanel("servers")}
              />
            ) : activePanel === "control-center" ? (
              <ControlCenter
                plugins={plugins}
                onTogglePlugin={handleTogglePlugin}
                onInstallPlugin={handleInstallPlugin}
                onUninstallPlugin={handleUninstallPlugin}
              />
            ) : activePanel === "servers" ? (
              <ServerDashboard
                onOpenAppDeploy={() => setActivePanel("releases")}
                onOpenTerminal={() => setActivePanel("terminal")}
                onOpenDatabase={() => setActivePanel("database")}
                onOpenDomains={() => setActivePanel("domains")}
                onOpenBackups={() => setActivePanel("releases")}
                onSwitchToDesktop={() => handleSelectMode("desktop")}
              />
            ) : activePanel === "hosting" ? (
              <HostingPanel />
            ) : activePanel === "clients" ? (
              <ClientCRMPanel />
            ) : activePanel === "docker" || activePanel === "workers" ? (
              <ServicesPanel
                environment={environment}
                projectName={projectInfo?.name}
              />
            ) : activePanel === "git" || activePanel === "versions" ? (
              <GitPanel
                projectPath={projectPath || "."}
                onRefreshBranch={setCurrentBranch}
              />
            ) : activePanel === "releases" ||
              activePanel === "rollbacks" ||
              activePanel === "doctor" ? (
              <DeployPanel
                environment={environment}
                projectPath={projectPath || "."}
                initialTab={
                  activePanel === "rollbacks"
                    ? "rollbacks"
                    : activePanel === "doctor"
                    ? "doctor"
                    : "releases"
                }
              />
            ) : activePanel === "monitoring" ? (
              <MonitoringPanel
                environment={environment}
                projectName={projectInfo?.name}
              />
            ) : activePanel === "settings" ? (
              <SettingsPanel environment={environment} />
            ) : activePanel === "database" ? (
              <DatabasePanel
                environment={environment}
                projectName={projectInfo?.name}
                projectPath={projectPath}
              />
            ) : activePanel === "tunnels" ? (
              <TunnelsPanel
                environment={environment}
                projectName={projectInfo?.name}
              />
            ) : activePanel === "billing" ? (
              <BillingPanel environment={environment} />
            ) : activePanel === "domains" ? (
              <DomainsPanel
                environment={environment}
                projectName={projectInfo?.name}
                onNavigateToDeploy={() => setActivePanel("releases")}
              />
            ) : (
              <EditorPanel
                tabs={tabs}
                activeTab={activeTab}
                onTabClick={setActiveTab}
                onTabClose={handleTabClose}
                onContentChange={handleContentChange}
                onSave={handleSave}
                projectName={projectInfo?.name || "aipanel"}
                projectPath={projectPath}
                projectFramework={projectInfo?.framework || "React 19 (Vite + Tauri)"}
                onOpenFileByPath={handleOpenFileByPath}
                onOpenWorkspaceSwitcher={() => setShowWorkspaceSwitcher(true)}
              />
            )}

            {/* AI Panel (Only in Desktop Workspace / Editor mode) */}
            {operatingMode === "desktop" && activePanel === "explorer" && showAI && projectPath && (
              <>
                <ResizeHandle
                  direction="vertical"
                  onResize={handleAiResize}
                  onDoubleClick={() => {
                    setAiWidth(340);
                    try {
                      localStorage.setItem("aipanel_ai_width", "340");
                    } catch {}
                  }}
                  title="Drag left/right to resize AI panel • Double-click to reset (340px)"
                />
                <div
                  style={{ width: `${aiWidth}px` }}
                  className="shrink-0 border-l border-zinc-800 overflow-hidden flex flex-col"
                >
                  <AIPanel
                    environment={environment}
                    projectName={projectInfo?.name}
                    projectPath={projectPath}
                    activeFilePath={activeTab || undefined}
                    onOpenBilling={() => setActivePanel("billing")}
                    onOpenFreeAI={() => setShowFreeAIModal(true)}
                    onApplyCode={(code) => {
                      if (activeTab) {
                        handleContentChange(activeTab, code);
                      }
                    }}
                  />
                </div>
              </>
            )}

            {/* DevOps Control Center Dock (Only in Desktop Workspace / Editor mode) */}
            {operatingMode === "desktop" && activePanel === "explorer" && showDevOpsDock && (
              <DevOpsControlPanel
                environment={environment}
                projectName={projectInfo?.name}
                projectPath={projectPath}
                onOpenDeploy={() => setActivePanel("releases")}
                onOpenServers={() => setActivePanel("servers")}
                onOpenDomains={() => setActivePanel("domains")}
                onOpenTunnels={() => setActivePanel("tunnels")}
                onOpenMonitoring={() => setActivePanel("monitoring")}
                onClose={() => setShowDevOpsDock(false)}
              />
            )}
          </div>

          {/* Bottom Panel */}
          <BottomPanel
            expanded={bottomExpanded}
            onToggle={() => setBottomExpanded(!bottomExpanded)}
            height={bottomHeight}
            onHeightChange={handleBottomHeightChange}
            onResetHeight={() => {
              setBottomHeight(224);
              try {
                localStorage.setItem("aipanel_bottom_height", "224");
              } catch {}
            }}
            projectPath={projectPath}
          />
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        environment={environment}
        services={services}
        activeFile={activeTab || undefined}
        cursorPosition={activeTab ? { line: 1, col: 1 } : undefined}
        gitBranch={currentBranch}
        onSelectService={(name) =>
          setActivePanel(name === "PostgreSQL" || name === "Redis" ? "database" : "docker")
        }
        onSelectBranch={() => setActivePanel("git")}
        onSelectEnvironment={() => setActivePanel("releases")}
      />

      {/* Mode Selector Modal */}
      <ModeSelectorModal
        isOpen={showModeModal}
        currentMode={operatingMode}
        onSelectMode={handleSelectMode}
        onClose={() => setShowModeModal(false)}
      />

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={(panel) => setActivePanel(panel)}
        onTriggerAI={() => {
          setActivePanel("explorer");
          setShowAI(true);
        }}
        onOpenProject={() => openProject()}
        onDeploy={(env) => {
          setEnvironment(env as Environment);
          setActivePanel("releases");
        }}
      />

      {/* Workspace & Folder Switcher Modal */}
      <WorkspaceSwitcherModal
        isOpen={showWorkspaceSwitcher}
        onClose={() => setShowWorkspaceSwitcher(false)}
        currentPath={projectPath}
        onSelectWorkspace={(path) => openProject(path)}
        recentProjects={recentProjects}
      />

      {/* Free AI Models & Kilo Code Setup Modal */}
      <FreeAIModal
        isOpen={showFreeAIModal}
        onClose={() => setShowFreeAIModal(false)}
        onSelectProvider={(p) => {
          localStorage.setItem("aipanel_ai_provider", p);
          setShowAI(true);
        }}
      />
    </div>
  );
}
