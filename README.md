# OpenCode Plugins Monorepo

This repository is the **single source of truth** for all [OpenCode](https://opencode.ai) plugins developed by Pantheon.

## Architecture

This is an NX monorepo with Bun + TypeScript that:

- Develops multiple OpenCode plugins under `packages/`
- Mirrors each plugin to dedicated read-only GitHub repos for distribution
- Publishes each plugin independently to npm under `@pantheon-org/<plugin-name>`
- Deploys plugin documentation to GitHub Pages per plugin

### Plugins

Each plugin:

- Lives under `packages/<plugin-name>/`
- Has its own npm package: `@pantheon-org/<plugin-name>`
- Is mirrored to: `pantheon-org/<plugin-name>` (read-only)
- Has independent versioning and releases

**Example Plugin** (reference template):

- `packages/opencode-warcraft-notification/` - Use this as a template for new plugins

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

## Documentation

### Core Documentation

- **[Developer Guide](docs/PLUGINS_MIGRATION.md)** - Commands for building, testing, releasing plugins
- **[Mirror Setup Guide](docs/MIRROR_SETUP.md)** - Complete guide for creating and configuring mirror repos

### Migration Documentation (Temporary)

- **[Migration Plan](docs/MIGRATION_PLAN.md)** - Initial project setup and architecture checklist
- **[Plugin Inventory](docs/PLUGIN_INVENTORY.md)** - Plugins being migrated from parent directory (temporary, will be
  archived post-migration)

## Project Structure

```
opencode-plugins/
├── packages/
│   ├── opencode-warcraft-notification/  # Example plugin (reference template)
│   └── <other-plugins>/                 # Future plugins follow same structure
├── .github/
│   └── workflows/
│       └── mirror-<plugin>.yml          # Mirror sync workflow per plugin
├── docs/                                # Project documentation
├── nx.json                              # NX workspace config
├── workspace.json                       # NX project definitions
└── package.json                         # Root workspace config
```

## Release Process

```bash
# Tag a plugin release (use plugin-specific tag format)
git tag <plugin-name>@v1.0.0
git push origin <plugin-name>@v1.0.0

# This triggers:
# 1. Monorepo extracts packages/<plugin>/
# 2. Pushes to mirror repo pantheon-org/<plugin>
# 3. Mirror repo publishes to npm + deploys docs
```

## Resources

- [OpenCode Documentation](https://opencode.ai/docs)
- [NX Documentation](https://nx.dev)
- [Bun Documentation](https://bun.sh/docs)
