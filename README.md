# OpenCode Plugins Monorepo

This repository is the **single source of truth** for all [OpenCode](https://opencode.ai) plugins developed by Pantheon.

## Architecture

This is an NX monorepo with Bun + TypeScript that:

- Develops multiple OpenCode plugins under `packages/`
- Provides a shared documentation builder in `apps/docs-builder/`
- Mirrors each plugin to dedicated read-only GitHub repos for distribution
- Mirrors the docs-builder to a separate read-only repo
- Publishes each plugin independently to npm under `@pantheon-org/<plugin-name>`
- Deploys plugin documentation to GitHub Pages per plugin using the shared docs-builder

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

- Lives in `apps/docs-builder/`
- Is mirrored to: `pantheon-org/opencode-docs-builder` (read-only)
- Contains Astro + Starlight configuration
- Is pulled by plugin mirror repos during GitHub Pages deployment
- Has independent versioning (tagged as `docs-builder@v1.0.0`)

### Workflows App

The workflows app contains automated CI/CD scripts and utilities:

- Lives in `apps/workflows/`
- Built with Bun + TypeScript (strict mode)
- Modular architecture with comprehensive test coverage
- Used by GitHub Actions workflows for repository automation
- See [Workflows App Documentation](apps/workflows/README.md) for details

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

## Contributing

All development happens in this monorepo. Mirror repos are read-only distribution channels.

1. Create/modify plugin code under `packages/<plugin-name>/`
2. Follow the structure in `packages/opencode-warcraft-notification/` (example)
3. Submit PR to this repo
4. On merge and tag push, plugin is auto-mirrored and published

## Project Structure

```
opencode-plugins/
├── apps/
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
├── packages/
│   ├── opencode-warcraft-notification/  # Example plugin (reference template)
│   │   ├── docs/                        # Plugin-specific markdown docs
│   │   ├── src/                         # Plugin TypeScript source
│   │   └── package.json                 # Plugin dependencies (no Astro)
│   └── <other-plugins>/                 # Future plugins follow same structure
├── .github/
│   └── workflows/
│       ├── mirror-packages.yml          # Mirror plugins to separate repos
│       └── mirror-docs-builder.yml      # Mirror docs-builder to separate repo
├── nx.json                              # NX workspace config
├── workspace.json                       # NX project definitions
└── package.json                         # Root workspace config
```

## Release Process

### Plugin Releases

```bash
# Tag a plugin release (use plugin-specific tag format)
git tag <plugin-name>@v1.0.0
git push origin <plugin-name>@v1.0.0

# This triggers:
# 1. Dynamic workflow detects the package from tag
# 2. Validates package.json has repository URL
# 3. Checks if package has changes since last tag
# 4. If changes exist: extracts packages/<plugin>/ and pushes to mirror repo
# 5. Adds CI/CD workflows (publish-npm.yml, deploy-docs.yml) to mirror repo
# 6. Mirror repo automatically publishes to npm on tag push
# 7. Mirror repo automatically deploys docs to GitHub Pages
```

### Docs Builder Releases

```bash
# Tag a docs-builder release (use docs-builder tag format)
git tag docs-builder@v1.0.0
git push origin docs-builder@v1.0.0

# This triggers:
# 1. Workflow detects docs-builder tag
# 2. Checks for changes in apps/docs-builder/
# 3. If changes exist: extracts apps/docs-builder/ and pushes to mirror repo
# 4. Plugins automatically pull the latest docs-builder during their deployment
```

### Mirror Workflow Features

The `mirror-packages.yml` workflow automatically:

- **Discovers packages** from tag format (`<package-name>@v*`)
- **Validates** package directory exists and `package.json` has `repository.url`
- **Detects changes** by comparing with previous version tag
- **Skips mirroring** if no changes detected (saves CI time)
- **Extracts subtree** using `git subtree split`
- **Adds CI/CD workflows** from `.github/mirror-templates/` to enable npm publishing and docs deployment
- **Pushes to mirror** repository's `main` branch and creates version tag (uses `--force-with-lease` for safety)
- **Enables GitHub Pages** automatically via API with `workflow` build type
- **Disables repository features** (Issues, Projects, Wiki) to prevent content creation in mirror repos
- **Sets branch protection** to make mirror repository read-only (prevents accidental direct commits)

### Mirror Repository Automation

Each mirror repository automatically receives two GitHub Actions workflows:

1. **`publish-npm.yml`** - Publishes package to npm when tags are pushed
   - Runs on `main` branch pushes (dry-run) and `v*` tags (actual publish)
   - Executes tests and type checking before publishing
   - Uses npm provenance for supply chain security
   - Requires `NPM_TOKEN` secret in mirror repo

2. **`deploy-docs.yml`** - Deploys documentation to GitHub Pages
   - Clones the shared `opencode-docs-builder` repository
   - Copies plugin docs and README into docs-builder structure
   - Generates custom Astro config with plugin-specific metadata
   - Builds and deploys to GitHub Pages
   - Accessible at: `https://pantheon-org.github.io/<plugin-name>/`

### Requirements for Mirror Repositories

**For each plugin package:**

1. **Repository URL in package.json:**

   ```json
   {
     "repository": {
       "type": "git",
       "url": "git+https://github.com/pantheon-org/<plugin-name>.git"
     }
   }
   ```

2. **Mirror repository must exist** at the URL specified in `repository.url`

3. **GitHub Secrets configured:**
   - `MIRROR_REPO_TOKEN` - Personal access token with `repo` scope and `Pages: write` permissions (in monorepo)
   - `NPM_TOKEN` - npm automation token with publish access (in mirror repo)

4. **GitHub Pages:** Automatically enabled by mirror workflow with GitHub Actions as build source

5. **Tag format:** `<package-name>@v<version>` (e.g., `opencode-foo-plugin@v1.0.0`)

### Mirror Repository Structure

After mirroring, each repository contains:

```
<plugin-name>/
├── .github/
│   └── workflows/
│       ├── publish-npm.yml      # Auto-added by mirror workflow
│       └── deploy-docs.yml      # Auto-added by mirror workflow
├── docs/                        # Plugin documentation
├── src/                         # Plugin source code
├── dist/                        # Built output (generated)
├── package.json                 # Package configuration
├── tsconfig.json                # TypeScript config
└── README.md                    # Main documentation
```

## Resources

- [OpenCode Documentation](https://opencode.ai/docs)
- [NX Documentation](https://nx.dev)
- [Bun Documentation](https://bun.sh/docs)
