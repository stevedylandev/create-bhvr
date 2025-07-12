
import path from "node:path";
import { execa } from "execa";
import fs from "fs-extra";
import pc from "picocolors";
import yoctoSpinner from "yocto-spinner";

export async function removeBiome(projectPath: string): Promise<void> {
	const spinner = yoctoSpinner({ text: "Removing Biome..." }).start();
	try {
		// Remove biome.json from the root of the project
		spinner.text = "Removing biome.json...";
		const biomeConfigPath = path.join(projectPath, "biome.json");
		if (fs.existsSync(biomeConfigPath)) {
			await fs.remove(biomeConfigPath);
		}

		// Uninstall Biome from the root of the project
		spinner.text = "Uninstalling Biome...";
		await execa("bun", ["remove", "@biomejs/biome"], { cwd: projectPath });

		// Update root package.json to remove biome scripts
		spinner.text = "Updating scripts in root/package.json...";
		const rootPkgJsonPath = path.join(projectPath, "package.json");
		if (fs.existsSync(rootPkgJsonPath)) {
			const rootPkgJson = await fs.readJson(rootPkgJsonPath);
			if (rootPkgJson.scripts) {
				delete rootPkgJson.scripts.format;
				delete rootPkgJson.scripts.lint;
			}
			await fs.writeJson(rootPkgJsonPath, rootPkgJson, { spaces: 2 });
		}

		spinner.success("Biome removal complete.");
	} catch (error) {
		spinner.error("Biome removal failed.");
		if (error instanceof Error) {
			console.error(pc.red("\nError:"), error.message);
		} else {
			console.error(pc.red("\nError: Unknown error during Biome removal."));
		}
	}
}
