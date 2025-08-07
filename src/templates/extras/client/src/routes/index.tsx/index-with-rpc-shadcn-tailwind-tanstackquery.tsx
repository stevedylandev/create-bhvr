import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import beaver from "@/assets/beaver.svg";
import { Button } from "@/components/ui/button";
import { hcWithType } from "server/dist/client";
import { useMutation } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
	component: Index,
});

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

const client = hcWithType(SERVER_URL);

type ResponseType = Awaited<ReturnType<typeof client.hello.$get>>;

function Index() {
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
				<Button onClick={() => sendRequest()}>Call API</Button>
				<Button variant="secondary" asChild>
					<a target="_blank" href="https://bhvr.dev" rel="noopener">
						Docs
					</a>
				</Button>
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
	);
}

export default Index;
