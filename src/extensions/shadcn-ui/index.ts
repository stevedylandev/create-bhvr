import type { Extension } from "@/types";
import { tailwindcssExtension } from "../tailwindcss";
import { addShadcnUi } from "./add-shadcn-ui";
import { removeShadcnUi } from "./remove-shadcn-ui";

export const shadcnUiExtension: Extension = {
	id: "shadcn-ui",
	name: "shadcn/ui",
	description: "Build your component library",
	version: "1.0.0",
	add: addShadcnUi,
	remove: removeShadcnUi,
	tag: "styling",
	dependsOn: [tailwindcssExtension],
};
