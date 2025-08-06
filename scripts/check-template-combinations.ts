#!/usr/bin/env bun
// Experimental script that lets you check if every possible template combination is created.
// Please use with CAUTION - A lot of parts have been written by AI

import fs from "fs-extra";
import path from "node:path";

// Define the possible boolean options from ProjectOptions type
const BOOLEAN_OPTIONS = ["tailwind", "shadcn", "rpc", "tanstackQuery"] as const;

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

// Generate all possible combinations of boolean options
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
		combinations.push(combination);
	}

	return combinations;
}

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

	// Hardcoded follows specific order: tailwind, shadcn, rpc
	if (possibleOptions.tailwind) result += "-tailwind";
	if (possibleOptions.shadcn) result += "-shadcn";
	if (possibleOptions.rpc) result += "-rpc";

	return extension ? `${result}.${extension}` : result;
};

// Check if template files exist for all combinations
async function checkTemplateFiles() {
	console.log("🔍 Analyzing template patterns in installers...\n");

	const templateCalls = await parseInstallerFiles();

	if (templateCalls.length === 0) {
		console.log("❌ No template patterns found in installer files!");
		return;
	}

	const extrasDir = path.resolve("src/templates/extras");

	for (const call of templateCalls) {
		console.log(`📁 Analyzing: ${call.file} (${call.type})`);
		console.log(`   Basename: ${call.basename}`);
		console.log(`   Used Options: [${call.usedOptions.join(", ")}]`);
		console.log(`   Template Path: ${call.templatePath}`);
		console.log("");

		// Generate all possible combinations for the used options
		const allCombinations = generateAllCombinations(call.usedOptions);
		const templateDir = path.join(
			extrasDir,
			call.templatePath.replace(/["']/g, ""),
			call.basename,
		);

		console.log(
			`   📋 All possible template files for ${call.basename} (${call.type}):`,
		);

		let foundCount = 0;
		let missingCount = 0;

		for (const combination of allCombinations) {
			const templateName =
				call.type === "nameGenerator"
					? nameGenerator(call.basename, combination)
					: hardcodedGenerator(call.basename, combination);
			const fullTemplatePath = path.join(templateDir, templateName);

			const exists = await fs.pathExists(fullTemplatePath);
			const status = exists ? "✅" : "❌";

			if (exists) {
				foundCount++;
			} else {
				missingCount++;
			}

			// Show combination details
			const enabledOptions = Object.keys(combination)
				.filter((key) => combination[key])
				.join(", ");

			console.log(
				`     ${status} ${templateName} ${enabledOptions ? `(${enabledOptions})` : "(no options)"}`,
			);

			if (!exists) {
				console.log(`        Missing: ${fullTemplatePath}`);
			}
		}

		console.log("");
		console.log(`   📊 Summary: ${foundCount} found, ${missingCount} missing`);
		console.log("   " + "=".repeat(50));
		console.log("");
	}

	// Overall statistics
	console.log("🎯 Overall Analysis Complete!");
	console.log(
		`   Found ${templateCalls.length} template patterns in installers`,
	);
	console.log(
		`   - ${templateCalls.filter((c) => c.type === "nameGenerator").length} nameGenerator calls`,
	);
	console.log(
		`   - ${templateCalls.filter((c) => c.type === "hardcoded").length} hardcoded template patterns`,
	);

	// Consistency analysis
	console.log("");
	console.log("!  CONSISTENCY ISSUES DETECTED:");
	console.log(
		"   The RPC installer uses hardcoded template names with order: tailwind-shadcn-rpc",
	);
	console.log(
		"   The TanStack Query installer uses nameGenerator with alphabetical order: rpc-shadcn-tailwind-tanstackquery",
	);
	console.log("   But the actual template files follow the hardcoded pattern!");
	console.log("");
	console.log("💡 RECOMMENDATIONS:");
	console.log(
		"   1. Standardize on nameGenerator for consistency across all installers",
	);
	console.log(
		"   2. OR rename template files to match nameGenerator's alphabetical sorting",
	);
	console.log(
		"   3. OR update nameGenerator to use the same order as hardcoded pattern",
	);
	console.log("");
	console.log("🔍 MISSING TEMPLATE FILES:");
	const totalMissing = templateCalls.reduce((acc, call) => {
		const allCombinations = generateAllCombinations(call.usedOptions);
		return (
			acc +
			allCombinations.filter((combo) => {
				const templateName =
					call.type === "nameGenerator"
						? nameGenerator(call.basename, combo)
						: hardcodedGenerator(call.basename, combo);
				const templateDir = path.join(
					path.resolve("src/templates/extras"),
					call.templatePath.replace(/["']/g, ""),
					call.basename,
				);
				const fullTemplatePath = path.join(templateDir, templateName);
				return !require("fs-extra").pathExistsSync(fullTemplatePath);
			}).length
		);
	}, 0);
	console.log(`   Total missing template files: ${totalMissing}`);

	console.log("");
	console.log("🛠  COMMANDS TO CREATE MISSING FILES:");

	for (const call of templateCalls) {
		const allCombinations = generateAllCombinations(call.usedOptions);
		const templateDir = path.join(
			path.resolve("src/templates/extras"),
			call.templatePath.replace(/["']/g, ""),
			call.basename,
		);

		const missingFiles: string[] = [];

		for (const combination of allCombinations) {
			const templateName =
				call.type === "nameGenerator"
					? nameGenerator(call.basename, combination)
					: hardcodedGenerator(call.basename, combination);
			const fullTemplatePath = path.join(templateDir, templateName);

			const exists = require("fs-extra").pathExistsSync(fullTemplatePath);
			if (!exists) {
				missingFiles.push(`touch "${fullTemplatePath}"`);
			}
		}

		if (missingFiles.length > 0) {
			console.log(`   # Missing files for ${call.basename} (${call.type}):`);
			for (const cmd of missingFiles) {
				console.log(`   ${cmd}`);
			}
			console.log("");
		}
	}
}

// Run the analysis
checkTemplateFiles().catch(console.error);
