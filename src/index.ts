#!/usr/bin/env node

// @ts-ignore: Shebang line

import { create } from "@/commands/create";
import { program } from "@/program";
import { DEFAULT_REPO } from "./utils";

program
	.name("create-bhvr")
	.description("Create a bhvr monorepo starter project")
	.argument("[project-directory]", "directory to create the project in")
	.option("-y, --yes", "skip confirmation prompts")
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
	.option(
		"--tsquery",
		"use TanStack Query for data fetching and state management",
	)
	.option(
		"--router <router>",
		"specify a client router (none, reactrouter, tanstackrouter)",
	)
	.option("--linter <linter>", "specify the linter to use (eslint or biome)")
	.action(create);

program.parse();
