import { useState } from "react";
import beaver from "../assets/beaver.svg";
import type { ApiResponse } from "shared";
import "../App.css";
import ClientOnly from "./ClientOnly";

const SERVER_URL = import.meta.env.DEV ? "http://localhost:3000" : "/api";

function Home() {
	const [data, setData] = useState<ApiResponse | undefined>();

	async function sendRequest() {
		try {
			const req = await fetch(`${SERVER_URL}/hello`);
			const res: ApiResponse = await req.json();
			setData(res);
		} catch (error) {
			console.log(error);
		}
	}

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
			<ClientOnly>
				<div className="card">
					<div className="button-container">
						<button type="button" onClick={sendRequest}>
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
					{data && (
						<pre className="response">
							<code>
								Message: {data.message} <br />
								Success: {data.success.toString()}
							</code>
						</pre>
					)}
				</div>
			</ClientOnly>
		</>
	);
}

export default Home;
