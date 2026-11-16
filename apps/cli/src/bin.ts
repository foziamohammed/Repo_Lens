#!/usr/bin/env node
import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { scanCommand } from "./commands/scan.js";
import { generateCommand } from "./commands/generate.js";
import { checkCommand } from "./commands/check.js";

const program = new Command();

program
  .name("repolens")
  .description("Scan repositories, generate documentation, and detect changes.")
  .version("0.0.1");

program.addCommand(initCommand());
program.addCommand(scanCommand());
program.addCommand(generateCommand());
program.addCommand(checkCommand());

program.parse(process.argv);
