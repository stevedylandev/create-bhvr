import { shadcnUiExtension } from "@/extensions/shadcn-ui";
import { tailwindcssExtension } from "@/extensions/tailwindcss";
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

	if (projectOptions.style === "tailwindcss") {
		await tailwindcssExtension.add(
			projectOptions.projectName ?? projectDirectory,
		);
	}

	if (projectOptions.extras?.includes("shadcn-ui")) {
		await shadcnUiExtension.add(projectOptions.projectName ?? projectDirectory);
	}

	const gitInitialized = await initializeGit(
		projectOptions.projectName ?? projectDirectory,
		projectOptions.yes,
	);

	const dependenciesInstalled = await installDependencies(
		projectOptions.projectName ?? projectDirectory,
		projectOptions.yes,
	);

	return {
		projectName: projectOptions.projectName ?? projectDirectory,
		gitInitialized,
		dependenciesInstalled,
	};
}
