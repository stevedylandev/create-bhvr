import type { Extension, ProjectOptions, ProjectResult } from "@/types";
import { initializeGit } from "./initialize-git";
import { installDependencies } from "./install-dependencies";
import { promptForOptions } from "./prompt-for-options";
import { scaffoldTemplate } from "./scaffold-template";

export async function createProject(
	projectDirectory: string,
	options: ProjectOptions,
	extensions: Extension[],
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

	for (const extension of extensions) {
		if (
			(extension.tag === "styling" && projectOptions.style === extension.id) ||
			(extension.tag === "linter" && projectOptions.linter === extension.id) ||
			(extension.tag === "extra" &&
				// biome-ignore lint/suspicious/noExplicitAny: Needed to make extensions scale without typing all extension IDs.
				projectOptions.extras?.includes(extension.id as any))
		) {
			await extension.add(projectOptions.projectName ?? projectDirectory);
		}
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
