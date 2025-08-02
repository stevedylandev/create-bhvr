import path from "node:path";
import { consola } from "consola";
import { execa } from "execa";
import fs from "fs-extra";
import pc from "picocolors";
import yoctoSpinner from "yocto-spinner";
import {
	defaultTemplate,
	honoClientTemplate,
	honoRpcTemplate,
	shadcnTemplate,
	tailwindTemplate,
} from "@/utils/templates";

export async function patchFilesForRPC(
	projectPath: string,
	templateChoice: string,
): Promise<boolean> {
	const spinner = yoctoSpinner({ text: "Setting up RPC client..." }).start();

	try {
		// 1. Update client package.json to ensure hono client is installed
		const clientPkgPath = path.join(projectPath, "client", "package.json");
		const clientPkg = await fs.readJson(clientPkgPath);

		if (!clientPkg.dependencies.hono) {
			await execa("bun", ["install", "hono"], { cwd: projectPath });
		}

		await fs.writeJson(clientPkgPath, clientPkg, { spaces: 2 });

		// 2. Update server package.json dev script for RPC
		const serverPkgPath = path.join(projectPath, "server", "package.json");
		const serverPkg = await fs.readJson(serverPkgPath);

		// Update the dev script to include TypeScript compilation
		serverPkg.scripts.dev = "bun --watch run src/index.ts && tsc --watch";

		await fs.writeJson(serverPkgPath, serverPkg, { spaces: 2 });

		// 3. Server modification for RPC export type (no client imports)
		const serverIndexPath = path.join(projectPath, "server", "src", "index.ts");
		await fs.writeFile(serverIndexPath, honoRpcTemplate, "utf8");

		// 4. Create separate client helper file
		const clientHelperPath = path.join(
			projectPath,
			"server",
			"src",
			"client.ts",
		);
		await fs.writeFile(clientHelperPath, honoClientTemplate, "utf8");

		// 5. Update App.tsx based on template selection using switch statement
		const appTsxPath = path.join(projectPath, "client", "src", "App.tsx");

		// Determine template content based on the template type
		let updatedAppContent: string;

		// Select template based on choice
		switch (templateChoice) {
			case "shadcn":
				updatedAppContent = shadcnTemplate;
				break;
			case "tailwind":
				updatedAppContent = tailwindTemplate;
				break;
			default:
				updatedAppContent = defaultTemplate;
				break;
		}

		await fs.writeFile(appTsxPath, updatedAppContent, "utf8");
		spinner.success("RPC client setup completed");
		return true;
	} catch (err: unknown) {
		spinner.error("Failed to set up RPC client");
		if (err instanceof Error) {
			consola.error(pc.red("Error:"), err.message);
		} else {
			consola.error(pc.red("Error: Unknown error"));
		}
		return false;
	}
}
