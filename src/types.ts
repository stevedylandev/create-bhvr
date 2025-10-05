export interface TemplateInfo {
	branch: string;
	description: string;
}

export type ProjectOptions = {
	projectName?: string;
	yes?: boolean;
	typescript?: boolean;
	repo?: string;
	template?: string;
	branch?: string;
	tailwind?: boolean;
	shadcn?: boolean;
	rpc?: boolean;
	linter?: "eslint" | "biome";
	router?: "none" | "reactrouter" | "reactroutermpa" | "tanstackrouter";
	tanstackQuery?: boolean;
};

export interface ProjectResult {
	projectName: string;
	gitInitialized: boolean;
	dependenciesInstalled: boolean;
	template: string;
}
