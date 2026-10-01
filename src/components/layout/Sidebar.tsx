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
  // Persisted collapse state per group
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("aipanel_sidebar_collapsed_groups");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleGroup = useCallback((groupKey: string) => {
    setCollapsedGroups((prev) => {
      const updated = { ...prev, [groupKey]: !prev[groupKey] };
      localStorage.setItem("aipanel_sidebar_collapsed_groups", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <aside
      className={`h-full bg-[#0C0D12] border-r border-white/8 flex flex-col shrink-0 transition-all duration-200 select-none z-20 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-white/6 shrink-0">
        {!collapsed && (
          <span className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase font-mono">
            Navigation
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? "Expand Sidebar (240px)" : "Collapse Sidebar (64px)"}
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer ml-auto"
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Groups Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 space-y-4">
        {navGroups.map((group) => {
          const isGroupCollapsed = Boolean(collapsedGroups[group.key]);

          return (
            <div key={group.key} className="space-y-0.5">
              {/* Group Header (only when expanded) */}
              {!collapsed ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.key)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-bold text-zinc-400 tracking-wider hover:text-zinc-300 rounded group cursor-pointer transition-colors"
                >
                  <span>{group.label}</span>
                  <span className="text-zinc-500 group-hover:text-zinc-400">
                    {isGroupCollapsed ? (
                      <ChevronRight className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </span>
                </button>
              ) : (
                <div className="h-1 border-t border-white/5 mx-2 my-1.5" />
              )}

              {/* Group Items */}
              {(!isGroupCollapsed || collapsed) && (
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
