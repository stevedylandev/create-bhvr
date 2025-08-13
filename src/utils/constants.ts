import { fileURLToPath } from "node:url";
import path from "node:path";

export const DEFAULT_REPO = "stevedylandev/bhvr";

// Resolve EXTRAS_DIR relative to this file's location
// We need to handle both development and production cases:
// - Development: running from src/ directory
// - Production: bundled into dist/index.js
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if we're running from source or built version
// In development, __dirname will contain 'src', in production it won't
const isProduction = !__dirname.includes(path.sep + "src" + path.sep);
const templatesPath = isProduction
	? path.resolve(__dirname, "templates", "extras") // dist/index.js -> dist/templates/extras
	: path.resolve(__dirname, "..", "templates", "extras"); // src/utils -> src/templates/extras

export const EXTRAS_DIR = templatesPath;
