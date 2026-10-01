import { useState, useMemo, useEffect } from "react";
import {
  Database,
  Table,
  Play,
  Download,
  CheckCircle2,
  Lock,
  Layers,
  Search,
  FileCode,
  Zap,
  Filter,
} from "lucide-react";
import type { Environment } from "../layout/TopBar";

export type DatabaseEngine = "sqlite" | "postgres" | "mysql" | "redis";

interface DatabasePanelProps {
  environment: Environment;
  projectName?: string;
  projectPath?: string | null;
}

interface ColumnDef {
  name: string;
  type: string;
  isPrimary: boolean;
  isNullable: boolean;
}

interface TableSchema {
  name: string;
  rowCount: number;
  columns: ColumnDef[];
}

// ── SQLite Schema (Default in DEV) ──────────────────────────────────
const sqliteMockTables: TableSchema[] = [
  {
    name: "users",
    rowCount: 1420,
    columns: [
      { name: "id", type: "INTEGER", isPrimary: true, isNullable: false },
      { name: "username", type: "TEXT", isPrimary: false, isNullable: false },
      { name: "email", type: "TEXT", isPrimary: false, isNullable: false },
      { name: "role", type: "TEXT", isPrimary: false, isNullable: false },
      { name: "is_active", type: "INTEGER", isPrimary: false, isNullable: false },
      { name: "created_at", type: "DATETIME", isPrimary: false, isNullable: false },
    ],
  },
  {
    name: "tasks",
    rowCount: 342,
    columns: [
      { name: "id", type: "INTEGER", isPrimary: true, isNullable: false },
      { name: "title", type: "TEXT", isPrimary: false, isNullable: false },
      { name: "status", type: "TEXT", isPrimary: false, isNullable: false },
      { name: "priority", type: "INTEGER", isPrimary: false, isNullable: false },
      { name: "assignee", type: "TEXT", isPrimary: false, isNullable: true },
      { name: "created_at", type: "DATETIME", isPrimary: false, isNullable: false },
    ],
  },
  {
    name: "app_settings",
    rowCount: 18,
    columns: [
      { name: "key", type: "TEXT", isPrimary: true, isNullable: false },
      { name: "value", type: "TEXT", isPrimary: false, isNullable: false },
      { name: "category", type: "TEXT", isPrimary: false, isNullable: false },
      { name: "updated_at", type: "DATETIME", isPrimary: false, isNullable: false },
    ],
  },
  {
    name: "activity_logs",
    rowCount: 5612,
    columns: [
      { name: "id", type: "INTEGER", isPrimary: true, isNullable: false },
      { name: "action", type: "TEXT", isPrimary: false, isNullable: false },
      { name: "actor", type: "TEXT", isPrimary: false, isNullable: false },
      { name: "ip_address", type: "TEXT", isPrimary: false, isNullable: true },
      { name: "created_at", type: "DATETIME", isPrimary: false, isNullable: false },
    ],
  },
];

// ── PostgreSQL Schema ──────────────────────────────────────────────
const postgresMockTables: TableSchema[] = [
  {
    name: "users",
    rowCount: 1420,
    columns: [
      { name: "id", type: "uuid", isPrimary: true, isNullable: false },
      { name: "email", type: "varchar(255)", isPrimary: false, isNullable: false },
      { name: "password_hash", type: "text", isPrimary: false, isNullable: false },
      { name: "role", type: "varchar(32)", isPrimary: false, isNullable: false },
      { name: "created_at", type: "timestamptz", isPrimary: false, isNullable: false },
    ],
  },
  {
    name: "deployments",
    rowCount: 86,
    columns: [
      { name: "id", type: "uuid", isPrimary: true, isNullable: false },
      { name: "version", type: "varchar(64)", isPrimary: false, isNullable: false },
      { name: "environment", type: "varchar(32)", isPrimary: false, isNullable: false },
      { name: "status", type: "varchar(32)", isPrimary: false, isNullable: false },
      { name: "commit_hash", type: "varchar(40)", isPrimary: false, isNullable: true },
      { name: "created_at", type: "timestamptz", isPrimary: false, isNullable: false },
    ],
  },
  {
    name: "services",
    rowCount: 12,
    columns: [
      { name: "id", type: "varchar(64)", isPrimary: true, isNullable: false },
      { name: "name", type: "varchar(128)", isPrimary: false, isNullable: false },
      { name: "port", type: "integer", isPrimary: false, isNullable: false },
      { name: "status", type: "varchar(32)", isPrimary: false, isNullable: false },
      { name: "replicas", type: "integer", isPrimary: false, isNullable: false },
    ],
  },
  {
    name: "migrations",
    rowCount: 24,
    columns: [
      { name: "version", type: "bigint", isPrimary: true, isNullable: false },
      { name: "name", type: "varchar(255)", isPrimary: false, isNullable: false },
      { name: "applied_at", type: "timestamptz", isPrimary: false, isNullable: false },
    ],
  },
];

// ── MySQL Schema ───────────────────────────────────────────────────
const mysqlMockTables: TableSchema[] = [
  {
    name: "accounts",
    rowCount: 2840,
    columns: [
      { name: "account_id", type: "BIGINT UNSIGNED AUTO_INCREMENT", isPrimary: true, isNullable: false },
      { name: "username", type: "VARCHAR(191)", isPrimary: false, isNullable: false },
      { name: "email", type: "VARCHAR(191)", isPrimary: false, isNullable: false },
      { name: "status", type: "ENUM('active','suspended')", isPrimary: false, isNullable: false },
      { name: "created_at", type: "DATETIME", isPrimary: false, isNullable: false },
    ],
  },
  {
    name: "orders",
    rowCount: 10450,
    columns: [
      { name: "order_id", type: "BIGINT UNSIGNED AUTO_INCREMENT", isPrimary: true, isNullable: false },
      { name: "account_id", type: "BIGINT UNSIGNED", isPrimary: false, isNullable: false },
      { name: "amount_cents", type: "INT", isPrimary: false, isNullable: false },
      { name: "currency", type: "VARCHAR(3)", isPrimary: false, isNullable: false },
      { name: "status", type: "VARCHAR(32)", isPrimary: false, isNullable: false },
      { name: "created_at", type: "DATETIME", isPrimary: false, isNullable: false },
    ],
  },
];

// ── Redis Key-Value Store ──────────────────────────────────────────
interface RedisItem {
  key: string;
  type: "string" | "hash" | "list" | "set" | "zset";
  ttl: number;
  valuePreview: string;
  size: string;
}

const redisMockKeys: RedisItem[] = [
  { key: "sess:usr_9918a2bc", type: "hash", ttl: 3420, valuePreview: '{"user_id": 1420, "role": "admin", "login_ip": "127.0.0.1"}', size: "384 B" },
  { key: "cache:aipanel_fleet_status", type: "string", ttl: 54, valuePreview: '{"healthy": 8, "latency_ms": 1.2, "uptime": "99.98%"}', size: "1.1 KB" },
  { key: "ratelimit:127.0.0.1:api", type: "string", ttl: 28, valuePreview: "14", size: "8 B" },
  { key: "queue:deploy_jobs", type: "list", ttl: -1, valuePreview: "['build_v3.2', 'sync_caddy_cert', 'prune_images']", size: "2.4 KB" },
  { key: "active_sessions_set", type: "set", ttl: 86400, valuePreview: "142 active session keys recorded", size: "4.8 KB" },
];

export default function DatabasePanel({ environment, projectName, projectPath }: DatabasePanelProps) {
  // Database Engine selection - defaults to SQLite in Dev!
  const [engine, setEngine] = useState<DatabaseEngine>(() => {
    return environment === "dev" ? "sqlite" : "postgres";
  });

  const [activeTab, setActiveTab] = useState<"data" | "schema">("data");
  const [tableSearch, setTableSearch] = useState("");
  const [dataSearch, setDataSearch] = useState("");
  const [sqliteFile, setSqliteFile] = useState<string>(() => {
    const base = projectPath ? projectPath.split("/").filter(Boolean).pop() : projectName;
    return `${base ? base.toLowerCase().replace(/[^a-z0-9_-]/g, "_") : "dev"}.sqlite`;
  });
  const [isEditingFile, setIsEditingFile] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);

  // Active tables based on engine
  const currentTables = useMemo(() => {
    if (engine === "sqlite") return sqliteMockTables;
    if (engine === "mysql") return mysqlMockTables;
    return postgresMockTables;
  }, [engine]);

  const [selectedTable, setSelectedTable] = useState<TableSchema>(currentTables[0]);
  const [query, setQuery] = useState(`SELECT * FROM ${currentTables[0].name} LIMIT 10;`);
  const [queryRunning, setQueryRunning] = useState(false);
  const [queryResult, setQueryResult] = useState<Record<string, any>[] | null>(null);
  const [queryDuration, setQueryDuration] = useState<number | null>(null);

  // Reset selected table and query when engine changes
  useEffect(() => {
    const defaultTable = currentTables[0];
    setSelectedTable(defaultTable);
    if (engine === "redis") {
      setQuery("KEYS *");
    } else {
      setQuery(`SELECT * FROM ${defaultTable.name} LIMIT 10;`);
    }
    setQueryResult(null);
  }, [engine, currentTables]);

  // Generate realistic data rows when table changes or query runs
  const generateMockRows = (tbl: TableSchema, count = 8) => {
    return Array.from({ length: count }).map((_, i) => {
      const row: Record<string, any> = {};
      for (const col of tbl.columns) {
        if (col.isPrimary) {
          row[col.name] = i + 1;
        } else if (col.name === "email") {
          row[col.name] = `user${i + 1}@${projectName || "aipanel"}.io`;
        } else if (col.name === "username" || col.name === "actor") {
          row[col.name] = `developer_${i + 1}`;
        } else if (col.name === "role") {
          row[col.name] = i === 0 ? "admin" : i % 2 === 0 ? "engineer" : "viewer";
        } else if (col.name === "is_active") {
          row[col.name] = 1;
        } else if (col.name === "title") {
          row[col.name] = ["Deploy cluster v3.2", "Review PR #42", "Refactor SQLite Engine", "Configure SSL certs", "Update docs"][i % 5];
        } else if (col.name === "status") {
          row[col.name] = ["completed", "in_progress", "pending", "active"][i % 4];
        } else if (col.name === "priority") {
          row[col.name] = (i % 3) + 1;
        } else if (col.name === "key") {
          row[col.name] = ["app.env", "auth.session_ttl", "db.engine", "ui.theme"][i % 4];
        } else if (col.name === "value") {
          row[col.name] = ["production", "86400", "sqlite", "dark"][i % 4];
        } else if (col.name.includes("at") || col.name.includes("date")) {
          row[col.name] = new Date(Date.now() - i * 7200000).toISOString().replace("T", " ").slice(0, 19);
        } else if (col.name === "ip_address") {
          row[col.name] = `192.168.1.${10 + i}`;
        } else if (col.type.includes("INT")) {
          row[col.name] = (i + 1) * 100;
        } else {
          row[col.name] = `${col.name}_val_${i + 1}`;
        }
      }
      return row;
    });
  };

  // Initial data rows for selected table
  useEffect(() => {
    if (engine !== "redis") {
      setQueryResult(generateMockRows(selectedTable, 8));
      setQueryDuration(0.8);
    }
  }, [selectedTable, engine]);

  const handleSelectTable = (tbl: TableSchema) => {
    setSelectedTable(tbl);
    setQuery(`SELECT * FROM ${tbl.name} LIMIT 10;`);
    setQueryResult(generateMockRows(tbl, 8));
    setQueryDuration(0.6);
  };

  const handleRunQuery = () => {
    setQueryRunning(true);
    setTimeout(() => {
      if (engine === "redis") {
        setQueryDuration(0.4);
      } else {
        const rows = generateMockRows(selectedTable, 8);
        setQueryResult(rows);
        setQueryDuration(Number((Math.random() * 1.5 + 0.4).toFixed(1)));
      }
      setQueryRunning(false);
    }, 250);
  };

  const handleQuickTemplate = (template: string) => {
    if (template === "SELECT *") {
      setQuery(`SELECT * FROM ${selectedTable.name} LIMIT 10;`);
    } else if (template === "COUNT(*)") {
      setQuery(`SELECT COUNT(*) AS total_rows FROM ${selectedTable.name};`);
    } else if (template === "PRAGMA") {
      setQuery(`PRAGMA table_info(${selectedTable.name});`);
    } else if (template === "CREATE TABLE") {
      setQuery(`CREATE TABLE IF NOT EXISTS new_table (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);`);
    } else if (template === "INSERT") {
      const nonPkCols = selectedTable.columns.filter((c) => !c.isPrimary).map((c) => c.name);
      setQuery(`INSERT INTO ${selectedTable.name} (${nonPkCols.slice(0, 3).join(", ")})\nVALUES ('demo_val', 'user@example.com', CURRENT_TIMESTAMP);`);
    } else if (template === "KEYS *") {
      setQuery("KEYS *");
    } else if (template === "INFO") {
      setQuery("INFO stats");
    }
  };

  const handleSnapshot = () => {
    const filename =
      engine === "sqlite"
        ? `${sqliteFile}.backup.gz`
        : `${selectedTable.name}_snapshot_${environment}.sql.gz`;
    setBackupSuccess(filename);
    setTimeout(() => setBackupSuccess(null), 4000);
  };

  const filteredTables = useMemo(() => {
    if (!tableSearch.trim()) return currentTables;
    return currentTables.filter((t) =>
      t.name.toLowerCase().includes(tableSearch.toLowerCase())
    );
  }, [currentTables, tableSearch]);

  const displayDataRows = useMemo(() => {
    if (!queryResult) return [];
    if (!dataSearch.trim()) return queryResult;
    return queryResult.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(dataSearch.toLowerCase())
      )
    );
  }, [queryResult, dataSearch]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090d] text-zinc-100 overflow-hidden select-none">
      {/* ── Engine Switcher Bar ── */}
      <div className="flex items-center justify-between px-3 h-10 border-b border-zinc-800/80 bg-zinc-900/60 shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEngine("sqlite")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
              engine === "sqlite"
                ? "bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-950/60"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            <FileCode size={13} className={engine === "sqlite" ? "text-white" : "text-sky-400"} />
            <span>SQLite (Default in Dev)</span>
            <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-200 font-mono">
              Embedded
            </span>
          </button>

          <button
            onClick={() => setEngine("postgres")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
              engine === "postgres"
                ? "bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-950/60"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            <Database size={13} className={engine === "postgres" ? "text-white" : "text-blue-400"} />
            <span>PostgreSQL</span>
            <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
              :5432
            </span>
          </button>

          <button
            onClick={() => setEngine("mysql")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
              engine === "mysql"
                ? "bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-950/60"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            <Database size={13} className={engine === "mysql" ? "text-white" : "text-amber-400"} />
            <span>MySQL</span>
            <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
              :3306
            </span>
          </button>

          <button
            onClick={() => setEngine("redis")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
              engine === "redis"
                ? "bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-950/60"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            <Zap size={13} className={engine === "redis" ? "text-white" : "text-rose-400"} />
            <span>Redis Cache</span>
            <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
              :6379
            </span>
          </button>
        </div>

        {/* Environment Tag */}
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
              environment === "production"
                ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                : environment === "staging"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
            }`}
          >
            {environment} MODE
          </span>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* ── Left: Tables & Database Details ── */}
        <div className="w-72 border-r border-zinc-800/80 bg-zinc-950/60 flex flex-col shrink-0">
          <div className="p-3 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {engine === "sqlite" ? (
                <FileCode size={15} className="text-sky-400" />
              ) : engine === "redis" ? (
                <Zap size={15} className="text-rose-400" />
              ) : (
                <Database size={15} className="text-indigo-400" />
              )}
              <span className="text-xs font-semibold tracking-wider uppercase text-zinc-200">
                {engine === "sqlite"
                  ? "SQLite Database"
                  : engine === "redis"
                  ? "Redis Key-Value"
                  : `${engine.toUpperCase()} Schema`}
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              {engine === "redis" ? `${redisMockKeys.length} keys` : `${filteredTables.length} tables`}
            </span>
          </div>

          {/* Search bar */}
          <div className="p-2 border-b border-zinc-800/80">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
              <Search size={13} className="text-zinc-500 shrink-0" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder={engine === "redis" ? "Filter keys..." : "Search tables..."}
                className="bg-transparent text-xs text-zinc-200 outline-none w-full placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Tables / Keys List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {engine === "redis" ? (
              redisMockKeys.map((item) => (
                <div
                  key={item.key}
                  className="w-full flex flex-col px-2.5 py-2 rounded-lg text-xs font-mono transition-colors border border-zinc-800/60 bg-zinc-900/40 hover:bg-zinc-850"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200 truncate">{item.key}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      {item.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] text-zinc-500 mt-1">
                    <span>TTL: {item.ttl === -1 ? "persistent" : `${item.ttl}s`}</span>
                    <span>{item.size}</span>
                  </div>
                </div>
              ))
            ) : (
              filteredTables.map((tbl) => (
                <button
                  key={tbl.name}
                  onClick={() => handleSelectTable(tbl)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-mono transition-colors text-left cursor-pointer ${
                    selectedTable.name === tbl.name
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-semibold shadow-xs"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Table size={13} className={selectedTable.name === tbl.name ? "text-indigo-400" : "text-zinc-500"} />
                    <span className="truncate">{tbl.name}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500 font-mono">
                    {tbl.rowCount}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Connection Footer Details */}
          <div className="p-3 border-t border-zinc-800/80 bg-zinc-900/40 text-[11px] font-mono text-zinc-400 space-y-1.5 shrink-0">
            {engine === "sqlite" ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Engine:</span>
                  <span className="text-sky-300 font-semibold">SQLite3 (Embedded)</span>
                </div>
                <div className="flex justify-between items-center gap-1">
                  <span className="text-zinc-500">File:</span>
                  {isEditingFile ? (
                    <input
                      type="text"
                      value={sqliteFile}
                      onChange={(e) => setSqliteFile(e.target.value)}
                      onBlur={() => setIsEditingFile(false)}
                      onKeyDown={(e) => e.key === "Enter" && setIsEditingFile(false)}
                      autoFocus
                      className="bg-zinc-800 border border-sky-500/50 rounded px-1.5 py-0.5 text-[10px] text-zinc-100 font-mono w-28 focus:outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => setIsEditingFile(true)}
                      className="text-zinc-200 hover:text-sky-300 truncate max-w-[130px] font-mono hover:underline flex items-center gap-1 group text-right"
                      title="Click to change SQLite file path"
                    >
                      <span className="truncate">{sqliteFile}</span>
                      <span className="text-[9px] text-zinc-500 group-hover:text-sky-400">✎</span>
                    </button>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Mode:</span>
                  <span className="text-emerald-400">Zero-Daemon Local</span>
                </div>
              </>
            ) : engine === "redis" ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Port:</span>
                  <span className="text-zinc-200">6379</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Memory:</span>
                  <span className="text-zinc-200">14.2 MB / 512 MB</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Port:</span>
                  <span className="text-zinc-200">{engine === "postgres" ? "5432" : "3306"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Database:</span>
                  <span className="text-zinc-200 truncate max-w-[130px]">
                    {projectName?.toLowerCase() || "aipanel"}_{environment}
                  </span>
                </div>
              </>
            )}

            <div className="flex justify-between items-center pt-1.5 border-t border-zinc-800/60 text-[10.5px]">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active (0.8ms)
              </span>
              <button
                onClick={handleSnapshot}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
                title="Create Database Backup"
              >
                <Download size={11} />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: SQL Console & Data View ── */}
        <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          {/* SQL Console Header */}
          <div className="px-4 py-2.5 border-b border-zinc-800/80 bg-zinc-900/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-indigo-400" />
                <span className="text-xs font-semibold text-zinc-200">
                  {engine === "redis" ? "Redis Console" : "Interactive SQL Studio"}
                </span>
                {engine !== "redis" && (
                  <span className="font-mono text-indigo-400 text-xs font-semibold">
                    — {selectedTable.name}
                  </span>
                )}
              </div>

              {/* View Switcher Tabs (Data Rows vs Schema Structure) */}
              {engine !== "redis" && (
                <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[11px] font-medium ml-2">
                  <button
                    onClick={() => setActiveTab("data")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      activeTab === "data"
                        ? "bg-zinc-800 text-zinc-100 font-semibold shadow-xs"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Table size={12} className={activeTab === "data" ? "text-indigo-400" : "text-zinc-500"} />
                    <span>Table Data (Records)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("schema")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      activeTab === "schema"
                        ? "bg-zinc-800 text-zinc-100 font-semibold shadow-xs"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Layers size={12} className={activeTab === "schema" ? "text-indigo-400" : "text-zinc-500"} />
                    <span>Schema Definition</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {environment === "production" && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-mono">
                  <Lock size={10} />
                  READ-ONLY GATED
                </span>
              )}

              <button
                onClick={handleRunQuery}
                disabled={queryRunning}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold shadow-xs shadow-indigo-950/60 transition-all cursor-pointer"
              >
                <Play size={12} className={queryRunning ? "animate-spin" : ""} />
                <span>{queryRunning ? "Executing..." : "Execute (Cmd+Enter)"}</span>
              </button>
            </div>
          </div>

          {/* Quick Query Templates */}
          <div className="px-4 py-1.5 bg-[#0b0d13] border-b border-zinc-800/60 flex items-center gap-1.5 text-[10.5px] font-mono overflow-x-auto no-scrollbar shrink-0">
            <span className="text-zinc-500 uppercase text-[9.5px] mr-1 shrink-0">Quick Templates:</span>
            {engine === "sqlite" ? (
              <>
                {["SELECT *", "COUNT(*)", "PRAGMA", "INSERT", "CREATE TABLE"].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleQuickTemplate(t)}
                    className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-indigo-300 border border-zinc-800 cursor-pointer transition-colors shrink-0"
                  >
                    {t}
                  </button>
                ))}
              </>
            ) : engine === "redis" ? (
              <>
                {["KEYS *", "INFO", "HGETALL sess:usr_9918a2bc"].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleQuickTemplate(t)}
                    className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-indigo-300 border border-zinc-800 cursor-pointer transition-colors shrink-0"
                  >
                    {t}
                  </button>
                ))}
              </>
            ) : (
              <>
                {["SELECT *", "COUNT(*)", "INSERT", "EXPLAIN ANALYZE"].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleQuickTemplate(t)}
                    className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-indigo-300 border border-zinc-800 cursor-pointer transition-colors shrink-0"
                  >
                    {t}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Query Input Editor */}
          <div className="p-3 bg-zinc-950 border-b border-zinc-800/80 shrink-0">
            <textarea
              rows={2}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  handleRunQuery();
                }
              }}
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 font-mono text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 resize-none leading-relaxed shadow-inner"
              placeholder="Write SQL query (e.g. SELECT * FROM users WHERE role = 'admin';)..."
            />
          </div>

          {backupSuccess && (
            <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Backup snapshot exported successfully: <code>{backupSuccess}</code></span>
              </div>
              <span className="text-[10px] text-emerald-400/80 font-mono">14.2 MB compressed</span>
            </div>
          )}

          {/* ── Main Data / Schema Results Area ── */}
          <div className="flex-1 flex flex-col min-h-0 p-4 overflow-hidden">
            {/* Table Action Bar */}
            <div className="flex items-center justify-between pb-2 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-200">
                  {engine === "redis"
                    ? "Redis Key-Value Cache Store"
                    : activeTab === "data"
                    ? `Records in ${selectedTable.name}`
                    : `Schema Definition: ${selectedTable.name}`}
                </span>
                <span className="text-zinc-500 font-normal">
                  {engine === "redis"
                    ? `(${redisMockKeys.length} keys total)`
                    : activeTab === "data"
                    ? `(${displayDataRows.length} rows loaded)`
                    : `(${selectedTable.columns.length} columns defined)`}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {activeTab === "data" && engine !== "redis" && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
                    <Filter size={11} className="text-zinc-500" />
                    <input
                      type="text"
                      value={dataSearch}
                      onChange={(e) => setDataSearch(e.target.value)}
                      placeholder="Filter records..."
                      className="bg-transparent text-[11px] text-zinc-200 outline-none w-28 placeholder:text-zinc-600"
                    />
                  </div>
                )}

                {queryDuration !== null && (
                  <span className="font-mono text-[11px] text-zinc-400">
                    Execution: <strong className="text-emerald-400">{queryDuration}ms</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Results Grid Container */}
            <div className="flex-1 border border-zinc-800 rounded-xl overflow-auto bg-[#0d0f17] shadow-inner">
              {engine === "redis" ? (
                /* Redis Keys Inspector */
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-zinc-900 border-b border-zinc-800 sticky top-0 text-zinc-400 text-[11px]">
                    <tr>
                      <th className="px-3.5 py-2.5 font-semibold">Key</th>
                      <th className="px-3.5 py-2.5 font-semibold">Type</th>
                      <th className="px-3.5 py-2.5 font-semibold">TTL</th>
                      <th className="px-3.5 py-2.5 font-semibold">Size</th>
                      <th className="px-3.5 py-2.5 font-semibold">Value Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {redisMockKeys.map((item) => (
                      <tr key={item.key} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-3.5 py-2.5 font-bold text-zinc-100">{item.key}</td>
                        <td className="px-3.5 py-2.5">
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 text-[10px] font-bold">
                            {item.type}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-zinc-400">
                          {item.ttl === -1 ? "persistent" : `${item.ttl}s`}
                        </td>
                        <td className="px-3.5 py-2.5 text-zinc-400">{item.size}</td>
                        <td className="px-3.5 py-2.5 text-zinc-300 font-mono text-[11px] truncate max-w-xs">
                          {item.valuePreview}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : activeTab === "data" ? (
                /* Data Records Table */
                displayDataRows.length > 0 ? (
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-zinc-900 border-b border-zinc-800 sticky top-0 text-zinc-400 text-[11px]">
                      <tr>
                        <th className="px-3 py-2.5 font-semibold w-10 text-zinc-600">#</th>
                        {selectedTable.columns.map((c) => (
                          <th key={c.name} className="px-3.5 py-2.5 font-semibold">
                            <div className="flex items-center gap-1.5">
                              <span>{c.name}</span>
                              {c.isPrimary && (
                                <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-bold">
                                  PK
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                      {displayDataRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-3 py-2 text-zinc-600 select-none text-[10.5px]">
                            {idx + 1}
                          </td>
                          {selectedTable.columns.map((c) => (
                            <td key={c.name} className="px-3.5 py-2 truncate max-w-[220px]">
                              {row[c.name] === null || row[c.name] === undefined ? (
                                <span className="text-zinc-600 italic">NULL</span>
                              ) : c.isPrimary ? (
                                <span className="font-bold text-zinc-100">{String(row[c.name])}</span>
                              ) : (
                                String(row[c.name])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-2 p-8">
                    <Table size={24} className="text-zinc-600" />
                    <span>No records found matching query or filter.</span>
                  </div>
                )
              ) : (
                /* Schema & Column Definition Table */
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-zinc-900 border-b border-zinc-800 sticky top-0 text-zinc-400 text-[11px]">
                    <tr>
                      <th className="px-3.5 py-2.5 font-semibold">Column Name</th>
                      <th className="px-3.5 py-2.5 font-semibold">Data Type</th>
                      <th className="px-3.5 py-2.5 font-semibold">Key</th>
                      <th className="px-3.5 py-2.5 font-semibold">Nullable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {selectedTable.columns.map((c) => (
                      <tr key={c.name} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-3.5 py-2.5 font-bold text-zinc-100 flex items-center gap-2">
                          <Table size={12} className="text-zinc-500" />
                          <span>{c.name}</span>
                        </td>
                        <td className="px-3.5 py-2.5 text-indigo-400 font-semibold">{c.type}</td>
                        <td className="px-3.5 py-2.5">
                          {c.isPrimary ? (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                              PRIMARY KEY
                            </span>
                          ) : (
                            <span className="text-zinc-600">-</span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5">
                          {c.isNullable ? (
                            <span className="text-emerald-400">YES</span>
                          ) : (
                            <span className="text-zinc-500">NO</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
