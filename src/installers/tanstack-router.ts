import path from "node:path";
import fs from "fs-extra";
import type { ProjectOptions } from "@/types";
import yoctoSpinner from "yocto-spinner";
import pc from "picocolors";
import { consola } from "consola";
import { addPackageDependency } from "@/utils/add-package-dependency";
import { EXTRAS_DIR } from "@/utils";
import { nameGenerator } from "@/utils/name-generator";
import { execa } from "execa";

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
      dependencies: [
        "@tanstack/react-router",
        "@tanstack/react-router-devtools",
      ],
      target: "client",
      projectName,
    });

    await addPackageDependency({
      dependencies: ["@tanstack/router-plugin"],
      devMode: true,
      target: "client",
      projectName,
    });

    const viteConfigTemplate = nameGenerator("vite.config.ts", {
      tailwind,
      shadcn,
      tanstackRouter: true,
    });
    const viteConfigSrc = path.join(
      EXTRAS_DIR,
      "client",
      "vite.config.ts",
      viteConfigTemplate,
    );
    const viteConfigTarget = path.join(projectPath, "client", "vite.config.ts");
    fs.copySync(viteConfigSrc, viteConfigTarget);

    const rootTsxSrc = path.join(
      EXTRAS_DIR,
      "client",
      "src",
      "routes",
      "__root.tsx",
    );
    const rootTsxTarget = path.join(
      projectPath,
      "client",
      "src",
      "routes",
      "__root.tsx",
    );
    fs.copySync(rootTsxSrc, rootTsxTarget);

    const indexTsxSrc = path.join(
      EXTRAS_DIR,
      "client",
      "src",
      "routes",
      "index.tsx",
      nameGenerator("index.tsx", { tanstackQuery, tailwind, shadcn, rpc }),
    );
    const indexTsxTarget = path.join(
      projectPath,
      "client",
      "src",
      "routes",
      "index.tsx",
    );
    fs.copySync(indexTsxSrc, indexTsxTarget);

    const mainTsxSrc = path.join(
      EXTRAS_DIR,
      "client",
      "src",
      "main.tsx",
      nameGenerator("main.tsx", { tanstackQuery, tanstackRouter: true }),
    );
    const mainTsxTarget = path.join(projectPath, "client", "src", "main.tsx");
    fs.copySync(mainTsxSrc, mainTsxTarget);

    const appTsxTarget = path.join(projectPath, "client", "src", "App.tsx");
    fs.remove(appTsxTarget);

    spinner.text = "Generating TanStack Route Tree...";

    // await execa("vite", ["--config", "vite.config.ts", "--force"], {
    // 	cwd: path.join(projectPath, "client"),
    // });
    //
    await execa("bunx", ["vite", "build"], {
      cwd: path.join(projectPath, "client"),
    });

    await execa("bunx", ["tsc", "-b"], {
      cwd: path.join(projectPath, "client"),
    });

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
