import path from "node:path";
import { FileScanner } from "@repolens/core";
import { TypeScriptParser, DependencyParser } from "@repolens/parser";
import type { ScanResult, Language } from "@repolens/shared";

export class Analyzer {
  private scanner = new FileScanner();
  private tsParser = new TypeScriptParser();
  private depParser = new DependencyParser();

  async analyze(rootPath: string): Promise<ScanResult> {
    const absRoot = path.resolve(rootPath);
    const files = this.scanner.scan(absRoot);

    // Count languages
    const languages: Record<string, number> = {};
    for (const file of files) {
      if (file.language) {
        languages[file.language] = (languages[file.language] ?? 0) + 1;
      }
    }

    // Parse TypeScript/JavaScript files
    const tsFiles = files.filter(
      (f) => f.language === "typescript" || f.language === "javascript"
    );

    const allFunctions = [];
    const allClasses = [];

    for (const file of tsFiles) {
      const absPath = path.join(absRoot, file.path);
      const { functions, classes } = this.tsParser.parseFile(absPath);
      allFunctions.push(...functions);
      allClasses.push(...classes);
    }

    // Dependencies
    const dependencies = this.depParser.parsePackageJson(absRoot);
    const frameworks = this.depParser.detectFrameworks(dependencies);

    return {
      meta: {
        name: path.basename(absRoot),
        rootPath: absRoot,
        scannedAt: new Date().toISOString(),
      },
      files,
      languages: languages as Record<Language, number>,
      functions: allFunctions,
      classes: allClasses,
      endpoints: [], // populated by endpoint extractor (future)
      dependencies,
      frameworks,
    };
  }
}
