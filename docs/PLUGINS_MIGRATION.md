# Plugins Migration Guide

This document provides reproducible commands for building, testing, and publishing **multiple
OpenCode plugins** in the NX monorepo.

## Architecture Overview

- **Monorepo** (`pantheon-org/opencode-plugins`): Single source of truth for **all plugin
  development**
- **Mirror repos** (`pantheon-org/<plugin-name>`): Read-only distribution channels for npm +
  gh-pages (one per plugin)
- **Package scope**: All plugins use `@pantheon-org/<plugin-name>` npm package names
- **Runtime**: Bun + TypeScript
- **Example plugin**: `opencode-warcraft-notification` serves as reference template for all plugins

## Available Plugins

This monorepo hosts multiple OpenCode plugins. To see all plugins:

```bash
# List all packages
ls -la packages/

# Or use NX to see projects
bunx nx show projects
```

**Current plugins**:

- `opencode-warcraft-notification` - Warcraft II notifications with Alliance/Horde sounds
  (example/template)
- _(More plugins being migrated - see [PLUGIN_INVENTORY.md](PLUGIN_INVENTORY.md) for migration
  status and upcoming plugins)_

## Local Development

### Initial Setup

```bash
# Clone monorepo
git clone git@github.com:pantheon-org/opencode-plugins.git
cd opencode-plugins

# Install dependencies
bun install
```

### Working with a Plugin

```bash
# Build a single plugin
cd packages/opencode-warcraft-notification
bun run build

# Or use NX from root
bunx nx run opencode-warcraft-notification:build

# Build all plugins
bunx nx run-many --target=build --all
```

### Testing Locally

```bash
# Test a plugin (if tests exist)
cd packages/<plugin-name>
bun test

# Test all plugins
bunx nx run-many --target=test --all
```

### Dry-Run Publish

```bash
# Create tarball for local testing
cd packages/<plugin-name>
bun run pack
# or
bunx npm pack

# Inspect tarball contents
tar -tzf pantheon-org-<plugin-name>-*.tgz

# Test installing locally
bun install /path/to/tarball
```

## Release Process

### 1. Tag and Push (Monorepo)

```bash
# Tag a plugin release (triggers mirror sync)
git tag opencode-warcraft-notification@v1.0.0
git push origin opencode-warcraft-notification@v1.0.0
```

This triggers:

- Monorepo workflow extracts `packages/opencode-warcraft-notification/`
- Pushes to mirror repo `pantheon-org/opencode-warcraft-notification`
- Mirror repo workflows publish to npm and deploy gh-pages

### 2. Verify Mirror Sync

Check GitHub Actions in:

- Monorepo: `.github/workflows/mirror-<plugin>.yml` runs successfully
- Mirror repo: Workflows triggered on push to `main` and tag push

### 3. Verify npm Publish

```bash
# Check published package
npm view @pantheon-org/<plugin-name>

# Install published package
bun add @pantheon-org/<plugin-name>
```

### 4. Verify Documentation

Visit: `https://pantheon-org.github.io/<plugin-name>/`

## Adding a New Plugin

### 1. Create Package Structure

```bash
mkdir -p packages/<plugin-name>/src
cd packages/<plugin-name>
```

### 2. Add `package.json`

```json
{
  "name": "@pantheon-org/<plugin-name>",
  "version": "0.1.0",
  "private": false,
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "bunx tsup src/index.ts --format esm,cjs --dts --out-dir dist",
    "pack": "bunx npm pack --prefix ."
  },
  "devDependencies": {
    "tsup": "^6.0.0"
  }
}
```

### 3. Add `tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

### 4. Add NX Project Entry

Edit `workspace.json`:

```json
{
  "<plugin-name>": {
    "root": "packages/<plugin-name>",
    "sourceRoot": "packages/<plugin-name>/src",
    "projectType": "library",
    "targets": {
      "build": {
        "executor": "@nrwl/workspace:run-commands",
        "options": {
          "commands": [
            {
              "command": "bunx tsup src/index.ts --format esm,cjs --dts --out-dir dist"
            }
          ],
          "cwd": "packages/<plugin-name>",
          "parallel": false
        }
      }
    }
  }
}
```

### 5. Add Mirror Workflow

Copy `.github/workflows/mirror-opencode-warcraft-notification.yml` and replace plugin name.

### 6. Create Mirror Repo

Follow instructions in `docs/MIRROR_SETUP.md`.

## Troubleshooting

### Build fails with "tsup not found"

```bash
# Install tsup locally in plugin
cd packages/<plugin-name>
bun add -D tsup
```

### Mirror sync, npm publish, or gh-pages deployment fails

See the comprehensive troubleshooting guide in [MIRROR_SETUP.md](MIRROR_SETUP.md#troubleshooting)
which covers:

- **Mirror sync failures**: Token issues, permissions, remote repo not found
- **npm publish failures**: Token scope, package naming, version conflicts
- **GitHub Pages deployment issues**: Configuration, workflow failures, 404 errors

## Commands Reference

| Command                                 | Description                      |
| --------------------------------------- | -------------------------------- |
| `bun install`                           | Install all dependencies         |
| `bunx nx run <plugin>:build`            | Build a plugin                   |
| `bunx nx run-many --target=build --all` | Build all plugins                |
| `bunx npm pack`                         | Create tarball for local testing |
| `git tag <plugin>@v1.0.0`               | Tag plugin release               |
| `git push origin <plugin>@v1.0.0`       | Trigger mirror sync              |

## Resources

- [NX Documentation](https://nx.dev)
- [Bun Documentation](https://bun.sh/docs)
- [tsup Documentation](https://tsup.egoist.dev)
- [GitHub Actions: peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)
