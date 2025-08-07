import path from "node:path";
import fs from "fs-extra";
import type { ProjectOptions } from "@/types";
import yoctoSpinner from "yocto-spinner";
import pc from "picocolors";
import { consola } from "consola";
import { addPackageDependency } from "@/utils/add-package-dependency";
import { EXTRAS_DIR } from "@/utils";
import { nameGenerator } from "@/utils/name-generator";

export const tanstackRouterInstaller = async (
	options: Required<ProjectOptions>,
): Promise<boolean> => {
	const spinner = yoctoSpinner({
		text: "Setting up TanStack Router...",
	}).start();

	try {
		const { projectName, rpc, shadcn, tailwind, tanstackQuery } = options;

		const projectPath = path.resolve(process.cwd(), projectName);
		spinner.text = "Installing TanStack Router...";
		await addPackageDependency({
			dependencies: [""],
			target: "client",
			projectName,
		});

		// const selectedTemplate = nameGenerator("App.tsx", {
		// 	rpc,
		// 	shadcn,
		// 	tailwind,
		// 	tanstackQuery,
		// 	reactRouter: true,
		// });

		// const appTsxSrc = path.join(
		// 	EXTRAS_DIR,
		// 	"client",
		// 	"src",
		// 	"App.tsx",
		// 	selectedTemplate,
		// );
		// const appTsxTarget = path.join(projectPath, "client", "src", "App.tsx");
		// fs.copySync(appTsxSrc, appTsxTarget);
		//
		spinner.success("TanStack Router setup completed");
		return true;
	} catch (err: unknown) {
		spinner.error("Failed to set up TanStack Router");
		if (err instanceof Error) {
			consola.error(pc.red("Error:"), err.message);
		} else {
			consola.error(pc.red("Error: Unknown error"));
		}
		return false;
	}
};
