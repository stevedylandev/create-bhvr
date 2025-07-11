import { consola } from "consola";
import { execa } from "execa";
import ora from "ora";
import pc from "picocolors";
import { tryCatch } from "@/utils/try-catch";

export async function initializeGit(
  projectPath: string,
  skipConfirmation?: boolean,
): Promise<boolean> {
  if (!skipConfirmation) {
    const { data: gitResponse, error } = await tryCatch(
      consola.prompt("Initialize a git repository?", {
        type: "confirm",
        initial: true,
        cancel: "reject",
      }),
    );

    if (error) {
      console.log(pc.yellow("Project creation cancelled."));
      return false;
    }

    if (!gitResponse) {
      return false;
    }
  }

  const spinner = ora("Initializing git repository...").start();
  try {
    await execa("git", ["init"], { cwd: projectPath });
    spinner.succeed("Git repository initialized");
    return true;
  } catch (err: unknown) {
    spinner.fail("Failed to initialize git repository. Is git installed?");
    if (err instanceof Error) {
      consola.error(pc.red("Git error:"), err.message);
    } else {
      consola.error(pc.red("Git error: Unknown error"));
    }
    return false;
  }
}
