# Development Guide

## Prerequisites

- Node.js 20+
- npm or Yarn

## Install Dependencies

```bash
npm install
```

## Build All Packages

```bash
npm run build
```

This compiles TypeScript for all packages and apps in the monorepo.

## Running the CLI

```bash
cd apps/cli
node dist/bin.js init
node dist/bin.js scan --path ../..
node dist/bin.js generate --path ../..
node dist/bin.js check --path ../..
```

Or after publishing: `npx repolens init`

## Running the API

In one terminal:

```bash
cd apps/api
npm run dev
```

The API will start on `http://localhost:3001`.

## Running the Web App

In another terminal:

```bash
cd apps/web
npm run dev
```

The web app will start on `http://localhost:3000`.

## Project Structure

```
repolens/
├── apps/
│   ├── cli/           # CLI tool
│   ├── api/           # Express REST API
│   └── web/           # React + Vite web app
├── packages/
│   ├── shared/        # Shared types
│   ├── core/          # File scanner + language detector
│   ├── parser/        # AST parser + dependency parser
│   ├── analyzer/      # Orchestrates scan + parse
│   └── generator/     # Doc generation
├── docs/              # Project docs
└── README.md
```

## Testing

To test the entire flow locally:

1. Build: `npm run build`
2. Run CLI on this repo: `cd apps/cli && node dist/bin.js scan --path ../..`
3. Generate docs: `node dist/bin.js generate --path ../..`
4. View generated docs in `.repolens/docs/`
5. Start the API: `cd apps/api && npm run dev`
6. Start the web app: `cd apps/web && npm run dev`
7. In the browser, enter the absolute path to a test repo and scan

## Next Steps

- Add endpoint detection (Express/Fastify routes)
- Add GitHub API integration
- Add Mermaid diagram generation
- Add persistent storage (PostgreSQL)
- Add authentication
