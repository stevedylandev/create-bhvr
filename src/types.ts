export type ProjectOptions = {
	projectName?: string;
	yes?: boolean;
	typescript?: boolean;
	repo?: string;
	branch?: string;
	rpc?: boolean;
	linter?: "eslint" | "biome";
};

export interface ProjectResult {
	projectName: string;
	gitInitialized: boolean;
	dependenciesInstalled: boolean;
}
