export type ProjectOptions = {
	projectName?: string;
	yes?: boolean;
	typescript?: boolean;
	repo?: string;
	branch?: string;
	rpc?: boolean;
	linter?: "eslint" | "biome";
	style?: "tailwindcss";
	extras?: ("shadcn-ui")[];
};

export interface ProjectResult {
	projectName: string;
	gitInitialized: boolean;
	dependenciesInstalled: boolean;
}

type ExtensionTag = "linter" | "styling" | "extra";

export type Extension = {
	id: string;
	name: string;
	version: string; // Should have the same version number has create-biome
	description: string;
	add: (path: string) => Promise<void>;
	remove: (path: string) => Promise<void>;
	conflicts?: Extension["id"][];
	dependsOn?: Extension[];
	tag?: ExtensionTag;
};
