import fs from "node:fs";
import { parse, simpleTraverse } from "@typescript-eslint/typescript-estree";
import type { FunctionInfo, ClassInfo } from "@repolens/shared";

export class TypeScriptParser {
  parseFile(filePath: string): { functions: FunctionInfo[]; classes: ClassInfo[] } {
    let source: string;
    try {
      source = fs.readFileSync(filePath, "utf8");
    } catch {
      return { functions: [], classes: [] };
    }

    let ast: ReturnType<typeof parse>;
    try {
      ast = parse(source, {
        jsx: filePath.endsWith(".tsx") || filePath.endsWith(".jsx"),
        loc: true,
        comment: true,
        tokens: false,
      });
    } catch {
      return { functions: [], classes: [] };
    }

    const functions: FunctionInfo[] = [];
    const classes: ClassInfo[] = [];

    simpleTraverse(ast, {
      enter(node) {
        // Extract function declarations and arrow functions assigned to variables
        if (
          node.type === "FunctionDeclaration" &&
          node.id?.name &&
          node.loc
        ) {
          functions.push({
            name: node.id.name,
            filePath,
            startLine: node.loc.start.line,
            endLine: node.loc.end.line,
            isExported: false, // refined by parent check
            isAsync: node.async,
            params: node.params.map((p) =>
              source.slice((p as any).range?.[0] ?? 0, (p as any).range?.[1] ?? 0)
            ),
          });
        }

        if (node.type === "ClassDeclaration" && node.id?.name && node.loc) {
          const methods = node.body.body
            .filter((m) => m.type === "MethodDefinition")
            .map((m) => {
              const key = (m as any).key;
              return key?.name ?? key?.value ?? "unknown";
            });

          classes.push({
            name: node.id.name,
            filePath,
            startLine: node.loc.start.line,
            methods,
            isExported: false,
          });
        }
      },
    });

    return { functions, classes };
  }
}
