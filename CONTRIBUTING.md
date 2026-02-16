# Contributing to create-bhvr

First off, thank you for considering contributing to `create-bhvr`.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please make sure the bug has not already been reported by searching on GitHub under [Issues](https://github.com/stevedylandev/bhvr/issues). If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/stevedylandev/bhvr/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample** or an **executable test case** demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

If you have an idea for an enhancement, please make sure the enhancement has not already been suggested by searching on GitHub under [Issues](https://github.com/stevedylandev/bhvr/issues). If you're unable to find an open issue addressing the suggestion, [open a new one](https://github.com/stevedylandev/bhvr/issues/new). Be sure to include a **title and clear description** of the enhancement you're suggesting.

### Submitting a Pull Request

**Important:** Before starting work on a pull request, you must first [open an issue](https://github.com/stevedylandev/bhvr/issues/new) describing your proposed change and wait for it to be reviewed and approved. PRs without a corresponding approved issue will be closed.

1.  Fork the repository and create your branch from `main`.
2.  Run `bun install` to install the dependencies.
3.  Make your changes.
4.  Run `bun run build` to make sure your changes build correctly.
5.  Use `bun dist` to run the CLI and test your new changes.
6.  Use `bun lint` and `bun format` to apply Biome formatting and lint checking.
7.  Use `bun test` to run unit tests. Depending on your PR consider adding tests.
8.  Issue that pull request!

## Repo Structure

`create-bhvr` is a CLI tool that generates full-stack TypeScript projects using the Bun + Hono + Vite + React (BHVR) stack. The tool scaffolds projects from GitHub templates and allows users to add various extensions like TanStack Query, React Router, and more.

### Project Architecture

```
src/
├── commands/           # CLI command handlers
│   └── create.ts      # Main create command implementation
├── installers/        # Extension installers
│   ├── react-router.ts      # React Router setup
│   ├── rpc.ts              # RPC integration
│   ├── tanstack-query.ts   # TanStack Query setup
│   └── tanstack-router.ts  # TanStack Router setup
├── lib/               # Core functionality
│   ├── create-project.ts    # Main project creation orchestrator
│   ├── scaffold-template.ts # Template downloading and setup
│   ├── install-dependencies.ts
│   ├── prompt-for-options.ts
│   └── ...
├── templates/extras/  # Template variations for extensions
│   └── client/
│       ├── src/App.tsx/     # App.tsx variants for different combinations
│       ├── src/main.tsx/    # Entry point variants
│       ├── src/components/  # Component variants
│       └── vite.config.ts/  # Vite config variants
├── utils/             # Utility functions
│   ├── name-generator.ts    # Generates template file names
│   ├── templates.ts         # Template configurations
│   └── constants.ts
└── types.ts           # TypeScript definitions
```

### How Extensions Work

Extensions in create-bhvr follow a modular architecture where each extension has:

1. **An Installer** (`src/installers/*.ts`) that handles:
   - Adding dependencies via `addPackageDependency()`
   - Copying appropriate template files using the `nameGenerator()` utility
   - Managing configuration changes

2. **Template variants** (`src/templates/extras/`) that provide:
   - Pre-configured code for different extension combinations
   - File variants named using a convention like `App-with-rpc-tailwind-tanstackquery.tsx`
   - Smart file selection based on enabled options

#### Adding New Extensions

To add a new extension (e.g., "myextension"):

1. **Create the installer** (`src/installers/myextension.ts`):
   ```typescript
   export const myExtensionInstaller = async (options: Required<ProjectOptions>) => {
     // Install dependencies
     await addPackageDependency({
       dependencies: ["my-package"],
       target: "client",
       projectName: options.projectName,
     });

     // Copy appropriate template files
     const selectedTemplate = nameGenerator("App.tsx", {
       myExtension: options.myExtension,
       // ... other options
     });
   };
   ```

2. **Add template variants** in `src/templates/extras/client/src/`:
   - Create files like `App-with-myextension.tsx`
   - Support all possible combinations like `App-with-myextension-tailwind.tsx`

3. **Update types** (`src/types.ts`):
   ```typescript
   export type ProjectOptions = {
     // ... existing options
     myExtension?: boolean;
   };
   ```

4. **Update the name generator logic** (`src/utils/name-generator.ts`) if needed for special naming rules.

#### Template File Naming Convention

The `nameGenerator()` utility creates file names based on enabled options:
- Base file: `App.tsx`
- With TanStack Query: `App-with-tanstackquery.tsx`
- Multiple extensions: `App-with-rpc-tailwind-tanstackquery.tsx`

Options are sorted alphabetically to ensure consistent naming.

#### Updating GitHub Actions

To make sure your new addition to extensions work, please add your combination to `.github/workflows/test-cli-options.yml` to make sure it does not break other builds. In order to do this you need to add your combination to the matrix and make sure a flag is included in `src/index.ts`.

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
