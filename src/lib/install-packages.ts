import type { ProjectOptions } from "@/types";
import { setupBiome } from "./setup-biome";
import path from "node:path";
import { tanstackQueryInstaller } from "@/installers/tanstack-query";
import { rpcInstaller } from "@/installers/rpc";

export async function installPackages(
	options: Required<ProjectOptions>,
): Promise<boolean> {
	const { projectName, template, repo, branch, rpc, linter, tanstackQuery } =
		options;

	const projectPath = path.resolve(process.cwd(), projectName);

	if (rpc) {
		await rpcInstaller(options);
	}

	if (linter === "biome") {
		await setupBiome(projectPath);
	}

	if (tanstackQuery) {
		await tanstackQueryInstaller(options);
	}

	return false;
}
