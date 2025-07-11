# create-bhvr 🦫

![cover](https://cdn.stevedylan.dev/ipfs/bafybeievx27ar5qfqyqyud7kemnb5n2p4rzt2matogi6qttwkpxonqhra4)

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/stevedylandev/create-bhvr/blob/main/LICENSE)
![create-bhvr version](https://img.shields.io/npm/v/create-bhvr.svg?label=%20)

A command-line interface (CLI) to quickly scaffold a new `bhvr` project. `bhvr` is a full-stack TypeScript monorepo starter with shared types, using Bun, Hono, Vite, and React.

## Getting Started

To create a new `bhvr` project, run any of the following commands and follow the interactive prompts:

```bash
# Using Bun
bun create bhvr@latest my-bhvr-app
```

This will create a new directory called `my-bhvr-app` inside the current folder.

## Features

- **Interactive Setup**: A simple and fast interactive CLI to guide you through project setup.
- **Multiple Templates**: Choose from several templates to get started:
    - `default`: A basic setup with Bun, Hono, Vite, and React.
    - `tailwind`: Includes Tailwind CSS for styling.
    - `shadcn`: Pre-configured with Tailwind CSS and shadcn/ui.
- **Optional RPC**: Automatically configure Hono RPC for end-to-end type-safe API communication.
- **Linter Choice**: Choose between ESLint (default) or Biome for code linting and formatting.
- **Automated Setup**: Handles `git` initialization and dependency installation for you.

## Command-Line Options

You can also use command-line options to skip the interactive prompts:

| Option                  | Description                                            | Default   |
| ----------------------- | ------------------------------------------------------ | --------- |
| `[project-directory]`   | The name of the directory to create the project in.    | -         |
| `-y, --yes`             | Skip all confirmation prompts and use default values.  | `false`   |
| `--template <template>` | Specify a template (`default`, `tailwind`, `shadcn`).  | `default` |
| `--rpc`                 | Use Hono RPC for type-safe API communication.          | `false`   |
| `--linter <linter>`     | Specify the linter to use (`eslint` or `biome`).       | `eslint`  |
| `--branch <branch>`     | Specify a branch to use from the repository.           | `main`    |

## Contributing

We welcome contributions from the community! Whether it's reporting a bug, suggesting a new feature, or submitting a pull request, your help is appreciated.

Please read our [**CONTRIBUTING.md**](CONTRIBUTING.md) for detailed guidelines on how to get started.

## Links

- [License (MIT)](LICENSE)
- [Contributing](CONTRIBUTING.md)
- [Website](https://bhvr.dev)
