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
	query?: boolean;
}

export interface ProjectResult {
	projectName: string;
	gitInitialized: boolean;
	dependenciesInstalled: boolean;
	template: string;
}
