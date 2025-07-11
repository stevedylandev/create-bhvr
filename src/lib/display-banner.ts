import { consola } from "consola";
import figlet from "figlet";
import pc from "picocolors";

export function displayBanner() {
  const text = figlet.textSync("bhvr", {
    font: "Big",
    horizontalLayout: "default",
    verticalLayout: "default",
    width: 80,
    whitespaceBreak: true,
  });

  console.log("\n");
  console.log(pc.yellowBright(text));

  consola.info(`${pc.cyan("🦫 Lets build 🦫")}`);
  consola.info(`${pc.blue("https://github.com/stevedylandev/bhvr")}\n`);
}
