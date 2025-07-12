import type { Extension } from "@/types";
import { removeTailwindcss } from "./remove-tailwindcss";
import { setupTailwindcss } from "./setup-tailwindcss";

export const tailwindcssExtension: Extension = {
	id: "tailwindcss",
	name: "TailwindCSS",
	description: "",
	version: "0.0.1",
	add: setupTailwindcss,
	remove: removeTailwindcss,
	conflicts: [],
};