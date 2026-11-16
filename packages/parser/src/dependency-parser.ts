import fs from "node:fs";
import path from "node:path";
import type { DependencyInfo } from "@repolens/shared";

export class DependencyParser {
  parsePackageJson(rootPath: string): DependencyInfo[] {
    const pkgPath = path.join(rootPath, "package.json");
    if (!fs.existsSync(pkgPath)) return [];

    let pkg: any;
    try {
      pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    } catch {
      return [];
    }

    const deps: DependencyInfo[] = [];

    if (pkg.dependencies) {
      for (const [name, version] of Object.entries(pkg.dependencies)) {
        deps.push({ name, version: String(version), isDev: false });
      }
    }

    if (pkg.devDependencies) {
      for (const [name, version] of Object.entries(pkg.devDependencies)) {
        deps.push({ name, version: String(version), isDev: true });
      }
    }

    return deps;
  }

  /**
   * Heuristic: detect frameworks from dependencies.
   * Returns an array of framework names.
   */
  detectFrameworks(deps: DependencyInfo[]): string[] {
    const frameworks: string[] = [];
    const names = new Set(deps.map((d) => d.name));

    if (names.has("react") || names.has("react-dom")) frameworks.push("React");
    if (names.has("next")) frameworks.push("Next.js");
    if (names.has("vue")) frameworks.push("Vue");
    if (names.has("@angular/core")) frameworks.push("Angular");
    if (names.has("express")) frameworks.push("Express");
    if (names.has("fastify")) frameworks.push("Fastify");
    if (names.has("nestjs")) frameworks.push("NestJS");

    return frameworks;
  }
}
