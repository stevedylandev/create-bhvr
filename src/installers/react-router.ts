import path from "node:path";
import fs from "fs-extra";
import type { ProjectOptions } from "@/types";
import yoctoSpinner from "yocto-spinner";
import pc from "picocolors";
import { consola } from "consola";
import { addPackageDependency } from "@/utils/add-package-dependency";
import { EXTRAS_DIR } from "@/utils";
import { nameGenerator } from "@/utils/name-generator";

export const reactRouterInstaller = async (
	options: Required<ProjectOptions>,
): Promise<boolean> => {
	const spinner = yoctoSpinner({
		text: "Setting up React Router...",
	}).start();

	try {
		const { projectName, rpc, shadcn, tailwind, tanstackQuery } = options;

		const projectPath = path.resolve(process.cwd(), projectName);
		spinner.text = "Installing React Router...";
		await addPackageDependency({
			dependencies: ["react-router"],
			target: "client",
			projectName,
		});

		const appTsxTemplate = nameGenerator("App.tsx", {
			reactRouter: true,
		});

		const appTsxSrc = path.join(
			EXTRAS_DIR,
			"client",
			"src",
			"App.tsx",
			appTsxTemplate,
		);
		const appTsxTarget = path.join(projectPath, "client", "src", "App.tsx");
		fs.copySync(appTsxSrc, appTsxTarget);

		const homeTsxTemplate = nameGenerator("Home.tsx", {
			rpc,
			shadcn,
			tailwind,
			tanstackQuery,
		});

		const homeTsxSrc = path.join(
			EXTRAS_DIR,
			"client",
			"src",
			"components",
			"Home.tsx",
			homeTsxTemplate,
		);
		const homeTsxTarget = path.join(
			projectPath,
			"client",
			"src",
			"components",
			"Home.tsx",
		);
		fs.copySync(homeTsxSrc, homeTsxTarget);

		spinner.success("React Router setup completed");
		return true;
	} catch (err: unknown) {
		spinner.error("Failed to set up React Router");
		if (err instanceof Error) {
			consola.error(pc.red("Error:"), err.message);
		} else {
			consola.error(pc.red("Error: Unknown error"));
		}
		return false;
	}
};
