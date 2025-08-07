import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import path from "node:path";

// Import the function to test
import { addPackageDependency } from "./add-package-dependency";

// Mock execa
const mockExeca = mock(() => Promise.resolve({ stdout: "", stderr: "" }));

// Mock the execa module
mock.module("execa", () => ({
	execa: mockExeca,
}));

describe("addPackageDependency", () => {
	const testProjectName = "test-project";
	const testDependencies = ["react", "typescript"];

	beforeEach(() => {
		mockExeca.mockClear();
	});

	afterEach(() => {
		mock.restore();
	});

	describe("basic functionality", () => {
		it("should install dependencies in project root by default", async () => {
			await addPackageDependency({
				dependencies: testDependencies,
				projectName: testProjectName,
			});

			expect(mockExeca).toHaveBeenCalledTimes(1);
			expect(mockExeca).toHaveBeenCalledWith(
				"bun",
				["install", ...testDependencies],
				{
					cwd: path.resolve(process.cwd(), testProjectName),
				},
			);
		});

		it("should install dev dependencies when devMode is true", async () => {
			await addPackageDependency({
				dependencies: testDependencies,
				projectName: testProjectName,
				devMode: true,
			});

			expect(mockExeca).toHaveBeenCalledTimes(1);
			expect(mockExeca).toHaveBeenCalledWith(
				"bun",
				["install", "-D", ...testDependencies],
				{
					cwd: path.resolve(process.cwd(), testProjectName),
				},
			);
		});

		it("should handle single dependency", async () => {
			await addPackageDependency({
				dependencies: ["react"],
				projectName: testProjectName,
			});

			expect(mockExeca).toHaveBeenCalledWith("bun", ["install", "react"], {
				cwd: path.resolve(process.cwd(), testProjectName),
			});
		});

		it("should allow empty dependencies array", async () => {
			await addPackageDependency({
				dependencies: [],
				projectName: testProjectName,
			});

			expect(mockExeca).toHaveBeenCalledWith("bun", ["install"], {
				cwd: path.resolve(process.cwd(), testProjectName),
			});
		});
	});

	describe("target-specific installations", () => {
		it("should install dependencies in client directory when target is 'client'", async () => {
			await addPackageDependency({
				dependencies: testDependencies,
				projectName: testProjectName,
				target: "client",
			});

			expect(mockExeca).toHaveBeenCalledTimes(1);
			expect(mockExeca).toHaveBeenCalledWith(
				"bun",
				["install", ...testDependencies],
				{
					cwd: path.join(
						path.resolve(process.cwd(), testProjectName),
						"client",
					),
				},
			);
		});

		it("should install dependencies in server directory when target is 'server'", async () => {
			await addPackageDependency({
				dependencies: testDependencies,
				projectName: testProjectName,
				target: "server",
			});

			expect(mockExeca).toHaveBeenCalledTimes(1);
			expect(mockExeca).toHaveBeenCalledWith(
				"bun",
				["install", ...testDependencies],
				{
					cwd: path.join(
						path.resolve(process.cwd(), testProjectName),
						"server",
					),
				},
			);
		});

		it("should install dev dependencies in client directory", async () => {
			await addPackageDependency({
				dependencies: testDependencies,
				projectName: testProjectName,
				target: "client",
				devMode: true,
			});

			expect(mockExeca).toHaveBeenCalledWith(
				"bun",
				["install", "-D", ...testDependencies],
				{
					cwd: path.join(
						path.resolve(process.cwd(), testProjectName),
						"client",
					),
				},
			);
		});

		it("should install dev dependencies in server directory", async () => {
			await addPackageDependency({
				dependencies: testDependencies,
				projectName: testProjectName,
				target: "server",
				devMode: true,
			});

			expect(mockExeca).toHaveBeenCalledWith(
				"bun",
				["install", "-D", ...testDependencies],
				{
					cwd: path.join(
						path.resolve(process.cwd(), testProjectName),
						"server",
					),
				},
			);
		});
	});

	describe("edge cases and error scenarios", () => {
		it("should handle special characters in project name", async () => {
			const specialProjectName = "my-project_with.special-chars";
			await addPackageDependency({
				dependencies: ["react"],
				projectName: specialProjectName,
			});

			expect(mockExeca).toHaveBeenCalledWith("bun", ["install", "react"], {
				cwd: path.resolve(process.cwd(), specialProjectName),
			});
		});

		it("should handle dependencies with scoped packages", async () => {
			const scopedDependencies = ["@types/node", "@tanstack/react-query"];
			await addPackageDependency({
				dependencies: scopedDependencies,
				projectName: testProjectName,
			});

			expect(mockExeca).toHaveBeenCalledWith(
				"bun",
				["install", ...scopedDependencies],
				{
					cwd: path.resolve(process.cwd(), testProjectName),
				},
			);
		});

		it("should propagate execa errors", async () => {
			const testError = new Error("Installation failed");
			mockExeca.mockRejectedValueOnce(testError);

			await expect(
				addPackageDependency({
					dependencies: ["react"],
					projectName: testProjectName,
				}),
			).rejects.toThrow("Failed to install dependencies: Installation failed");
		});

		it("should handle undefined devMode (falsy)", async () => {
			await addPackageDependency({
				dependencies: testDependencies,
				projectName: testProjectName,
				devMode: undefined,
			});

			expect(mockExeca).toHaveBeenCalledWith(
				"bun",
				["install", ...testDependencies],
				{
					cwd: path.resolve(process.cwd(), testProjectName),
				},
			);
		});

		it("should handle false devMode explicitly", async () => {
			await addPackageDependency({
				dependencies: testDependencies,
				projectName: testProjectName,
				devMode: false,
			});

			expect(mockExeca).toHaveBeenCalledWith(
				"bun",
				["install", ...testDependencies],
				{
					cwd: path.resolve(process.cwd(), testProjectName),
				},
			);
		});

		it("should throw error for empty project name", async () => {
			await expect(
				addPackageDependency({
					dependencies: ["react"],
					projectName: "",
				}),
			).rejects.toThrow("Project name is required");

			expect(mockExeca).not.toHaveBeenCalled();
		});

		it("should throw error for whitespace-only project name", async () => {
			await expect(
				addPackageDependency({
					dependencies: ["react"],
					projectName: "   ",
				}),
			).rejects.toThrow("Project name is required");

			expect(mockExeca).not.toHaveBeenCalled();
		});

		it("should include target info in error messages", async () => {
			const testError = new Error("Installation failed");
			mockExeca.mockRejectedValueOnce(testError);

			await expect(
				addPackageDependency({
					dependencies: ["react"],
					projectName: testProjectName,
					target: "client",
				}),
			).rejects.toThrow(
				"Failed to install dependencies in client: Installation failed",
			);
		});
	});

	describe("path construction", () => {
		it("should construct correct absolute paths", async () => {
			const expectedPath = path.resolve(process.cwd(), testProjectName);

			await addPackageDependency({
				dependencies: ["react"],
				projectName: testProjectName,
			});

			const actualCall = mockExeca.mock.calls[0];
			expect(actualCall[2].cwd).toBe(expectedPath);
		});

		it("should construct correct client path", async () => {
			const expectedPath = path.join(
				path.resolve(process.cwd(), testProjectName),
				"client",
			);

			await addPackageDependency({
				dependencies: ["react"],
				projectName: testProjectName,
				target: "client",
			});

			const actualCall = mockExeca.mock.calls[0];
			expect(actualCall[2].cwd).toBe(expectedPath);
		});

		it("should construct correct server path", async () => {
			const expectedPath = path.join(
				path.resolve(process.cwd(), testProjectName),
				"server",
			);

			await addPackageDependency({
				dependencies: ["express"],
				projectName: testProjectName,
				target: "server",
			});

			const actualCall = mockExeca.mock.calls[0];
			expect(actualCall[2].cwd).toBe(expectedPath);
		});
	});

	describe("command structure validation", () => {
		it("should always use 'bun' as the command", async () => {
			await addPackageDependency({
				dependencies: ["react"],
				projectName: testProjectName,
			});

			expect(mockExeca.mock.calls[0][0]).toBe("bun");
		});

		it("should include 'install' as first argument", async () => {
			await addPackageDependency({
				dependencies: ["react"],
				projectName: testProjectName,
			});

			const args = mockExeca.mock.calls[0][1];
			expect(args[0]).toBe("install");
		});

		it("should preserve dependency order", async () => {
			const orderedDeps = ["zlib", "axios", "lodash"];
			await addPackageDependency({
				dependencies: orderedDeps,
				projectName: testProjectName,
			});

			const args = mockExeca.mock.calls[0][1];
			const depsInCall = args.slice(1); // Remove 'install'
			expect(depsInCall).toEqual(orderedDeps);
		});

		it("should use separate arguments for flags (not concatenated)", async () => {
			await addPackageDependency({
				dependencies: ["react"],
				projectName: testProjectName,
				devMode: true,
			});

			const args = mockExeca.mock.calls[0][1];
			expect(args).toEqual(["install", "-D", "react"]);
			// Ensure we're not using concatenated strings like "install -D"
			expect(args[0]).toBe("install");
			expect(args[1]).toBe("-D");
		});
	});
});
