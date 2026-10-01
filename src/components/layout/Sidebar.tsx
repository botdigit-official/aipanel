import { useState } from "react";
import {
  LayoutDashboard,
  Code2,
  Bot,
  GitBranch,
  PlayCircle,
  Container,
  Database,
  Cpu,
  Terminal,
  Link,
  Eye,
  History,
  Rocket,
  Layers,
  Undo2,
  Server,
  Globe,
  Archive,
  Activity,
  Blocks,
  FileDiff,
  CreditCard,
  Users,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import type { AIPanelPlugin } from "../../lib/types";

// ── Types ────────────────────────────────────────────────────────

export type SidebarSection =
  | "workspace"
  | "run"
  | "delivery"
  | "infrastructure"
  | "hosting"
  | "control_center";

export interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  section: SidebarSection;
  badge?: string;
  badgeColor?: string;
  disabled?: boolean;
  pluginId?: string;
}

const baseSidebarItems: SidebarItem[] = [
  // 1. WORKSPACE
  { id: "dashboard", label: "Overview", icon: LayoutDashboard, section: "workspace" },
  { id: "explorer", label: "Code", icon: Code2, section: "workspace" },
  { id: "ai", label: "AI Agent", icon: Bot, section: "workspace", badge: "Pro", badgeColor: "bg-indigo-500/20 text-indigo-300" },
  { id: "changes", label: "Changes", icon: FileDiff, section: "workspace", badge: "3", badgeColor: "bg-amber-500/20 text-amber-300" },
  { id: "git", label: "Source Control", icon: GitBranch, section: "workspace" },

  // 2. RUN
  { id: "development", label: "Development", icon: PlayCircle, section: "run", badge: "Active", badgeColor: "bg-emerald-500/20 text-emerald-300" },
  { id: "docker", label: "Services", icon: Container, section: "run" },
  { id: "database", label: "Database", icon: Database, section: "run" },
  { id: "workers", label: "Workers", icon: Cpu, section: "run" },
  { id: "terminal", label: "Terminal", icon: Terminal, section: "run" },
  { id: "tunnels", label: "Tunnels", icon: Link, section: "run" },

  // 3. DELIVERY
  { id: "preview", label: "Preview", icon: Eye, section: "delivery", badge: "Live", badgeColor: "bg-sky-500/20 text-sky-300" },
  { id: "environments", label: "Environments", icon: Layers, section: "delivery" },
  { id: "versions", label: "Versions", icon: History, section: "delivery" },
  { id: "releases", label: "Releases", icon: Rocket, section: "delivery" },
  { id: "rollbacks", label: "Rollbacks", icon: Undo2, section: "delivery" },

  // 4. INFRASTRUCTURE
  { id: "servers", label: "Servers", icon: Server, section: "infrastructure" },
  { id: "monitoring", label: "Monitoring", icon: Activity, section: "infrastructure" },
  { id: "backups", label: "Backups", icon: Archive, section: "infrastructure" },

  // 5. CONTROL CENTER (Centralized configuration & plugins)
  {
    id: "control-center",
    label: "Control Center",
    icon: Blocks,
    section: "control_center",
    badge: "Core",
    badgeColor: "bg-indigo-500/20 text-indigo-300",
  },
];

const sectionMetadata: Record<SidebarSection, { label: string }> = {
  workspace: { label: "WORKSPACE" },
  run: { label: "RUN" },
  delivery: { label: "DELIVERY" },
  infrastructure: { label: "INFRASTRUCTURE" },
  hosting: { label: "HOSTING & CLIENTS" },
  control_center: { label: "CONTROL CENTER" },
};

// ── Component ────────────────────────────────────────────────────

interface SidebarProps {
  activeItem: string;
  onItemClick: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  projectName?: string;
  plugins?: AIPanelPlugin[];
}

export default function Sidebar({
  activeItem,
  onItemClick,
  collapsed,
  plugins = [],
}: SidebarProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    delivery: false,
    infrastructure: false,
    hosting: false,
  });

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Dynamically assemble items based on active plugins
  const isDomainsActive = plugins.some((p) => p.id === "domains-dns" && p.enabled);
  const isHostingActive = plugins.some((p) => p.id === "hosting-core" && p.enabled);
  const isCrmActive = plugins.some((p) => p.id === "client-crm" && p.enabled);

  const dynamicItems: SidebarItem[] = [...baseSidebarItems];

  // If domains plugin is active, inject into Infrastructure
  if (isDomainsActive) {
    dynamicItems.splice(dynamicItems.findIndex((i) => i.id === "monitoring"), 0, {
      id: "domains",
      label: "Domains & SSL",
      icon: Globe,
      section: "infrastructure",
      badge: "SSL",
      badgeColor: "bg-emerald-500/20 text-emerald-300",
    });
  }

  // If hosting plugin active, inject into Hosting section
  if (isHostingActive) {
    dynamicItems.push({
      id: "hosting",
      label: "Hosting Plans",
      icon: CreditCard,
      section: "hosting",
      badge: "Active",
      badgeColor: "bg-purple-500/20 text-purple-300",
    });
  }

  // If CRM plugin active, inject into Hosting section
  if (isCrmActive) {
    dynamicItems.push({
      id: "clients",
      label: "Client CRM",
      icon: Users,
      section: "hosting",
      badge: "CRM",
      badgeColor: "bg-purple-500/20 text-purple-300",
    });
  }

  // Group items by section
  const sections: SidebarSection[] = [
    "workspace",
    "run",
    "delivery",
    "infrastructure",
    ...(isHostingActive || isCrmActive ? (["hosting"] as SidebarSection[]) : []),
    "control_center",
  ];

  return (
    <aside
      className={`bg-[#0d0f18] border-r border-slate-800/80 flex flex-col shrink-0 select-none transition-all duration-200 z-10 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4">
        {sections.map((section) => {
          const items = dynamicItems.filter((i) => i.section === section);
          if (items.length === 0) return null;
          const isCollapsed = collapsedSections[section];

          return (
            <div key={section} className="space-y-1">
              {/* Section Header */}
              {!collapsed && (
                <div
                  onClick={() => toggleSection(section)}
                  className="flex items-center justify-between px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <span>{sectionMetadata[section].label}</span>
                  {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                </div>
              )}

              {/* Items */}
              {(!isCollapsed || collapsed) &&
                items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => !item.disabled && onItemClick(item.id)}
                      disabled={item.disabled}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                        isActive
                          ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold shadow-xs"
                          : item.disabled
                          ? "opacity-30 cursor-not-allowed text-slate-600"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={`shrink-0 transition-transform group-hover:scale-105 ${
                          isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"
                        }`}
                      />

                      {!collapsed && (
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                                item.badgeColor
                                  ? `${item.badgeColor} border-current/20`
                                  : "bg-slate-800 text-slate-400 border-slate-700"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          );
        })}
      </nav>

      {/* Footer Branding */}
      <div className="p-4 border-t border-slate-800/80 bg-[#090a0f] flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs text-slate-400 font-mono font-medium">AIPanel v0.1.0 • Live</span>
          </div>
        ) : (
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mx-auto animate-pulse"></div>
        )}
      </div>
    </aside>
  );
}
