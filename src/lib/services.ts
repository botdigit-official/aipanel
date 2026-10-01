import { Database, HardDrive, Wifi, type LucideIcon } from "lucide-react";

export interface ServiceStatus {
  name: string;
  icon: LucideIcon;
  status: "running" | "stopped" | "error";
  port?: number;
}

export const defaultDevServices: ServiceStatus[] = [
  { name: "PostgreSQL", icon: Database, status: "stopped", port: 5432 },
  { name: "Redis", icon: HardDrive, status: "stopped", port: 6379 },
  { name: "Tunnel", icon: Wifi, status: "stopped" },
];
