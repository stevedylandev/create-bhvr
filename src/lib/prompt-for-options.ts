import { consola } from "consola";
import pc from "picocolors";
import type { ProjectOptions } from "@/types";
import { TEMPLATES } from "@/utils/templates";
import { tryCatch } from "@/utils/try-catch";

export async function promptForOptions(
  options: ProjectOptions,
): Promise<ProjectOptions | null> {
  let projectName = options.projectName;

  if (!projectName && !options.yes) {
    const { data, error } = await tryCatch(
      consola.prompt(pc.yellow("What is the name of your project?"), {
        type: "text",
        default: "my-bhvr-app",
        placeholder: "my-bhvr-app",
        cancel: "reject",
      }),
    );

    if (!data || error) {
      consola.error(pc.red("Project creation cancelled."));
      return null;
    }

    projectName = data;
  }

  let templateChoice = options.template || "default";

  if (!options.yes && !options.branch) {
    const templateChoices = Object.keys(TEMPLATES).map((key) => ({
      label: `${key} (${TEMPLATES[key]?.description})`,
      value: key,
    }));

    const { data, error } = await tryCatch(
      consola.prompt(pc.yellow("Select a template:"), {
        type: "select",
        options: templateChoices,
        initial: "default",
        cancel: "reject",
      }),
    );

    if (!data || error) {
      consola.error("Project creation cancelled.");
      return null;
    }

    templateChoice = data;
  }

  let useRpc = options.rpc;

  if (!options.yes && !options.rpc) {
    const { data: rpcResponse, error } = await tryCatch(
      consola.prompt("Use Hono RPC client for type-safe API communication?", {
        type: "confirm",
        initial: false,
      }),
    );

    if (error) {
      consola.error("Project creation cancelled.");
      return null;
    }

    useRpc = rpcResponse;
  }

  let linter = options.linter;

  if (!options.yes && !options.linter) {
    const { data: linterResponse, error } = await tryCatch(
      consola.prompt("Select a linter:", {
        type: "select",
        options: [
          { label: "ESLint (default)", value: "eslint" },
          { label: "Biome", value: "biome" },
        ],
        initial: "eslint",
        cancel: "reject",
      }),
    );

    if (error) {
      console.log(pc.yellow("Project creation cancelled."));
      return null;
    }

    linter = linterResponse as "eslint" | "biome";
  }

  return {
    ...options,
    projectName,
    template: templateChoice,
    rpc: useRpc,
    linter,
  };
}
