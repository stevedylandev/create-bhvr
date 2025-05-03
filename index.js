#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import prompts from 'prompts';
import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import degit from 'degit';
import figlet from 'figlet';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GitHub repository for the template
const DEFAULT_REPO = 'stevedylandev/bhvr';

// Available templates
const TEMPLATES = {
  default: { branch: 'main', description: 'Basic setup with Bun, Hono, Vite and React' },
  tailwind: { branch: 'tailwindcss', description: 'Basic setup + TailwindCSS' },
  shadcn: { branch: 'shadcn-ui', description: 'Basic setup + TailwindCSS + shadcn/ui' }
};

// Function to display a fun banner
function displayBanner() {
  const text = figlet.textSync('bhvr', {
    font: 'Big',
    horizontalLayout: 'default',
    verticalLayout: 'default',
    width: 80,
    whitespaceBreak: true
  });

  console.log('\n');
  console.log(chalk.yellowBright(text));
  console.log(`\n${chalk.cyan('🦫 Lets build 🦫')}\n`);
  console.log(`${chalk.blue('https://github.com/stevedylandev/bhvr')}\n`);
}

// Set up the CLI program
program
  .name('create-bhvr')
  .description('Create a bhvr monorepo starter project')
  .argument('[project-directory]', 'directory to create the project in')
  .option('-y, --yes', 'skip confirmation prompts')
  .option('--ts, --typescript', 'use TypeScript (default)')
  .option('--repo <repo>', 'specify a custom GitHub repository as source', DEFAULT_REPO)
  .option('--template <template>', 'specify a template (default, tailwind, shadcn)', 'default')
  .option('--branch <branch>', 'specify a branch to use from the repository')
  .action(async (projectDirectory, options) => {
    try {
      displayBanner();
      const result = await createProject(projectDirectory, options);
      if (result) {
        console.log(chalk.green.bold('🎉 Project created successfully!'));
        console.log('\nNext steps:');

        if (!result.dependenciesInstalled) {
          console.log(chalk.cyan(`  cd ${result.projectName}`));
          console.log(chalk.cyan('  bun install'));
        } else {
          console.log(chalk.cyan(`  cd ${result.projectName}`));
        }

        console.log(chalk.cyan('  bun run dev:client   # Start the client'));
        console.log(chalk.cyan('  bun run dev:server   # Start the server in another terminal'));
        console.log(chalk.cyan('  bun run dev          # Start all'));
        process.exit(0);
      }
    } catch (err) {
      console.error(chalk.red('Error creating project:'), err);
      process.exit(1);
    }
  });

program.parse();

async function createProject(projectDirectory, options) {
  // If project directory not provided, prompt for it
  let projectName = projectDirectory;

  if (!projectName && !options.yes) {
    const response = await prompts({
      type: 'text',
      name: 'projectName',
      message: 'What is the name of your project?',
      initial: 'my-bhvr-app'
    });

    if (!response.projectName) {
      console.log(chalk.yellow('Project creation cancelled.'));
      return null;
    }

    projectName = response.projectName;
  } else if (!projectName) {
    projectName = 'my-bhvr-app';
  }

  // Template selection
  let templateChoice = options.template;

  if (!options.yes && !options.branch) {
    const templateChoices = Object.keys(TEMPLATES).map(key => ({
      title: `${key} (${TEMPLATES[key].description})`,
      value: key
    }));

    const templateResponse = await prompts({
      type: 'select',
      name: 'template',
      message: 'Select a template:',
      choices: templateChoices,
      initial: 0
    });

    if (templateResponse.template === undefined) {
      console.log(chalk.yellow('Project creation cancelled.'));
      return null;
    }

    templateChoice = templateResponse.template;
  }

  // Create the project directory
  const projectPath = path.resolve(process.cwd(), projectName);

  // Check if directory exists and is not empty
  if (fs.existsSync(projectPath)) {
    const files = fs.readdirSync(projectPath);

    if (files.length > 0 && !options.yes) {
      const { overwrite } = await prompts({
        type: 'confirm',
        name: 'overwrite',
        message: `The directory ${projectName} already exists and is not empty. Do you want to overwrite it?`,
        initial: false
      });

      if (!overwrite) {
        console.log(chalk.yellow('Project creation cancelled.'));
        return null;
      }

      // Clear directory if overwriting
      await fs.emptyDir(projectPath);
    }
  }

  // Create directory if it doesn't exist
  fs.ensureDirSync(projectPath);

  // Clone template from GitHub
  const repoPath = options.repo || DEFAULT_REPO;
  // Use provided branch, template branch, or default
  const branch = options.branch || (TEMPLATES[templateChoice] ? TEMPLATES[templateChoice].branch : 'main');
  const repoUrl = `${repoPath}#${branch}`;

  const spinner = ora('Downloading template...').start();

  try {
    const emitter = degit(repoUrl, {
      cache: false,
      force: true,
      verbose: false,
    });

    await emitter.clone(projectPath);
    spinner.succeed(`Template downloaded successfully (${templateChoice} template)`);

    // Update package.json with project name
    const pkgJsonPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
      const pkgJson = await fs.readJson(pkgJsonPath);
      pkgJson.name = projectName;
      await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 2 });
    }

    // Remove the .git directory if it exists
    const gitDir = path.join(projectPath, '.git');
    if (fs.existsSync(gitDir)) {
      await fs.remove(gitDir);
      console.log(chalk.blue('Removed .git directory'));
    }

    // Initialize git repository?
    let gitInitialized = false;

    if (!options.yes) {
      const gitResponse = await prompts({
        type: 'confirm',
        name: 'initGit',
        message: 'Initialize a git repository?',
        initial: true
      });

      if (gitResponse.initGit) {
        try {
          spinner.start('Initializing git repository...');
          await execa('git', ['init'], { cwd: projectPath });
          await execa('git', ['add', '.'], { cwd: projectPath });
          await execa('git', ['commit', '-m', 'Initial commit from create-bhvr'], { cwd: projectPath });
          spinner.succeed('Git repository initialized');
          gitInitialized = true;
        } catch (err) {
          spinner.fail('Failed to initialize git repository. Is git installed?');
          console.error(chalk.red('Git error:'), err.message);
        }
      }
    } else {
      // If using --yes, automatically initialize git
      try {
        spinner.start('Initializing git repository...');
        await execa('git', ['init'], { cwd: projectPath });
        await execa('git', ['add', '.'], { cwd: projectPath });
        await execa('git', ['commit', '-m', 'Initial commit from create-bhvr'], { cwd: projectPath });
        spinner.succeed('Git repository initialized');
        gitInitialized = true;
      } catch (err) {
        spinner.fail('Failed to initialize git repository. Is git installed?');
      }
    }

    // Install dependencies?
    let dependenciesInstalled = false;

    if (!options.yes) {
      const depsResponse = await prompts({
        type: 'confirm',
        name: 'installDeps',
        message: 'Install dependencies?',
        initial: true
      });

      if (depsResponse.installDeps) {
        spinner.start('Installing dependencies...');
        try {
          // Try with bun first
          await execa('bun', ['install'], { cwd: projectPath });
          spinner.succeed('Dependencies installed with bun');
          dependenciesInstalled = true;
        } catch (bunErr) {
          // If bun fails, try with npm
          try {
            spinner.text = 'Installing dependencies with npm...';
            await execa('npm', ['install'], { cwd: projectPath });
            spinner.succeed('Dependencies installed with npm');
            dependenciesInstalled = true;
          } catch (npmErr) {
            spinner.fail('Failed to install dependencies.');
            console.log(chalk.yellow('You can install them manually after navigating to the project directory.'));
          }
        }
      }
    } else {
      // If using --yes, automatically install dependencies
      spinner.start('Installing dependencies...');
      try {
        await execa('bun', ['install'], { cwd: projectPath });
        spinner.succeed('Dependencies installed with bun');
        dependenciesInstalled = true;
      } catch (bunErr) {
        try {
          spinner.text = 'Installing dependencies with npm...';
          await execa('npm', ['install'], { cwd: projectPath });
          spinner.succeed('Dependencies installed with npm');
          dependenciesInstalled = true;
        } catch (npmErr) {
          spinner.fail('Failed to install dependencies. You can install them manually later.');
        }
      }
    }

    return {
      projectName,
      gitInitialized,
      dependenciesInstalled,
      template: templateChoice,
    };
  } catch (err) {
    spinner.fail('Failed to download template');
    throw err;
  }
}
