#!/usr/bin/env node

// @ts-ignore: Shebang line

import { create } from "@/commands/create";
import { loadExtensions } from "@/extensions";
import { program } from "@/program";
import { DEFAULT_REPO } from "./utils";

program
	.name("create-bhvr")
	.description("Create a bhvr monorepo starter project")
	.argument("[project-directory]", "directory to create the project in")
	.option("-y, --yes", "skip confirmation prompts")
	.option("--ts, --typescript", "use TypeScript (default)")
	.option(
		"--repo <repo>",
		"specify a custom GitHub repository as source",
		DEFAULT_REPO,
	)
	.option(
		"--template <template>",
		"specify a template (default, tailwind, shadcn)",
		"default",
	)
	.option("--branch <branch>", "specify a branch to use from the repository")
	.option("--rpc", "use Hono RPC client for type-safe API communication")
	.option("--linter <linter>", "specify the linter to use (eslint or biome)")
	.action(async (projectDirectory, options) => {
		const extensions = await loadExtensions();
		create(projectDirectory, options, extensions);
	});

program.parse();
