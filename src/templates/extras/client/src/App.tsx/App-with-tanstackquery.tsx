import beaver from "./assets/beaver.svg";
import { useMutation } from "@tanstack/react-query";
import type { ApiResponse } from "shared";
import "./App.css";

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
		<>
			<div>
				<a
					href="https://github.com/stevedylandev/bhvr"
					target="_blank"
					rel="noopener"
				>
					<img src={beaver} className="logo" alt="beaver logo" />
				</a>
			</div>
			<h1>bhvr</h1>
			<h2>Bun + Hono + Vite + React</h2>
			<p>A typesafe fullstack monorepo</p>
			<div className="card">
				<div className="button-container">
					<button type="button" onClick={() => apiRequestMutation.mutate()}>
						Call API
					</button>
					<a
						className="docs-link"
						target="_blank"
						href="https://bhvr.dev"
						rel="noopener"
					>
						Docs
					</a>
				</div>
				{apiRequestMutation.isSuccess && (
					<pre className="response">
						<code>
							Message: {apiRequestMutation.data.message} <br />
							Success: {apiRequestMutation.data.success.toString()}
						</code>
					</pre>
				)}
			</div>
		</>
	);
}

export default App;
