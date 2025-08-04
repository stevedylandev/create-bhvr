import path from "node:path";
import { execa } from "execa";

export const addPackageDependency = async (opts: {
	dependencies: string[];
	devMode?: boolean;
	projectName: string;
	target?: "client" | "server";
}) => {
	const { dependencies, devMode, projectName, target } = opts;

	const projectPath = path.resolve(process.cwd(), projectName);

	if (target !== undefined) {
		if (target === "client") {
			const clientPath = path.join(projectPath, "client");
			await execa("bun", [`install${devMode ? " -D" : ""}`, ...dependencies], {
				cwd: clientPath,
			});
			return;
		}

		if (target === "server") {
			const serverPath = path.join(projectPath, "server");
			await execa(
				"bun",
				[
					`install${devMode ? " -D" : ""}`,
					devMode ? "-D" : "",
					...dependencies,
				],
				{
					cwd: serverPath,
				},
			);
			return;
		}
	}

	await execa("bun", ["install", ...dependencies], {
		cwd: projectPath,
	});
};
