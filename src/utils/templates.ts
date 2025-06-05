import type { TemplateInfo } from "../types";

export const TEMPLATES: Record<string, TemplateInfo> = {
	default: {
		branch: "main",
		description: "Next.js with MongoDB and Mongoose",
	},
	tailwind: { 
		branch: "tailwindcss", 
		description: "Next.js + TailwindCSS + MongoDB" 
	},
	shadcn: {
		branch: "shadcn-ui",
		description: "Next.js + TailwindCSS + shadcn/ui + MongoDB",
	},
};

// MongoDB connection template
export const mongodbTemplate = `import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;`;

// Example model template
export const exampleModelTemplate = `import mongoose from 'mongoose';

const ExampleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this example.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description for this example.'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Example || mongoose.model('Example', ExampleSchema);`;

// Example API route template
export const exampleApiTemplate = `import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Example from '@/models/Example';

export async function GET() {
  try {
    await connectDB();
    const examples = await Example.find({});
    return NextResponse.json(examples);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch examples' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const example = await Example.create(body);
    return NextResponse.json(example, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create example' }, { status: 500 });
  }
}`;

// Example page template
export const examplePageTemplate = `import { useState, useEffect } from 'react';

export default function Home() {
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExamples = async () => {
      try {
        const response = await fetch('/api/examples');
        const data = await response.json();
        setExamples(data);
      } catch (error) {
        console.error('Error fetching examples:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamples();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Examples</h1>
      <div className="grid gap-4">
        {examples.map((example: any) => (
          <div key={example._id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{example.name}</h2>
            <p className="text-gray-600">{example.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`;

// Environment variables template
export const envTemplate = `MONGODB_URI=mongodb://localhost:27017/myapp
NEXT_PUBLIC_API_URL=http://localhost:3000/api`;

// Package.json template
export const packageJsonTemplate = `{
  "name": "comet-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "bun run next dev",
    "build": "bun run next build",
    "start": "bun run next start",
    "lint": "bun run next lint"
  },
  "dependencies": {
    "next": "latest",
    "react": "latest",
    "react-dom": "latest",
    "mongoose": "latest",
    "typescript": "latest",
    "@types/react": "latest",
    "@types/node": "latest",
    "@types/mongoose": "latest"
  },
  "devDependencies": {
    "eslint": "latest",
    "eslint-config-next": "latest"
  }
}`;
