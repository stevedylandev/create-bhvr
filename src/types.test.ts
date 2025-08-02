import { describe, it, expect } from "bun:test";
import type { TemplateInfo, ProjectOptions, ProjectResult } from "./types";

describe("TypeScript types", () => {
	it("should define correct type structures", () => {
		// Test that types can be instantiated correctly
		const templateInfo: TemplateInfo = {
			branch: "main",
			description: "Test template",
		};

		const options: ProjectOptions = {
			projectName: "test-project",
			linter: "biome",
		};

		const result: ProjectResult = {
			projectName: "test-project",
			gitInitialized: true,
			dependenciesInstalled: false,
			template: "default",
		};

		expect(templateInfo.branch).toBe("main");
		expect(options.linter).toBe("biome");
		expect(result.projectName).toBe("test-project");
	});
});
