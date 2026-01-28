# OpenCode Plugins Monorepo

This repository is the **single source of truth** for all [OpenCode](https://opencode.ai) plugins developed by Pantheon.

## Architecture

This is an NX monorepo with Bun + TypeScript that:

- Develops multiple OpenCode plugins under `packages/`
- Provides internal shared libraries under `libs/`
- Mirrors each plugin and distributable package to dedicated read-only GitHub repos
- Publishes plugins and packages independently to npm under `@pantheon-org/<name>`
- Deploys plugin documentation to GitHub Pages per plugin

## Directory Structure

### `packages/` - Mirrored Distributable Packages

All packages under `packages/` are:

- **Mirrored** to individual GitHub repositories
- **Published** to npm as `@pantheon-org/<name>`
- **Tagged** using format `<name>@v<version>` (e.g., `opencode-font@v1.0.0`)

**Types of packages:**

- **OpenCode Plugins**: Extend OpenCode functionality (prefixed with `opencode-`)
- **Distributable Packages**: Standalone npm packages (e.g., `opencode-font`)

### `libs/` - Internal Libraries (Not Mirrored)

Internal libraries for monorepo support:

- **workflows/** - CI/CD automation scripts and utilities
- **docs-builder/** - Shared Astro documentation builder

These are **not mirrored** or published to npm.

### Plugins

Each plugin:

- Lives under `packages/<plugin-name>/`
- Has its own npm package: `@pantheon-org/<plugin-name>`
- Contains only plugin code and markdown docs (no Astro infrastructure)
- Is mirrored to: `pantheon-org/<plugin-name>` (read-only)
- Has independent versioning and releases

**Example Plugin** (reference template):

- `packages/opencode-warcraft-notification/` - Use this as a template for new plugins

### Documentation Builder

The shared documentation builder:

- Lives in `libs/docs-builder/`
- Contains Astro + Starlight configuration
- Is pulled by plugin mirror repos during GitHub Pages deployment
- Used internally, not distributed

### Workflows

The workflows library contains automated CI/CD scripts and utilities:

- Lives in `libs/workflows/`
- Built with Bun + TypeScript (strict mode)
- Modular architecture with comprehensive test coverage
- Used by GitHub Actions workflows for repository automation
- See [Workflows Documentation](libs/workflows/README.md) for details

## Quick Start

```bash
# Install dependencies
bun install

# Generate a new plugin
bun run generate:plugin <plugin-name>
# Or: nx workspace-generator plugin <plugin-name>

# Build all plugins
bunx nx run-many --target=build --all

# Build a specific plugin
bunx nx run opencode-warcraft-notification:build

# Test locally
cd packages/<plugin-name>
bun run pack
```

### Creating a New Plugin

Use the built-in Nx generator to scaffold a new plugin:

```bash
# Basic usage
bun run generate:plugin my-feature

# With options
nx workspace-generator plugin my-feature --description "My awesome feature" --addTests --addLint
```

This will create a new plugin in `packages/opencode-<name>/` with:

- TypeScript configuration
- Build setup with tsup
- Package.json with correct naming
- README template
- Basic entry point in `src/index.ts`

See [Generator Documentation](tools/generators/plugin/README.md) for more details.

## Development

### Linting and Formatting

This project uses **Biome** for linting and formatting:

```bash
# Lint all packages (with auto-fix)
bun run lint

# Lint only affected packages (fast, uses batch mode)
bun run lint:affected

# Format all files
bun run format

# Check formatting without changes
bun run format:check

# Validate TSDoc comments
bun run validate:tsdoc
```

### Code Style

- **One function per module**: Each module should export a single primary function or class
- **Barrel exports**: Use `index.ts` for public API re-exports
- **TSDoc required**: All public functions and classes must have valid TSDoc comments
- **Type safety**: All code must compile with TypeScript's `strict` mode enabled

See [Development Standards](.opencode/knowledge-base/bun-typescript-development.md) for complete guidelines.

### Testing

```bash
# Run all tests
bun run test

# Test specific package
bunx nx test opencode-core-plugin

# Watch mode
bunx nx test opencode-core-plugin --watch
```

### Type Checking

```bash
# Type-check all packages
bun run type-check

# Type-check affected packages
bun run type-check:affected
```

## Contributing

All development happens in this monorepo. Mirror repos are read-only distribution channels.

1. Create/modify plugin code under `packages/<plugin-name>/`
2. Follow the structure in `packages/opencode-warcraft-notification/` (example)
3. Submit PR to this repo
4. On merge and tag push, plugin is auto-mirrored and published

## Project Structure

```
opencode-plugins/
├── packages/                            # Mirrored distributable packages
│   ├── opencode-warcraft-notification/  # Example plugin (reference template)
│   │   ├── docs/                        # Plugin-specific markdown docs
│   │   ├── src/                         # Plugin TypeScript source
│   │   └── package.json                 # Plugin dependencies
│   ├── opencode-font/                   # Font package (non-plugin)
│   │   ├── src/                         # Font generation source
│   │   ├── css/                         # Generated CSS
│   │   └── fonts/                       # Generated font files
│   └── <other-plugins>/                 # Future plugins follow same structure
├── libs/                            # Internal libraries (not mirrored)
│   ├── docs-builder/                    # Shared Astro documentation builder
│   │   ├── src/                         # Astro components, styles
│   │   ├── astro.config.mjs             # Astro configuration
│   │   ├── package.json                 # Astro dependencies
│   │   └── transform-docs.js            # Doc transformation scripts
│   └── workflows/                       # CI/CD automation scripts
│       ├── src/                         # TypeScript source
│       │   ├── scripts/                 # Workflow scripts
│       │   └── utils/                   # Shared utilities
│       └── README.md                    # Workflows documentation
├── .github/
│   └── workflows/
│       └── mirror-packages.yml          # Mirror packages to separate repos
├── nx.json                              # NX workspace config
├── workspace.json                       # NX project definitions
└── package.json                         # Root workspace config
```

## Release Process

### Plugin & Package Releases

All packages in `packages/` directory (plugins and distributable packages) follow the same release process:

```bash
# Tag a package release (use package-specific tag format)
git tag <package-name>@v1.0.0
git push origin <package-name>@v1.0.0

# This triggers:
# 1. Dynamic workflow detects the package from tag
# 2. Validates package.json has repository URL
# 3. Checks if package has changes since last tag
# 4. If changes exist: extracts packages/<package>/ and pushes to mirror repo
# 5. Mirror repo publishes to npm + deploys docs (for plugins)
```

### Examples

```bash
# Release a plugin
git tag opencode-warcraft-notification@v1.0.0
git push origin opencode-warcraft-notification@v1.0.0

# Release a non-plugin package
git tag opencode-font@v1.0.0
git push origin opencode-font@v1.0.0
```

### Mirror Workflow Features

The `mirror-packages.yml` workflow automatically:

- **Discovers packages** from tag format (`<package-name>@v*`)
- **Validates** package directory exists and `package.json` has `repository.url`
- **Detects changes** by comparing with previous version tag
- **Skips mirroring** if no changes detected (saves CI time)
- **Extracts subtree** using `git subtree split`
- **Pushes to mirror** repository's `main` branch and creates version tag

**Requirements for each mirrored package:**

1. Package must have `repository.url` in `package.json`:
   ```json
   {
     "repository": {
       "type": "git",
       "url": "git+https://github.com/pantheon-org/<package-name>.git"
     }
   }
   ```
2. Mirror repository must exist and `MIRROR_REPO_TOKEN` must have write access
3. Tag format must be: `<package-name>@v<version>` (e.g., `opencode-font@v1.0.0`)

## Resources

- [OpenCode Documentation](https://opencode.ai/docs)
- [NX Documentation](https://nx.dev)
- [Bun Documentation](https://bun.sh/docs)
