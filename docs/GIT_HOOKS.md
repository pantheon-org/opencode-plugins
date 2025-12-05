# Git Hooks Setup with Lefthook

This project uses [Lefthook](https://github.com/evilmartians/lefthook) to manage Git hooks for
automated code quality checks. The hooks leverage [Nx](https://nx.dev) to run tasks efficiently on
affected packages only.

## Overview

The following hooks are configured:

### Pre-commit Hooks (Run in parallel)

- **Format**: Auto-formats affected packages using Prettier via Nx
- **Lint**: Lints and auto-fixes TypeScript/JavaScript files in affected packages using ESLint via
  Nx
- **Type-check**: Validates TypeScript types in affected packages via Nx
- **Markdown-lint**: Validates markdown files formatting

### Pre-push Hooks (Run sequentially)

- **Test**: Runs test suites on affected packages via Nx
- **Build**: Ensures affected packages build successfully via Nx
- **Lint-all**: Final comprehensive lint check on all affected packages via Nx

## How It Works

All hooks use Nx's `affected` command to intelligently run tasks only on packages that have changed.
This makes the hooks fast and efficient, especially in monorepo setups with multiple packages.

### Affected Detection

- **Pre-commit**: Compares `HEAD~1` to `HEAD` (changes in current commit)
- **Pre-push**: Compares `origin/main` to `HEAD` (all changes since main branch)

## Installation

Lefthook hooks are automatically installed when you run:

```bash
bun install
```

If you need to manually install hooks:

```bash
bun run hooks:install
```

## Available Scripts

### Root Level Scripts

All scripts use Nx to run tasks on packages:

```bash
# Run on ALL packages
bun run lint          # Run ESLint on all packages
bun run format        # Format all packages with Prettier
bun run type-check    # Type-check all packages
bun run test          # Run tests in all packages
bun run build         # Build all packages

# Run on AFFECTED packages only (faster)
bun run lint:affected       # Lint only affected packages
bun run format:affected     # Format only affected packages
bun run type-check:affected # Type-check only affected packages
bun run test:affected       # Test only affected packages
bun run build:affected      # Build only affected packages

# Hook Management
bun run hooks:install    # Install Lefthook hooks
bun run hooks:uninstall  # Uninstall Lefthook hooks
```

### Package Level Scripts

Each package (e.g., `opencode-warcraft-notification`) has its own scripts:

```bash
# From package directory
bun run lint          # Lint package files
bun run lint:fix      # Lint and fix package files
bun run format        # Format package files
bun run type-check    # Type-check package
bun run build         # Build package
```

## Skipping Hooks

### Skip All Hooks

```bash
LEFTHOOK=0 git commit -m "your message"
LEFTHOOK=0 git push
```

### Skip Specific Commands

```bash
# Skip only linting
LEFTHOOK_EXCLUDE=lint git commit -m "your message"

# Skip multiple commands
LEFTHOOK_EXCLUDE=lint,type-check git commit -m "your message"
```

### Skip in CI/CD

Lefthook automatically skips in CI environments. You can also explicitly disable:

```bash
CI=true git commit -m "your message"
```

## Configuration Files

- `eslint.config.mjs` - ESLint v9 flat config with TypeScript support
- `.prettierrc.json` - Prettier formatting rules
- `.prettierignore` - Files to exclude from formatting
- `lefthook.yml` - Lefthook hooks configuration
- `workspace.json` - Nx workspace configuration with task targets for each package

## Troubleshooting

### Hooks not running

1. Verify hooks are installed:

   ```bash
   bun run hooks:install
   ```

2. Check your `.git/hooks` directory contains Lefthook hooks

### Type check failures

If type-check fails on commit, run:

```bash
bun run type-check          # Check all packages
bun run type-check:affected # Check only affected packages
```

Fix any TypeScript errors before committing.

### Formatting issues

If formatting checks fail:

```bash
bun run format              # Format all packages
bun run format:affected     # Format only affected packages
git add .
```

### ESLint errors

For auto-fixable issues, Nx handles the linting:

```bash
bun run lint                # Lint all packages
bun run lint:affected       # Lint only affected packages
git add .
```

## Nx Integration Benefits

This setup leverages Nx's intelligent task execution:

1. **Affected Detection**: Only runs tasks on packages that have actually changed
2. **Parallel Execution**: Runs tasks on multiple packages simultaneously (up to 3 parallel
   processes)
3. **Caching**: Nx caches task results, so unchanged packages skip execution entirely
4. **Consistent Interface**: Each package defines its own lint/format/test/build targets in
   `workspace.json`

### How Affected Detection Works

Nx analyzes your git history and dependency graph to determine which packages are affected by your
changes. This means:

- Changed a single package? Only that package is checked
- Changed a shared dependency? All dependent packages are checked
- No changes? Tasks are skipped entirely

## Best Practices

1. **Commit small changes**: Smaller commits mean fewer affected packages and faster hook execution
2. **Run checks locally**: Use `bun run lint:affected`, `bun run format:affected`, etc. before
   committing
3. **Keep dependencies updated**: Regularly update ESLint, Prettier, Lefthook, and Nx
4. **Don't skip hooks unnecessarily**: Hooks catch issues early and save time
5. **Use affected commands**: Prefer `:affected` variants for faster feedback during development

## Adding New Hooks

### Add a Hook Command

To add new hooks, edit `lefthook.yml`:

```yaml
pre-commit:
  commands:
    your-command:
      run: bunx nx affected --target=your-target --base=HEAD~1 --head=HEAD --parallel=3
```

### Add a Target to Packages

Then add the target to your package in `workspace.json`:

```json
{
  "projects": {
    "your-package": {
      "targets": {
        "your-target": {
          "executor": "@nrwl/workspace:run-commands",
          "options": {
            "commands": [
              {
                "command": "your-command-here"
              }
            ],
            "cwd": "packages/your-package"
          }
        }
      }
    }
  }
}
```

Then reinstall:

```bash
bun run hooks:install
```

## Package-Level Configuration

Each package can customize its tasks by updating the target in `workspace.json`. The current setup
for each package includes:

- **build**: Compiles the package using tsup
- **lint**: Runs ESLint on the package source files
- **format**: Formats code using Prettier
- **type-check**: Validates TypeScript types
- **test**: Runs package tests

You can also add package-specific scripts in the package's `package.json` that will be called by the
Nx targets.

## More Information

- [Lefthook Documentation](https://github.com/evilmartians/lefthook/blob/master/docs/configuration.md)
- [Nx Affected Commands](https://nx.dev/nx-api/nx/documents/affected)
- [ESLint v9 Configuration](https://eslint.org/docs/latest/use/configure/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
