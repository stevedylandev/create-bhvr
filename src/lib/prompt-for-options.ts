import { consola } from "consola";
import pc from "picocolors";
import type { ProjectOptions } from "@/types";
import { TEMPLATES } from "@/utils/templates";
import { tryCatch } from "@/utils/try-catch";

export async function promptForOptions(
	options: ProjectOptions,
): Promise<ProjectOptions> {
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

	let templateChoice = options.template || "default";

	if (!options.yes && !options.branch) {
		const templateChoices = Object.keys(TEMPLATES).map((key) => ({
			label: `${key} (${TEMPLATES[key]?.description})`,
			value: key,
		}));

		const { data, error } = await tryCatch(
			consola.prompt(pc.yellow("Select a template:"), {
				type: "select",
				options: templateChoices,
				initial: "default",
				cancel: "reject",
			}),
		);

		if (!data || error) {
			consola.error("Project creation cancelled.");
			process.exit(1);
		}

		templateChoice = data;
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

	let router = options.router;

	if (!options.yes && !options.router) {
		const { data: routerResponse, error } = await tryCatch(
			consola.prompt("Select a client router:", {
				type: "select",
				options: [
					{ label: "None (default)", value: "none" },
					{ label: "React Router", value: "reactrouter" },
					{ label: "React Router MPA", value: "reactroutermpa" },
					{ label: "TanStack Router", value: "tanstackrouter" },
				],
				initial: "none",
				cancel: "reject",
			}),
		);

		if (error) {
			console.log(pc.yellow("Project creation cancelled."));
			process.exit(1);
		}

		router = routerResponse as
			| "none"
			| "reactrouter"
			| "reactroutermpa"
			| "tanstackrouter";
	}

	let useTanstackQuery = options.tanstackQuery;

	if (!options.yes && !options.tanstackQuery) {
		const { data: tanstackQueryResponse, error } = await tryCatch(
			consola.prompt(
				"Would you like to enable TanStack Query for data fetching and state management?",
				{
					type: "confirm",
					initial: false,
				},
			),
		);

		if (error) {
			consola.error("Project creation cancelled.");
			process.exit(1);
		}

		useTanstackQuery = tanstackQueryResponse;
	}

	let noBuild = options.noBuild;

	if (!options.yes && options.noBuild === undefined) {
		const { data: noBuildResponse, error } = await tryCatch(
			consola.prompt(
				"Skip TypeScript compilation? (Use Bun/Vite to run TS directly - simpler but not packageable)",
				{
					type: "confirm",
					initial: true,
				},
			),
		);

		if (error) {
			consola.error("Project creation cancelled.");
			process.exit(1);
		}

		noBuild = noBuildResponse;
	}

	return {
		...options,
		projectName,
		template: templateChoice,
		tailwind: templateChoice === "tailwind" || templateChoice === "shadcn",
		shadcn: templateChoice === "shadcn",
		rpc: useRpc,
		linter,
		router,
		tanstackQuery: useTanstackQuery,
		noBuild: options.yes ? (options.noBuild ?? true) : noBuild,
	};
}
