import { readdir } from "node:fs/promises";
import { join } from "node:path";

const kebabToCamelCase = (str: string) => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

export const loadExtensions = async () => {
  const extensionsDir = join(__dirname);
  const dirents = await readdir(extensionsDir, { withFileTypes: true });

  const extensionModules = await Promise.all(
    dirents
      .filter((dirent) => dirent.isDirectory())
      .map(async (dirent) => {
        const modulePath = join(extensionsDir, dirent.name, "index.ts");
        try {
          const module = await import(modulePath);
          const exportName = `${kebabToCamelCase(dirent.name)}Extension`;
          return module[exportName];
        } catch (error) {
          console.error(`Failed to load extension from ${modulePath}:`, error);
          return null;
        }
      }),
  );

  return extensionModules.filter(Boolean);
};
