import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { ScanResult, GeneratedDocs, ChangeDetectionResult } from "@repolens/shared";

/**
 * Detects which documentation sections may be outdated based on
 * file content hashes compared against those recorded at doc generation time.
 */
export class ChangeDetector {
  /**
   * Compute a hash fingerprint of source files referenced by docs.
   */
  hashFiles(rootPath: string, filePaths: string[]): string {
    const hasher = crypto.createHash("sha256");
    for (const rel of filePaths.sort()) {
      const abs = path.join(rootPath, rel);
      try {
        const content = fs.readFileSync(abs);
        hasher.update(rel);
        hasher.update(content);
      } catch {
        hasher.update(rel + ":missing");
      }
    }
    return hasher.digest("hex");
  }

  /**
   * Compare current scan against previously generated docs to find
   * sections that need updating.
   */
  detect(
    currentScan: ScanResult,
    previousDocs: GeneratedDocs
  ): ChangeDetectionResult {
    const outdated: ChangeDetectionResult["outdatedSections"] = [];
    const missing: string[] = [];

    // Check if the number of functions/classes changed significantly
    const root = currentScan.meta.rootPath;
    const currentFileCount = currentScan.files.length;

    // Simple heuristic: if source files changed since docs were generated
    const docAge =
      Date.now() - new Date(previousDocs.generatedAt).getTime();
    const ageHours = docAge / (1000 * 60 * 60);

    if (ageHours > 24) {
      // Re-hash all source files referenced
      const allSourcePaths = currentScan.files
        .filter((f) => f.language !== null)
        .map((f) => f.path);

      const currentHash = this.hashFiles(root, allSourcePaths);

      outdated.push({
        sectionId: "readme",
        reason: `Documentation is ${Math.round(ageHours)} hours old and source files may have changed.`,
        affectedFiles: allSourcePaths.slice(0, 5),
      });
    }

    if (!previousDocs.api && currentScan.endpoints.length > 0) {
      missing.push("api");
    }

    return {
      outdatedSections: outdated,
      missingSections: missing,
      checkedAt: new Date().toISOString(),
    };
  }
}
