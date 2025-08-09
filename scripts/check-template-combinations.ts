#!/usr/bin/env bun
// Experimental script that lets you check if every possible template combination is created.
// Please use with CAUTION - A lot of parts have been written by AI

import fs from "fs-extra";
import path from "node:path";

// Define the possible boolean options from ProjectOptions type
const BOOLEAN_OPTIONS = [
	"tailwind",
	"shadcn",
	"rpc",
	"tanstackQuery",
	"reactRouter",
	"tanstackRouter",
] as const;

// Package dependency rules
const PACKAGE_DEPENDENCIES: Record<string, string[]> = {
	shadcn: ["tailwind"], // shadcn requires tailwind
	// Add more dependencies here as needed
	// example: somePackage: ["requiredPackage1", "requiredPackage2"]
};

// Mutually exclusive groups (only one option from each group can be selected)
const MUTUALLY_EXCLUSIVE_GROUPS: string[][] = [
	// Add mutually exclusive groups here as needed
	// example: ["option1", "option2", "option3"]
	["reactRouter", "tanstackRouter"],
];

// Check if a combination is valid based on dependencies and mutual exclusivity
function isValidCombination(combination: Record<string, boolean>): boolean {
	// Skip combinations with no packages selected
	const hasAnyPackage = Object.values(combination).some((value) => value);
	if (!hasAnyPackage) {
		return false;
	}

	// Skip combinations that only contain shadcn and/or tailwind (they're cloned from repo)
	const enabledPackages = Object.keys(combination).filter(
		(key) => combination[key],
	);
	const onlyShadcnTailwind = enabledPackages.every(
		(pkg) => pkg === "shadcn" || pkg === "tailwind",
	);
	if (onlyShadcnTailwind) {
		return false;
	}

	// Check package dependencies
	for (const [packageName, dependencies] of Object.entries(
		PACKAGE_DEPENDENCIES,
	)) {
		if (combination[packageName]) {
			// If this package is enabled, all its dependencies must also be enabled
			for (const dependency of dependencies) {
				if (!combination[dependency]) {
					return false;
				}
			}
		}
	}

	// Check mutual exclusivity
	for (const group of MUTUALLY_EXCLUSIVE_GROUPS) {
		const selectedInGroup = group.filter((option) => combination[option]);
		if (selectedInGroup.length > 1) {
			return false; // More than one option selected in mutually exclusive group
		}
	}

	return true;
}

// Generate all possible combinations of boolean options with filtering
function generateAllCombinations(
	options: readonly string[],
): Array<Record<string, boolean>> {
	const combinations: Array<Record<string, boolean>> = [];
	const totalCombinations = Math.pow(2, options.length);

	for (let i = 0; i < totalCombinations; i++) {
		const combination: Record<string, boolean> = {};
		for (let j = 0; j < options.length; j++) {
			combination[options[j]] = Boolean(i & (1 << j));
		}

		// Only include valid combinations
		if (isValidCombination(combination)) {
			combinations.push(combination);
		}
	}

	return combinations;
}

// Simulate nameGenerator function locally
const nameGenerator = (
	basename: string,
	possibleOptions: Record<string, boolean>,
) => {
	const dotIndex = basename.lastIndexOf(".");
	const filename = dotIndex === -1 ? basename : basename.substring(0, dotIndex);
	const extension = dotIndex === -1 ? "" : basename.substring(dotIndex + 1);

	const selectedOptions = Object.keys(possibleOptions)
		.filter((opt) => possibleOptions[opt])
		.map((opt) => opt.toLowerCase())
		.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

	if (selectedOptions.length > 0) {
		const suffix = ["-with", ...selectedOptions].join("-");
		return extension
			? `${filename}${suffix}.${extension}`
			: `${filename}${suffix}`;
	}
	return basename;
};

// Parse installer files to find nameGenerator calls and hardcoded template patterns
// Recursively find all .ts files in installers directory
async function findInstallerFiles(dir: string): Promise<string[]> {
	const files: string[] = [];
	const entries = await fs.readdir(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await findInstallerFiles(fullPath)));
		} else if (entry.isFile() && entry.name.endsWith(".ts")) {
			files.push(fullPath);
		}
	}

	return files;
}

async function parseInstallerFiles(): Promise<
	Array<{
		file: string;
		basename: string;
		usedOptions: string[];
		templatePath: string;
		type: "nameGenerator" | "hardcoded";
	}>
> {
	const installerFiles = await findInstallerFiles("src/installers");
	const templateCalls: Array<{
		file: string;
		basename: string;
		usedOptions: string[];
		templatePath: string;
		type: "nameGenerator" | "hardcoded";
	}> = [];

	for (const file of installerFiles) {
		const content = await fs.readFile(file, "utf-8");

		// Find nameGenerator calls with regex
		const nameGeneratorRegex =
			/nameGenerator\s*\(\s*["']([^"']+)["']\s*,\s*\{([^}]+)\}/g;
		let match;

		while ((match = nameGeneratorRegex.exec(content)) !== null) {
			const basename = match[1];
			const optionsStr = match[2];

			// Extract the options used in this call
			const usedOptions = BOOLEAN_OPTIONS.filter((option) =>
				optionsStr.includes(option),
			);

			// Try to find the template path from the surrounding context
			const lines = content.split("\n");
			const matchLine =
				content.substring(0, match.index).split("\n").length - 1;

			let templatePath = "client/src"; // default based on common pattern

			// Look for path.join with EXTRAS_DIR in nearby lines (could be multi-line)
			for (
				let i = Math.max(0, matchLine - 10);
				i <= Math.min(lines.length - 1, matchLine + 10);
				i++
			) {
				const line = lines[i].trim();
				if (line.includes("path.join") && line.includes("EXTRAS_DIR")) {
					// Find the complete path.join statement (might span multiple lines)
					let pathJoinContent = "";
					let j = i;
					let parenCount = 0;
					let foundStart = false;

					while (j < lines.length) {
						const currentLine = lines[j].trim();
						pathJoinContent += currentLine + " ";

						if (currentLine.includes("path.join")) {
							foundStart = true;
						}

						if (foundStart) {
							parenCount += (currentLine.match(/\(/g) || []).length;
							parenCount -= (currentLine.match(/\)/g) || []).length;

							if (parenCount === 0) {
								break;
							}
						}
						j++;
					}

					// Extract path components from the complete path.join
					const pathMatch = pathJoinContent.match(/EXTRAS_DIR[^,]*,([^)]+)\)/);
					if (pathMatch) {
						templatePath = pathMatch[1]
							.split(",")
							.map((s) =>
								s
									.trim()
									.replace(/['"]/g, "")
									.replace(/nameGenerator[^,]*/, basename),
							)
							.filter((s) => s && s !== basename)
							.join("/");
					}
					break;
				}
			}

			templateCalls.push({
				file,
				basename,
				usedOptions,
				templatePath,
				type: "nameGenerator",
			});
		}

		// Find hardcoded template patterns like: `App-with${tailwind ? "-tailwind" : ""}${shadcn ? "-shadcn" : ""}${rpc ? "-rpc" : ""}.tsx`
		const hardcodedRegex = /`([^`]*)-with\${[^`]+\$\{[^`]+}\.[^`]+`/g;
		let hardcodedMatch;

		while ((hardcodedMatch = hardcodedRegex.exec(content)) !== null) {
			const templatePattern = hardcodedMatch[1];

			// Extract basename from pattern (everything before "-with")
			const basenameMatch = templatePattern.match(/^([^-]+)/);
			if (basenameMatch) {
				const basename = `${basenameMatch[1]}.tsx`; // Add .tsx extension

				// Extract options from the template pattern
				const usedOptions = BOOLEAN_OPTIONS.filter((option) =>
					hardcodedMatch[0].includes(option),
				);

				// Find template path similar to nameGenerator
				const lines = content.split("\n");
				const matchLine =
					content.substring(0, hardcodedMatch.index).split("\n").length - 1;

				let templatePath = "client/src";

				for (
					let i = Math.max(0, matchLine - 10);
					i <= Math.min(lines.length - 1, matchLine + 10);
					i++
				) {
					const line = lines[i].trim();
					if (line.includes("path.join") && line.includes("EXTRAS_DIR")) {
						let pathJoinContent = "";
						let j = i;
						let parenCount = 0;
						let foundStart = false;

						while (j < lines.length) {
							const currentLine = lines[j].trim();
							pathJoinContent += currentLine + " ";

							if (currentLine.includes("path.join")) {
								foundStart = true;
							}

							if (foundStart) {
								parenCount += (currentLine.match(/\(/g) || []).length;
								parenCount -= (currentLine.match(/\)/g) || []).length;

								if (parenCount === 0) {
									break;
								}
							}
							j++;
						}

						const pathMatch = pathJoinContent.match(
							/EXTRAS_DIR[^,]*,([^)]+)\)/,
						);
						if (pathMatch) {
							templatePath = pathMatch[1]
								.split(",")
								.map((s) =>
									s
										.trim()
										.replace(/['"]/g, "")
										.replace(/selectedTemplate[^,]*/, basename),
								)
								.filter(
									(s) => s && s !== basename && !s.includes("selectedTemplate"),
								)
								.join("/");
						}
						break;
					}
				}

				templateCalls.push({
					file,
					basename,
					usedOptions,
					templatePath,
					type: "hardcoded",
				});
			}
		}
	}

	return templateCalls;
}

// Simulate hardcoded template naming (like in RPC installer)
const hardcodedGenerator = (
	basename: string,
	possibleOptions: Record<string, boolean>,
) => {
	const dotIndex = basename.lastIndexOf(".");
	const filename = dotIndex === -1 ? basename : basename.substring(0, dotIndex);
	const extension = dotIndex === -1 ? "" : basename.substring(dotIndex + 1);

	let result = filename + "-with";

	// Hardcoded follows specific order: tailwind, shadcn, rpc, tanstackQuery, then routers
	if (possibleOptions.tailwind) result += "-tailwind";
	if (possibleOptions.shadcn) result += "-shadcn";
	if (possibleOptions.rpc) result += "-rpc";
	if (possibleOptions.tanstackQuery) result += "-tanstackquery";
	if (possibleOptions.reactRouter) result += "-reactrouter";

	return extension ? `${result}.${extension}` : result;
};

// Check if template files exist for all combinations
async function checkTemplateFiles() {
	const templateCalls = await parseInstallerFiles();

	if (templateCalls.length === 0) {
		return;
	}

	for (const call of templateCalls) {
		const allCombinations = generateAllCombinations(call.usedOptions);
		const templateDir = path.join(
			path.resolve("src/templates/extras"),
			call.templatePath.replace(/["']/g, ""),
			call.basename,
		);

		for (const combination of allCombinations) {
			const templateName =
				call.type === "nameGenerator"
					? nameGenerator(call.basename, combination)
					: hardcodedGenerator(call.basename, combination);
			const fullTemplatePath = path.join(templateDir, templateName);

			const exists = await fs.pathExists(fullTemplatePath);
			if (!exists) {
				console.log(`touch "${fullTemplatePath}"`);
			}
		}
	}
}

// Run the analysis
checkTemplateFiles().catch(console.error);
