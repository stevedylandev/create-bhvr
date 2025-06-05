#!/usr/bin/env node
// @ts-ignore: Shebang line

import { program } from "commander";
import chalk from "chalk";
import { displayBanner, createProject } from "./utils";

program
	.name("create-comet")
	.description("Create a Next.js application with MongoDB and Mongoose")
	.argument("[project-directory]", "directory to create the project in")
	.option("-y, --yes", "skip confirmation prompts")
	.option("--ts, --typescript", "use TypeScript (default)")
	.option(
		"--template <template>",
		"specify a template (default, tailwind, shadcn)",
		"default",
	)
	.action(async (projectDirectory, options) => {
		try {
			displayBanner();
			const result = await createProject(projectDirectory, options);
			if (result) {
				console.log(chalk.green("Project created successfully!"));
				console.log("\nNext steps:");

				if (!result.dependenciesInstalled) {
					console.log(chalk.cyan(`  cd ${result.projectName}`));
					console.log(chalk.cyan("  bun install"));
				} else {
					console.log(chalk.cyan(`  cd ${result.projectName}`));
				}

				console.log(chalk.cyan("  bun dev               # Start the development server"));
				console.log("\nMake sure to:");
				console.log(chalk.yellow("  1. Set up your MongoDB connection in .env.local"));
				console.log(chalk.yellow("  2. Create your MongoDB models in src/models"));
				console.log(chalk.yellow("  3. Create your API routes in src/app/api"));
				process.exit(0);
			}
		} catch (err) {
			console.error(chalk.red("Error creating project:"), err);
			process.exit(1);
		}
	});

program.parse();
