import { Command } from "commander";

export const program = new Command()
	.option("-y, --yes", "Skip all prompts and use default values")
	.option("--ts, --typescript", "Use typescript")
	.option("--rpc", "Use Hono RPC")
	.option("--linter <linter>", "Linter to use (eslint or biome)")
	.option("--style <style>", "Styling solution to use (tailwindcss)")
	.option("--extras <extras...>", "Extras to include (shadcn-ui)");
