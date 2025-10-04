import path from "node:path";
import fs from "fs-extra";
import type { ProjectOptions } from "@/types";
import yoctoSpinner from "yocto-spinner";
import pc from "picocolors";
import { consola } from "consola";
import { addPackageDependency } from "@/utils/add-package-dependency";
import { EXTRAS_DIR } from "@/utils";
import { nameGenerator } from "@/utils/name-generator";

export const reactRouterMpaInstaller = async (
	options: Required<ProjectOptions>,
): Promise<boolean> => {
	const spinner = yoctoSpinner({
		text: "Setting up React Router MPA...",
	}).start();

	try {
		const { projectName, rpc, shadcn, tailwind, tanstackQuery } = options;

		const projectPath = path.resolve(process.cwd(), projectName);

		spinner.text = "Installing React Router MPA dependencies...";
		await addPackageDependency({
			dependencies: [
				"react-router",
				"@react-router/dev",
				"@react-router/node",
				"@react-router/serve",
				"vite-tsconfig-paths",
				"isbot",
			],
			target: "client",
			projectName,
		});

		// Copy root.tsx
		const rootTsxSrc = path.join(
			EXTRAS_DIR,
			"client",
			"src",
			"root.tsx",
			"root.tsx",
		);
		const rootTsxTarget = path.join(projectPath, "client", "src", "root.tsx");
		fs.copySync(rootTsxSrc, rootTsxTarget);

		// Copy routes.ts
		const routesTsSrc = path.join(
			EXTRAS_DIR,
			"client",
			"src",
			"routes.ts",
			"routes.ts",
		);
		const routesTsTarget = path.join(projectPath, "client", "src", "routes.ts");
		fs.copySync(routesTsSrc, routesTsTarget);

		// Create routes directory and copy home.tsx
		const routesDir = path.join(projectPath, "client", "src", "routes");
		fs.ensureDirSync(routesDir);

		const homeTsxSrc = path.join(
			EXTRAS_DIR,
			"client",
			"src",
			"routes",
			"home.tsx",
			"home.tsx",
		);
		const homeTsxTarget = path.join(routesDir, "home.tsx");
		fs.copySync(homeTsxSrc, homeTsxTarget);

		// Copy ClientOnly component
		const clientOnlySrc = path.join(
			EXTRAS_DIR,
			"client",
			"src",
			"components",
			"ClientOnly.tsx",
			"ClientOnly.tsx",
		);
		const clientOnlyTarget = path.join(
			projectPath,
			"client",
			"src",
			"components",
			"ClientOnly.tsx",
		);
		fs.copySync(clientOnlySrc, clientOnlyTarget);

		// Update Home component with ClientOnly wrapper
		const homeTsxTemplate = nameGenerator("Home.tsx", {
			reactroutermpa: true,
			rpc,
			shadcn,
			tailwind,
			tanstackQuery,
		});

		const homeComponentSrc = path.join(
			EXTRAS_DIR,
			"client",
			"src",
			"components",
			"Home.tsx",
			homeTsxTemplate,
		);
		const homeComponentTarget = path.join(
			projectPath,
			"client",
			"src",
			"components",
			"Home.tsx",
		);
		fs.copySync(homeComponentSrc, homeComponentTarget);

		// Copy react-router.config.ts
		const reactRouterConfigSrc = path.join(
			EXTRAS_DIR,
			"client",
			"react-router.config.ts",
			"react-router.config.ts",
		);
		const reactRouterConfigTarget = path.join(
			projectPath,
			"client",
			"react-router.config.ts",
		);
		fs.copySync(reactRouterConfigSrc, reactRouterConfigTarget);

		// Copy tsconfig.app.json
		const tsconfigAppSrc = path.join(
			EXTRAS_DIR,
			"client",
			"tsconfig.app.json",
			"tsconfig.app.json",
		);
		const tsconfigAppTarget = path.join(
			projectPath,
			"client",
			"tsconfig.app.json",
		);
		fs.copySync(tsconfigAppSrc, tsconfigAppTarget);

		// Update vite.config.ts
		const viteConfigTemplate = nameGenerator("vite.config.ts", {
			reactroutermpa: true,
			shadcn,
			tailwind,
		});

		const viteConfigSrc = path.join(
			EXTRAS_DIR,
			"client",
			"vite.config.ts",
			viteConfigTemplate,
		);
		const viteConfigTarget = path.join(projectPath, "client", "vite.config.ts");
		fs.copySync(viteConfigSrc, viteConfigTarget);

		// Update package.json scripts
		const packageJsonPath = path.join(projectPath, "client", "package.json");
		const packageJson = fs.readJsonSync(packageJsonPath);

		packageJson.scripts = {
			...packageJson.scripts,
			dev: "react-router dev",
			build: "react-router typegen && tsc -b && react-router build",
			typecheck: "react-router typegen && tsc",
		};

		fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });

		spinner.success("React Router MPA setup completed");
		return true;
	} catch (err: unknown) {
		spinner.error("Failed to set up React Router MPA");
		if (err instanceof Error) {
			consola.error(pc.red("Error:"), err.message);
		} else {
			consola.error(pc.red("Error: Unknown error"));
		}
		return false;
	}
};
