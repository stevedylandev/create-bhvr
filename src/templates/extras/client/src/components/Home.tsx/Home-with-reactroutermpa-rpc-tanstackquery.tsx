import { useState } from "react";
import beaver from "../assets/beaver.svg";
import { hcWithType } from "server/dist/client";
import { useMutation } from "@tanstack/react-query";
import "../App.css";
import ClientOnly from "./ClientOnly";

const SERVER_URL = import.meta.env.DEV ? "http://localhost:3000" : "/api";

const client = hcWithType(SERVER_URL);

type ResponseType = Awaited<ReturnType<typeof client.hello.$get>>;

function Home() {
	const [data, setData] = useState<
		Awaited<ReturnType<ResponseType["json"]>> | undefined
	>();

	const { mutate: sendRequest } = useMutation({
		mutationFn: async () => {
			try {
				const res = await client.hello.$get();
				if (!res.ok) {
					console.log("Error fetching data");
					return;
				}
				const data = await res.json();
				setData(data);
			} catch (error) {
				console.log(error);
			}
		},
	});

	return (
		<div
			style={{
				maxWidth: "1280px",
				margin: "0 auto",
				padding: "2rem",
				textAlign: "center",
			}}
		>
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
						<button type="button" onClick={() => sendRequest()}>
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
		</div>
	);
}

export default Home;
