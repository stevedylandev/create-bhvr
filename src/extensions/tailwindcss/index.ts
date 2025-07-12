import type { Extension } from "@/types";
import { addTailwindcss } from "./add-tailwindcss";
import { removeTailwindcss } from "./remove-tailwindcss";

export const tailwindcssExtension: Extension = {
	id: "tailwindcss",
	name: "TailwindCSS",
	description: "",
	version: "0.3.12",
	add: addTailwindcss,
	remove: removeTailwindcss,
	tag: "styling",
};
