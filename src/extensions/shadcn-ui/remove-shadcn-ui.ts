import path from "node:path";
import { execa } from "execa";
import fs from "fs-extra";
import pc from "picocolors";
import yoctoSpinner from "yocto-spinner";

export async function removeShadcnUi(projectPath: string): Promise<void> {
	const spinner = yoctoSpinner({
		text: "Removing shadcn/ui...",
	}).start();
	try {
		const clientPath = path.join(projectPath, "client");

		// Uninstall dependencies
		spinner.text = "Uninstalling dependencies...";
		await execa(
			"bun",
			[
				"remove",
				"tailwindcss-animate",
				"class-variance-authority",
				"clsx",
				"tailwind-merge",
				"lucide-react",
			],
			{
				cwd: clientPath,
			},
		);

		// Remove tailwind.config.ts
		spinner.text = "Removing tailwind.config.ts...";
		const tailwindConfigPath = path.join(clientPath, "tailwind.config.ts");
		await fs.remove(tailwindConfigPath);

		// Remove postcss.config.js
		spinner.text = "Removing postcss.config.js...";
		const postcssConfigPath = path.join(clientPath, "postcss.config.js");
		await fs.remove(postcssConfigPath);

		// Remove components.json
		spinner.text = "Removing components.json...";
		const componentsJsonPath = path.join(clientPath, "components.json");
		await fs.remove(componentsJsonPath);

		// Remove lib/utils.ts
		spinner.text = "Removing lib/utils.ts...";
		const utilsPath = path.join(clientPath, "src", "lib");
		await fs.remove(utilsPath);

		// Update tsconfig.json
		spinner.text = "Updating tsconfig.json...";
		const tsconfigPath = path.join(clientPath, "tsconfig.json");
		const tsconfig = await fs.readJson(tsconfigPath);
		delete tsconfig.compilerOptions.baseUrl;
		delete tsconfig.compilerOptions.paths;
		await fs.writeJson(tsconfigPath, tsconfig, { spaces: 2 });

		// Update vite.config.ts
		spinner.text = "Updating vite.config.ts...";
		const viteConfigPath = path.join(clientPath, "vite.config.ts");
		const viteConfig = await fs.readFile(viteConfigPath, "utf-8");
		const newViteConfig = viteConfig.replace(
			`import path from "path"\nimport react from "@vitejs/plugin-react"`,
			`import react from "@vitejs/plugin-react"`,
		).replace(
			`plugins: [react(), tailwindcss()],\n  resolve: {\n    alias: {\n      "@": path.resolve(__dirname, "./src"),\n    },\n  },`,
			"plugins: [react(), tailwindcss()]",
		);
		await fs.writeFile(viteConfigPath, newViteConfig);

		// Update index.css
		spinner.text = "Updating index.css...";
		const globalsCssPath = path.join(clientPath, "src", "index.css");
		const globalsCss = `@import "tailwindcss";`;
		await fs.writeFile(globalsCssPath, globalsCss);

		spinner.success("shadcn/ui removal complete.");
	} catch (error) {
		spinner.error("shadcn/ui removal failed.");
		if (error instanceof Error) {
			console.error(pc.red("\nError:"), error.message);
		} else {
			console.error(pc.red("\nError: Unknown error during shadcn/ui removal."));
		}
	}
}