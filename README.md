# RepoLens

> Understand your code. Document your project. Keep everything in sync.

RepoLens is a TypeScript monorepo that ships a CLI and web app for scanning repositories, generating documentation, and detecting when docs drift from the code.

## Packages

| Package | Description |
|---------|-------------|
| `@repolens/shared` | Shared types used across all apps and packages |
| `@repolens/core` | File scanner and language detector |
| `@repolens/parser` | AST parser for TypeScript/JS, dependency parser |
| `@repolens/analyzer` | Orchestrates scanning + parsing, change detection |
| `@repolens/generator` | Generates README, API, setup, architecture docs |

## Apps

| App | Description |
|-----|-------------|
| `apps/cli` | `repolens` CLI — init / scan / generate / check |
| `apps/api` | Express API consumed by the web app |
| `apps/web` | React + Vite web app for browsing docs and structure |

## Getting Started

```bash
npm install
npm run build
```

### CLI

```bash
cd apps/cli
node dist/bin.js init
node dist/bin.js scan
node dist/bin.js generate
node dist/bin.js check
```

Or after publishing: `npx repolens init`

### API

```bash
cd apps/api
npm run dev      # starts on http://localhost:3001
```

### Web App

```bash
cd apps/web
npm run dev      # starts on http://localhost:3000
```

## MVP Feature Checklist

- [x] Scan local repository (files, languages, file sizes)
- [x] Detect languages and frameworks
- [x] Parse TypeScript/JS functions and classes (AST-based)
- [x] Parse `package.json` dependencies
- [x] Generate README, Setup, Architecture, and API docs
- [x] CLI commands: init / scan / generate / check
- [x] REST API for the web app
- [x] Web app: scan view + documentation viewer
- [ ] GitHub integration (connect remote repos)
- [ ] Architecture diagram rendering (Mermaid)
- [ ] Persistent storage (PostgreSQL)
- [ ] Auth and project management
