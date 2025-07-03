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
  shadcnTemplateWithQuery,
  tailwindTemplateWithQuery,
  defaultTemplateWithQuery,
  queryMainTemplate,
  TEMPLATES,
} from "./templates";
import type { ProjectOptions, ProjectResult } from "../types";
import degit from "degit";
import prompts from "prompts";

export const DEFAULT_REPO = "stevedylandev/bhvr";

export async function setupTanStackQuery(
  projectPath: string,
  templateChoice?: string
): Promise<boolean> {
  const spinner = ora("Setting up TanStack Query...").start();

  try {
    // 1. Install TanStack Query and devtools in the client
    const clientPath = path.join(projectPath, "client");
    await execa("bun", ["add", "@tanstack/react-query"], { cwd: clientPath });
    await execa("bun", ["add", "-D", "@tanstack/react-query-devtools"], {
      cwd: clientPath,
    });

    // 2. Update client's main.tsx to include QueryClient provider
    const mainTsxPath = path.join(clientPath, "src", "main.tsx");
    await fs.writeFile(mainTsxPath, queryMainTemplate, "utf8");

    // 3. Update App.tsx with TanStack Query template based on template choice
    if (templateChoice) {
      const appTsxPath = path.join(clientPath, "src", "App.tsx");

      let updatedAppContent: string;
      switch (templateChoice) {
        case "shadcn":
          updatedAppContent = shadcnTemplateWithQuery;
          break;
        case "tailwind":
          updatedAppContent = tailwindTemplateWithQuery;
          break;
        default:
          updatedAppContent = defaultTemplateWithQuery;
          break;
      }

      await fs.writeFile(appTsxPath, updatedAppContent, "utf8");
    }

    spinner.succeed("TanStack Query setup completed");
    return true;
  } catch (err: unknown) {
    spinner.fail("Failed to set up TanStack Query");
    if (err instanceof Error) {
      console.error(chalk.red("Error:"), err.message);
    } else {
      console.error(chalk.red("Error: Unknown error"));
    }
    return false;
  }
}

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
  templateChoice: string
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
      "client.ts"
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
  options: ProjectOptions
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
      `Template downloaded successfully (${templateChoice} template)`
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

    let useTanStackQuery = options.query;

    if (!options.yes && !options.query) {
      const queryResponse = await prompts({
        type: "confirm",
        name: "useTanStackQuery",
        message: "Include TanStack Query for data fetching?",
        initial: false,
      });

      if (queryResponse.useTanStackQuery === undefined) {
        console.log(chalk.yellow("Project creation cancelled."));
        return null;
      }

      useTanStackQuery = queryResponse.useTanStackQuery;
    }

    if (useTanStackQuery) {
      await setupTanStackQuery(projectPath, templateChoice);
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
            "Failed to initialize git repository. Is git installed?"
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
                "You can install them manually after navigating to the project directory."
              )
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
            "Failed to install dependencies. You can install them manually later."
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
