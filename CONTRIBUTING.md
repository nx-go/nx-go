# Contributing to nx-go

First off, thank you for considering contributing to nx-go! 🎉

It's people like you that make nx-go such a great tool. We welcome contributions from everyone, whether you're fixing a bug, implementing a new feature, improving documentation, or simply reporting an issue.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Style and Linting](#code-style-and-linting)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

Contributions are made to this repo via Issues and Pull Requests (PRs). A few general guidelines:

- Search for existing Issues and PRs before creating your own
- We work hard to make sure issues are handled in a timely manner but, depending on the impact, it could take a while to investigate the root cause
- If you've never contributed before, see [this guide](https://opensource.guide/how-to-contribute/) for getting started

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (LTS version recommended)
- **pnpm** as the project uses it as the package manager
- **Go** (stable version from [go.dev/dl](https://go.dev/dl/))
- **Git** for version control

## Project Structure

The nx-go repository is an Nx monorepo with the following structure:

```
nx-go/
├── packages/
│   ├── nx-go/              # Main plugin package
│   │   ├── src/
│   │   │   ├── executors/  # Nx executors (build, test, serve, etc.)
│   │   │   ├── generators/ # Nx generators (application, library, etc.)
│   │   │   ├── graph/      # Nx graph plugin
│   │   │   ├── migrations/ # Plugin migrations
│   │   │   └── utils/      # Shared utilities
│   │   └── package.json
│   └── nx-go-e2e/          # E2E tests
├── docs/                   # Documentation
│   ├── executors/
│   └── generators/
├── .github/                # GitHub templates and workflows
└── package.json            # Root package configuration
```

## Development Workflow

### Building the Plugin

```bash
pnpm build
# or
nx build nx-go
```

### Running Tests

```bash
# Run unit tests
pnpm test
# or
nx test nx-go

# Run E2E tests
pnpm e2e
# or
nx e2e nx-go-e2e
```

### Linting

```bash
pnpm lint
# or
nx lint nx-go
```

### Running Affected Commands

When working on a feature, you can run commands only on affected projects:

```bash
nx affected:test
nx affected:lint
nx affected:build
```

## Testing

### Unit Tests

- Write unit tests for all new functionality
- Place test files next to the source files with `.spec.ts` extension
- Use Jest for testing
- Aim for high code coverage, especially for critical paths

### E2E Tests

- E2E tests are located in `packages/nx-go-e2e/`
- These tests create actual Nx workspaces and run commands
- Add E2E tests for new executors and generators
- E2E tests take longer to run, so be mindful of test time

### Code Coverage

We use SonarCloud to track code quality and coverage. Ensure your changes maintain or improve the current coverage levels.

## Code Style and Linting

This project uses:

- **ESLint** for linting
- **Prettier** for code formatting
- **TypeScript** with strict type checking

### Guidelines

- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Use TypeScript types properly - avoid `any` when possible

### Running the Linter

```bash
nx lint nx-go
```

The linter runs automatically on `git commit` via Husky hooks.

## Commit Guidelines

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files

### Examples

```bash
feat(executor): add serve-air executor for live reload
fix(generator): correct import paths in library templates
docs(readme): update installation instructions
test(build): add tests for build executor options
```

## Pull Request Process

1. **Update your branch** with the latest changes from upstream:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Ensure all tests pass**:

   ```bash
   nx affected:test --base=upstream/main
   nx affected:lint --base=upstream/main
   ```

3. **Push your changes** to your fork:

   ```bash
   git push origin feat/my-new-feature
   ```

4. **Open a Pull Request** on GitHub using the [PR template](.github/PULL_REQUEST_TEMPLATE.md)

5. **Fill out the PR template** completely:

   - Provide a clear description of your changes
   - Link to related issues (e.g., "Fixes #123")
   - Check all applicable items in the checklist
   - Note any breaking changes
   - Add screenshots or examples if applicable

6. **Respond to review feedback** promptly and make requested changes

7. **Ensure CI passes** - All tests and checks must pass before merging

### PR Guidelines

- Keep PRs focused on a single concern
- Break large changes into smaller, reviewable PRs when possible
- Update documentation for any user-facing changes
- Add tests for new functionality
- Follow the code style of the project
- Write clear, descriptive commit messages

## Reporting Issues

### Bug Reports

Use the [bug report template](.github/ISSUE_TEMPLATE/bug-report.yml) and include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Your environment (OS, Node version, Go version, Nx version)
- Relevant logs or error messages
- Minimal reproduction repository if possible

### Feature Requests

Use the [feature request template](.github/ISSUE_TEMPLATE/feature-request.yml) and include:

- A clear description of the feature
- The problem it solves
- Potential implementation ideas (optional)
- Examples from other tools (if applicable)

### Security Issues

Please refer to our [Security Policy](SECURITY.md) for reporting security vulnerabilities.

## Documentation

Good documentation is crucial for the project's success.

### When to Update Documentation

- When adding a new executor or generator
- When changing existing functionality
- When adding new configuration options
- When fixing bugs that affect documented behavior

### Documentation Locations

- **README.md**: High-level overview and getting started
- **docs/executors/**: Executor documentation
- **docs/generators/**: Generator documentation
- **docs/options.md**: Plugin configuration options
- **Code comments**: For complex logic or public APIs

### Documentation Style

- Use clear, concise language
- Provide code examples
- Include expected inputs and outputs
- Document all options and parameters
- Keep examples up-to-date with the code

## Community

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For Q&A and general discussion
- **Pull Requests**: For code contributions

## Questions?

Don't hesitate to ask questions by:

- Opening a GitHub Discussion
- Commenting on an existing issue
- Reaching out to the maintainers

Thank you for contributing to nx-go! 🚀
