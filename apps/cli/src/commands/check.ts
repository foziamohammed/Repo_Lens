import { Command } from "commander";
import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import ora from "ora";
import { Analyzer, ChangeDetector } from "@repolens/analyzer";
import type { GeneratedDocs } from "@repolens/shared";

export function checkCommand(): Command {
  return new Command("check")
    .description("Detect code changes that may have made documentation outdated.")
    .option("-p, --path <path>", "Target project path", ".")
    .action(async (opts) => {
      const targetPath = path.resolve(opts.path);
      const docsFile = path.join(targetPath, ".repolens", "docs.json");

      if (!fs.existsSync(docsFile)) {
        console.error(chalk.red("No docs found. Run `repolens generate` first."));
        process.exit(1);
      }

      const spinner = ora("Checking for changes...").start();

      try {
        const previousDocs: GeneratedDocs = JSON.parse(
          fs.readFileSync(docsFile, "utf8")
        );

        const analyzer = new Analyzer();
        const currentScan = await analyzer.analyze(targetPath);

        const detector = new ChangeDetector();
        const result = detector.detect(currentScan, previousDocs);

        spinner.succeed("Check complete.");
        console.log();

        if (
          result.outdatedSections.length === 0 &&
          result.missingSections.length === 0
        ) {
          console.log(chalk.green("✔ Documentation appears up to date."));
        } else {
          if (result.outdatedSections.length > 0) {
            console.log(chalk.yellow("⚠ Potentially outdated sections:"));
            for (const section of result.outdatedSections) {
              console.log(`  - ${chalk.bold(section.sectionId)}: ${section.reason}`);
            }
          }
          if (result.missingSections.length > 0) {
            console.log(chalk.red("✖ Missing sections:"));
            for (const s of result.missingSections) {
              console.log(`  - ${chalk.bold(s)}`);
            }
          }
          console.log();
          console.log("Run " + chalk.cyan("repolens generate") + " to refresh documentation.");
        }
      } catch (err) {
        spinner.fail("Check failed.");
        console.error(err);
        process.exit(1);
      }
    });
}
