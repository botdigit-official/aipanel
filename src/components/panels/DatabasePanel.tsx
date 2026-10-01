import { useState } from "react";
import {
  Database,
  Table,
  Play,
  Download,
  CheckCircle2,
  Lock,
  Layers,
  Search,
} from "lucide-react";
import type { Environment } from "../layout/TopBar";

interface DatabasePanelProps {
  environment: Environment;
  projectName?: string;
}

interface TableSchema {
  name: string;
  rowCount: number;
  columns: { name: string; type: string; isPrimary: boolean; isNullable: boolean }[];
}

const mockTables: TableSchema[] = [
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

export default function DatabasePanel({ environment, projectName }: DatabasePanelProps) {
  const [selectedTable, setSelectedTable] = useState<TableSchema>(mockTables[0]);
  const [query, setQuery] = useState(`SELECT * FROM ${selectedTable.name} LIMIT 10;`);
  const [queryRunning, setQueryRunning] = useState(false);
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [queryDuration, setQueryDuration] = useState<number | null>(null);
  const [backupSuccess, setBackupSuccess] = useState(false);

  const handleSelectTable = (tbl: TableSchema) => {
    setSelectedTable(tbl);
    setQuery(`SELECT * FROM ${tbl.name} LIMIT 10;`);
    setQueryResult(null);
  };

  const handleRunQuery = () => {
    setQueryRunning(true);
    setTimeout(() => {
      // Generate realistic mock rows based on table columns
      const rows = Array.from({ length: 6 }).map((_, i) => {
        const row: Record<string, any> = {};
        for (const col of selectedTable.columns) {
          if (col.isPrimary) {
            row[col.name] = `${selectedTable.name.slice(0, 3)}_${1000 + i}`;
          } else if (col.type.includes("varchar") || col.type.includes("text")) {
            row[col.name] = `${col.name}_${i + 1}`;
          } else if (col.type.includes("timestamptz")) {
            row[col.name] = new Date(Date.now() - i * 3600000).toISOString();
          } else {
            row[col.name] = i * 2 + 1;
          }
        }
        return row;
      });

      setQueryResult(rows);
      setQueryDuration(1.4);
      setQueryRunning(false);
    }, 350);
  };

  const handleSnapshot = () => {
    setBackupSuccess(true);
    setTimeout(() => setBackupSuccess(false), 3000);
  };

  return (
    <div className="flex-1 flex h-full bg-zinc-950 text-zinc-100 overflow-hidden select-none">
      {/* ── Left: Tables & Schemas List ── */}
      <div className="w-64 border-r border-zinc-800 bg-zinc-900/40 flex flex-col shrink-0">
        <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={15} className="text-indigo-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-zinc-200">
              Postgres Schema
            </span>
          </div>
          <span
            className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
              environment === "production"
                ? "bg-rose-500/15 text-rose-300 border border-rose-500/20"
                : environment === "staging"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
            }`}
          >
            {environment}
          </span>
        </div>

        <div className="p-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-400">
            <Search size={12} />
            <input
              type="text"
              placeholder="Search tables..."
              className="bg-transparent text-xs text-zinc-200 outline-none w-full placeholder:text-zinc-600"
            />
          </div>
        </div>

        {/* Tables */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="text-[10px] font-mono uppercase text-zinc-500 px-2 py-1">
            Tables ({mockTables.length})
          </div>
          {mockTables.map((tbl) => (
            <button
              key={tbl.name}
              onClick={() => handleSelectTable(tbl)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors text-left ${
                selectedTable.name === tbl.name
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Table size={13} className="text-indigo-400/80" />
                <span className="truncate">{tbl.name}</span>
              </div>
              <span className="text-[10px] text-zinc-600">{tbl.rowCount}</span>
            </button>
          ))}
        </div>

        {/* DB Connection info */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950/60 text-[11px] font-mono text-zinc-400 space-y-1">
          <div className="flex justify-between">
            <span>Port:</span>
            <span className="text-zinc-200">{environment === "production" ? "5432 (SSL)" : "5432"}</span>
          </div>
          <div className="flex justify-between">
            <span>Database:</span>
            <span className="text-zinc-200 truncate">{projectName?.toLowerCase() || "aipanel"}_{environment}</span>
          </div>
          <div className="flex justify-between items-center pt-1 text-[10px] text-emerald-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Connected (1.2ms)
            </span>
            <button
              onClick={handleSnapshot}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              title="Snapshot Database"
            >
              <Download size={10} />
              <span>Dump</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Right: SQL Console & Table Data ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* SQL Console Header */}
        <div className="p-3 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-indigo-400" />
            <span className="text-xs font-semibold text-zinc-200">
              Interactive SQL Console — <span className="font-mono text-indigo-400">{selectedTable.name}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {environment === "production" && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-mono">
                <Lock size={10} />
                READ-ONLY MUTATIONS GATED
              </span>
            )}

            <button
              onClick={handleRunQuery}
              disabled={queryRunning}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Play size={12} className={queryRunning ? "animate-spin" : ""} />
              <span>{queryRunning ? "Executing..." : "Execute (Cmd+Enter)"}</span>
            </button>
          </div>
        </div>

        {/* Query Input */}
        <div className="p-3 bg-zinc-950 border-b border-zinc-800 shrink-0">
          <textarea
            rows={2}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                handleRunQuery();
              }
            }}
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg p-2.5 font-mono text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
          />
        </div>

        {backupSuccess && (
          <div className="mx-4 mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span>Database snapshot created: <code>{selectedTable.name}_snapshot.sql.gz</code> (14.2 MB)</span>
          </div>
        )}

        {/* Table Results Grid */}
        <div className="flex-1 flex flex-col min-h-0 p-4 overflow-hidden">
          <div className="flex items-center justify-between pb-2 text-xs">
            <span className="font-semibold text-zinc-300 flex items-center gap-2">
              <span>Schema Definition & Columns</span>
              <span className="text-zinc-500 font-normal">({selectedTable.columns.length} columns)</span>
            </span>
            {queryDuration !== null && (
              <span className="font-mono text-[11px] text-zinc-400">
                Returned in <strong className="text-emerald-400">{queryDuration}ms</strong>
              </span>
            )}
          </div>

          {/* Results Table */}
          <div className="flex-1 border border-zinc-800 rounded-xl overflow-auto bg-zinc-900/30">
            {queryResult ? (
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-900 border-b border-zinc-800 sticky top-0 text-zinc-400 text-[11px]">
                  <tr>
                    {selectedTable.columns.map((c) => (
                      <th key={c.name} className="px-3.5 py-2 font-semibold">
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {queryResult.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                      {selectedTable.columns.map((c) => (
                        <td key={c.name} className="px-3.5 py-2 truncate max-w-[200px]">
                          {String(row[c.name])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex flex-col justify-start">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-zinc-900 border-b border-zinc-800 sticky top-0 text-zinc-400 text-[11px]">
                    <tr>
                      <th className="px-3.5 py-2 font-semibold">Column</th>
                      <th className="px-3.5 py-2 font-semibold">Type</th>
                      <th className="px-3.5 py-2 font-semibold">Primary Key</th>
                      <th className="px-3.5 py-2 font-semibold">Nullable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {selectedTable.columns.map((c) => (
                      <tr key={c.name} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-3.5 py-2.5 font-bold text-zinc-100">{c.name}</td>
                        <td className="px-3.5 py-2.5 text-indigo-400">{c.type}</td>
                        <td className="px-3.5 py-2.5">
                          {c.isPrimary ? (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px] font-bold">
                              PK
                            </span>
                          ) : (
                            <span className="text-zinc-600">-</span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5 text-zinc-400">
                          {c.isNullable ? "YES" : "NO"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
