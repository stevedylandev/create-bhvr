#!/usr/bin/env node

import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prompts from "prompts";
import { program } from "commander";
import chalk from "chalk";
import ora from "ora";
import { execa } from "execa";
import degit from "degit";
import figlet from "figlet";
import {
	defaultTemplate,
	shadcnTemplate,
	tailwindTemplate,
	honoRpcTemplate,
} from "./utils/templates";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GitHub repository for the template
const DEFAULT_REPO = "stevedylandev/bhvr";

interface TemplateInfo {
	branch: string;
	description: string;
}

const TEMPLATES: Record<string, TemplateInfo> = {
	default: {
		branch: "main",
		description: "Basic setup with Bun, Hono, Vite and React",
	},
	tailwind: { branch: "tailwindcss", description: "Basic setup + TailwindCSS" },
	shadcn: {
		branch: "shadcn-ui",
		description: "Basic setup + TailwindCSS + shadcn/ui",
	},
};

interface ProjectOptions {
	yes?: boolean;
	typescript?: boolean;
	repo?: string;
	template?: string;
	branch?: string;
	rpc?: boolean;
}

function displayBanner() {
	try {
		const text = figlet.textSync("bhvr", {
			font: "Standard", // Use the Standard font which is more commonly available
			horizontalLayout: "default",
			verticalLayout: "default",
			width: 80,
			whitespaceBreak: true,
		});

		console.log("\n");
		console.log(chalk.yellowBright(text));
	} catch (error) {
		// Fallback in case figlet fails for any reason
		console.log("\n");
		console.log(chalk.yellowBright("B H V R"));
		console.log(chalk.yellow("=========="));
	}

	console.log(`\n${chalk.cyan("🦫 Lets build 🦫")}\n`);
	console.log(`${chalk.blue("https://github.com/stevedylandev/bhvr")}\n`);
}

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

interface ProjectResult {
	projectName: string;
	gitInitialized: boolean;
	dependenciesInstalled: boolean;
	template: string;
}

async function createProject(
	projectDirectory: string,
	options: ProjectOptions,
): Promise<ProjectResult | null> {
	let projectName = projectDirectory;

	if (!projectName && !options.yes) {
		const response = await prompts({
			type: "text",
			name: "projectName",
			message: "What is the name of your project?",
			initial: "my-bhvr-app",
		});

		if (!response.projectName) {
			console.log(chalk.yellow("Project creation cancelled."));
			return null;
		}

		projectName = response.projectName;
	} else if (!projectName) {
		projectName = "my-bhvr-app";
	}

	let templateChoice = options.template || "default";

	if (!options.yes && !options.branch) {
		const templateChoices = Object.keys(TEMPLATES).map((key) => ({
			title: `${key} (${TEMPLATES[key]?.description})`,
			value: key,
		}));

		const templateResponse = await prompts({
			type: "select",
			name: "template",
			message: "Select a template:",
			choices: templateChoices,
			initial: 0,
		});

		if (templateResponse.template === undefined) {
			console.log(chalk.yellow("Project creation cancelled."));
			return null;
		}

		templateChoice = templateResponse.template;
	}

	const projectPath = path.resolve(process.cwd(), projectName);

	if (fs.existsSync(projectPath)) {
		const files = fs.readdirSync(projectPath);

		if (files.length > 0 && !options.yes) {
			const { overwrite } = await prompts({
				type: "confirm",
				name: "overwrite",
				message: `The directory ${projectName} already exists and is not empty. Do you want to overwrite it?`,
				initial: false,
			});

			if (!overwrite) {
				console.log(chalk.yellow("Project creation cancelled."));
				return null;
			}

			await fs.emptyDir(projectPath);
		}
	}

	fs.ensureDirSync(projectPath);

	const repoPath = options.repo || DEFAULT_REPO;
	const templateConfig =
		TEMPLATES[templateChoice as keyof typeof TEMPLATES] || TEMPLATES.default;
	const branch = options.branch || (templateConfig?.branch ?? "main");
	const repoUrl = `${repoPath}#${branch}`;

	const spinner = ora("Downloading template...").start();

	try {
		const emitter = degit(repoUrl, {
			cache: false,
			force: true,
			verbose: false,
		});

		await emitter.clone(projectPath);
		spinner.succeed(
			`Template downloaded successfully (${templateChoice} template)`,
		);

		const pkgJsonPath = path.join(projectPath, "package.json");
		if (fs.existsSync(pkgJsonPath)) {
			const pkgJson = await fs.readJson(pkgJsonPath);
			pkgJson.name = projectName;
			await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 2 });
		}

		const gitDir = path.join(projectPath, ".git");
		if (fs.existsSync(gitDir)) {
			await fs.remove(gitDir);
			console.log(chalk.blue("Removed .git directory"));
		}

		let useRpc = options.rpc;

		if (!options.yes && !options.rpc) {
			const rpcResponse = await prompts({
				type: "confirm",
				name: "useRpc",
				message: "Use Hono RPC client for type-safe API communication?",
				initial: false,
			});

			if (rpcResponse.useRpc === undefined) {
				console.log(chalk.yellow("Project creation cancelled."));
				return null;
			}

			useRpc = rpcResponse.useRpc;
		}

		if (useRpc) {
			await patchFilesForRPC(projectPath, templateChoice);
		}

		let gitInitialized = false;

		if (!options.yes) {
			const gitResponse = await prompts({
				type: "confirm",
				name: "initGit",
				message: "Initialize a git repository?",
				initial: true,
			});

			if (gitResponse.initGit) {
				try {
					spinner.start("Initializing git repository...");
					await execa("git", ["init"], { cwd: projectPath });
					spinner.succeed("Git repository initialized");
					gitInitialized = true;
				} catch (err: unknown) {
					spinner.fail(
						"Failed to initialize git repository. Is git installed?",
					);
					if (err instanceof Error) {
						console.error(chalk.red("Git error:"), err.message);
					} else {
						console.error(chalk.red("Git error: Unknown error"));
					}
				}
			}
		} else {
			try {
				spinner.start("Initializing git repository...");
				await execa("git", ["init"], { cwd: projectPath });
				spinner.succeed("Git repository initialized");
				gitInitialized = true;
			} catch (err) {
				spinner.fail("Failed to initialize git repository. Is git installed?");
			}
		}

		let dependenciesInstalled = false;

		if (!options.yes) {
			const depsResponse = await prompts({
				type: "confirm",
				name: "installDeps",
				message: "Install dependencies?",
				initial: true,
			});

			if (depsResponse.installDeps) {
				spinner.start("Installing dependencies...");
				try {
					await execa("bun", ["install"], { cwd: projectPath });
					spinner.succeed("Dependencies installed with bun");
					dependenciesInstalled = true;
				} catch (bunErr) {
					try {
						spinner.text = "Installing dependencies with npm...";
						await execa("npm", ["install"], { cwd: projectPath });
						spinner.succeed("Dependencies installed with npm");
						dependenciesInstalled = true;
					} catch (npmErr) {
						spinner.fail("Failed to install dependencies.");
						console.log(
							chalk.yellow(
								"You can install them manually after navigating to the project directory.",
							),
						);
					}
				}
			}
		} else {
			spinner.start("Installing dependencies...");
			try {
				await execa("bun", ["install"], { cwd: projectPath });
				spinner.succeed("Dependencies installed with bun");
				dependenciesInstalled = true;
			} catch (bunErr) {
				try {
					spinner.text = "Installing dependencies with npm...";
					await execa("npm", ["install"], { cwd: projectPath });
					spinner.succeed("Dependencies installed with npm");
					dependenciesInstalled = true;
				} catch (npmErr) {
					spinner.fail(
						"Failed to install dependencies. You can install them manually later.",
					);
				}
			}
		}

		return {
			projectName,
			gitInitialized,
			dependenciesInstalled,
			template: templateChoice,
		};
	} catch (err) {
		spinner.fail("Failed to download template");
		throw err;
	}
}

async function patchFilesForRPC(
	projectPath: string,
	templateChoice: string,
): Promise<boolean> {
	const spinner = ora("Setting up RPC client...").start();

	try {
		// 1. Update client package.json to ensure hono client is installed
		const clientPkgPath = path.join(projectPath, "client", "package.json");
		const clientPkg = await fs.readJson(clientPkgPath);

		if (!clientPkg.dependencies.hono) {
			await execa("bun", ["install", "hono"], { cwd: projectPath });
		}

		await fs.writeJson(clientPkgPath, clientPkg, { spaces: 2 });

		// 2. Server modification for RPC export type
		const serverIndexPath = path.join(projectPath, "server", "src", "index.ts");
		await fs.writeFile(serverIndexPath, honoRpcTemplate, "utf8");

		// 3. Update App.tsx based on template selection using switch statement
		const appTsxPath = path.join(projectPath, "client", "src", "App.tsx");

		// Determine template content based on the template type
		let updatedAppContent: string;

		// Select template based on choice
		switch (templateChoice) {
			case "shadcn":
				updatedAppContent = shadcnTemplate;
				break;
			case "tailwind":
				updatedAppContent = tailwindTemplate;
				break;
			default:
				updatedAppContent = defaultTemplate;
				break;
		}

		await fs.writeFile(appTsxPath, updatedAppContent, "utf8");
		spinner.succeed("RPC client setup completed");
		return true;
	} catch (err: unknown) {
		spinner.fail("Failed to set up RPC client");
		if (err instanceof Error) {
			console.error(chalk.red("Error:"), err.message);
		} else {
			console.error(chalk.red("Error: Unknown error"));
		}
		return false;
	}
}
