import type { ClassInfo, FunctionInfo } from "@repolens/shared";

/**
 * Generates Mermaid diagram source strings from scan data.
 * The output can be dropped directly into a ```mermaid code block.
 */
export class MermaidGenerator {
  /**
   * Flowchart showing which modules depend on which.
   * Hardcoded layer knowledge for the monorepo pattern:
   *   apps → packages/analyzer → packages/parser, packages/core, packages/shared
   *         packages/generator → packages/shared
   * For unknown projects we fall back to a simple list layout.
   */
  moduleFlowDiagram(moduleNames: string[]): string {
    const hasPackages = moduleNames.some((m) => m.startsWith("packages/"));
    const hasApps = moduleNames.some((m) => m.startsWith("apps/"));

    if (!hasPackages && !hasApps) {
      // Generic flat layout
      const nodes = moduleNames.map((m, i) => `  M${i}["${m}"]`).join("\n");
      return `flowchart LR\n${nodes}`;
    }

    const lines: string[] = ["flowchart TD"];

    // Build safe node IDs (no slashes or spaces)
    const id = (name: string) =>
      name.replace(/[^a-zA-Z0-9]/g, "_");

    // Declare subgraphs by layer
    if (hasApps) {
      const apps = moduleNames.filter((m) => m.startsWith("apps/"));
      lines.push("  subgraph Apps");
      for (const a of apps) {
        const label = a.replace("apps/", "");
        lines.push(`    ${id(a)}["${label}"]`);
      }
      lines.push("  end");
    }

    if (hasPackages) {
      const pkgs = moduleNames.filter((m) => m.startsWith("packages/"));
      lines.push("  subgraph Packages");
      for (const p of pkgs) {
        const label = p.replace("packages/", "");
        lines.push(`    ${id(p)}["${label}"]`);
      }
      lines.push("  end");
    }

    // Known dependency edges for a standard monorepo layout
    const KNOWN_DEPS: Array<[string, string]> = [
      ["apps/cli",        "packages/analyzer"],
      ["apps/cli",        "packages/generator"],
      ["apps/api",        "packages/analyzer"],
      ["apps/api",        "packages/generator"],
      ["apps/web",        "packages/shared"],
      ["packages/analyzer", "packages/core"],
      ["packages/analyzer", "packages/parser"],
      ["packages/analyzer", "packages/shared"],
      ["packages/generator","packages/shared"],
      ["packages/parser", "packages/shared"],
      ["packages/core",   "packages/shared"],
    ];

    const present = new Set(moduleNames);
    for (const [from, to] of KNOWN_DEPS) {
      if (present.has(from) && present.has(to)) {
        lines.push(`  ${id(from)} --> ${id(to)}`);
      }
    }

    return lines.join("\n");
  }

  /**
   * Class diagram for all detected classes and their methods.
   */
  classDiagram(
    classes: ClassInfo[],
    toRelative: (path: string) => string
  ): string {
    if (classes.length === 0) {
      return "classDiagram\n  note \"No classes detected\"";
    }

    const lines: string[] = ["classDiagram"];

    // Group classes by module so we can add notes
    const byModule: Record<string, ClassInfo[]> = {};
    for (const cls of classes) {
      const rel = toRelative(cls.filePath);
      const parts = rel.split("/");
      const moduleKey =
        parts.length >= 3 && (parts[0] === "apps" || parts[0] === "packages")
          ? `${parts[0]}/${parts[1]}`
          : parts[0];
      (byModule[moduleKey] ??= []).push(cls);
    }

    for (const [moduleName, moduleClasses] of Object.entries(byModule)) {
      const moduleLabel = moduleName.split("/").pop() ?? moduleName;
      lines.push(`  namespace ${sanitizeId(moduleLabel)} {`);

      for (const cls of moduleClasses) {
        lines.push(`    class ${sanitizeId(cls.name)} {`);
        for (const method of cls.methods) {
          // Skip private-looking helpers
          if (method.startsWith("_")) continue;
          lines.push(`      +${method}()`);
        }
        lines.push("    }");
      }

      lines.push("  }");
    }

    return lines.join("\n");
  }

  /**
   * Simple timeline / sequence showing the CLI command flow.
   * Only generated when CLI commands are present.
   */
  cliFlowDiagram(functions: FunctionInfo[], toRelative: (p: string) => string): string | null {
    const cliCommands = functions
      .filter((f) => {
        const rel = toRelative(f.filePath);
        return rel.includes("cli") && rel.includes("commands") && f.isExported;
      })
      .map((f) => f.name);

    if (cliCommands.length === 0) return null;

    const lines = [
      "flowchart LR",
      `  User(["👤 User"])`,
      `  CLI["repolens CLI"]`,
    ];

    for (const cmd of cliCommands) {
      const label = cmd.replace("Command", "");
      const nodeId = `cmd_${label}`;
      lines.push(`  ${nodeId}["${label}"]`);
    }

    lines.push(`  User --> CLI`);
    for (const cmd of cliCommands) {
      const label = cmd.replace("Command", "");
      lines.push(`  CLI --> cmd_${label}`);
    }

    return lines.join("\n");
  }
}

function sanitizeId(name: string): string {
  // Mermaid class names can't have spaces or special chars
  return name.replace(/[^a-zA-Z0-9]/g, "_");
}
