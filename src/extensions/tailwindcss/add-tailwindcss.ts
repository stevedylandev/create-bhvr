import path from "node:path";
import { consola } from "consola";
import { execa } from "execa";
import fs from "fs-extra";
import pc from "picocolors";
import yoctoSpinner from "yocto-spinner";

export async function addTailwindcss(projectPath: string): Promise<void> {
	const spinner = yoctoSpinner({
		text: "Setting up TailwindCSS v4...",
	}).start();
	try {
		const clientPath = path.join(projectPath, "client");

		// Install TailwindCSS dependencies
		spinner.text = "Installing TailwindCSS dependencies...";
		await execa("bun", ["add", "-D", "tailwindcss", "@tailwindcss/vite"], {
			cwd: clientPath,
		});

		// Update vite.config.ts
		spinner.text = "Updating vite.config.ts...";
		const viteConfigPath = path.join(clientPath, "vite.config.ts");
		const viteConfig = await fs.readFile(viteConfigPath, "utf-8");
		const newViteConfig = viteConfig
			.replace(
				`import { defineConfig } from "vite"`,
				`import { defineConfig } from "vite";\nimport tailwindcss from "@tailwindcss/vite";`,
			)
			.replace("plugins: [", "plugins: [tailwindcss(),");

		await fs.writeFile(viteConfigPath, newViteConfig);

		// Update index.css
		spinner.text = "Updating index.css...";
		const globalsCssPath = path.join(clientPath, "src", "index.css");
		const globalsCss = `@import "tailwindcss";`;
		await fs.writeFile(globalsCssPath, globalsCss);

		spinner.text = "Removing CSS classes";
		const appCssPath = path.join(clientPath, "src", "App.css");

		try {
			await fs.access(appCssPath);
			await fs.unlink(appCssPath);
		} catch (error) {
			if (error.code !== "ENOENT") {
				// File doesn't exist, which is fine
				consola.error(
					new Error("App.css not found (already removed or doesn't exist)"),
				);
			} else {
				process.exit(1);
			}
		}

		// Update App.tsx with TailwindCSS classes
		spinner.text = "Updating App.tsx...";
		const appTsxPath = path.join(clientPath, "src", "App.tsx");
		const appTsxContent = `import { useState } from 'react'
import beaver from './assets/beaver.svg'
import { ApiResponse } from 'shared'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"

function App() {
  const [data, setData] = useState<ApiResponse | undefined>()

  async function sendRequest() {
    try {
      const req = await fetch(\`\${SERVER_URL}/hello\`)
      const res: ApiResponse = await req.json()
      setData(res)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6 items-center justify-center min-h-screen">
      <a href="https://github.com/stevedylandev/bhvr" target="_blank">
        <img
          src={beaver}
          className="w-16 h-16 cursor-pointer"
          alt="beaver logo"
        />
      </a>
      <h1 className="text-5xl font-black">bhvr</h1>
      <h2 className="text-2xl font-bold">Bun + Hono + Vite + React</h2>
      <p>A typesafe fullstack monorepo</p>
      <div className='flex items-center gap-4'>
        <button
          onClick={sendRequest}
          className="bg-black text-white px-2.5 py-1.5 rounded-md"
        >
          Call API
        </button>
        <a target='_blank' href="https://bhvr.dev" className='border-1 border-black text-black px-2.5 py-1.5 rounded-md'>
          Docs
        </a>
      </div>
        {data && (
          <pre className="bg-gray-100 p-4 rounded-md">
            <code>
            Message: {data.message} <br />
            Success: {data.success.toString()}
            </code>
          </pre>
        )}
    </div>
  )
}

export default App
`;

		await fs.writeFile(appTsxPath, appTsxContent);

		spinner.success("TailwindCSS v4 setup complete.");
	} catch (error) {
		spinner.error("TailwindCSS v4 setup failed.");
		if (error instanceof Error) {
			console.error(pc.red("\nError:"), error.message);
		} else {
			console.error(
				pc.red("\nError: Unknown error during TailwindCSS v4 setup."),
			);
		}
	}
}
