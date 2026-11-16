import type { Language } from "@repolens/shared";

const EXT_MAP: Record<string, Language> = {
  ".ts": "typescript",
  ".tsx": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".mjs": "javascript",
  ".cjs": "javascript",
  ".py": "python",
  ".rs": "rust",
  ".go": "go",
  ".java": "java",
  ".cs": "csharp",
  ".cpp": "cpp",
  ".cc": "cpp",
  ".cxx": "cpp",
  ".rb": "ruby",
  ".php": "php",
};

export class LanguageDetector {
  detect(extension: string): Language | null {
    return EXT_MAP[extension.toLowerCase()] ?? null;
  }

  /**
   * Given a map of language -> fileCount, return the list of detected
   * framework names by inspecting dependency manifests.
   * This is a heuristic — real detection happens in the analyzer.
   */
  summarize(counts: Record<string, number>): string[] {
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);
  }
}
