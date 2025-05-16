#!/usr/bin/env node
// @ts-ignore: Shebang line

import { program } from "commander";
import chalk from "chalk";
import { displayBanner, createProject, DEFAULT_REPO } from "./utils";

program
	.name("create-bhvr")
	.description("Create a bhvr monorepo starter project")
	.argument("[project-directory]", "directory to create the project in")
	.option("-y, --yes", "skip confirmation prompts")
	.option("--ts, --typescript", "use TypeScript (default)")
	.option(
		"--repo <repo>",
		"specify a custom GitHub repository as source",
		DEFAULT_REPO,
	)
	.option(
		"--template <template>",
		"specify a template (default, tailwind, shadcn)",
		"default",
	)
	.option("--branch <branch>", "specify a branch to use from the repository")
	.option("--rpc", "use Hono RPC client for type-safe API communication")
	.action(async (projectDirectory, options) => {
		try {
			displayBanner();
			const result = await createProject(projectDirectory, options);
			if (result) {
				console.log(chalk.green.bold("🎉 Project created successfully!"));
				console.log("\nNext steps:");

				if (!result.dependenciesInstalled) {
					console.log(chalk.cyan(`  cd ${result.projectName}`));
					console.log(chalk.cyan("  bun install"));
				} else {
					console.log(chalk.cyan(`  cd ${result.projectName}`));
				}

				console.log(chalk.cyan("  bun run dev:client   # Start the client"));
				console.log(
					chalk.cyan(
						"  bun run dev:server   # Start the server in another terminal",
					),
				);
				console.log(chalk.cyan("  bun run dev          # Start all"));
				process.exit(0);
			}
		} catch (err) {
			console.error(chalk.red("Error creating project:"), err);
			process.exit(1);
		}
	});

program.parse();
