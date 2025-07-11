import path from "node:path";
import degit from "degit";
import fs from "fs-extra";
import ora from "ora";
import pc from "picocolors";
import type { ProjectOptions } from "@/types";
import { DEFAULT_REPO } from "@/utils/constants";
import { TEMPLATES } from "@/utils/templates";
import { patchFilesForRPC } from "./patch-files-rpc";
import { setupBiome } from "./setup-biome";

export async function scaffoldTemplate(
  options: ProjectOptions,
): Promise<boolean> {
  const { projectName, template, repo, branch, rpc, linter } = options;
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
  const repoUrl = `${repoPath}#${repoBranch}`;
  const spinner = ora("Downloading template...").start();

  try {
    const emitter = degit(repoUrl, {
      cache: false,
      force: true,
      verbose: false,
    });

    await emitter.clone(projectPath);
    spinner.succeed(`Template downloaded successfully (${template} template)`);

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
      await patchFilesForRPC(projectPath, template);
    }

    if (linter === "biome") {
      await setupBiome(projectPath);
    }

    return true;
  } catch (err) {
    spinner.fail("Failed to download template");
    throw err;
  }
}
