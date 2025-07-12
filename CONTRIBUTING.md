# Contributing to create-bhvr

First off, thank you for considering contributing to `create-bhvr`.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please make sure the bug has not already been reported by searching on GitHub under [Issues](https://github.com/stevedylandev/bhvr/issues). If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/stevedylandev/bhvr/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample** or an **executable test case** demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

If you have an idea for an enhancement, please make sure the enhancement has not already been suggested by searching on GitHub under [Issues](https://github.com/stevedylandev/bhvr/issues). If you're unable to find an open issue addressing the suggestion, [open a new one](https://github.com/stevedylandev/bhvr/issues/new). Be sure to include a **title and clear description** of the enhancement you're suggesting.

### Submitting a Pull Request

1.  Fork the repository and create your branch from `main`.
2.  Run `bun install` to install the dependencies.
3.  Make your changes.
4.  Run `bun run build` to make sure your changes build correctly.
5.  Issue that pull request!

### Creating and Contributing Extensions

`create-bhvr` supports a modular extension system, allowing you to easily add new functionalities or integrations. To create and contribute a new extension, follow these steps:

1.  **Create a New Extension Directory**: Inside `src/extensions/`, create a new directory for your extension (e.g., `your-extension-name`). Use kebab-case for the directory name.
2.  **Define the Extension**: Inside your new directory, create an `index.ts` file. This file will define your extension's metadata and link to its `add` and `remove` functions. The `id` property should match your directory name.

    ```typescript
    // src/extensions/your-extension-name/index.ts
    import type { Extension } from "@/types";
    import { addYourExtension } from "./add-your-extension";
    import { removeYourExtension } from "./remove-your-extension";

    export const yourExtensionNameExtension: Extension = {
        id: "your-extension-name",
        name: "Your Extension Name",
        description: "A brief description of what your extension does.",
        version: "0.3.12", // Should match the current create-bhvr version
        add: addYourExtension,
        remove: removeYourExtension,
        tag: "extra", // or "linter", "styling" based on its purpose
        // conflicts?: Extension["id"][];
        // dependsOn?: Extension[];
    };
    ```

3.  **Implement `add` Functionality**: Create an `add-your-extension.ts` file in your extension's directory. This function will contain the logic to integrate your extension into a new project.

    ```typescript
    // src/extensions/your-extension-name/add-your-extension.ts
    import pc from "picocolors";
    import yoctoSpinner from "yocto-spinner";

    export async function addYourExtension(projectPath: string): Promise<void> {
        const spinner = yoctoSpinner({ text: "Setting up Your Extension..." }).start();
        try {
            // Your logic to add files, modify package.json, install dependencies, etc.
            // Example: await fs.copy(templatePath, projectPath);
            // Example: await execa("bun", ["add", "your-package"], { cwd: projectPath });
            spinner.success("Your Extension setup complete.");
        } catch (error) {
            spinner.error("Your Extension setup failed.");
            if (error instanceof Error) {
                console.error(pc.red("\nError:"), error.message);
            } else {
                console.error(pc.red("\nError: Unknown error during Your Extension setup."));
            }
        }
    }
    ```

4.  **Implement `remove` Functionality**: Create a `remove-your-extension.ts` file. This function should contain the logic to revert the changes made by the `add` function in case of conflicts with other extensions.

    ```typescript
    // src/extensions/your-extension-name/remove-your-extension.ts
    import pc from "picocolors";
    import yoctoSpinner from "yocto-spinner";

    export async function removeYourExtension(projectPath: string): Promise<void> {
        const spinner = yoctoSpinner({ text: "Removing Your Extension..." }).start();
        try {
            // Your logic to remove files, revert package.json changes, etc.
            spinner.success("Your Extension removal complete.");
        } catch (error) {
            spinner.error("Your Extension removal failed.");
            if (error instanceof Error) {
                console.error(pc.red("\nError:"), error.message);
            }
        } else {
                console.error(pc.red("\nError: Unknown error during Your Extension removal."));
            }
        }
    }
    ```

5.  **Automated Discovery**: New extensions are automatically discovered by `create-bhvr` based on their directory structure and the `export const [yourExtensionName]Extension` pattern in their `index.ts` file. You do not need to manually register them in `src/extensions/index.ts`.

6.  **Testing Your Extension**: Before submitting a pull request, thoroughly test your extension by running `create-bhvr` with your new extension enabled. Ensure it integrates correctly and doesn't cause any issues.

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
