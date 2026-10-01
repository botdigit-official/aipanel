import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
// @ts-expect-error type error without @types/node package
import process from "node:process";
import fs from "node:fs/promises";
import path from "node:path";
import { exec } from "node:child_process";
import os from "node:os";

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
        if (!req.url?.startsWith("/api/fs/") && !req.url?.startsWith("/api/terminal/")) {
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

          if (pathname === "/api/fs/create-project" && req.method === "POST") {
            let body = "";
            for await (const chunk of req) {
              body += chunk;
            }
            const { targetDir, projectName, template = "clean-ai", idea = "" } = JSON.parse(body || "{}");
            const destDir = path.join(targetDir, projectName);

            await fs.mkdir(destDir, { recursive: true });

            if (template === "clean-ai" || template === "clean") {
              const visionStatement = idea.trim()
                ? `**Initial Project Vision**: "${idea.trim()}"`
                : `This project is currently in the **AI Ideation & Architecture** phase. The core problem, target audience, and business model are being defined in collaboration with the AIPanel AI Assistant.`;

              const readmeContent = `# ${projectName}\n\n> **Project Vision & Architecture Blueprint**  \n> *Initialized via AIPanel Clean AI Ideation*\n\n## 1. Executive Summary & Vision\n${visionStatement}\n\n- **Status**: 🚀 Ideation & Blueprinting\n- **Project Type**: Clean Custom Architecture\n- **Target Tech Stack**: Pending Architecture Review (Budget vs Enterprise)\n\n## 2. Core Problem to Solve\n<!-- Describe the specific pain point this project addresses -->\n- [ ] Define the primary user persona and value proposition.\n- [ ] Identify high-impact features for the Minimum Viable Product (MVP).\n- [ ] Select appropriate technology stack and data persistence strategy.\n\n## 3. Recommended Workflow\n1. Open the **AI Assistant** (\`⌘L\` or right-side panel).\n2. Brainstorm product requirements and candidate architectures.\n3. Review candidate stacks (Budget Stack vs Enterprise Stack).\n4. Auto-generate database schemas and initial application structure.\n5. Deploy to Staging / Production via AIPanel 1-Click DevOps.\n`;
              await fs.writeFile(path.join(destDir, "README.md"), readmeContent, "utf-8");

              const taskContent = `# Project Roadmap & Sprint Tasks — ${projectName}\n\n## Phase 1: Product Ideation & Architecture (Active)\n- [ ] Brainstorm core product vision and user flows with AIPanel AI\n- [ ] Choose tech stack (Frontend, Backend, Database, Infrastructure)\n- [ ] Formalize database schema (Entities, Relations, Constraints)\n- [ ] Establish initial project dependencies and boilerplate\n\n## Phase 2: Core Engineering & Backend Services\n- [ ] Implement database migrations & seeds\n- [ ] Build core REST / GraphQL / RPC API endpoints\n- [ ] Set up authentication & role-based access control (RBAC)\n- [ ] Wire background worker queues (Redis / Celery / BullMQ)\n\n## Phase 3: Frontend & User Experience\n- [ ] Establish design tokens & UI components\n- [ ] Build responsive primary user dashboard & flows\n- [ ] Implement real-time data sync / WebSockets\n\n## Phase 4: Verification, Security & Launch\n- [ ] Automated smoke tests & integration test suite\n- [ ] Security audit (CORS, Rate Limiting, Input Validation)\n- [ ] Configure environment variables & production secrets\n- [ ] 1-Click Deploy via AIPanel Fleet Manager\n`;
              await fs.writeFile(path.join(destDir, "TASK.md"), taskContent, "utf-8");
              await fs.writeFile(path.join(destDir, "TODO.md"), taskContent, "utf-8");

              const archContent = `# Architecture Decision Record & System Design — ${projectName}\n\n## 1. System Overview\nHigh-level architectural blueprint for **${projectName}**.\n\n\`\`\`mermaid\ngraph TD\n    Client[Web / Mobile Clients] --> Gateway[Reverse Proxy / Caddy]\n    Gateway --> App[Application Server]\n    App --> DB[(Primary Database)]\n    App --> Cache[(Redis Cache / Queue)]\n    App --> Storage[Object Storage / S3]\n\`\`\`\n\n## 2. Candidate Stack Decision Matrix\n\n| Dimension | Option A: Budget / Lean Stack | Option B: Enterprise / Scale Stack |\n|---|---|---|\n| **Monthly Cost** | $0 - $10 / month | $50 - $150+ / month |\n| **Backend** | Fastify / Hono / Go / Python | Next.js / Rust Axum / NestJS |\n| **Database** | SQLite 3 + Litestream (WAL replication) | PostgreSQL 16 Cluster + PgBouncer |\n| **Cache / Queue** | In-Memory / SQLite queue | Redis 7.2 Cluster |\n| **Deployment** | Single VPS ($4/mo Hetzner/DigitalOcean) | Multi-Node Docker Swarm / Kubernetes |\n\n## 3. Data Flow & Security\n- Strict type validation on all incoming payload boundaries.\n- Environment variables managed through AIPanel Vault.\n`;
              await fs.writeFile(path.join(destDir, "ARCHITECTURE.md"), archContent, "utf-8");

              // Create .agents and skills
              const agentsDir = path.join(destDir, ".agents");
              const skillsDir = path.join(agentsDir, "skills");
              await fs.mkdir(path.join(skillsDir, "01-discovery"), { recursive: true });
              await fs.mkdir(path.join(skillsDir, "02-project-context"), { recursive: true });

              const agentsMd = `# AGENTS.md — AI Agent Operating Rules for ${projectName}\n\nThis file guides all AI coding assistants operating on **${projectName}**.\n\n## 1. Operating Principles\n- **Inspect First**: Understand existing code and architecture before editing.\n- **Maintain Task List**: Update \`TASK.md\` as progress is made.\n- **Sync Documentation**: Keep \`README.md\` and \`ARCHITECTURE.md\` up to date.\n- **Zero Broken Builds**: Ensure tests and builds pass before finalizing tasks.\n\n## 2. Skills & Capabilities\n- Architectural Decision Making\n- Database Schema Design & Migration\n- Security Auditing & Code Hardening\n- 1-Click DevOps & Deployment\n`;
              await fs.writeFile(path.join(agentsDir, "AGENTS.md"), agentsMd, "utf-8");

              await fs.writeFile(
                path.join(skillsDir, "01-discovery", "SKILL.md"),
                "---\nname: discovery\ndescription: Discovers project structure, stack, dependencies, and configuration.\n---\n# Discovery Workflow\nRun discovery across the repository to detect package managers, build scripts, port assignments, and environment requirements.\n",
                "utf-8"
              );
              await fs.writeFile(
                path.join(skillsDir, "02-project-context", "SKILL.md"),
                "---\nname: project-context\ndescription: Tracks project language, framework, database, and infrastructure state.\n---\n# Project Context Workflow\nMaintains project metadata and verifies compatibility with AIPanel deploy scripts.\n",
                "utf-8"
              );

              const aipanelToml = `[project]\nname = "${projectName}"\ntype = "clean-ai"\nruntime = "pending"\nframework = "AI Ideation"\nsuggested_dev_command = ""\nsuggested_build_command = ""\n`;
              await fs.writeFile(path.join(destDir, "aipanel.toml"), aipanelToml, "utf-8");
            } else if (template === "blank") {
              const readme = `# ${projectName}\n\nClean, minimal project repository initialized with AIPanel.\n`;
              await fs.writeFile(path.join(destDir, "README.md"), readme, "utf-8");
              const aipanelToml = `[project]\nname = "${projectName}"\ntype = "blank"\n`;
              await fs.writeFile(path.join(destDir, "aipanel.toml"), aipanelToml, "utf-8");
            } else if (template === "nextjs") {
              const pkg = JSON.stringify({
                name: projectName,
                version: "0.1.0",
                private: true,
                scripts: { dev: "next dev", build: "next build", start: "next start" },
                dependencies: { next: "^15.0.0", react: "^19.0.0", "react-dom": "^19.0.0" }
              }, null, 2);
              await fs.writeFile(path.join(destDir, "package.json"), pkg, "utf-8");
              await fs.mkdir(path.join(destDir, "src", "app"), { recursive: true });
              await fs.writeFile(path.join(destDir, "src", "app", "page.tsx"), "export default function Home() { return <main><h1>AIPanel Next.js Starter</h1></main>; }", "utf-8");
            } else if (template === "fastapi") {
              const pyMain = `from fastapi import FastAPI\n\napp = FastAPI(title="AIPanel FastAPI Service")\n\n@app.get("/")\ndef read_root():\n    return {"status": "ok", "app": "AIPanel FastAPI Starter"}\n`;
              await fs.writeFile(path.join(destDir, "main.py"), pyMain, "utf-8");
              await fs.writeFile(path.join(destDir, "requirements.txt"), "fastapi>=0.115.0\nuvicorn>=0.30.0\n", "utf-8");
            } else if (template === "rust-axum") {
              const cargo = `[package]\nname = "${projectName}"\nversion = "0.1.0"\nedition = "2021"\n\n[dependencies]\naxum = "0.8"\ntokio = { version = "1.0", features = ["full"] }\n`;
              await fs.writeFile(path.join(destDir, "Cargo.toml"), cargo, "utf-8");
              await fs.mkdir(path.join(destDir, "src"), { recursive: true });
              await fs.writeFile(path.join(destDir, "src", "main.rs"), "use axum::{routing::get, Router};\n#[tokio::main]\nasync fn main() {\n    let app = Router::new().route(\"/\", get(|| async { \"Hello from AIPanel Axum!\" }));\n    println!(\"Axum listening on port 3000\");\n}\n", "utf-8");
            } else {
              const pkg = JSON.stringify({
                name: projectName,
                version: "0.1.0",
                private: true,
                scripts: { dev: "vite", build: "vite build" }
              }, null, 2);
              await fs.writeFile(path.join(destDir, "package.json"), pkg, "utf-8");
            }

            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                name: projectName,
                path: destDir,
                framework: template === "clean-ai" ? "AI Ideation" : template,
                runtime: "pending",
                has_git: true,
                has_docker: false,
                has_aipanel_toml: true,
                suggested_file: path.join(destDir, "README.md"),
                detected_services: [],
                detected_workers: [],
                suggested_dev_command: "",
                suggested_build_command: "",
                suggested_port: 3000,
              })
            );
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

          if (pathname === "/api/fs/scaffold-workspace" && req.method === "POST") {
            let bodyStr = "";
            for await (const chunk of req) {
              bodyStr += chunk;
            }
            const { baseDir } = JSON.parse(bodyStr || "{}");
            if (!baseDir) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "baseDir required" }));
              return;
            }

            const targetRoot = baseDir.endsWith("/Projects")
              ? path.dirname(baseDir)
              : baseDir;

            const subDirs = ["Projects", "Live", "Staging", "Static", "Infrastructure", "Backups"];
            const created = [];
            for (const sub of subDirs) {
              const full = path.join(targetRoot, sub);
              try {
                await fs.mkdir(full, { recursive: true });
                created.push(full);
              } catch {
                // ignore
              }
            }

            // Write master workspace README if not present
            const masterReadme = path.join(targetRoot, "WORKSPACE.md");
            try {
              await fs.access(masterReadme);
            } catch {
              const content = `# Developer Workspace Root\n\nManaged by **AIPanel**.\n\n- \`Projects/\`: Active application repositories and codebases.\n- \`Live/\`: Production deployments and active services.\n- \`Staging/\`: Staging previews and ephemeral build testing.\n- \`Static/\`: Static assets, uploads, and CDN storage.\n- \`Infrastructure/\`: Docker compose manifests, Caddy configurations, and databases.\n- \`Backups/\`: Automated database dumps and volume snapshots.\n`;
              await fs.writeFile(masterReadme, content, "utf-8");
            }

            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true, created, baseDir }));
            return;
          }

          if (pathname === "/api/terminal/exec" && req.method === "POST") {
            let bodyStr = "";
            req.on("data", (chunk) => {
              bodyStr += chunk;
            });
            req.on("end", async () => {
              try {
                const body = JSON.parse(bodyStr || "{}");
                const rawCmd = (body.command || "").trim();
                const targetCwd = body.cwd || process.cwd();
                const asRoot = Boolean(body.asRoot);
                const currentUser = asRoot ? "root" : (process.env.USER || os.userInfo?.().username || "botdigit");

                if (!rawCmd) {
                  res.statusCode = 400;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ error: "Empty command string" }));
                  return;
                }

                // Handle directory navigation (cd command)
                if (rawCmd === "cd" || rawCmd === "cd ~") {
                  const home = os.homedir();
                  res.setHeader("Content-Type", "application/json");
                  res.end(
                    JSON.stringify({
                      command: rawCmd,
                      stdout: `Switched directory to: ${home}`,
                      stderr: "",
                      exit_code: 0,
                      cwd: home,
                      user: currentUser,
                    })
                  );
                  return;
                }

                if (rawCmd.startsWith("cd ")) {
                  const targetRel = rawCmd.slice(3).trim();
                  const resolved = targetRel.startsWith("/")
                    ? targetRel
                    : targetRel.startsWith("~")
                    ? path.join(os.homedir(), targetRel.slice(1))
                    : path.resolve(targetCwd, targetRel);
                  try {
                    const stat = await fs.stat(resolved);
                    if (stat.isDirectory()) {
                      res.setHeader("Content-Type", "application/json");
                      res.end(
                        JSON.stringify({
                          command: rawCmd,
                          stdout: `Switched directory to: ${resolved}`,
                          stderr: "",
                          exit_code: 0,
                          cwd: resolved,
                          user: currentUser,
                        })
                      );
                      return;
                    }
                  } catch {
                    res.setHeader("Content-Type", "application/json");
                    res.end(
                      JSON.stringify({
                        command: rawCmd,
                        stdout: "",
                        stderr: `cd: no such file or directory: ${targetRel}`,
                        exit_code: 1,
                        cwd: targetCwd,
                        user: currentUser,
                      })
                    );
                    return;
                  }
                }

                // When root access is requested, invoke with sudo
                let cmdToRun = rawCmd;
                if (asRoot && !rawCmd.startsWith("sudo")) {
                  // Non-interactive sudo or elevated execution
                  cmdToRun = `sudo -n ${rawCmd} 2>&1 || sudo ${rawCmd}`;
                }

                // Construct full system PATH for zsh
                const fullPath = [
                  "/Volumes/Mac2TB/Botdigit/Developer/Infrastructure/bin",
                  "/opt/homebrew/bin",
                  "/opt/homebrew/sbin",
                  "/usr/local/bin",
                  "/usr/bin",
                  "/bin",
                  "/usr/sbin",
                  "/sbin",
                  `${os.homedir()}/.cargo/bin`,
                  `${os.homedir()}/.nvm/versions/node/current/bin`,
                  process.env.PATH || "",
                ].join(":");

                const env = {
                  ...process.env,
                  PATH: fullPath,
                  HOME: os.homedir(),
                  USER: currentUser,
                };

                exec(
                  cmdToRun,
                  {
                    cwd: targetCwd,
                    env,
                    shell: "/bin/zsh",
                    maxBuffer: 20 * 1024 * 1024, // 20MB buffer
                    timeout: 60000, // 60s timeout
                  },
                  (error, stdout, stderr) => {
                    const exitCode =
                      error && typeof error.code === "number"
                        ? error.code
                        : error
                        ? 1
                        : 0;
                    res.setHeader("Content-Type", "application/json");
                    res.end(
                      JSON.stringify({
                        command: rawCmd,
                        stdout: stdout || "",
                        stderr: stderr || (error && error.message ? error.message : ""),
                        exit_code: exitCode,
                        cwd: targetCwd,
                        user: currentUser,
                      })
                    );
                  }
                );
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: err?.message || String(err) }));
              }
            });
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
