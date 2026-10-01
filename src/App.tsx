import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Sparkles, X, Loader2 } from "lucide-react";

// ── Stores (Zustand — no prop drilling) ──────────────────────────
import {
  useWorkspaceStore,
  useEditorStore,
  useUIStore,
  usePluginStore,
} from "./stores";
import { useAISessionStore } from "./stores/aiSession";

// ── Eagerly loaded (always visible) ──────────────────────────────
import Sidebar from "./components/layout/Sidebar";
import TopBar, { type Environment } from "./components/layout/TopBar";
import StatusBar from "./components/layout/StatusBar";
import { defaultDevServices } from "./lib/services";
import ResizeHandle from "./components/layout/ResizeHandle";

// ── Lazily loaded (only when needed — saves ~500 KB initial) ─────
const FileExplorer = lazy(() => import("./components/explorer/FileExplorer"));
const EditorPanel = lazy(() => import("./components/editor/EditorPanel"));
const AIPanel = lazy(() => import("./components/ai/AIPanel"));
const BottomPanel = lazy(() => import("./components/panels/BottomPanel"));
const ServicesPanel = lazy(() => import("./components/panels/ServicesPanel"));
const GitPanel = lazy(() => import("./components/git/GitPanel"));
const DocAgentPanel = lazy(() => import("./components/panels/DocAgentPanel"));
const DeployPanel = lazy(() => import("./components/deploy/DeployPanel"));
const MonitoringPanel = lazy(() => import("./components/panels/MonitoringPanel"));
const SettingsPanel = lazy(() => import("./components/panels/SettingsPanel"));
const DatabasePanel = lazy(() => import("./components/panels/DatabasePanel"));
const TunnelsPanel = lazy(() => import("./components/panels/TunnelsPanel"));
const BillingPanel = lazy(() => import("./components/panels/BillingPanel"));
const DomainsPanel = lazy(() => import("./components/panels/DomainsPanel"));
const DevOpsControlPanel = lazy(() => import("./components/layout/DevOpsControlPanel"));
const WelcomePage = lazy(() => import("./components/pages/WelcomePage"));
const ControlCenter = lazy(() => import("./components/control-center/ControlCenter"));
const ServerDashboard = lazy(() => import("./components/server/ServerDashboard"));
const HostingPanel = lazy(() => import("./components/hosting/HostingPanel"));
const ClientCRMPanel = lazy(() => import("./components/hosting/ClientCRMPanel"));
const ModeSelectorModal = lazy(() => import("./components/layout/ModeSelectorModal"));
const WorkspaceSwitcherModal = lazy(() => import("./components/modals/WorkspaceSwitcherModal"));
const FreeAIModal = lazy(() => import("./components/modals/FreeAIModal"));
const LocalServerConverterModal = lazy(() => import("./components/modals/LocalServerConverterModal"));
const AIPanelGuideModal = lazy(() => import("./components/modals/AIPanelGuideModal"));
const FirstRunWizardModal = lazy(() => import("./components/modals/FirstRunWizardModal"));
const CommandPaletteDS = lazy(() =>
  import("./design-system").then((mod) => ({ default: mod.CommandPalette }))
);

import {
  isTauri,
  readFile,
  writeFile,
  detectProject,
  generateAIPanelConfig,
  createProjectFromTemplate,
  type FileEntry,
} from "./lib/tauri";
import { resolveTargetFile } from "./lib/codeResolver";

// ── Loading Fallback ─────────────────────────────────────────────

function PanelLoader() {
  return (
    <div className="flex-1 flex items-center justify-center bg-bg-base">
      <div className="flex items-center gap-3 text-zinc-500">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-xs font-medium tracking-wide">Loading…</span>
      </div>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────

export default function App() {
  // ── Store selectors (granular — no unnecessary re-renders) ────
  const operatingMode = useWorkspaceStore((s) => s.operatingMode);
  const projectPath = useWorkspaceStore((s) => s.projectPath);
  const projectInfo = useWorkspaceStore((s) => s.projectInfo);
  const showDetectionBanner = useWorkspaceStore((s) => s.showDetectionBanner);
  const environment = useWorkspaceStore((s) => s.environment);
  const currentBranch = useWorkspaceStore((s) => s.currentBranch);
  const recentProjects = useWorkspaceStore((s) => s.recentProjects);
  const isFirstInstall = useWorkspaceStore((s) => s.isFirstInstall);
  const [showFirstRunWizard, setShowFirstRunWizard] = useState(isFirstInstall);

  const setProjectPath = useWorkspaceStore((s) => s.setProjectPath);
  const setProjectInfo = useWorkspaceStore((s) => s.setProjectInfo);
  const setShowDetectionBanner = useWorkspaceStore((s) => s.setShowDetectionBanner);
  const setEnvironment = useWorkspaceStore((s) => s.setEnvironment);
  const setCurrentBranch = useWorkspaceStore((s) => s.setCurrentBranch);
  const saveRecentProject = useWorkspaceStore((s) => s.saveRecentProject);
  const closeProject = useWorkspaceStore((s) => s.closeProject);
  const setOperatingMode = useWorkspaceStore((s) => s.setOperatingMode);

  const tabs = useEditorStore((s) => s.tabs);
  const activeTab = useEditorStore((s) => s.activeTab);
  const openTab = useEditorStore((s) => s.openTab);
  const closeTab = useEditorStore((s) => s.closeTab);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const updateContent = useEditorStore((s) => s.updateContent);
  const saveFile = useEditorStore((s) => s.saveFile);
  const openFileByPath = useEditorStore((s) => s.openFileByPath);
  const closeAllTabs = useEditorStore((s) => s.closeAllTabs);
  const setTabs = useEditorStore((s) => s.setTabs);
  const applyAIEdit = useEditorStore((s) => s.applyAIEdit);
  const revertFile = useEditorStore((s) => s.revertFile);

  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const activePanel = useUIStore((s) => s.activePanel);
  const bottomExpanded = useUIStore((s) => s.bottomExpanded);
  const showAI = useUIStore((s) => s.showAI);
  const showDevOpsDock = useUIStore((s) => s.showDevOpsDock);
  const showCommandPalette = useUIStore((s) => s.showCommandPalette);
  const showWorkspaceSwitcher = useUIStore((s) => s.showWorkspaceSwitcher);
  const showFreeAIModal = useUIStore((s) => s.showFreeAIModal);
  const showModeModal = useUIStore((s) => s.showModeModal);
  const showLocalServerModal = useUIStore((s) => s.showLocalServerModal);
  const showGuideModal = useUIStore((s) => s.showGuideModal);
  const explorerWidth = useUIStore((s) => s.explorerWidth);
  const aiWidth = useUIStore((s) => s.aiWidth);
  const bottomHeight = useUIStore((s) => s.bottomHeight);

  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setActivePanel = useUIStore((s) => s.setActivePanel);
  const toggleBottom = useUIStore((s) => s.toggleBottom);
  const toggleAI = useUIStore((s) => s.toggleAI);
  const toggleDevOpsDock = useUIStore((s) => s.toggleDevOpsDock);
  const setShowCommandPalette = useUIStore((s) => s.setShowCommandPalette);
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette);
  const setShowWorkspaceSwitcher = useUIStore((s) => s.setShowWorkspaceSwitcher);
  const setShowFreeAIModal = useUIStore((s) => s.setShowFreeAIModal);
  const setShowModeModal = useUIStore((s) => s.setShowModeModal);
  const setShowLocalServerModal = useUIStore((s) => s.setShowLocalServerModal);
  const setShowGuideModal = useUIStore((s) => s.setShowGuideModal);
  const setShowAI = useUIStore((s) => s.setShowAI);
  const resizeExplorer = useUIStore((s) => s.resizeExplorer);
  const resetExplorerWidth = useUIStore((s) => s.resetExplorerWidth);
  const resizeAI = useUIStore((s) => s.resizeAI);
  const resetAIWidth = useUIStore((s) => s.resetAIWidth);
  const setBottomHeight = useUIStore((s) => s.setBottomHeight);
  const resetBottomHeight = useUIStore((s) => s.resetBottomHeight);

  const plugins = usePluginStore((s) => s.plugins);
  const togglePlugin = usePluginStore((s) => s.togglePlugin);
  const installPlugin = usePluginStore((s) => s.installPlugin);
  const uninstallPlugin = usePluginStore((s) => s.uninstallPlugin);

  // ── Global ⌘K / Ctrl+K Shortcut ───────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleCommandPalette();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCommandPalette]);

  // ── Auto-detect project on startup ─────────────────────────────
  useEffect(() => {
    const defaultPath = "/Volumes/Mac2TB/Botdigit/Developer/Projects/aipanel";
    detectProject(defaultPath)
      .then(async (info) => {
        setProjectInfo(info);
        const fileToOpen = info.suggested_file || `${defaultPath}/README.md`;
        try {
          const file = await readFile(fileToOpen);
          const fileName = fileToOpen.split("/").pop() || "README.md";
          setTabs([{
            path: file.path,
            name: fileName,
            language: file.language,
            content: file.content,
            originalContent: file.content,
            isDirty: false,
          }]);
          setActiveTab(file.path);
        } catch (readErr) {
          console.warn("Could not auto-open primary file on startup:", readErr);
        }
      })
      .catch((e) => console.warn("Initial detect project:", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Project Operations ─────────────────────────────────────────

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
        } catch {
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

        const fileToOpen = info.suggested_file || `${selectedPath}/package.json`;
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
          closeAllTabs();
        }

        saveRecentProject(info);
      } catch (err) {
        console.error("Failed to open project:", err);
      }
    },
    [setProjectPath, setProjectInfo, setShowDetectionBanner, setActivePanel, setTabs, setActiveTab, closeAllTabs, saveRecentProject, setShowWorkspaceSwitcher]
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
  }, [projectPath, setProjectInfo, setShowDetectionBanner]);

  const handleCreateProject = useCallback(
    async (targetDir: string, name: string, template: string, idea?: string) => {
      const info = await createProjectFromTemplate(targetDir, name, template, idea);
      setProjectPath(info.path);
      setProjectInfo(info);
      setShowDetectionBanner(false);
      setActivePanel("explorer");
      closeAllTabs();
      saveRecentProject(info);

      // Open initial file in Editor (README.md or suggested_file)
      const fileToOpen = info.suggested_file || `${info.path}/README.md`;
      try {
        const file = await readFile(fileToOpen);
        const fileName = fileToOpen.split("/").pop() || "README.md";
        setTabs([{
          path: file.path,
          name: fileName,
          language: file.language,
          content: file.content,
          originalContent: file.content,
          isDirty: false,
        }]);
        setActiveTab(file.path);
      } catch (err) {
        console.warn("Could not auto-open initial project file:", err);
      }

      // If it's a clean-ai project or blank, open AI Assistant and seed the Ideation Thread
      if (template === "clean-ai" || template === "clean" || template === "blank") {
        setShowAI(true);
        try {
          const sessionStore = useAISessionStore.getState();
          sessionStore.initProjectSessions(name, info.path);
          sessionStore.createSession(`Ideation: ${name}`);
          sessionStore.addMessage({
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: `### 🚀 Welcome to your new Clean Project: **${name}**!\n\nI have initialized your clean project foundation with:\n- 📄 **\`README.md\`**: Project vision, problem statement, and goals\n- 📋 **\`TASK.md\`**: Phased roadmap and sprint checklist\n- 🏗️ **\`ARCHITECTURE.md\`**: System design, data flow & candidate stack matrix\n- 🤖 **\`.agents/\`**: Basic discovery, project context, and agent skills\n\n${idea ? `**Your Initial Vision**: *"${idea}"*\n\n` : ""}**What kind of project would you like to build?**\nTell me your idea or core requirements, and I will:\n1. ⚖️ **Evaluate Candidate Tech Stacks** (Budget Lean Stack vs Enterprise Cloud Stack)\n2. 🗄️ **Draft Entity Models & Database Schema**\n3. 🛠️ **Scaffold the exact backend/frontend frameworks you choose**\n4. 🚀 **Guide you through 1-Click staging deployment**`,
            actions: [
              { label: "🗄️ Auto-Create Database Schema", action: "open_database" },
              { label: "🧠 Discover & Apply Agent Skills", action: "open_skills" },
              { label: "🚀 Deploy to Staging", action: "deploy_staging" },
            ],
            timestamp: new Date(),
          });
        } catch (err) {
          console.warn("Could not seed initial AI ideation session:", err);
        }
      }
    },
    [setProjectPath, setProjectInfo, setShowDetectionBanner, setActivePanel, closeAllTabs, saveRecentProject, setTabs, setActiveTab, setShowAI]
  );

  // ── File Operations ────────────────────────────────────────────

  const handleFileClick = useCallback(
    async (entry: FileEntry) => {
      if (entry.is_dir) return;

      try {
        const file = await readFile(entry.path);
        openTab({
          path: file.path,
          name: entry.name,
          language: file.language,
          content: file.content,
          originalContent: file.content,
          isDirty: false,
        });
      } catch (err) {
        console.error("Failed to read file:", err);
      }
    },
    [openTab]
  );

  const handleSidebarClick = useCallback(
    (id: string) => {
      if (id === "ai") {
        toggleAI();
      } else if (id === "explorer") {
        setActivePanel("explorer");
        setShowAI(true);
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
        setActivePanel(id as any);
      }
    },
    [toggleAI, setShowAI, setActivePanel, projectPath, setProjectPath, tabs.length, handleFileClick]
  );

  // ── Derived state ──────────────────────────────────────────────

  const projectName = projectInfo?.name || "AIPanel";
  const isGlobalToolPanel = [
    "control-center", "hosting", "clients", "servers",
    "releases", "rollbacks", "doctor", "docker", "workers",
    "git", "versions", "monitoring", "settings", "database",
    "tunnels", "billing", "domains",
  ].includes(activePanel);
  const showExplorer = operatingMode === "desktop" && activePanel === "explorer";
  const showDashboard = operatingMode === "desktop" && activePanel === "dashboard" && !isGlobalToolPanel;

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-bg-base">
      {/* Top Bar */}
      <TopBar
        projectName={projectName}
        projectPath={projectPath}
        environment={environment}
        onEnvironmentChange={setEnvironment}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={toggleSidebar}
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
        onOpenLocalServerConverter={() => setShowLocalServerModal(true)}
        onOpenGuide={() => setShowGuideModal(true)}
        onOpenSetup={() => setShowFirstRunWizard(true)}
        onCloseProject={() => {
          closeProject();
          closeAllTabs();
          setActivePanel("dashboard");
        }}
        onOpenDomains={() => setActivePanel("domains")}
        showDevOpsDock={showDevOpsDock}
        onToggleDevOps={toggleDevOpsDock}
        showAI={showAI}
        onToggleAI={toggleAI}
      />

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <Sidebar
          activeItem={activePanel}
          onItemClick={handleSidebarClick}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
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
                  <Suspense fallback={<PanelLoader />}>
                    <FileExplorer
                      projectPath={projectPath}
                      onFileClick={handleFileClick}
                      activeFilePath={activeTab || undefined}
                      onOpenWorkspaceSwitcher={() => setShowWorkspaceSwitcher(true)}
                    />
                  </Suspense>
                </div>
                <ResizeHandle
                  direction="vertical"
                  onResize={resizeExplorer}
                  onDoubleClick={resetExplorerWidth}
                  title="Drag left/right to resize file explorer • Double-click to reset (288px)"
                />
              </>
            )}

            {/* Main Panel Area — Lazy loaded */}
            <Suspense fallback={<PanelLoader />}>
              {operatingMode === "server" && !isGlobalToolPanel ? (
                <ServerDashboard
                  onOpenAppDeploy={() => setActivePanel("releases")}
                  onOpenTerminal={() => setActivePanel("terminal")}
                  onOpenDatabase={() => setActivePanel("database")}
                  onOpenDomains={() => setActivePanel("domains")}
                  onOpenBackups={() => setActivePanel("releases")}
                  onSwitchToDesktop={() => setOperatingMode("desktop")}
                />
              ) : showDashboard ? (
                <WelcomePage
                  onOpenProject={() => setShowWorkspaceSwitcher(true)}
                  recentProjects={recentProjects}
                  onOpenRecent={(path) => openProject(path)}
                  onCreateProject={handleCreateProject}
                  onOpenSetup={() => setShowFirstRunWizard(true)}
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
                  onTogglePlugin={togglePlugin}
                  onInstallPlugin={installPlugin}
                  onUninstallPlugin={uninstallPlugin}
                />
              ) : activePanel === "servers" ? (
                <ServerDashboard
                  onOpenAppDeploy={() => setActivePanel("releases")}
                  onOpenTerminal={() => setActivePanel("terminal")}
                  onOpenDatabase={() => setActivePanel("database")}
                  onOpenDomains={() => setActivePanel("domains")}
                  onOpenBackups={() => setActivePanel("releases")}
                  onSwitchToDesktop={() => setOperatingMode("desktop")}
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
              ) : activePanel === "doc-agent" ? (
                <DocAgentPanel projectPath={projectPath || "."} />
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
                  projectPath={projectPath}
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
                  onTabClose={closeTab}
                  onContentChange={updateContent}
                  onSave={saveFile}
                  onRevert={revertFile}
                  projectName={projectInfo?.name || "aipanel"}
                  projectPath={projectPath}
                  projectFramework={projectInfo?.framework || "React 19 (Vite + Tauri)"}
                  onOpenFileByPath={openFileByPath}
                  onOpenWorkspaceSwitcher={() => setShowWorkspaceSwitcher(true)}
                />
              )}
            </Suspense>

            {/* AI Panel (Only in Desktop Workspace / Editor mode) */}
            {operatingMode === "desktop" && activePanel === "explorer" && showAI && (
              <>
                <ResizeHandle
                  direction="vertical"
                  onResize={resizeAI}
                  onDoubleClick={resetAIWidth}
                  title="Drag left/right to resize AI panel • Double-click to reset (340px)"
                />
                <div
                  style={{ width: `${aiWidth}px` }}
                  className="shrink-0 border-l border-zinc-800 overflow-hidden flex flex-col"
                >
                  <Suspense fallback={<PanelLoader />}>
                    <AIPanel
                      environment={environment}
                      projectName={projectInfo?.name || "aipanel"}
                      projectPath={projectPath || "/Volumes/Mac2TB/Botdigit/Developer/Projects/aipanel"}
                      activeFilePath={activeTab || undefined}
                      onOpenBilling={() => setActivePanel("billing")}
                      onOpenFreeAI={() => setShowFreeAIModal(true)}
                      onOpenGuideModal={() => setShowGuideModal(true)}
                      onOpenTunnels={() => setActivePanel("domains")}
                      onOpenDatabase={() => setActivePanel("database")}
                      onOpenSkills={() => setActivePanel("doc-agent")}
                      onDeployClick={(targetEnv) => {
                        if (targetEnv) setEnvironment(targetEnv);
                        setActivePanel("releases");
                      }}
                      onApplyCode={(code, suggestedPath) => {
                        const root =
                          projectPath ||
                          "/Volumes/Mac2TB/Botdigit/Developer/Projects/aipanel";
                        const { targetPath, fileName, language } =
                          resolveTargetFile(code, activeTab, root, suggestedPath);

                        setActivePanel("explorer");
                        const tab = tabs.find((t) => t.path === targetPath);
                        if (tab) {
                          applyAIEdit(
                            targetPath,
                            code,
                            "AIPanel AI",
                            "AI Automated Optimization & Code Refactor"
                          );
                        } else {
                          const isAutoSave = useEditorStore.getState().autoSave;
                          openTab({
                            path: targetPath,
                            name: fileName,
                            language,
                            content: code,
                            originalContent: code,
                            isDirty: false,
                            aiEditSummary: "AI Generated File",
                          });
                          if (isAutoSave) {
                            writeFile(targetPath, code).catch((err) =>
                              console.error("Auto-save failed on new file creation:", err)
                            );
                          }
                        }
                      }}
                    />
                  </Suspense>
                </div>
              </>
            )}

            {/* DevOps Control Center Dock */}
            {operatingMode === "desktop" && activePanel === "explorer" && showDevOpsDock && (
              <Suspense fallback={<PanelLoader />}>
                <DevOpsControlPanel
                  environment={environment}
                  projectName={projectInfo?.name}
                  projectPath={projectPath}
                  onOpenDeploy={() => setActivePanel("releases")}
                  onOpenServers={() => setActivePanel("servers")}
                  onOpenDomains={() => setActivePanel("domains")}
                  onOpenTunnels={() => setActivePanel("tunnels")}
                  onOpenMonitoring={() => setActivePanel("monitoring")}
                  onClose={() => useUIStore.getState().setShowDevOpsDock(false)}
                />
              </Suspense>
            )}
          </div>

          {/* Bottom Panel */}
          <Suspense fallback={null}>
            <BottomPanel
              expanded={bottomExpanded}
              onToggle={toggleBottom}
              height={bottomHeight}
              onHeightChange={setBottomHeight}
              onResetHeight={resetBottomHeight}
              projectPath={projectPath}
              projectName={projectInfo?.name || "aipanel"}
              environment={environment}
              onOpenTunnels={() => setActivePanel("tunnels")}
            />
          </Suspense>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        environment={environment}
        services={defaultDevServices}
        activeFile={activeTab || undefined}
        cursorPosition={activeTab ? { line: 1, col: 1 } : undefined}
        gitBranch={currentBranch}
        onSelectService={(name) =>
          setActivePanel(name === "PostgreSQL" || name === "Redis" ? "database" : "docker")
        }
        onSelectBranch={() => setActivePanel("git")}
        onSelectEnvironment={() => setActivePanel("releases")}
      />

      {/* Lazy-loaded Modals — only mount when visible */}
      {showModeModal && (
        <Suspense fallback={null}>
          <ModeSelectorModal
            isOpen={showModeModal}
            currentMode={operatingMode}
            onSelectMode={setOperatingMode}
            onClose={() => setShowModeModal(false)}
          />
        </Suspense>
      )}

      {showCommandPalette && (
        <Suspense fallback={null}>
          <CommandPaletteDS
            isOpen={showCommandPalette}
            onClose={() => setShowCommandPalette(false)}
            onNavigate={(panel) => setActivePanel(panel as any)}
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
        </Suspense>
      )}

      {showWorkspaceSwitcher && (
        <Suspense fallback={null}>
          <WorkspaceSwitcherModal
            isOpen={showWorkspaceSwitcher}
            onClose={() => setShowWorkspaceSwitcher(false)}
            currentPath={projectPath}
            onSelectWorkspace={(path) => openProject(path)}
            recentProjects={recentProjects}
          />
        </Suspense>
      )}

      {showFreeAIModal && (
        <Suspense fallback={null}>
          <FreeAIModal
            isOpen={showFreeAIModal}
            onClose={() => setShowFreeAIModal(false)}
            onSelectProvider={(p) => {
              localStorage.setItem("aipanel_ai_provider", p);
              setShowAI(true);
            }}
          />
        </Suspense>
      )}

      {showLocalServerModal && (
        <Suspense fallback={null}>
          <LocalServerConverterModal
            isOpen={showLocalServerModal}
            onClose={() => setShowLocalServerModal(false)}
            projectName={projectName}
            projectPath={projectPath}
          />
        </Suspense>
      )}

      {showGuideModal && (
        <Suspense fallback={null}>
          <AIPanelGuideModal
            isOpen={showGuideModal}
            onClose={() => setShowGuideModal(false)}
            onNavigate={(panel) => setActivePanel(panel as any)}
          />
        </Suspense>
      )}

      {showFirstRunWizard && (
        <Suspense fallback={null}>
          <FirstRunWizardModal
            isOpen={showFirstRunWizard}
            onClose={() => setShowFirstRunWizard(false)}
            onComplete={() => setShowFirstRunWizard(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
