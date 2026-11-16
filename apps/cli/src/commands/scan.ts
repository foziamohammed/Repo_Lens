import { Command } from "commander";
import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import ora from "ora";
import { Analyzer } from "@repolens/analyzer";

export function scanCommand(): Command {
  return new Command("scan")
    .description("Analyze the codebase and save a scan result.")
    .option("-p, --path <path>", "Target project path", ".")
    .action(async (opts) => {
      const targetPath = path.resolve(opts.path);
      const spinner = ora("Scanning repository...").start();

      try {
        const analyzer = new Analyzer();
        const result = await analyzer.analyze(targetPath);

        const outputDir = path.join(targetPath, ".repolens");
        fs.mkdirSync(outputDir, { recursive: true });

        const scanFile = path.join(outputDir, "scan.json");
        fs.writeFileSync(scanFile, JSON.stringify(result, null, 2));

        spinner.succeed(chalk.green("Scan complete."));
        console.log();
        console.log(`  Files scanned:     ${chalk.bold(result.files.length)}`);
        console.log(`  Languages:         ${chalk.bold(Object.keys(result.languages).join(", ") || "none")}`);
        console.log(`  Frameworks:        ${chalk.bold(result.frameworks.join(", ") || "none")}`);
        console.log(`  Functions found:   ${chalk.bold(result.functions.length)}`);
        console.log(`  Classes found:     ${chalk.bold(result.classes.length)}`);
        console.log(`  Dependencies:      ${chalk.bold(result.dependencies.length)}`);
        console.log();
        console.log(`  Saved to: ${chalk.dim(scanFile)}`);
        console.log();
        console.log("Next step: " + chalk.cyan("repolens generate"));
      } catch (err) {
        spinner.fail("Scan failed.");
        console.error(err);
        process.exit(1);
      }
    });
}
