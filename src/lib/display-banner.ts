import { consola } from "consola";
import pc from "picocolors";

export function displayBanner() {
	const text = `
  _     _
 | |   | |
 | |__ | |____   ___ __
 | '_ \\| '_ \\ \\ / / '__|
 | |_) | | | \\ V /| |
 |_.__/|_| |_|\\_/ |_|
`;

	console.log("\n");
	console.log(pc.yellowBright(text));

	consola.info(`${pc.cyan("🦫 Lets build 🦫")}`);
	consola.info(`${pc.blue("https://github.com/stevedylandev/bhvr")}\n`);
}
