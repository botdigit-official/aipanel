/**
 * Smart file target detection for AI code snippets.
 * Ensures AI-generated manifests (package.json, Cargo.toml), components (App.tsx),
 * documentation (TASK.md, ARCHITECTURE.md), or styles don't accidentally overwrite
 * mismatched open tabs (e.g. pasting package.json into an open TASK.md).
 */

export interface ResolvedFileTarget {
  targetPath: string;
  fileName: string;
  language: string;
}

export function resolveTargetFile(
  code: string,
  activeTabPath: string | null,
  projectRoot: string,
  suggestedPath?: string
): ResolvedFileTarget {
  const root = projectRoot.replace(/\/+$/, "");

  // 1. Explicit path from AI message or user
  if (suggestedPath && suggestedPath.trim().length > 0) {
    const cleanPath = suggestedPath.trim();
    const fullPath = cleanPath.startsWith("/") ? cleanPath : `${root}/${cleanPath}`;
    const fileName = fullPath.split("/").pop() || "file";
    return {
      targetPath: fullPath,
      fileName,
      language: getLanguageFromPath(fileName),
    };
  }

  const trimmed = code.trim();

  // 2. Package manifest (package.json)
  if (
    trimmed.startsWith("{") &&
    (trimmed.includes('"dependencies"') ||
      trimmed.includes('"devDependencies"') ||
      trimmed.includes('"scripts"') ||
      trimmed.includes('"engines"'))
  ) {
    if (activeTabPath && activeTabPath.endsWith("package.json")) {
      return {
        targetPath: activeTabPath,
        fileName: "package.json",
        language: "json",
      };
    }
    return {
      targetPath: `${root}/package.json`,
      fileName: "package.json",
      language: "json",
    };
  }

  // 3. Rust Cargo Manifest (Cargo.toml)
  if (trimmed.includes("[package]") || (trimmed.includes("[dependencies]") && !trimmed.includes("{"))) {
    if (activeTabPath && activeTabPath.endsWith("Cargo.toml")) {
      return {
        targetPath: activeTabPath,
        fileName: "Cargo.toml",
        language: "plaintext",
      };
    }
    return {
      targetPath: `${root}/Cargo.toml`,
      fileName: "Cargo.toml",
      language: "plaintext",
    };
  }

  // 4. Docker / Containers
  if (trimmed.includes("FROM ") && (trimmed.includes("WORKDIR ") || trimmed.includes("RUN "))) {
    return {
      targetPath: `${root}/Dockerfile`,
      fileName: "Dockerfile",
      language: "plaintext",
    };
  }
  if (trimmed.includes("services:") && (trimmed.includes("version:") || trimmed.includes("networks:"))) {
    return {
      targetPath: `${root}/docker-compose.yml`,
      fileName: "docker-compose.yml",
      language: "plaintext",
    };
  }

  // 5. Database SQL Schema / Migration
  if (
    trimmed.includes("CREATE TABLE") ||
    trimmed.includes("ALTER TABLE") ||
    trimmed.includes("INSERT INTO") ||
    trimmed.includes("CREATE INDEX")
  ) {
    if (activeTabPath && activeTabPath.endsWith(".sql")) {
      const fileName = activeTabPath.split("/").pop() || "schema.sql";
      return {
        targetPath: activeTabPath,
        fileName,
        language: "sql",
      };
    }
    return {
      targetPath: `${root}/schema.sql`,
      fileName: "schema.sql",
      language: "sql",
    };
  }

  // 6. Markdown Task lists / Architecture / Documentation
  const isMarkdown =
    trimmed.startsWith("#") ||
    trimmed.includes("- [ ]") ||
    trimmed.includes("- [x]") ||
    trimmed.includes("## Architecture") ||
    trimmed.includes("## Tech Stack");

  if (isMarkdown) {
    if (trimmed.includes("- [ ]") || trimmed.includes("## Tasks") || trimmed.includes("# Task")) {
      if (activeTabPath && activeTabPath.endsWith("TASK.md")) {
        return { targetPath: activeTabPath, fileName: "TASK.md", language: "markdown" };
      }
      return { targetPath: `${root}/TASK.md`, fileName: "TASK.md", language: "markdown" };
    }

    if (trimmed.includes("# Architecture") || trimmed.includes("## Architecture")) {
      if (activeTabPath && activeTabPath.endsWith("ARCHITECTURE.md")) {
        return { targetPath: activeTabPath, fileName: "ARCHITECTURE.md", language: "markdown" };
      }
      return { targetPath: `${root}/ARCHITECTURE.md`, fileName: "ARCHITECTURE.md", language: "markdown" };
    }

    if (activeTabPath && activeTabPath.endsWith(".md")) {
      const fileName = activeTabPath.split("/").pop() || "document.md";
      return { targetPath: activeTabPath, fileName, language: "markdown" };
    }

    return { targetPath: `${root}/README.md`, fileName: "README.md", language: "markdown" };
  }

  // 7. Stylesheet (CSS)
  if (
    trimmed.includes("@tailwind") ||
    (trimmed.includes("{") &&
      (trimmed.includes("margin:") ||
        trimmed.includes("display: flex") ||
        trimmed.includes("background-color:") ||
        trimmed.includes("font-family:")))
  ) {
    if (activeTabPath && activeTabPath.endsWith(".css")) {
      const fileName = activeTabPath.split("/").pop() || "index.css";
      return { targetPath: activeTabPath, fileName, language: "css" };
    }
    return { targetPath: `${root}/src/index.css`, fileName: "index.css", language: "css" };
  }

  // 8. TypeScript / React JSX Component
  const isReact =
    trimmed.includes("import React") ||
    trimmed.includes("export default function") ||
    trimmed.includes("const [") ||
    trimmed.includes("return (") ||
    trimmed.includes("className=");

  if (isReact) {
    if (activeTabPath && (activeTabPath.endsWith(".tsx") || activeTabPath.endsWith(".jsx"))) {
      const fileName = activeTabPath.split("/").pop() || "Component.tsx";
      return { targetPath: activeTabPath, fileName, language: "typescript" };
    }
    return { targetPath: `${root}/src/App.tsx`, fileName: "App.tsx", language: "typescript" };
  }

  // 9. Active Tab fallback if it matches language
  if (activeTabPath) {
    const fileName = activeTabPath.split("/").pop() || "file";
    return {
      targetPath: activeTabPath,
      fileName,
      language: getLanguageFromPath(fileName),
    };
  }

  // 10. Default fallback
  return {
    targetPath: `${root}/src/App.tsx`,
    fileName: "App.tsx",
    language: "typescript",
  };
}

export function getLanguageFromPath(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    md: "markdown",
    css: "css",
    html: "html",
    sql: "sql",
    rs: "rust",
    py: "python",
    sh: "plaintext",
    toml: "plaintext",
    yml: "plaintext",
    yaml: "plaintext",
  };
  return map[ext] || "plaintext";
}
