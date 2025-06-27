import type { TemplateInfo } from "../types";

export const TEMPLATES: Record<string, TemplateInfo> = {
	default: {
		branch: "main",
		description: "Basic setup with Bun, Hono, Vite and React",
	},
	tailwind: { branch: "tailwindcss", description: "Basic setup + TailwindCSS" },
	shadcn: {
		branch: "shadcn-ui",
		description: "Basic setup + TailwindCSS + shadcn/ui",
	},
};

export const honoRpcTemplate = `import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ApiResponse } from "shared/dist";

export const app = new Hono()

.use(cors())

.get("/", (c) => {
	return c.text("Hello Hono!");
})

.get("/hello", async (c) => {
	const data: ApiResponse = {
		message: "Hello BHVR!",
		success: true,
	};

	return c.json(data, { status: 200 });
});

export default app;`;

export const honoClientTemplate = `import { hc } from "hono/client";
import type { app } from "./index";

export type AppType = typeof app;
export type Client = ReturnType<typeof hc<AppType>>;

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<AppType>(...args);`;

export const tailwindTemplate = `import { useState } from 'react'
import beaver from './assets/beaver.svg'
import { hcWithType } from 'server/dist/client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"

type ResponseType = Awaited<ReturnType<typeof client.hello.$get>>;

const client = hcWithType(SERVER_URL);

function App() {
  const [data, setData] = useState<Awaited<ReturnType<ResponseType["json"]>> | undefined>()

  async function sendRequest() {
    try {
      const res = await client.hello.$get()
      if (!res.ok) {
        console.log("Error fetching data")
        return
      }
      const data = await res.json()
      setData(data)
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

export default App`;

export const shadcnTemplate = `import { useState } from 'react'
import beaver from './assets/beaver.svg'
import { Button } from './components/ui/button'
import { hcWithType } from 'server/dist/client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"

const client = hcWithType(SERVER_URL);

type ResponseType = Awaited<ReturnType<typeof client.hello.$get>>;

function App() {
  const [data, setData] = useState<Awaited<ReturnType<ResponseType["json"]>> | undefined>()

  async function sendRequest() {
    try {
      const res = await client.hello.$get()
      if (!res.ok) {
        console.log("Error fetching data")
        return
      }
      const data = await res.json()
      setData(data)
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
        <Button
          onClick={sendRequest}
        >
          Call API
        </Button>
        <Button
          variant='secondary'
          asChild
        >
          <a target='_blank' href="https://bhvr.dev">
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
  )
}

export default App`;

export const defaultTemplate = `import { useState } from 'react'
import beaver from './assets/beaver.svg'
import { hcWithType } from 'server/dist/client'
import './App.css'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"

const client = hcWithType(SERVER_URL);

type ResponseType = Awaited<ReturnType<typeof client.hello.$get>>;

function App() {
  const [data, setData] = useState<Awaited<ReturnType<ResponseType["json"]>> | undefined>()

  async function sendRequest() {
    try {
      const res = await client.hello.$get()
      if (!res.ok) {
        console.log("Error fetching data")
        return
      }
      const data = await res.json()
      setData(data)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <div>
        <a href="https://github.com/stevedylandev/bhvr" target="_blank">
          <img src={beaver} className="logo" alt="beaver logo" />
        </a>
      </div>
      <h1>bhvr</h1>
      <h2>Bun + Hono + Vite + React</h2>
      <p>A typesafe fullstack monorepo</p>
      <div className="card">
        <div className='button-container'>
          <button onClick={sendRequest}>
            Call API
          </button>
          <a className='docs-link' target='_blank' href="https://bhvr.dev">Docs</a>
        </div>
        {data && (
          <pre className='response'>
            <code>
            Message: {data.message} <br />
            Success: {data.success.toString()}
            </code>
          </pre>
        )}
      </div>
    </>
  )
}

export default App`;

export const defaultTemplateWithQuery = `import { useQuery } from '@tanstack/react-query'
import beaver from './assets/beaver.svg'
import { hcWithType } from 'server/dist/client'
import './App.css'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"

const client = hcWithType(SERVER_URL);

function App() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['hello'],
    queryFn: async () => {
      const res = await client.hello.$get()
      if (!res.ok) {
        throw new Error('Failed to fetch data')
      }
      return res.json()
    },
    enabled: false, // Don't fetch on mount, only when button is clicked
  })

  return (
    <>
      <div>
        <a href="https://github.com/stevedylandev/bhvr" target="_blank">
          <img src={beaver} className="logo" alt="beaver logo" />
        </a>
      </div>
      <h1>bhvr</h1>
      <h2>Bun + Hono + Vite + React</h2>
      <p>A typesafe fullstack monorepo with TanStack Query</p>
      <p className="text-sm text-gray-600">💡 Open React Query DevTools (bottom-left) to inspect queries</p>
      <div className="card">
        <div className='button-container'>
          <button onClick={() => refetch()} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Call API'}
          </button>
          <a className='docs-link' target='_blank' href="https://tanstack.com/query/latest/docs/framework/react/overview">
            TanStack Query Docs
          </a>
        </div>
        {error && (
          <pre className='response error'>
            <code>Error: {error.message}</code>
          </pre>
        )}
        {data && (
          <pre className='response'>
            <code>
            Message: {data.message} <br />
            Success: {data.success.toString()}
            </code>
          </pre>
        )}
      </div>
    </>
  )
}

export default App`;

export const tailwindTemplateWithQuery = `import { useQuery } from '@tanstack/react-query'
import beaver from './assets/beaver.svg'
import { hcWithType } from 'server/dist/client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"

const client = hcWithType(SERVER_URL);

function App() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['hello'],
    queryFn: async () => {
      const res = await client.hello.$get()
      if (!res.ok) {
        throw new Error('Failed to fetch data')
      }
      return res.json()
    },
    enabled: false, // Don't fetch on mount, only when button is clicked
  })

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
      <p>A typesafe fullstack monorepo with TanStack Query</p>
      <p className="text-sm text-gray-500">💡 Open React Query DevTools (bottom-left) to inspect queries</p>
      <div className='flex items-center gap-4'>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="bg-black text-white px-2.5 py-1.5 rounded-md disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Call API'}
        </button>
        <a target='_blank' href="https://tanstack.com/query/latest/docs/framework/react/overview" className='border-1 border-black text-black px-2.5 py-1.5 rounded-md'>
          TanStack Query Docs
        </a>
      </div>
      {error && (
        <pre className="bg-red-100 p-4 rounded-md border border-red-200">
          <code>Error: {error.message}</code>
        </pre>
      )}
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

export default App`;

export const shadcnTemplateWithQuery = `import { useQuery } from '@tanstack/react-query'
import beaver from './assets/beaver.svg'
import { Button } from './components/ui/button'
import { hcWithType } from 'server/dist/client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"

const client = hcWithType(SERVER_URL);

function App() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['hello'],
    queryFn: async () => {
      const res = await client.hello.$get()
      if (!res.ok) {
        throw new Error('Failed to fetch data')
      }
      return res.json()
    },
    enabled: false, // Don't fetch on mount, only when button is clicked
  })

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
      <p>A typesafe fullstack monorepo with TanStack Query</p>
      <p className="text-sm text-gray-500">💡 Open React Query DevTools (bottom-left) to inspect queries</p>
      <div className='flex items-center gap-4'>
        <Button 
          onClick={() => refetch()}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Call API'}
        </Button>
        <Button 
          variant="outline"
          asChild
        >
          <a target='_blank' href="https://tanstack.com/query/latest/docs/framework/react/overview">
          TanStack Query Docs
          </a>
        </Button>
      </div>
      {error && (
        <pre className="bg-red-100 p-4 rounded-md border border-red-200">
          <code>Error: {error.message}</code>
        </pre>
      )}
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

export default App`;
