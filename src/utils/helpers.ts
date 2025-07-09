import figlet from "figlet";
import chalk from "chalk";
import { execa } from "execa";
import ora from "ora";
import path from "node:path";
import fs from "fs-extra";
import {
  honoRpcTemplate,
  honoClientTemplate,
  shadcnTemplate,
  tailwindTemplate,
  defaultTemplate,
  TEMPLATES,
} from "./templates";
import type { ProjectOptions, ProjectResult } from "../types";
import degit from "degit";
import prompts from "prompts";

export const DEFAULT_REPO = "stevedylandev/bhvr";

export function displayBanner() {
  try {
    const text = figlet.textSync("bhvr", {
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
    console.log(chalk.yellowBright("B H V R"));
    console.log(chalk.yellow("=========="));
  }

  console.log(`\n${chalk.cyan("🦫 Lets build 🦫")}\n`);
  console.log(`${chalk.blue("https://github.com/stevedylandev/bhvr")}\n`);
}

export async function patchFilesForRPC(
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

    // 2. Update server package.json dev script for RPC
    const serverPkgPath = path.join(projectPath, "server", "package.json");
    const serverPkg = await fs.readJson(serverPkgPath);

    // Update the dev script to include TypeScript compilation
    serverPkg.scripts.dev = "bun --watch run src/index.ts && tsc --watch";

    await fs.writeJson(serverPkgPath, serverPkg, { spaces: 2 });

    // 3. Server modification for RPC export type (no client imports)
    const serverIndexPath = path.join(projectPath, "server", "src", "index.ts");
    await fs.writeFile(serverIndexPath, honoRpcTemplate, "utf8");

    // 4. Create separate client helper file
    const clientHelperPath = path.join(
      projectPath,
      "server",
      "src",
      "client.ts",
    );
    await fs.writeFile(clientHelperPath, honoClientTemplate, "utf8");

    // 5. Update App.tsx based on template selection using switch statement
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

    let linter = options.linter;

    if (!options.yes && !options.linter) {
      const linterResponse = await prompts({
        type: "select",
        name: "linter",
        message: "Select a linter:",
        choices: [
          { title: "ESLint (default)", value: "eslint" },
          { title: "Biome", value: "biome" },
        ],
        initial: 0,
      });

      if (linterResponse.linter === undefined) {
        console.log(chalk.yellow("Project creation cancelled."));
        return null;
      }

      linter = linterResponse.linter;
    }

    if (linter === "biome") {
      await setupBiome(projectPath);
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
        } catch (_bunErr) {
          try {
            spinner.text = "Installing dependencies with npm...";
            await execa("npm", ["install"], { cwd: projectPath });
            spinner.succeed("Dependencies installed with npm");
            dependenciesInstalled = true;
          } catch (_npmErr) {
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
      } catch (_bunErr) {
        try {
          spinner.text = "Installing dependencies with npm...";
          await execa("npm", ["install"], { cwd: projectPath });
          spinner.succeed("Dependencies installed with npm");
          dependenciesInstalled = true;
        } catch (_npmErr) {
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

export async function setupBiome(projectPath: string): Promise<void> {
  const spinner = ora("Setting up Biome...").start();
  try {
    const clientPath = path.join(projectPath, "client");
    const clientPkgJsonPath = path.join(clientPath, "package.json");
    const eslintConfigPath = path.join(clientPath, "eslint.config.js");

    // Remove ESLint config file
    if (fs.existsSync(eslintConfigPath)) {
      await fs.remove(eslintConfigPath);
    }

    // Read client package.json and remove ESLint dependencies
    const clientPkgJson = await fs.readJson(clientPkgJsonPath);
    const devDependencies = clientPkgJson.devDependencies || {};
    const eslintDeps = Object.keys(devDependencies).filter(
      (dep) => dep.includes("eslint") || dep.includes("@eslint"),
    );

    if (eslintDeps.length > 0) {
      spinner.text = "Replacing ESLint dependencies...";
      await execa("bun", ["remove", ...eslintDeps], { cwd: clientPath });
    }

    // Install Biome in the root of the project
    spinner.text = "Installing Biome...";
    await execa("bun", ["add", "-D", "@biomejs/biome"], { cwd: projectPath });

    // Create biome.json in the root of the project
    spinner.text = "Creating biome.json...";
    const biomeConfig = {
      $schema: "https://biomejs.dev/schemas/1.7.3/schema.json",
      vcs: {
        enabled: true,
        clientKind: "git",
        useIgnoreFile: true,
      },
      files: { ignoreUnknown: false, ignore: [] },
      formatter: { enabled: true },
      organizeImports: { enabled: true },
      linter: {
        enabled: true,
        rules: {
          recommended: true,
        },
      },
    };
    const biomeConfigPath = path.join(projectPath, "biome.json");
    await fs.writeJson(biomeConfigPath, biomeConfig, { spaces: 2 });

    // Update client package.json scripts to remove lint
    spinner.text = "Updating scripts in client/package.json...";
    const newClientPkgJson = await fs.readJson(clientPkgJsonPath);
    if (newClientPkgJson.scripts || newClientPkgJson.scripts.lint) {
      delete newClientPkgJson.scripts.lint;
    }
    await fs.writeJson(clientPkgJsonPath, newClientPkgJson, { spaces: 2 });

    // Update root package.json with biome scripts
    spinner.text = "Updating scripts in root/package.json...";
    const rootPkgJsonPath = path.join(projectPath, "package.json");
    if (fs.existsSync(rootPkgJsonPath)) {
      const rootPkgJson = await fs.readJson(rootPkgJsonPath);
      rootPkgJson.scripts = rootPkgJson.scripts || {};
      rootPkgJson.scripts.format = "biome format . --write";
      rootPkgJson.scripts.lint = "biome lint .";
      await fs.writeJson(rootPkgJsonPath, rootPkgJson, { spaces: 2 });
    }

    spinner.succeed("Biome setup complete.");
  } catch (error) {
    spinner.fail("Biome setup failed.");
    if (error instanceof Error) {
      console.error(chalk.red("\nError:"), error.message);
    } else {
      console.error(chalk.red("\nError: Unknown error during Biome setup."));
    }
  }
}
