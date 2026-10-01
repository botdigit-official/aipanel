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

          if (pathname === "/api/fs/detect") {
            const targetPath = parsedUrl.searchParams.get("path") || process.cwd();
            const folderName = path.basename(targetPath) || "project";
            let name = folderName;
            let framework = "Generic Workspace";
            let runtime = "node";
            let has_git = false;
            let has_docker = false;
            let has_aipanel_toml = false;
            let suggested_file: string | null = null;

            try {
              const entries = await fs.readdir(targetPath);
              const entrySet = new Set(entries);
              has_git = entrySet.has(".git");
              has_docker = entrySet.has("Dockerfile") || entrySet.has("docker-compose.yml");
              has_aipanel_toml = entrySet.has("aipanel.toml");

              if (entrySet.has("package.json")) {
                try {
                  const pkgContent = await fs.readFile(path.join(targetPath, "package.json"), "utf-8");
                  const pkg = JSON.parse(pkgContent);
                  if (pkg.name) name = pkg.name;
                  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
                  if (deps.next) framework = "Next.js";
                  else if (deps.react) framework = "React 19";
                  else if (deps.vue) framework = "Vue";
                  else if (deps.svelte) framework = "Svelte";
                  else if (deps.express || deps.fastify) framework = "Node.js Server";
                  else framework = "Node.js";
                } catch {
                  // ignore
                }
              } else if (entrySet.has("Cargo.toml")) {
                framework = "Rust (Cargo)";
                runtime = "rust";
              } else if (entrySet.has("requirements.txt") || entrySet.has("pyproject.toml")) {
                framework = "Python";
                runtime = "python";
              } else if (entrySet.has("go.mod")) {
                framework = "Go";
                runtime = "go";
              }

              // Pick suggested starting file
              const candidates = ["package.json", "README.md", "src/App.tsx", "app/page.tsx", "src/main.tsx", "src/main.rs", "index.html", "TASK.md"];
              for (const cand of candidates) {
                try {
                  const p = path.join(targetPath, cand);
                  await fs.access(p);
                  suggested_file = p;
                  break;
                } catch {
                  // continue
                }
              }
            } catch (err: any) {
              // ignore
            }

            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                name,
                path: targetPath,
                framework,
                runtime,
                has_git,
                has_docker,
                has_aipanel_toml,
                suggested_file,
                detected_services: ["PostgreSQL 16", "Redis 7.2", "Caddy"],
                detected_workers: [],
                suggested_dev_command: "npm run dev",
                suggested_build_command: "npm run build",
                suggested_port: 3000,
              })
            );
            return;
          }

          if (pathname === "/api/fs/quick-folders") {
            const baseDir = "/Volumes/Mac2TB/Botdigit/Developer";
            const folders: { name: string; path: string; category: string }[] = [];
            const subCategories = ["Projects", "Live", "Clients", "Tools", "Infrastructure"];
            for (const cat of subCategories) {
              const catPath = path.join(baseDir, cat);
              try {
                const subDirs = await fs.readdir(catPath, { withFileTypes: true });
                for (const d of subDirs) {
                  if (d.isDirectory() && !d.name.startsWith(".")) {
                    folders.push({
                      name: d.name,
                      path: path.join(catPath, d.name),
                      category: cat,
                    });
                  }
                }
              } catch {
                // ignore
              }
            }
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(folders));
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
