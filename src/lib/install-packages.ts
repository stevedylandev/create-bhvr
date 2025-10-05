import type { ProjectOptions } from "@/types";
import { setupBiome } from "./setup-biome";
import path from "node:path";
import { tanstackQueryInstaller } from "@/installers/tanstack-query";
import { rpcInstaller } from "@/installers/rpc";
import { reactRouterInstaller } from "@/installers/react-router";
import { reactRouterMpaInstaller } from "@/installers/react-router-mpa";
import { tanstackRouterInstaller } from "@/installers/tanstack-router";

export async function installPackages(
	options: Required<ProjectOptions>,
): Promise<boolean> {
	const { projectName, rpc, router, linter, tanstackQuery } = options;

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

	if (router !== "none") {
		switch (router) {
			case "reactrouter": {
				await reactRouterInstaller(options);
				break;
			}
			case "reactroutermpa": {
				await reactRouterMpaInstaller(options);
				break;
			}
			case "tanstackrouter": {
				await tanstackRouterInstaller(options);
				break;
			}
		}
	}

	return false;
}
