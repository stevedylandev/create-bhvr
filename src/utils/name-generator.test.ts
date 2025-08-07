import { describe, it, expect } from "bun:test";
import { nameGenerator } from "./name-generator";

describe("nameGenerator", () => {
	describe("nameGenerator function", () => {
		it("should return original basename for empty options", async () => {
			const result = nameGenerator("template.txt", {});
			expect(result).toBe("template.txt");
		});

		it("should return original basename when all options are false", async () => {
			const options = {
				rpc: false,
				shadcn: false,
				tailwind: false,
				tanstackQuery: false,
			};
			const result = nameGenerator("template.txt", options);
			expect(result).toBe("template.txt");
		});

		it("should return filename with '-with-' prefix when only one option is true", async () => {
			const options = {
				rpc: true,
				shadcn: false,
				tailwind: false,
				tanstackQuery: false,
			};
			const result = nameGenerator("template.txt", options);
			expect(result).toBe("template-with-rpc.txt");
		});

		it("should return multiple options with '-with-' prefix joined with dashes", async () => {
			const options = {
				rpc: true,
				shadcn: true,
				tailwind: false,
				tanstackQuery: false,
			};
			const result = nameGenerator("template.txt", options);
			expect(result).toBe("template-with-rpc-shadcn.txt");
		});

		it("should sort options alphabetically after '-with-' prefix", async () => {
			const options = {
				tailwind: true,
				rpc: true,
				shadcn: true,
				tanstackQuery: false,
			};
			const result = nameGenerator("template.txt", options);
			expect(result).toBe("template-with-rpc-shadcn-tailwind.txt");
		});

		it("should handle all options selected", async () => {
			const options = {
				tailwind: true,
				rpc: true,
				shadcn: true,
				tanstackQuery: true,
			};
			const result = nameGenerator("template.txt", options);
			expect(result).toBe(
				"template-with-rpc-shadcn-tailwind-tanstackquery.txt",
			);
		});

		it("should convert camelCase options to lowercase", async () => {
			const options = {
				tanstackQuery: true,
				rpc: false,
				shadcn: false,
				tailwind: false,
			};
			const result = nameGenerator("template.txt", options);
			expect(result).toBe("template-with-tanstackquery.txt");
		});

		it("should handle mixed selections with alphabetical sorting", async () => {
			const options = {
				tanstackQuery: true,
				tailwind: true,
				rpc: false,
				shadcn: false,
			};
			const result = nameGenerator("template.txt", options);
			expect(result).toBe("template-with-tailwind-tanstackquery.txt");
		});

		it("should handle different combinations maintaining alphabetical order", async () => {
			const options = {
				shadcn: true,
				tanstackQuery: true,
				rpc: false,
				tailwind: false,
			};
			const result = nameGenerator("template.txt", options);
			expect(result).toBe("template-with-shadcn-tanstackquery.txt");
		});

		it("should handle single tailwind option", async () => {
			const options = {
				rpc: false,
				shadcn: false,
				tailwind: true,
				tanstackQuery: false,
			};
			const result = nameGenerator("template.txt", options);
			expect(result).toBe("template-with-tailwind.txt");
		});

		it("should handle rpc and tanstackQuery combination", async () => {
			const options = {
				rpc: true,
				shadcn: false,
				tailwind: false,
				tanstackQuery: true,
			};
			const result = nameGenerator("template.txt", options);
			expect(result).toBe("template-with-rpc-tanstackquery.txt");
		});

		it("should handle different file extensions", async () => {
			const options = {
				rpc: true,
				shadcn: false,
				tailwind: false,
				tanstackQuery: false,
			};
			const result = nameGenerator("component.tsx", options);
			expect(result).toBe("component-with-rpc.tsx");
		});

		it("should handle files without extensions", async () => {
			const options = {
				tailwind: true,
				shadcn: false,
				rpc: false,
				tanstackQuery: false,
			};
			const result = nameGenerator("README", options);
			expect(result).toBe("README-with-tailwind");
		});

		it("should handle complex filenames", async () => {
			const options = {
				rpc: true,
				shadcn: true,
				tailwind: false,
				tanstackQuery: false,
			};
			const result = nameGenerator("my-app-config.json", options);
			expect(result).toBe("my-app-config-with-rpc-shadcn.json");
		});
	});
});
