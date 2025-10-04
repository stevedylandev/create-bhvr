import type { Config } from "@react-router/dev/config";

export default {
	buildDirectory: "dist",
	appDirectory: "src",
	ssr: false,
	async prerender() {
		return ["/"];
	},
} satisfies Config;
