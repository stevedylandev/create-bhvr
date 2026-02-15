import path from "node:path";
import { consola } from "consola";
import fs from "fs-extra";
import pc from "picocolors";
import yoctoSpinner from "yocto-spinner";
import type { ProjectOptions } from "@/types";

export async function noBuildInstaller(
	options: Required<ProjectOptions>,
): Promise<boolean> {
	const spinner = yoctoSpinner({
		text: "Configuring no-build mode (direct source imports)...",
	}).start();

	try {
		const { projectName } = options;
		const projectPath = path.resolve(process.cwd(), projectName);

		// 1. Update root package.json - remove postinstall build script
		const rootPkgPath = path.join(projectPath, "package.json");
		if (await fs.pathExists(rootPkgPath)) {
			const rootPkg = await fs.readJson(rootPkgPath);

			if (rootPkg.scripts?.postinstall) {
				delete rootPkg.scripts.postinstall;
			}

			await fs.writeJson(rootPkgPath, rootPkg, { spaces: 2 });
		}

		// 2. Update shared package.json - exports point to src, remove build/watch, add typecheck
		const sharedPkgPath = path.join(projectPath, "shared", "package.json");
		if (await fs.pathExists(sharedPkgPath)) {
			const sharedPkg = await fs.readJson(sharedPkgPath);

			// Update main/exports to point to src instead of dist
			if (sharedPkg.main) {
				sharedPkg.main = sharedPkg.main.replace(/^\.\/dist\//, "./src/");
				sharedPkg.main = sharedPkg.main.replace(/\.js$/, ".ts");
			}
			if (sharedPkg.types) {
				sharedPkg.types = sharedPkg.types.replace(/^\.\/dist\//, "./src/");
				sharedPkg.types = sharedPkg.types.replace(/\.d\.ts$/, ".ts");
			}
			if (sharedPkg.exports) {
				for (const key of Object.keys(sharedPkg.exports)) {
					const exp = sharedPkg.exports[key];
					if (typeof exp === "string") {
						sharedPkg.exports[key] = exp
							.replace(/^\.\/dist\//, "./src/")
							.replace(/\.js$/, ".ts");
					} else if (typeof exp === "object" && exp !== null) {
						sharedPkg.exports[key] = "./src/index.ts";
					}
				}
			}

			// Remove build and dev/watch scripts, add typecheck
			if (sharedPkg.scripts?.build) {
				delete sharedPkg.scripts.build;
			}
			if (sharedPkg.scripts?.dev) {
				delete sharedPkg.scripts.dev;
			}
			sharedPkg.scripts = sharedPkg.scripts || {};
			sharedPkg.scripts.typecheck = "tsc --noEmit";

			await fs.writeJson(sharedPkgPath, sharedPkg, { spaces: 2 });
		}

		// Remove prebuilt shared dist if present
		const sharedDistPath = path.join(projectPath, "shared", "dist");
		if (await fs.pathExists(sharedDistPath)) {
			await fs.remove(sharedDistPath);
		}

		// 3. Update server package.json - replace build with typecheck
		const serverPkgPath = path.join(projectPath, "server", "package.json");
		if (await fs.pathExists(serverPkgPath)) {
			const serverPkg = await fs.readJson(serverPkgPath);

			// Remove build script, add typecheck
			if (serverPkg.scripts?.build) {
				delete serverPkg.scripts.build;
			}
			serverPkg.scripts.typecheck = "tsc --noEmit";

			await fs.writeJson(serverPkgPath, serverPkg, { spaces: 2 });
		}

		// Remove prebuilt server dist if present
		const serverDistPath = path.join(projectPath, "server", "dist");
		if (await fs.pathExists(serverDistPath)) {
			await fs.remove(serverDistPath);
		}

		// 4. Update client package.json - remove tsc -b from build, add typecheck
		const clientPkgPath = path.join(projectPath, "client", "package.json");
		if (await fs.pathExists(clientPkgPath)) {
			const clientPkg = await fs.readJson(clientPkgPath);

			// Remove tsc -b from build script (vite handles it directly)
			if (clientPkg.scripts?.build) {
				clientPkg.scripts.build = clientPkg.scripts.build
					.replace(/tsc -b\s*&&\s*/g, "")
					.replace(/\s*&&\s*tsc -b/g, "");
			}

			// Add typecheck script
			clientPkg.scripts.typecheck = "tsc --noEmit";

			await fs.writeJson(clientPkgPath, clientPkg, { spaces: 2 });
		}

		spinner.success("No-build mode configured (direct source imports)");
		return true;
	} catch (err: unknown) {
		spinner.error("Failed to configure no-build mode");
		if (err instanceof Error) {
			consola.error(pc.red("Error:"), err.message);
		} else {
			consola.error(pc.red("Error: Unknown error"));
		}
		return false;
	}
}
