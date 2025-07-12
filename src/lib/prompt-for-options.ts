import { consola } from "consola";
import pc from "picocolors";
import type { ProjectOptions } from "@/types";
import { DEFAULT_REPO } from "@/utils/constants";
import { tryCatch } from "@/utils/try-catch";

export async function promptForOptions(
	options: ProjectOptions,
): Promise<Required<ProjectOptions>> {
	let projectName = options.projectName;

	if (!projectName && !options.yes) {
		const { data, error } = await tryCatch(
			consola.prompt(pc.yellow("What is the name of your project?"), {
				type: "text",
				default: "my-bhvr-app",
				placeholder: "my-bhvr-app",
				cancel: "reject",
			}),
		);

		if (!data || error) {
			consola.error(pc.red("Project creation cancelled."));
			process.exit(1);
		}

		projectName = data;
	}

	if (!projectName) {
		consola.error(pc.red("Project creation cancelled."));
		process.exit(1);
	}

	let useRpc = options.rpc;

	if (!options.yes && !options.rpc) {
		const { data: rpcResponse, error } = await tryCatch(
			consola.prompt("Use Hono RPC client for type-safe API communication?", {
				type: "confirm",
				initial: false,
			}),
		);

		if (error) {
			consola.error("Project creation cancelled.");
			process.exit(1);
		}

		useRpc = rpcResponse;
	}

	if (!useRpc) {
		consola.error("Project creation cancelled.");
		process.exit(1);
	}

	let linter = options.linter;

	if (!options.yes && !options.linter) {
		const { data: linterResponse, error } = await tryCatch(
			consola.prompt("Select a linter:", {
				type: "select",
				options: [
					{ label: "ESLint (default)", value: "eslint" },
					{ label: "Biome", value: "biome" },
				],
				initial: "eslint",
				cancel: "reject",
			}),
		);

		if (error) {
			console.log(pc.yellow("Project creation cancelled."));
			process.exit(1);
		}

		linter = linterResponse as "eslint" | "biome";
	}

	if (!linter) {
		consola.error("Project creation cancelled.");
		process.exit(1);
	}

	return {
		repo: options.repo || DEFAULT_REPO,
		branch: options.branch || "main",
		typescript: options.typescript || false,
		yes: options.yes || false,
		projectName,
		rpc: useRpc,
		linter,
	};
}
