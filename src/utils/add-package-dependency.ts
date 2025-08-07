import path from "node:path";
import { execa } from "execa";

export interface AddPackageDependencyOptions {
	dependencies: string[];
	devMode?: boolean;
	projectName: string;
	target?: "client" | "server";
}

export const addPackageDependency = async (
	opts: AddPackageDependencyOptions,
) => {
	const { dependencies, devMode = false, projectName, target } = opts;

	// Early validation - only validate project name, allow empty dependencies
	if (!projectName.trim()) {
		throw new Error("Project name is required");
	}

	// Construct base command args once
	const baseArgs = ["install"];
	if (devMode) {
		baseArgs.push("-D");
	}
	const installArgs = [...baseArgs, ...dependencies];

	// Determine working directory
	const projectPath = path.resolve(process.cwd(), projectName);
	let workingDir = projectPath;

	if (target) {
		workingDir = path.join(projectPath, target);
	}

	try {
		await execa("bun", installArgs, {
			cwd: workingDir,
		});
	} catch (error) {
		const targetSuffix = target ? ` in ${target}` : "";
		throw new Error(
			`Failed to install dependencies${targetSuffix}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
};
