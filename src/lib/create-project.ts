import type { ProjectOptions, ProjectResult } from "@/types";
import { initializeGit } from "./initialize-git";
import { installDependencies } from "./install-dependencies";
import { promptForOptions } from "./prompt-for-options";
import { scaffoldTemplate } from "./scaffold-template";

export async function createProject(
  projectDirectory: string,
  options: ProjectOptions,
): Promise<ProjectResult | null> {
  const projectOptions = await promptForOptions({
    ...options,
    projectName: projectDirectory,
  });

  if (!projectOptions) {
    return null;
  }

  const scaffolded = await scaffoldTemplate(projectOptions);

  if (!scaffolded) {
    return null;
  }

  const gitInitialized = await initializeGit(
    projectOptions.projectName,
    projectOptions.yes,
  );
  const dependenciesInstalled = await installDependencies(
    projectOptions.projectName,
    projectOptions.yes,
  );

  return {
    projectName: projectOptions.projectName,
    gitInitialized,
    dependenciesInstalled,
    template: projectOptions.template,
  };
}
