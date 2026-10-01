import { useState, useCallback } from "react";
import {
  LayoutDashboard,
  Code2,
  Bot,
  GitBranch,
  Container,
  Database,
  Cpu,
  Terminal,
  Eye,
  Layers,
  Rocket,
  ArrowUpRight,
  Server,
  Globe,
  Activity,
  Archive,
  CreditCard,
  Users,
  Settings,
  Shield,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "../../design-system";

export type SidebarGroupKey =
  | "workspace"
  | "development"
  | "delivery"
  | "infrastructure"
  | "clients"
  | "control";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  badgeType?: "status" | "env" | "type";
  badgeColor?: string;
  statusDot?: boolean;
}

export interface NavGroup {
  key: SidebarGroupKey;
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    key: "workspace",
    label: "WORKSPACE",
    items: [
      { id: "dashboard", label: "Overview", icon: LayoutDashboard },
      { id: "explorer", label: "Code", icon: Code2 },
      { id: "ai", label: "AI Agent", icon: Bot, badge: "PRO", badgeType: "type" },
      { id: "git", label: "Source Control", icon: GitBranch, badge: "3", badgeType: "type" },
    ],
  },
  {
    key: "development",
    label: "DEVELOPMENT",
    items: [
      { id: "docker", label: "Services", icon: Container },
      { id: "database", label: "Database", icon: Database },
      { id: "workers", label: "Workers", icon: Cpu },
      { id: "terminal", label: "Terminal", icon: Terminal },
    ],
  },
  {
    key: "delivery",
    label: "DELIVERY",
    items: [
      { id: "preview", label: "Preview", icon: Eye, badge: "Live", badgeType: "status", statusDot: true },
      { id: "environments", label: "Environments", icon: Layers },
      { id: "releases", label: "Releases", icon: Rocket },
      { id: "deployments", label: "Deployments", icon: ArrowUpRight },
    ],
  },
  {
    key: "infrastructure",
    label: "INFRASTRUCTURE",
    items: [
      { id: "servers", label: "Servers", icon: Server },
      { id: "domains", label: "Domains & SSL", icon: Globe, badge: "SSL", badgeType: "type" },
      { id: "monitoring", label: "Monitoring", icon: Activity },
      { id: "backups", label: "Backups", icon: Archive },
    ],
  },
  {
    key: "clients",
    label: "CLIENTS",
    items: [
      { id: "hosting", label: "Hosting", icon: CreditCard, badge: "Active", badgeType: "status" },
      { id: "clients", label: "CRM", icon: Users, badge: "CRM", badgeType: "type" },
    ],
  },
  {
    key: "control",
    label: "CONTROL",
    items: [
      { id: "control-center", label: "Control Center", icon: Shield, badge: "CORE", badgeType: "type" },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  activePanel?: string;
  activeItem?: string;
  onSelectPanel?: (id: string) => void;
  onItemClick?: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  projectName?: string;
  plugins?: any[];
}

export default function Sidebar({
  activePanel,
  activeItem,
  onSelectPanel,
  onItemClick,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const currentActive = activePanel || activeItem || "explorer";
  const handleSelect = (id: string) => {
    onSelectPanel?.(id);
    onItemClick?.(id);
  };
  // Persisted collapse state per group with progressive disclosure defaults
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("aipanel_sidebar_collapsed_groups");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Default progressive disclosure: Keep core IDE groups open, collapse secondary groups
    return {
      workspace: false,
      development: false,
      delivery: true,
      infrastructure: true,
      clients: true,
      control: true,
    };
  });

  // Automatically expand group if its child is active
  const isGroupExpanded = (groupKey: string, groupItems: NavItem[]) => {
    if (groupItems.some((it) => it.id === currentActive)) {
      return true;
    }
    return !collapsedGroups[groupKey];
  };

  const toggleGroup = useCallback((groupKey: string) => {
    setCollapsedGroups((prev) => {
      const isCurrentlyCollapsed = prev[groupKey] ?? (groupKey !== "workspace" && groupKey !== "development");
      const updated = { ...prev, [groupKey]: !isCurrentlyCollapsed };
      localStorage.setItem("aipanel_sidebar_collapsed_groups", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <aside
      className={`h-full bg-[#0c0e16] border-r border-[#1e2437] flex flex-col shrink-0 transition-all duration-200 select-none z-20 ${
        collapsed ? "w-14" : "w-64"
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-11 px-3 flex items-center justify-between border-b border-[#1b2030] shrink-0 bg-[#0a0c13]/50">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold tracking-widest text-zinc-400 uppercase font-mono">
              WORKSPACE EXPLORER
            </span>
          </div>
        ) : null}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? "Expand Sidebar (256px)" : "Collapse Sidebar (56px)"}
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer ml-auto"
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Groups Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 space-y-3">
        {navGroups.map((group) => {
          const expanded = isGroupExpanded(group.key, group.items);

          return (
            <div key={group.key} className="space-y-0.5">
              {/* Group Header (only when expanded) */}
              {!collapsed ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.key)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-extrabold text-zinc-400 tracking-widest hover:text-zinc-200 rounded group cursor-pointer transition-colors"
                >
                  <span className="font-mono">{group.label}</span>
                  <span className="text-zinc-500 group-hover:text-zinc-400">
                    {!expanded ? (
                      <ChevronRight className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </span>
                </button>
              ) : (
                <div className="h-px border-t border-[#1e2437] mx-2 my-1.5" />
              )}

              {/* Group Items */}
              {(expanded || collapsed) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentActive === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item.id)}
                        title={collapsed ? item.label : undefined}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                          isActive
                            ? "bg-violet-600/15 text-violet-300 font-semibold border border-violet-500/25 shadow-sm"
                            : "text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent"
                        } ${collapsed ? "justify-center px-0 py-2" : ""}`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? "text-violet-400" : "text-zinc-400"
                          }`}
                        />
                        {!collapsed && (
                          <>
                            <span className="truncate flex-1 text-left text-[13px] leading-tight">
                              {item.label}
                            </span>
                            {item.badge && (
                              <Badge
                                category={item.badgeType || "type"}
                                status={item.statusDot ? "active" : undefined}
                                dot={item.statusDot}
                                className="scale-95 origin-right"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
