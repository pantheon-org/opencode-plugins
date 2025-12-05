# OpenCode Plugins Migration Inventory

> **Note**: This is a **temporary** document for the initial migration from parent directory.  
> Once all plugins are migrated, this file will be archived or removed.  
> For ongoing plugin development, see [PLUGINS_MIGRATION.md](PLUGINS_MIGRATION.md).

Identified plugins from parent directory

## Plugins to Migrate

### 1. ✅ opencode-warcraft-notifications (Example - Already Scaffolded)

- **Source**: `opencode-warcraft-notifications/`
- **Current package**: `@pantheon-ai/opencode-warcraft-notifications`
- **New package**: `@pantheon-org/opencode-warcraft-notification` (note: singular)
- **Description**: Warcraft II notifications plugin with Alliance and Horde faction sounds
- **Status**: Skeleton exists, needs source migration
- **Has docs**: Yes (README, badges)

### 2. opencode-resources-loader-plugin

- **Source**: `opencode-resources-loader-plugin/`
- **Current package**: `@pantheon-ai/opencode-resources-loader`
- **New package**: `@pantheon-org/opencode-resources-loader`
- **Description**: Resources Loader plugin for OpenCode
- **Main entry**: `index.ts`
- **Has docs**: Yes (README with badges)
- **Priority**: High

### 3. opencode-smart-mode-selector-plugin

- **Source**: `opencode-smart-mode-selector-plugin/`
- **Current package**: `@pantheon-ai/opencode-smart-mode-selector`
- **New package**: `@pantheon-org/opencode-smart-mode-selector`
- **Description**: Intelligent LLM model selection based on task analysis, usage patterns, cost
  optimization
- **Main entry**: `src/index.ts`
- **Has docs**: Yes (README with license badge)
- **Priority**: High

### 4. opencode-tool-dump-plugin

- **Source**: `opencode-tool-dump-plugin/`
- **Current package**: Has incorrect name in package.json (shows warcraft-notifications - likely
  copy/paste error)
- **New package**: `@pantheon-org/opencode-tool-dump`
- **Description**: Dumps all available OpenCode tools with advanced filtering and export
  capabilities
- **Main entry**: `src/index.ts`
- **Has docs**: Yes (src/README.md)
- **Priority**: Medium
- **Note**: Need to fix package.json name during migration

## Not Plugins (Exclude from Migration)

### opencode-plugin-projen

- **Type**: Project generator/scaffolding tool (uses Projen)
- **Reason**: Not an OpenCode runtime plugin, but a development tool
- **Action**: Keep as separate repo

### opencode-plugin-template

- **Type**: Template/boilerplate project
- **Current package**: `@pantheon-ai/opencode-warcraft-notifications` (appears to be template copy)
- **Reason**: Template for creating new plugins, not a plugin itself
- **Action**: Keep as separate repo or archive

### opencode-font

- **Type**: Font assets
- **Reason**: Not a plugin
- **Action**: Keep as separate repo

### awesome-opencode

- **Type**: Curated list/documentation
- **Reason**: Not a plugin
- **Action**: Keep as separate repo

### opencode-projen

- **Type**: Projen configuration
- **Reason**: Development tool, not a plugin
- **Action**: Keep as separate repo

## Migration Priority

### Phase 1: High Priority

1. ✅ `opencode-warcraft-notification` (already scaffolded)
2. `opencode-smart-mode-selector` (high-value feature)
3. `opencode-resources-loader` (core utility)

### Phase 2: Medium Priority

4. `opencode-tool-dump` (developer utility)

## Package Name Changes

All plugins will change scope from `@pantheon-ai` → `@pantheon-org`:

| Original Package                               | New Package                                    |
| ---------------------------------------------- | ---------------------------------------------- |
| `@pantheon-ai/opencode-warcraft-notifications` | `@pantheon-org/opencode-warcraft-notification` |
| `@pantheon-ai/opencode-resources-loader`       | `@pantheon-org/opencode-resources-loader`      |
| `@pantheon-ai/opencode-smart-mode-selector`    | `@pantheon-org/opencode-smart-mode-selector`   |
| _(incorrect in tool-dump)_                     | `@pantheon-org/opencode-tool-dump`             |

## Next Steps

1. Confirm plugin selection and priority order
2. For each plugin, following `opencode-warcraft-notification` template:
   - Create `packages/<plugin-name>/` structure
   - Copy source code (no git history)
   - Update package.json with new scope
   - Copy docs to `packages/<plugin-name>/docs/`
   - Add NX project entry to `workspace.json`
   - Create `.github/workflows/mirror-<plugin-name>.yml`
3. Test builds locally
4. Create mirror repos when ready to publish
