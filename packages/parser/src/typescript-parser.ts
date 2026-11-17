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
        range: true,
        comment: true,
        tokens: false,
      });
    } catch {
      return { functions: [], classes: [] };
    }

    const functions: FunctionInfo[] = [];
    const classes: ClassInfo[] = [];

    simpleTraverse(ast, {
      enter(node, parent) {
        const isExported =
          parent?.type === "ExportNamedDeclaration" ||
          parent?.type === "ExportDefaultDeclaration";

        // Named function declarations
        if (node.type === "FunctionDeclaration" && node.id?.name && node.loc) {
          functions.push({
            name: node.id.name,
            filePath,
            startLine: node.loc.start.line,
            endLine: node.loc.end.line,
            isExported,
            isAsync: node.async,
            params: node.params.map((p) =>
              source.slice((p as any).range?.[0] ?? 0, (p as any).range?.[1] ?? 0)
            ),
          });
        }

        // Arrow functions and function expressions assigned to variables:
        // export const foo = () => {}  or  export const foo = function() {}
        if (
          node.type === "VariableDeclaration" &&
          (parent?.type === "ExportNamedDeclaration" || parent?.type === "Program") &&
          node.loc
        ) {
          for (const decl of node.declarations) {
            const init = decl.init;
            const nameNode = decl.id;
            if (
              nameNode?.type === "Identifier" &&
              init &&
              (init.type === "ArrowFunctionExpression" || init.type === "FunctionExpression") &&
              init.loc
            ) {
              const isVarExported =
                parent?.type === "ExportNamedDeclaration";
              functions.push({
                name: nameNode.name,
                filePath,
                startLine: init.loc.start.line,
                endLine: init.loc.end.line,
                isExported: isVarExported,
                isAsync: (init as any).async ?? false,
                params: init.params.map((p: any) =>
                  source.slice(p.range?.[0] ?? 0, p.range?.[1] ?? 0)
                ),
              });
            }
          }
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
            isExported,
          });
        }
      },
    });

    return { functions, classes };
  }
}
