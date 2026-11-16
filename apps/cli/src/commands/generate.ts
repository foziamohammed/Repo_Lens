import { Command } from "commander";
import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import ora from "ora";
import { DocGenerator } from "@repolens/generator";
import type { ScanResult } from "@repolens/shared";

export function generateCommand(): Command {
  return new Command("generate")
    .description("Generate documentation from the last scan result.")
    .option("-p, --path <path>", "Target project path", ".")
    .action((opts) => {
      const targetPath = path.resolve(opts.path);
      const scanFile = path.join(targetPath, ".repolens", "scan.json");

      if (!fs.existsSync(scanFile)) {
        console.error(chalk.red("No scan found. Run `repolens scan` first."));
        process.exit(1);
      }

      const spinner = ora("Generating documentation...").start();

      try {
        const scan: ScanResult = JSON.parse(fs.readFileSync(scanFile, "utf8"));
        const generator = new DocGenerator();
        const docs = generator.generate(scan);

        const docsDir = path.join(targetPath, ".repolens", "docs");
        fs.mkdirSync(docsDir, { recursive: true });

        // Write each section as a markdown file
        fs.writeFileSync(path.join(docsDir, "README.md"), docs.readme.content);
        fs.writeFileSync(path.join(docsDir, "setup.md"), docs.setup.content);
        fs.writeFileSync(path.join(docsDir, "architecture.md"), docs.architecture.content);
        if (docs.api) {
          fs.writeFileSync(path.join(docsDir, "api.md"), docs.api.content);
        }

        // Save full docs JSON for the web app / change detection
        fs.writeFileSync(
          path.join(targetPath, ".repolens", "docs.json"),
          JSON.stringify(docs, null, 2)
        );

        spinner.succeed(chalk.green("Documentation generated."));
        console.log();
        console.log(`  Output: ${chalk.dim(docsDir)}`);
        console.log();
        console.log("Files created:");
        console.log(chalk.cyan("  .repolens/docs/README.md"));
        console.log(chalk.cyan("  .repolens/docs/setup.md"));
        console.log(chalk.cyan("  .repolens/docs/architecture.md"));
        if (docs.api) console.log(chalk.cyan("  .repolens/docs/api.md"));
      } catch (err) {
        spinner.fail("Generation failed.");
        console.error(err);
        process.exit(1);
      }
    });
}
