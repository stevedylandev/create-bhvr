import path from "node:path";
import degit from "degit";
import fs from "fs-extra";
import pc from "picocolors";
import yoctoSpinner from "yocto-spinner";
import type { ProjectOptions } from "@/types";
import { DEFAULT_REPO } from "@/utils/constants";
import { patchFilesForRPC } from "./patch-files-rpc";
import { setupBiome } from "./setup-biome";

export async function scaffoldTemplate(
	options: Required<ProjectOptions>,
): Promise<boolean> {
	const { projectName, repo, branch, rpc, linter } = options;

	const projectPath = path.resolve(process.cwd(), projectName);

	if (fs.existsSync(projectPath)) {
		const files = fs.readdirSync(projectPath);
		if (files.length > 0) {
			await fs.emptyDir(projectPath);
		}
	}

	fs.ensureDirSync(projectPath);

	const repoPath = repo || DEFAULT_REPO;
	const repoBranch = branch || "main";
	const repoUrl = `${repoPath}#${repoBranch}`;
	const spinner = yoctoSpinner({ text: "Downloading bhvr..." }).start();

	try {
		const emitter = degit(repoUrl, {
			cache: false,
			force: true,
			verbose: false,
		});

		await emitter.clone(projectPath);
		spinner.success(`Bhvr downloaded successfully`);

		const pkgJsonPath = path.join(projectPath, "package.json");
		if (fs.existsSync(pkgJsonPath)) {
			const pkgJson = await fs.readJson(pkgJsonPath);
			pkgJson.name = projectName;
			await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 2 });
		}

		const gitDir = path.join(projectPath, ".git");
		if (fs.existsSync(gitDir)) {
			await fs.remove(gitDir);
			console.log(pc.blue("Removed .git directory"));
		}

		if (rpc) {
			await patchFilesForRPC(projectPath);
		}

		if (linter === "biome") {
			await setupBiome(projectPath);
		}

		return true;
	} catch (err) {
		spinner.error("Failed to download bhvr");
		throw err;
	}
}
