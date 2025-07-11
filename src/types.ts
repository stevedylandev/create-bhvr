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
  rpc?: boolean;
  linter?: "eslint" | "biome";
};

export interface ProjectResult {
  projectName: string;
  gitInitialized: boolean;
  dependenciesInstalled: boolean;
  template: string;
}
