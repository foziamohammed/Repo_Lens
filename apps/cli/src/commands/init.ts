import { Command } from "commander";
import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";

export function initCommand(): Command {
  return new Command("init")
    .description("Initialize RepoLens in the current project.")
    .option("-p, --path <path>", "Target project path", ".")
    .action((opts) => {
      const targetPath = path.resolve(opts.path);
      const configPath = path.join(targetPath, ".repolens.json");

      if (fs.existsSync(configPath)) {
        console.log(chalk.yellow("RepoLens is already initialized in this project."));
        return;
      }

      const config = {
        version: "0.0.1",
        ignore: [],
        output: ".repolens/docs",
        createdAt: new Date().toISOString(),
      };

      fs.mkdirSync(path.join(targetPath, ".repolens", "docs"), { recursive: true });
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      console.log(chalk.green("✔ RepoLens initialized."));
      console.log(`  Config: ${chalk.dim(configPath)}`);
      console.log(`  Docs:   ${chalk.dim(path.join(targetPath, ".repolens", "docs"))}`);
      console.log();
      console.log("Next steps:");
      console.log(chalk.cyan("  repolens scan"));
      console.log(chalk.cyan("  repolens generate"));
    });
}
