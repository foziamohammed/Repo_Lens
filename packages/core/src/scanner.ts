import fs from "node:fs";
import path from "node:path";
import type { FileNode } from "@repolens/shared";
import { LanguageDetector } from "./language-detector.js";

const DEFAULT_IGNORE = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  ".cache",
  "coverage",
  "__pycache__",
  ".venv",
  "venv",
  ".idea",
  ".vscode",
  ".repolens",
]);

export interface ScanOptions {
  ignore?: string[];
  maxDepth?: number;
}

export class FileScanner {
  private detector = new LanguageDetector();

  scan(rootPath: string, options: ScanOptions = {}): FileNode[] {
    const ignored = new Set([
      ...DEFAULT_IGNORE,
      ...(options.ignore ?? []),
    ]);
    const maxDepth = options.maxDepth ?? 20;
    const results: FileNode[] = [];

    this.walk(rootPath, rootPath, ignored, maxDepth, 0, results);
    return results;
  }

  private walk(
    rootPath: string,
    currentPath: string,
    ignored: Set<string>,
    maxDepth: number,
    depth: number,
    results: FileNode[]
  ): void {
    if (depth > maxDepth) return;

    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(currentPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (ignored.has(entry.name)) continue;

      const fullPath = path.join(currentPath, entry.name);
      const relativePath = path.relative(rootPath, fullPath).replace(/\\/g, "/");

      if (entry.isDirectory()) {
        this.walk(rootPath, fullPath, ignored, maxDepth, depth + 1, results);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        let sizeBytes = 0;
        try {
          sizeBytes = fs.statSync(fullPath).size;
        } catch {
          // skip unreadable files
        }

        results.push({
          path: relativePath,
          name: entry.name,
          extension: ext,
          language: this.detector.detect(ext),
          sizeBytes,
        });
      }
    }
  }
}
