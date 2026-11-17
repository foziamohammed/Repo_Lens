import type { ScanResult, DocSection } from "@repolens/shared";

export class SetupTemplate {
  render(scan: ScanResult, generatedAt: string): DocSection {
    const { frameworks, dependencies, meta, files } = scan;

    const hasYarn = dependencies.some((d) => d.name === "yarn");
    const hasPnpm = dependencies.some((d) => d.name === "pnpm");
    const pkgManager = hasPnpm ? "pnpm" : hasYarn ? "yarn" : "npm";

    const installCmd =
      pkgManager === "pnpm" ? "pnpm install" :
      pkgManager === "yarn" ? "yarn install" :
      "npm install";

    const devCmd =
      pkgManager === "pnpm" ? "pnpm dev" :
      pkgManager === "yarn" ? "yarn dev" :
      "npm run dev";

    const buildCmd =
      pkgManager === "pnpm" ? "pnpm build" :
      pkgManager === "yarn" ? "yarn build" :
      "npm run build";

    const testCmd =
      pkgManager === "pnpm" ? "pnpm test" :
      pkgManager === "yarn" ? "yarn test" :
      "npm test";

    // Detect scripts from presence of config files
    const fileNames = new Set(files.map((f) => f.name));
    const hasDocker = fileNames.has("Dockerfile") || fileNames.has("docker-compose.yml");
    const hasEnvExample = fileNames.has(".env.example") || fileNames.has(".env.sample");
    const hasPrisma = dependencies.some((d) => d.name === "prisma" || d.name === "@prisma/client");
    const hasKnex = dependencies.some((d) => d.name === "knex");
    const hasDrizzle = dependencies.some((d) => d.name === "drizzle-orm");
    const hasVite = dependencies.some((d) => d.name === "vite");
    const hasNext = dependencies.some((d) => d.name === "next");
    const hasEslint = dependencies.some((d) => d.name === "eslint");
    const hasPrettier = dependencies.some((d) => d.name === "prettier");
    const hasVitest = dependencies.some((d) => d.name === "vitest");
    const hasJest = dependencies.some((d) => d.name === "jest");

    // Scripts section
    const scripts: string[] = [
      `\`\`\`bash`,
      `# Install dependencies`,
      installCmd,
      ``,
      `# Run in development mode`,
      devCmd,
      ``,
      `# Build for production`,
      buildCmd,
      ``,
      `# Run tests`,
      testCmd,
    ];

    if (hasEslint) {
      const lintCmd = pkgManager === "npm" ? "npm run lint" : `${pkgManager} lint`;
      scripts.push(``, `# Lint`, lintCmd);
    }

    if (hasPrettier) {
      const fmtCmd = pkgManager === "npm" ? "npm run format" : `${pkgManager} format`;
      scripts.push(``, `# Format`, fmtCmd);
    }

    scripts.push(`\`\`\``);

    // DB migration section
    const dbSection = hasPrisma
      ? `\n## Database (Prisma)\n\n\`\`\`bash\n# Generate Prisma client\nnpx prisma generate\n\n# Run migrations\nnpx prisma migrate dev\n\n# Open Prisma Studio\nnpx prisma studio\n\`\`\``
      : hasKnex
      ? `\n## Database (Knex)\n\n\`\`\`bash\n# Run migrations\nnpx knex migrate:latest\n\n# Rollback\nnpx knex migrate:rollback\n\`\`\``
      : hasDrizzle
      ? `\n## Database (Drizzle ORM)\n\n\`\`\`bash\n# Push schema to DB\nnpx drizzle-kit push\n\n# Generate migrations\nnpx drizzle-kit generate\n\`\`\``
      : "";

    // Docker section
    const dockerSection = hasDocker
      ? `\n## Docker\n\n\`\`\`bash\n# Build image\ndocker build -t ${meta.name} .\n\n# Run with compose\ndocker compose up\n\`\`\``
      : "";

    // Env section
    const envSection = hasEnvExample
      ? `\n## Environment Variables\n\nCopy the example file and fill in values:\n\n\`\`\`bash\ncp .env.example .env\n\`\`\`\n\nEdit \`.env\` with your configuration before starting the server.`
      : `\n## Environment Variables\n\nCreate a \`.env\` file at the project root if the application requires configuration (database URLs, API keys, ports, etc.).`;

    // Framework-specific notes
    const frameworkNotes: string[] = [];
    if (hasNext) frameworkNotes.push(`- **Next.js** project — \`${devCmd}\` starts the dev server with hot reload on \`http://localhost:3000\``);
    if (hasVite && !hasNext) frameworkNotes.push(`- **Vite** project — dev server starts on \`http://localhost:5173\` by default`);
    if (hasPrisma) frameworkNotes.push(`- **Prisma** detected — run \`npx prisma generate\` after install`);
    if (hasVitest) frameworkNotes.push(`- Tests use **Vitest** — run with \`${testCmd} --run\` for single-pass`);
    if (hasJest) frameworkNotes.push(`- Tests use **Jest** — run with \`${testCmd} --watchAll=false\` for single-pass`);

    const notesSection =
      frameworkNotes.length > 0
        ? `\n## Notes\n\n${frameworkNotes.join("\n")}`
        : "";

    // All detected dependencies in full
    const prodDeps = dependencies.filter((d) => !d.isDev);
    const devDeps = dependencies.filter((d) => d.isDev);

    const prodTable =
      prodDeps.length > 0
        ? `| Package | Version |\n|---------|----------|\n` +
          prodDeps.map((d) => `| \`${d.name}\` | \`${d.version}\` |`).join("\n")
        : "_No production dependencies detected._";

    const devTable =
      devDeps.length > 0
        ? `| Package | Version |\n|---------|----------|\n` +
          devDeps.map((d) => `| \`${d.name}\` | \`${d.version}\` |`).join("\n")
        : "_No dev dependencies detected._";

    const content = `# Setup Guide

> Generated by RepoLens · ${generatedAt}

## Prerequisites

- **Node.js** >= 20.0.0
- **${pkgManager}**${hasDocker ? "\n- **Docker** (optional, for containerized setup)" : ""}

## Quick Start

${scripts.join("\n")}
${envSection}
${dbSection}
${dockerSection}
${notesSection}

## Frameworks Detected

${frameworks.length > 0 ? frameworks.map((f) => `- ${f}`).join("\n") : "_None detected._"}

## Production Dependencies (${prodDeps.length})

${prodTable}

## Dev Dependencies (${devDeps.length})

${devTable}
`;

    return {
      id: "setup",
      title: "Setup Guide",
      content,
      sourceFiles: [],
      generatedAt,
    };
  }
}
