export interface TemplateInfo {
	branch: string;
	description: string;
}

export interface ProjectOptions {
	yes?: boolean;
	typescript?: boolean;
	repo?: string;
	template?: string;
	branch?: string;
	rpc?: boolean;
}

export interface ProjectResult {
	projectName: string;
	gitInitialized: boolean;
	dependenciesInstalled: boolean;
	template: string;
}
