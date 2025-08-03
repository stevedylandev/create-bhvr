import path from "path";
import fs from "fs-extra";
import type { ProjectOptions } from "@/types";
import yoctoSpinner from "yocto-spinner";
import pc from "picocolors";
import { consola } from "consola";
import { addPackageDependency } from "@/utils/add-package-dependency";
import { EXTRAS_DIR } from "@/utils";

export const tanstackQueryInstaller = async (
	options: Required<ProjectOptions>,
): Promise<boolean> => {
	const spinner = yoctoSpinner({
		text: "Setting up TanStack Query...",
	}).start();

	try {
		const { projectName, rpc, shadcn, tailwind, tanstackQuery } = options;

		const projectPath = path.resolve(process.cwd(), projectName);
		spinner.text = "Installing TanStack Query...";
		await addPackageDependency({
			dependencies: ["@tanstack/react-query"],
			target: "client",
			projectName,
		});

		const selectedTemplate = `App-with${tailwind ? "-tailwind" : ""}${shadcn ? "-shadcn" : ""}${rpc ? "-rpc" : ""}${tanstackQuery ? "-tanstackquery" : ""}.tsx`;

		const appTsxSrc = path.join(
			EXTRAS_DIR,
			"client",
			"src",
			"App.tsx",
			selectedTemplate,
		);
		const appTsxTarget = path.join(projectPath, "client", "src", "App.tsx");
		fs.copySync(appTsxSrc, appTsxTarget);

		const mainTsxSrc = path.join(
			EXTRAS_DIR,
			"client",
			"src",
			"main.tsx",
			"main-with-tanstackquery.tsx",
		);
		const mainTsxTarget = path.join(projectPath, "client", "src", "main.tsx");
		fs.copySync(mainTsxSrc, mainTsxTarget);

		spinner.success("TanStack Query setup completed");
		return true;
	} catch (err: unknown) {
		spinner.error("Failed to set up TanStack Query");
		if (err instanceof Error) {
			consola.error(pc.red("Error:"), err.message);
		} else {
			consola.error(pc.red("Error: Unknown error"));
		}
		return false;
	}
};
