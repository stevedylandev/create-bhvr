import path from "node:path";
import { execa } from "execa";
import fs from "fs-extra";
import pc from "picocolors";
import yoctoSpinner from "yocto-spinner";

export async function addBiome(projectPath: string): Promise<void> {
	const spinner = yoctoSpinner({ text: "Setting up Biome..." }).start();
	try {
		const clientPath = path.join(projectPath, "client");
		const clientPkgJsonPath = path.join(clientPath, "package.json");
		const eslintConfigPath = path.join(clientPath, "eslint.config.js");

		// Remove ESLint config file
		if (fs.existsSync(eslintConfigPath)) {
			await fs.remove(eslintConfigPath);
		}

		// Read client package.json and remove ESLint dependencies
		const clientPkgJson = await fs.readJson(clientPkgJsonPath);
		const devDependencies = clientPkgJson.devDependencies || {};
		const eslintDeps = Object.keys(devDependencies).filter(
			(dep) => dep.includes("eslint") || dep.includes("@eslint"),
		);

		if (eslintDeps.length > 0) {
			spinner.text = "Replacing ESLint dependencies...";
			await execa("bun", ["remove", ...eslintDeps], { cwd: clientPath });
		}

		// Install Biome in the root of the project
		spinner.text = "Installing Biome...";
		await execa("bun", ["add", "-D", "@biomejs/biome"], { cwd: projectPath });

		// Create biome.json in the root of the project
		spinner.text = "Creating biome.json...";
		const templateBiomeConfigPath = path.join(__dirname, "biome.json");
		const biomeConfig = await fs.readJson(templateBiomeConfigPath);

		const biomeConfigPath = path.join(projectPath, "biome.json");
		await fs.writeJson(biomeConfigPath, biomeConfig, { spaces: 2 });

		// Update client package.json scripts to remove lint
		spinner.text = "Updating scripts in client/package.json...";
		const newClientPkgJson = await fs.readJson(clientPkgJsonPath);
		if (newClientPkgJson.scripts || newClientPkgJson.scripts.lint) {
			delete newClientPkgJson.scripts.lint;
		}
		await fs.writeJson(clientPkgJsonPath, newClientPkgJson, { spaces: 2 });

		// Update root package.json with biome scripts
		spinner.text = "Updating scripts in root/package.json...";
		const rootPkgJsonPath = path.join(projectPath, "package.json");
		if (fs.existsSync(rootPkgJsonPath)) {
			const rootPkgJson = await fs.readJson(rootPkgJsonPath);
			rootPkgJson.scripts = rootPkgJson.scripts || {};
			rootPkgJson.scripts.format = "biome format . --write";
			rootPkgJson.scripts.lint = "biome lint .";
			await fs.writeJson(rootPkgJsonPath, rootPkgJson, { spaces: 2 });
		}

		spinner.success("Biome setup complete.");
	} catch (error) {
		spinner.error("Biome setup failed.");
		if (error instanceof Error) {
			console.error(pc.red("\nError:"), error.message);
		} else {
			console.error(pc.red("\nError: Unknown error during Biome setup."));
		}
	}
}
