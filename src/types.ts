export type ProjectOptions = {
	projectName?: string;
	yes?: boolean;
	typescript?: boolean;
	repo?: string;
	branch?: string;
	rpc?: boolean;
	linter?: "eslint" | "biome";
	style?: "tailwindcss";
};

export interface ProjectResult {
	projectName: string;
	gitInitialized: boolean;
	dependenciesInstalled: boolean;
}

export type Extension = {
	id: string;
	name: string;
	version: string;
	description: string;
	add: (path: string) => Promise<void>;
	remove: (path: string) => Promise<void>;
	conflicts?: Extension["id"][];
	dependsOn?: Extension["id"][];
};
