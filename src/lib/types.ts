export type OperatingMode = "desktop" | "server" | "remote_client";

export type Environment = "dev" | "staging" | "production";

export type PluginCategory =
  | "development"
  | "infrastructure"
  | "hosting"
  | "ai"
  | "monitoring"
  | "backup";

export interface PluginPermission {
  id: string;
  name: string;
  description: string;
}

export interface AIPanelPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: PluginCategory;
  permissions: PluginPermission[];
  installed: boolean;
  enabled: boolean;
  compatibleVersion: string;
  isPaid?: boolean;
  price?: string;
  routeId?: string;
  sidebarLabel?: string;
  sidebarSection?: "infrastructure" | "control_center" | "hosting";
  settings?: Record<string, any>;
}

export interface HostingPlan {
  id: string;
  name: string;
  price: string;
  cycle: "monthly" | "yearly";
  websites: number;
  databases: number;
  storageGb: number;
  domains: number;
  emails: number;
  bandwidthGb: number;
  activeSubscribers: number;
}

export interface ClientRecord {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  planId: string;
  websitesCount: number;
  domainsCount: number;
  renewalDate: string;
  status: "active" | "expiring_soon" | "overdue";
  outstandingAmount: string;
  openTickets: number;
}

export interface ServerApplication {
  id: string;
  name: string;
  status: "running" | "stopped" | "deploying" | "failed";
  environment: Environment;
  domain: string;
  port: number;
  version: string;
  cpuPercent: number;
  ramMb: number;
  lastDeployment: string;
  framework: string;
  containers: string[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorType: "user" | "ai" | "agent" | "system";
  action: string;
  target: string;
  severity: "info" | "warning" | "critical";
  environment?: Environment;
}

export interface DomainRecord {
  id: string;
  name: string;
  status: "active" | "pending" | "expired";
  expiresAt: string;
  autoRenew: boolean;
  dnsProvider: string;
  sslStatus: "valid" | "expiring" | "invalid";
  clientId?: string;
  clientName?: string;
}

export interface AIProviderConfig {
  id: string;
  name: string;
  type: "openai" | "anthropic" | "gemini" | "groq" | "ollama" | "deepseek" | "openrouter";
  apiKey: string;
  isConfigured: boolean;
  models: string[];
  selectedModel: string;
  tokensUsedThisMonth: number;
  estimatedCost: string;
  monthlyLimitUsd: number;
}
