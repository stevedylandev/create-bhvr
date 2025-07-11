import { consola } from "consola";
import { execa } from "execa";
import ora from "ora";
import pc from "picocolors";
import { tryCatch } from "@/utils/try-catch";

async function getPackageManager(): Promise<"bun" | "pnpm" | "npm"> {
  try {
    await execa("bun", ["--version"]);
    return "bun";
  } catch (e) {
    // bun is not installed
  }

  try {
    await execa("pnpm", ["--version"]);
    return "pnpm";
  } catch (e) {
    // pnpm is not installed
  }

  return "npm";
}

export async function installDependencies(
  projectPath: string,
  skipConfirmation?: boolean,
): Promise<boolean> {
  if (!skipConfirmation) {
    const { data: depsResponse, error } = await tryCatch(
      consola.prompt("Install dependencies?", {
        type: "confirm",
        initial: true,
        cancel: "reject",
      }),
    );

    if (error) {
      console.log(pc.yellow("Project creation cancelled."));
      return false;
    }

    if (!depsResponse) {
      return false;
    }
  }

  const packageManager = await getPackageManager();
  const spinner = ora(
    `Installing dependencies with ${packageManager}...`,
  ).start();

  try {
    await execa(packageManager, ["install"], { cwd: projectPath });
    spinner.succeed(`Dependencies installed with ${packageManager}`);
    return true;
  } catch (err) {
    spinner.fail("Failed to install dependencies.");
    console.log(
      pc.yellow(
        "You can install them manually after navigating to the project directory.",
      ),
    );
    return false;
  }
}
