import path from "node:path";
import { execa } from "execa";
import fs from "fs-extra";
import pc from "picocolors";
import yoctoSpinner from "yocto-spinner";

export async function removeTailwindcss(projectPath: string): Promise<void> {
	const spinner = yoctoSpinner({ text: "Removing TailwindCSS v4..." }).start();
	try {
		const clientPath = path.join(projectPath, "client");

		// Uninstall TailwindCSS dependencies
		spinner.text = "Uninstalling TailwindCSS dependencies...";
		await execa("bun", ["remove", "tailwindcss", "@tailwindcss/vite"], {
			cwd: clientPath,
		});

		// Update vite.config.ts
		spinner.text = "Updating vite.config.ts...";
		const viteConfigPath = path.join(clientPath, "vite.config.ts");
		const viteConfig = await fs.readFile(viteConfigPath, "utf-8");
		const newViteConfig = viteConfig
			.replace(
				`import { defineConfig } from "vite";\nimport tailwindcss from "@tailwindcss/vite";`,
				`import { defineConfig } from "vite"`
			)
			.replace("plugins: [tailwindcss(),", "plugins: [");
		await fs.writeFile(viteConfigPath, newViteConfig);

		// Remove globals.css
		spinner.text = "Removing globals.css...";
		const globalsCssPath = path.join(clientPath, "src", "globals.css");
		await fs.remove(globalsCssPath);

		// Update main.tsx to remove globals.css import
		spinner.text = "Updating main.tsx...";
		const mainTsxPath = path.join(clientPath, "src", "main.tsx");
		const mainTsx = await fs.readFile(mainTsxPath, "utf-8");
		await fs.writeFile(
			mainTsxPath,
			mainTsx.replace(`import "./globals.css";\n`, ""),
		);

		spinner.success("TailwindCSS v4 removal complete.");
	} catch (error) {
		spinner.error("TailwindCSS v4 removal failed.");
		if (error instanceof Error) {
			console.error(pc.red("\nError:"), error.message);
		} else {
			console.error(
				pc.red("\nError: Unknown error during TailwindCSS v4 removal."),
			);
		}
	}
}