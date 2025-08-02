import { describe, it, expect } from "bun:test";
import { TEMPLATES, honoRpcTemplate, honoClientTemplate } from "./templates";

describe("Templates", () => {
	it("should have all required templates with correct structure", () => {
		const expectedTemplates = ["default", "tailwind", "shadcn"];

		expectedTemplates.forEach((templateName) => {
			expect(TEMPLATES).toHaveProperty(templateName);
			const template = TEMPLATES[templateName];
			expect(template).toHaveProperty("branch");
			expect(template).toHaveProperty("description");
			expect(typeof template?.branch).toBe("string");
			expect(typeof template?.description).toBe("string");
		});
	});

	it("should have valid Hono templates", () => {
		expect(honoRpcTemplate).toContain("import { Hono }");
		expect(honoRpcTemplate).toContain("export const app = new Hono()");

		expect(honoClientTemplate).toContain("import { hc }");
		expect(honoClientTemplate).toContain("export const hcWithType");
	});
});
