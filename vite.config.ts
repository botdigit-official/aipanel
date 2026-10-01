import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
// @ts-expect-error type error without @types/node package
import process from "node:process";
import fs from "node:fs/promises";
import path from "node:path";

const host = process.env.TAURI_DEV_HOST;

function detectLanguage(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    md: "markdown",
    rs: "rust",
    toml: "toml",
    py: "python",
    html: "html",
    css: "css",
    scss: "scss",
    sql: "sql",
    sh: "shell",
    bash: "shell",
    zsh: "shell",
    yaml: "yaml",
    yml: "yaml",
    svg: "html",
  };
  return map[ext] || "plaintext";
}

function devFsPlugin(): Plugin {
  return {
    name: "aipanel-dev-fs",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/fs/")) {
          return next();
        }

        try {
          const parsedUrl = new URL(req.url, "http://localhost:1420");
          const pathname = parsedUrl.pathname;

          if (pathname === "/api/fs/list") {
            const dirPath = parsedUrl.searchParams.get("path") || process.cwd();
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            const ignored = new Set([
              ".git",
              "node_modules",
              "target",
              ".DS_Store",
              "dist",
              ".gemini",
            ]);

            const results = [];
            for (const dirent of entries) {
              if (ignored.has(dirent.name)) continue;
              const fullPath = path.join(dirPath, dirent.name);
              const isDir = dirent.isDirectory();
              let size = 0;
              let childrenCount = 0;

              if (isDir) {
                try {
                  const subEntries = await fs.readdir(fullPath);
                  childrenCount = subEntries.filter((n) => !ignored.has(n)).length;
                } catch {
                  // ignore
                }
              } else {
                try {
                  const stat = await fs.stat(fullPath);
                  size = stat.size;
                } catch {
                  // ignore
                }
              }

              results.push({
                name: dirent.name,
                path: fullPath,
                is_dir: isDir,
                size,
                children_count: isDir ? childrenCount : undefined,
              });
            }

            // Directories first, then files alphabetically
            results.sort((a, b) => {
              if (a.is_dir !== b.is_dir) return a.is_dir ? -1 : 1;
              return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
            });

            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(results));
            return;
          }

          if (pathname === "/api/fs/read") {
            const filePath = parsedUrl.searchParams.get("path");
            if (!filePath) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "Missing path parameter" }));
              return;
            }

            const stat = await fs.stat(filePath);
            if (stat.size > 5_000_000) {
              res.statusCode = 413;
              res.end(JSON.stringify({ error: "File too large (>5MB)" }));
              return;
            }

            const content = await fs.readFile(filePath, "utf-8");
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                path: filePath,
                content,
                language: detectLanguage(filePath),
                size: stat.size,
              })
            );
            return;
          }

          if (pathname === "/api/fs/write" && req.method === "POST") {
            let body = "";
            for await (const chunk of req) {
              body += chunk;
            }
            const { path: filePath, content } = JSON.parse(body);
            await fs.writeFile(filePath, content, "utf-8");
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
            return;
          }

          if (pathname === "/api/fs/create" && req.method === "POST") {
            let body = "";
            for await (const chunk of req) {
              body += chunk;
            }
            const { path: targetPath, isDir, content = "" } = JSON.parse(body);
            if (isDir) {
              await fs.mkdir(targetPath, { recursive: true });
            } else {
              await fs.mkdir(path.dirname(targetPath), { recursive: true });
              await fs.writeFile(targetPath, content, "utf-8");
            }
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
            return;
          }

          if (pathname === "/api/fs/delete" && req.method === "POST") {
            let body = "";
            for await (const chunk of req) {
              body += chunk;
            }
            const { path: targetPath } = JSON.parse(body);
            const stat = await fs.stat(targetPath);
            if (stat.isDirectory()) {
              await fs.rm(targetPath, { recursive: true, force: true });
            } else {
              await fs.unlink(targetPath);
            }
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
            return;
          }

          next();
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: err?.message || String(err) }));
        }
      });
    },
  };
}

export default defineConfig(() => ({
  plugins: [react(), tailwindcss(), devFsPlugin()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? { protocol: "ws", host, port: 1421 }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
