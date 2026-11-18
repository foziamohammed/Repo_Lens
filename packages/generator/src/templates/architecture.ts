import type { ScanResult, DocSection, FileNode, FunctionInfo, ClassInfo } from "@repolens/shared";
import { MermaidGenerator } from "../mermaid-generator.js";

export class ArchitectureTemplate {
  private mermaid = new MermaidGenerator();

  render(scan: ScanResult, generatedAt: string): DocSection {
    const { files, functions, classes, languages, meta, dependencies, frameworks } = scan;

    const sourceFiles = files.filter((f) => f.language !== null);
    const totalSize = files.reduce((s, f) => s + f.sizeBytes, 0);

    // Strip absolute path prefix so paths are relative throughout
    const rootPrefix = meta.rootPath.replace(/\\/g, "/");
    const toRelative = (p: string) =>
      p.replace(/\\/g, "/").replace(rootPrefix + "/", "");

    // --- Module / layer map ---
    // Group files into top-level modules (apps/*, packages/*, root)
    type Module = {
      name: string;
      description: string;
      sourceFiles: number;
      totalFiles: number;
      sizeBytes: number;
      submodules: Record<string, { files: number; sizeBytes: number }>;
      classes: ClassInfo[];
      functions: FunctionInfo[];
    };

    const modules: Record<string, Module> = {};

    for (const file of files) {
      const parts = file.path.split("/");
      let moduleKey: string;
      let subKey: string | null = null;

      if (parts.length === 1) {
        moduleKey = "(root)";
      } else if (parts.length >= 3 && (parts[0] === "apps" || parts[0] === "packages")) {
        moduleKey = `${parts[0]}/${parts[1]}`;
        subKey = parts.length >= 4 ? parts[2] : null;
      } else {
        moduleKey = parts[0];
        subKey = parts.length >= 3 ? parts[1] : null;
      }

      if (!modules[moduleKey]) {
        modules[moduleKey] = {
          name: moduleKey,
          description: describeModule(moduleKey, dependencies),
          sourceFiles: 0,
          totalFiles: 0,
          sizeBytes: 0,
          submodules: {},
          classes: [],
          functions: [],
        };
      }

      const mod = modules[moduleKey];
      mod.totalFiles++;
      mod.sizeBytes += file.sizeBytes;
      if (file.language) mod.sourceFiles++;

      if (subKey) {
        mod.submodules[subKey] ??= { files: 0, sizeBytes: 0 };
        mod.submodules[subKey].files++;
        mod.submodules[subKey].sizeBytes += file.sizeBytes;
      }
    }

    // Attach classes and functions to their module
    for (const cls of classes) {
      const rel = toRelative(cls.filePath);
      const parts = rel.split("/");
      let moduleKey =
        parts.length >= 3 && (parts[0] === "apps" || parts[0] === "packages")
          ? `${parts[0]}/${parts[1]}`
          : parts[0];
      if (modules[moduleKey]) modules[moduleKey].classes.push(cls);
    }

    for (const fn of functions) {
      const rel = toRelative(fn.filePath);
      const parts = rel.split("/");
      let moduleKey =
        parts.length >= 3 && (parts[0] === "apps" || parts[0] === "packages")
          ? `${parts[0]}/${parts[1]}`
          : parts[0];
      if (modules[moduleKey]) modules[moduleKey].functions.push(fn);
    }

    // Sort modules: packages first, then apps, then root
    const sortedModules = Object.values(modules).sort((a, b) => {
      const rank = (m: Module) =>
        m.name.startsWith("packages/") ? 0 : m.name.startsWith("apps/") ? 1 : 2;
      return rank(a) - rank(b) || a.name.localeCompare(b.name);
    });

    // --- Build human-readable module sections ---
    const moduleSections = sortedModules
      .filter((m) => m.name !== "(root)")
      .map((mod) => {
        const classLines =
          mod.classes.length > 0
            ? mod.classes
                .map((c) => {
                  const methods = c.methods.length > 0 ? c.methods.join(", ") : "no public methods";
                  return `  - **${c.name}** — ${methods}`;
                })
                .join("\n")
            : null;

        const fnLines =
          mod.functions.filter((f) => f.isExported).length > 0
            ? mod.functions
                .filter((f) => f.isExported)
                .map((f) => `  - **${f.name}**${f.isAsync ? " *(async)*" : ""}`)
                .join("\n")
            : null;

        const subLines =
          Object.keys(mod.submodules).length > 0
            ? Object.entries(mod.submodules)
                .sort((a, b) => b[1].files - a[1].files)
                .map(([sub, info]) => `  - \`${sub}/\` — ${info.files} file${info.files !== 1 ? "s" : ""}`)
                .join("\n")
            : null;

        const parts = [
          `### ${mod.name}`,
          "",
          `> ${mod.description}`,
          "",
          `${mod.sourceFiles} source file${mod.sourceFiles !== 1 ? "s" : ""} · ${formatBytes(mod.sizeBytes)}`,
        ];

        if (subLines) {
          parts.push("", "**Subdirectories**", subLines);
        }
        if (classLines) {
          parts.push("", "**Classes**", classLines);
        }
        if (fnLines) {
          parts.push("", "**Exported functions**", fnLines);
        }

        return parts.join("\n");
      })
      .join("\n\n---\n\n");

    // --- Mermaid diagrams ---
    const moduleFlowDiagram = this.mermaid.moduleFlowDiagram(sortedModules.map((m) => m.name));
    const classDiagram = this.mermaid.classDiagram(classes, toRelative);

    // --- At-a-glance stats ---
    const exportedClasses = classes.filter((c) => c.isExported).length;
    const exportedFunctions = functions.filter((f) => f.isExported).length;

    const content = `# Architecture Overview

> Generated by RepoLens · ${generatedAt}

## At a Glance

| | |
|---|---|
| **Project** | ${meta.name} |
| **Source files** | ${sourceFiles.length} of ${files.length} total |
| **Languages** | ${Object.keys(languages).join(", ") || "—"} |
| **Frameworks** | ${frameworks.length > 0 ? frameworks.join(", ") : "none detected"} |
| **Modules** | ${sortedModules.filter((m) => m.name !== "(root)").length} |
| **Classes** | ${classes.length} (${exportedClasses} exported) |
| **Functions** | ${functions.length} (${exportedFunctions} exported) |
| **Total size** | ${formatBytes(totalSize)} |

---

## Module Map

This diagram shows how the project's modules relate to each other.

\`\`\`mermaid
${moduleFlowDiagram}
\`\`\`

---

## Module Breakdown

${moduleSections}

---

## Class Diagram

\`\`\`mermaid
${classDiagram}
\`\`\`

---

## Key Files

${topFiles(files)}
`;

    return {
      id: "architecture",
      title: "Architecture Overview",
      content,
      sourceFiles: files.map((f) => f.path),
      generatedAt,
    };
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────

function describeModule(
  key: string,
  deps: { name: string }[]
): string {
  const descriptions: Record<string, string> = {
    "apps/cli": "Command-line interface — the `repolens` binary users run in a terminal",
    "apps/api": "REST API server — exposes scan and documentation endpoints to the web app",
    "apps/web": "React web application — browse project structure, view and compare docs",
    "packages/shared": "Shared TypeScript types used by every other package and app",
    "packages/core": "File system scanner and language detection",
    "packages/parser": "AST-based code parser for functions, classes, and dependencies",
    "packages/analyzer": "Orchestrates the scan and parse steps, runs change detection",
    "packages/generator": "Builds human-readable documentation from scan results",
    docs: "Project-level documentation and guides",
  };
  return descriptions[key] ?? `${key.split("/").pop()} module`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const ARTIFACT_EXTS = new Set([".tsbuildinfo", ".lock"]);
const ARTIFACT_NAMES = new Set(["package-lock.json", "yarn.lock", "pnpm-lock.yaml"]);

function topFiles(files: FileNode[]): string {
  const interesting = files
    .filter((f) => f.language !== null && !ARTIFACT_EXTS.has(f.extension))
    .sort((a, b) => b.sizeBytes - a.sizeBytes)
    .slice(0, 8);

  if (interesting.length === 0) return "_No source files found._";

  return (
    "| File | Language | Size |\n" +
    "|------|----------|------|\n" +
    interesting
      .map((f) => `| \`${f.path}\` | ${f.language} | ${formatBytes(f.sizeBytes)} |`)
      .join("\n")
  );
}
