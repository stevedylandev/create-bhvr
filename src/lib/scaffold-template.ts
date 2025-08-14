import path from "node:path";
import fs from "fs-extra";
import pc from "picocolors";
import yoctoSpinner from "yocto-spinner";
import type { ProjectOptions } from "@/types";
import { DEFAULT_REPO } from "@/utils/constants";
import { TEMPLATES } from "@/utils/templates";
import { execSync } from "node:child_process";

export async function scaffoldTemplate(
	options: Required<ProjectOptions>,
): Promise<boolean> {
	const { projectName, template, repo, branch } = options;

	const projectPath = path.resolve(process.cwd(), projectName);

	if (fs.existsSync(projectPath)) {
		const files = fs.readdirSync(projectPath);
		if (files.length > 0) {
			await fs.emptyDir(projectPath);
		}
	}

	fs.ensureDirSync(projectPath);

	const repoPath = repo || DEFAULT_REPO;
	const templateConfig =
		TEMPLATES[template as keyof typeof TEMPLATES] || TEMPLATES.default;
	const repoBranch = branch || (templateConfig?.branch ?? "main");
	const spinner = yoctoSpinner({ text: "Downloading template..." }).start();

	try {
		execSync(
			`git clone --depth 1 --branch ${repoBranch} https://github.com/${repoPath} ${projectPath}`,
			{ stdio: "pipe" },
		);

		spinner.success(`Template downloaded successfully (${template} template)`);

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

		return true;
	} catch (err) {
		spinner.error("Failed to download template");
		throw err;
	}
}
