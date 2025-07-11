import path from "node:path";
import { consola } from "consola";
import degit from "degit";
import { execa } from "execa";
import fs from "fs-extra";
import ora from "ora";
import pc from "picocolors";
import type { ProjectOptions, ProjectResult } from "@/types";
import { DEFAULT_REPO } from "@/utils/constants";
import { TEMPLATES } from "@/utils/templates";
import { patchFilesForRPC } from "./patch-files-rpc";
import { setupBiome } from "./setup-biome";
import { tryCatch } from "@/utils/try-catch";

export async function createProject(
  projectDirectory: string,
  options: ProjectOptions,
): Promise<ProjectResult | null> {
  let projectName = projectDirectory;

  if (!projectName && !options.yes) {
    const { data, error } = await tryCatch(
      consola.prompt(pc.yellow("What is the name of your project?"), {
        type: "text",
        default: "my-bhvr-app",
        placeholder: "my-bhvr-app",
        cancel: "reject",
      }),
    );

    if (!data || error) {
      consola.error(pc.red("Project creation cancelled."));
      return null;
    }

    projectName = data;
  }

  let templateChoice = options.template || "default";

  if (!options.yes && !options.branch) {
    const templateChoices = Object.keys(TEMPLATES).map((key) => ({
      label: `${key} (${TEMPLATES[key]?.description})`,
      value: key,
    }));

    const { data, error } = await tryCatch(
      consola.prompt(pc.yellow("Select a template:"), {
        type: "select",
        options: templateChoices,
        initial: "default",
        cancel: "reject",
      }),
    );

    if (!data || error) {
      consola.error("Project creation cancelled.");
      return null;
    }

    templateChoice = data;
  }

  const projectPath = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    const files = fs.readdirSync(projectPath);

    if (files.length > 0 && !options.yes) {
      const { data: overwrite, error } = await tryCatch(
        consola.prompt(
          `The directory ${projectName} already exists and is not empty. Do you want to overwrite it?`,
          {
            type: "confirm",
            initial: false,
          },
        ),
      );

      if (!overwrite || error) {
        consola.error("Project creation cancelled.");
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
      console.log(pc.blue("Removed .git directory"));
    }

    let useRpc = options.rpc;

    if (!options.yes && !options.rpc) {
      const { data: rpcResponse, error } = await tryCatch(
        consola.prompt("Use Hono RPC client for type-safe API communication?", {
          type: "confirm",
          initial: false,
        }),
      );

      if (!rpcResponse || error) {
        consola.error("Project creation cancelled.");
        return null;
      }

      useRpc = rpcResponse;
    }

    if (useRpc) {
      await patchFilesForRPC(projectPath, templateChoice);
    }

    let linter = options.linter;

    if (!options.yes && !options.linter) {
      const { data: linterResponse, error } = await tryCatch(
        consola.prompt("Select a linter:", {
          type: "select",
          options: [
            { label: "ESLint (default)", value: "eslint" },
            { label: "Biome", value: "biome" },
          ],
          initial: "eslint",
          cancel: "reject",
        }),
      );

      if (!linterResponse || error) {
        console.log(pc.yellow("Project creation cancelled."));
        return null;
      }

      linter = linterResponse as "eslint" | "biome";
    }

    if (linter === "biome") {
      await setupBiome(projectPath);
    }

    let gitInitialized = false;

    if (!options.yes) {
      const { data: gitResponse, error } = await tryCatch(
        consola.prompt("Initialize a git repository?", {
          type: "confirm",

          initial: true,
          cancel: "reject",
        }),
      );

      if (error) {
        console.log(pc.yellow("Project creation cancelled."));
        return null;
      }

      if (gitResponse) {
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
            consola.error(pc.red("Git error:"), err.message);
          } else {
            consola.error(pc.red("Git error: Unknown error"));
          }
        }
      }
    } else {
      try {
        spinner.start("Initializing git repository...");
        await execa("git", ["init"], { cwd: projectPath });
        spinner.succeed("Git repository initialized");
        gitInitialized = true;
      } catch (_err) {
        spinner.fail("Failed to initialize git repository. Is git installed?");
      }
    }

    let dependenciesInstalled = false;

    if (!options.yes) {
      const { data: depsResponse, error } = await tryCatch(
        consola.prompt("Install dependencies?", {
          type: "confirm",
          initial: true,
          cancel: "reject",
        }),
      );

      if (error) {
        console.log(pc.yellow("Project creation cancelled."));
        return null;
      }

      if (depsResponse) {
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
              pc.yellow(
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
