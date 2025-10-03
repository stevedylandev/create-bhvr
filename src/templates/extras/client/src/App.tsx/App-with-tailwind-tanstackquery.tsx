import beaver from "./assets/beaver.svg";
import type { ApiResponse } from "shared";
import { useMutation } from "@tanstack/react-query";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

function App() {
	const apiRequestMutation = useMutation({
		mutationFn: async () => {
			const req = await fetch(`${SERVER_URL}/hello`);
			const res: ApiResponse = await req.json();
			return res;
		},
		onError: (err) => console.log(err),
	});

	return (
		<div className="max-w-xl mx-auto flex flex-col gap-6 items-center justify-center min-h-screen">
			<a
				href="https://github.com/stevedylandev/bhvr"
				target="_blank"
				rel="noopener"
			>
				<img
					src={beaver}
					className="w-16 h-16 cursor-pointer"
					alt="beaver logo"
				/>
			</a>
			<h1 className="text-5xl font-black">bhvr</h1>
			<h2 className="text-2xl font-bold">Bun + Hono + Vite + React</h2>
			<p>A typesafe fullstack monorepo</p>
			<div className="flex items-center gap-4">
				<button
					type="button"
					onClick={() => apiRequestMutation.mutate()}
					className="bg-black text-white px-2.5 py-1.5 rounded-md"
				>
					Call API
				</button>
				<a
					target="_blank"
					href="https://bhvr.dev"
					className="border-1 border-black text-black px-2.5 py-1.5 rounded-md"
					rel="noopener"
				>
					Docs
				</a>
			</div>
			{apiRequestMutation.isSuccess && (
				<pre className="bg-gray-100 p-4 rounded-md">
					<code>
						Message: {apiRequestMutation.data.message} <br />
						Success: {apiRequestMutation.data.success.toString()}
					</code>
				</pre>
			)}
		</div>
	);
}

export default App;
