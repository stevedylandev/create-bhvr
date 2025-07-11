import { consola } from "consola";
import { execa } from "execa";
import pc from "picocolors";
import yoctoSpinner from "yocto-spinner";
import { tryCatch } from "@/utils/try-catch";

async function getPackageManager(): Promise<"bun"> {
  const { error } = await tryCatch(execa("bun", ["--version"]));

  if (error) {
    consola.error(new Error("Bun is not installed."));
    consola.warn("Please install bun from https://bun.sh/");
    process.exit(1);
  }

  return "bun";
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

  const spinner = yoctoSpinner({
    text: `Installing dependencies with ${packageManager}...`,
  }).start();

  try {
    await execa(packageManager, ["install"], { cwd: projectPath });
    spinner.success(`Dependencies installed with ${packageManager}`);
    return true;
  } catch (_err) {
    spinner.error("Failed to install dependencies.");
    console.log(
      pc.yellow(
        "You can install them manually after navigating to the project directory.",
      ),
    );
    return false;
  }
}
