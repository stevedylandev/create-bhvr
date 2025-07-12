import type { Extension } from "@/types";
import { addBiome } from "./add-biome";
import { removeBiome } from "./remove-biome";

export const biomeExtension: Extension = {
	id: "biome",
	name: "Biome",
	description:
		"A linter and formatter for  JavaScript, TypeScript, JSX, CSS and GraphQL",
	version: "0.3.12",
	add: addBiome,
	remove: removeBiome,
	conflicts: ["eslint"],
};
