import figlet from "figlet";
import chalk from "chalk";
import { execa } from "execa";
import ora from "ora";
import path from "node:path";
import fs from "fs-extra";
import {
	mongodbTemplate,
	exampleModelTemplate,
	exampleApiTemplate,
	examplePageTemplate,
	envTemplate,
	packageJsonTemplate,
	TEMPLATES,
} from "./templates";
import type { ProjectOptions, ProjectResult } from "../types";
import prompts from "prompts";

export const DEFAULT_REPO = "stevedylandev/bhvr";

export function displayBanner() {
	try {
		const text = figlet.textSync("comet", {
			font: "Big",
			horizontalLayout: "default",
			verticalLayout: "default",
			width: 80,
			whitespaceBreak: true,
		});

		console.log("\n");
		console.log(chalk.yellowBright(text));
	} catch (error) {
		console.log("\n");
		console.log(chalk.yellowBright("COMET"));
		console.log(chalk.yellow("=========="));
	}

	console.log(`\n${chalk.cyan("🦫 Lets build 🦫")}\n`);
	console.log(`${chalk.blue("https://github.com/stevedylandev/bhvr")}\n`);
}

async function setupNextJsProject(projectPath: string, templateChoice: string): Promise<void> {
	const spinner = ora("Setting up Next.js project...").start();

	try {
		// Create necessary directories
		await fs.ensureDir(path.join(projectPath, "src", "app"));
		await fs.ensureDir(path.join(projectPath, "src", "lib"));
		await fs.ensureDir(path.join(projectPath, "src", "models"));
		await fs.ensureDir(path.join(projectPath, "src", "app", "api"));
		await fs.ensureDir(path.join(projectPath, "src", "app", "api", "examples"));

		// Write package.json
		await fs.writeJson(path.join(projectPath, "package.json"), JSON.parse(packageJsonTemplate), { spaces: 2 });

		// Write environment variables
		await fs.writeFile(path.join(projectPath, ".env.local"), envTemplate);

		// Write MongoDB connection utility
		await fs.writeFile(path.join(projectPath, "src", "lib", "mongodb.ts"), mongodbTemplate);

		// Write example model
		await fs.writeFile(path.join(projectPath, "src", "models", "Example.ts"), exampleModelTemplate);

		// Write example API route
		await fs.writeFile(path.join(projectPath, "src", "app", "api", "examples", "route.ts"), exampleApiTemplate);

		// Write example page
		await fs.writeFile(path.join(projectPath, "src", "app", "page.tsx"), examplePageTemplate);

		// Write layout file
		await fs.writeFile(
			path.join(projectPath, "src", "app", "layout.tsx"),
			`export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`
		);

		// Write tsconfig.json
		await fs.writeJson(
			path.join(projectPath, "tsconfig.json"),
			{
				compilerOptions: {
					target: "es5",
					lib: ["dom", "dom.iterable", "esnext"],
					allowJs: true,
					skipLibCheck: true,
					strict: true,
					forceConsistentCasingInFileNames: true,
					noEmit: true,
					esModuleInterop: true,
					module: "esnext",
					moduleResolution: "node",
					resolveJsonModule: true,
					isolatedModules: true,
					jsx: "preserve",
					incremental: true,
					plugins: [
						{
							name: "next",
						},
					],
					paths: {
						"@/*": ["./src/*"],
					},
				},
				include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
				exclude: ["node_modules"],
			},
			{ spaces: 2 }
		);

		spinner.succeed("Next.js project setup completed");
	} catch (err) {
		spinner.fail("Failed to set up Next.js project");
		throw err;
	}
}

export async function createProject(
	projectDirectory: string,
	options: ProjectOptions,
): Promise<ProjectResult | null> {
	let projectName = projectDirectory;

	if (!projectName && !options.yes) {
		const response = await prompts({
			type: "text",
			name: "projectName",
			message: "What is the name of your project?",
			initial: "comet-app",
		});

		if (!response.projectName) {
			console.log(chalk.yellow("Project creation cancelled."));
			return null;
		}

		projectName = response.projectName;
	} else if (!projectName) {
		projectName = "comet-app";
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

	try {
		await setupNextJsProject(projectPath, templateChoice);

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
					const spinner = ora("Initializing git repository...").start();
					await execa("git", ["init"], { cwd: projectPath });
					spinner.succeed("Git repository initialized");
					gitInitialized = true;
				} catch (err) {
					console.error(chalk.red("Git error:"), err);
				}
			}
		} else {
			try {
				const spinner = ora("Initializing git repository...").start();
				await execa("git", ["init"], { cwd: projectPath });
				spinner.succeed("Git repository initialized");
				gitInitialized = true;
			} catch (err) {
				console.error(chalk.red("Git error:"), err);
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
				const spinner = ora("Installing dependencies...").start();
				try {
					await execa("bun", ["install"], { cwd: projectPath });
					spinner.succeed("Dependencies installed");
					dependenciesInstalled = true;
				} catch (err) {
					spinner.fail("Failed to install dependencies");
					console.log(
						chalk.yellow(
							"You can install them manually after navigating to the project directory.",
						),
					);
				}
			}
		} else {
			const spinner = ora("Installing dependencies...").start();
			try {
				await execa("bun", ["install"], { cwd: projectPath });
				spinner.succeed("Dependencies installed");
				dependenciesInstalled = true;
			} catch (err) {
				spinner.fail("Failed to install dependencies");
				console.log(
					chalk.yellow(
						"You can install them manually after navigating to the project directory.",
					),
				);
			}
		}

		return {
			projectName,
			gitInitialized,
			dependenciesInstalled,
			template: templateChoice,
		};
	} catch (err) {
		console.error(chalk.red("Error creating project:"), err);
		throw err;
	}
}
