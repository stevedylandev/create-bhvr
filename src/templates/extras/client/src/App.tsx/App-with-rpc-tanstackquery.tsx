import { useMutation } from "@tanstack/react-query";
import { hcWithType } from "server/client";
import beaver from "./assets/beaver.svg";
import "./App.css";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

const client = hcWithType(SERVER_URL);

type ResponseType = Awaited<ReturnType<typeof client.hello.$get>>;

function App() {
	const apiRequestMutation = useMutation({
		mutationFn: async () => {
			const res = await client.hello.$get();
			if (!res.ok) {
				throw new Error("Error fetching data");
			}
			const data = await res.json();
			return data;
		},
		onError: (err: any) => console.log(err),
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
