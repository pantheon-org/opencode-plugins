# OpenCode Plugin Generator

An Nx workspace generator for scaffolding new OpenCode plugin packages.

## Usage

Generate a new OpenCode plugin using the Nx generator:

```bash
# Using Nx directly
nx workspace-generator plugin <plugin-name>

# Or using the workspace generator command
nx g @nrwl/workspace:workspace-generator plugin <plugin-name>

# With options
nx workspace-generator plugin my-plugin --description "My awesome plugin" --addTests --addLint
```

## Options

| Option        | Type      | Default      | Description                                         |
| ------------- | --------- | ------------ | --------------------------------------------------- |
| `name`        | `string`  | (required)   | The name of the plugin (without 'opencode-' prefix) |
| `description` | `string`  | `""`         | A brief description of what the plugin does         |
| `directory`   | `string`  | `"packages"` | A directory where the plugin is placed              |
| `addTests`    | `boolean` | `true`       | Add test configuration                              |
| `addLint`     | `boolean` | `true`       | Add lint configuration                              |
| `regenerate`  | `boolean` | `false`      | Regenerate plugin files (preserves src/ and docs/)  |

## Examples

### Basic plugin generation

```bash
nx workspace-generator plugin notification
```

This creates:

- `packages/opencode-notification/` - Plugin directory
- `packages/opencode-notification/src/index.ts` - Main entry point
- `packages/opencode-notification/package.json` - Package configuration
- `packages/opencode-notification/tsconfig.json` - TypeScript configuration
- `packages/opencode-notification/README.md` - Plugin documentation

### With description and test support

```bash
nx workspace-generator plugin analytics --description "Analytics tracking plugin" --addTests
```

## Generated Structure

```
packages/opencode-<name>/
├── src/
│   └── index.ts          # Main plugin entry point
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # Plugin documentation
```

## After Generation

1. Navigate to your new plugin:

   ```bash
   cd packages/opencode-<name>-plugin
   ```

2. Build the plugin:

   ```bash
   nx build opencode-<name>-plugin
   ```

3. Pack the plugin for distribution:
   ```bash
   nx pack opencode-<name>-plugin
   ```

## Regenerating Existing Plugins

⚠️ **Protection Against Accidental Regeneration**

If you try to run the generator on an existing plugin without the `--regenerate` flag, you'll get an
error:

```bash
nx workspace-generator plugin my-existing-plugin

# Error: Plugin already exists at: packages/opencode-my-existing-plugin
#
# To regenerate this plugin and update configuration files (while preserving src/ and docs/), run:
#   nx g ./tools/generators:plugin my-existing-plugin --regenerate
#
# Or use the shorthand:
#   nx g ./tools/generators:plugin my-existing-plugin -r
```

### To Regenerate a Plugin

Use the `--regenerate` (or `-r`) flag to explicitly allow regeneration:

```bash
# Full flag
nx workspace-generator plugin my-existing-plugin --regenerate

# Shorthand
nx workspace-generator plugin my-existing-plugin -r
```

**What gets regenerated:**

- ✅ Configuration files (`package.json`, `tsconfig.json`, `eslint.config.mjs`, etc.)
- ✅ GitHub workflows (`.github/workflows/*`)
- ✅ Documentation site (`pages/*`)
- ✅ Root-level files (`README.md`, `LICENSE`, etc.)

**What is preserved:**

- 🔒 `src/` - Your plugin source code
- 🔒 `docs/` - Your documentation markdown files

This allows you to:

- Update generator templates and apply changes to existing plugins
- Fix configuration issues without losing your work
- Adopt new best practices from updated templates
- Regenerate build configurations after template improvements

**Example workflow:**

```bash
# 1. Update the generator templates (in tools/generators/plugin/files/)
# 2. Regenerate your plugin
nx workspace-generator plugin my-plugin

# 3. Review changes
git diff packages/opencode-my-plugin

# 4. Commit the updated configuration
git add packages/opencode-my-plugin
git commit -m "chore: regenerate plugin configuration"
```

## Development Workflow

1. **Create a new plugin**

   ```bash
   nx workspace-generator plugin my-feature
   ```

2. **Implement your plugin logic** in `src/index.ts`

3. **Build the plugin**

   ```bash
   nx build opencode-my-feature
   ```

4. **Test locally** (if tests are configured)

   ```bash
   nx test opencode-my-feature
   ```

5. **Pack for distribution**
   ```bash
   nx pack opencode-my-feature
   ```

## Generator Structure

```
tools/generators/plugin/
├── index.ts                    # Generator implementation
├── schema.json                 # Generator schema definition
└── files/                      # Template files
    ├── package.json__template__
    ├── tsconfig.json__template__
    ├── README.md__template__
    └── src/
        └── index.ts__template__
```

## Template Variables

Below are the most commonly available template variables injected into files in `tools/generators/plugin/files/`. Add
these to your templates using EJS-style placeholders (e.g., `<%= name %>`).

- `projectName` — final project folder name (e.g. `opencode-my-plugin`)
- `projectRoot` — path to generated project (e.g. `packages/opencode-my-plugin`)
- `name` — raw name passed to generator (e.g. `my-plugin`)
- `className` — PascalCase project name used in templates (e.g. `MyPlugin`)
- `npmScope` — npm organization scope (e.g. `pantheon-org`)
- `description` — description option value
- `addTests` — boolean used by templates to include test config
- `addLint` — boolean used by templates to include lint config
- `regenerate` — boolean flag indicating regeneration mode
- `offsetFromRoot` — relative path string used in project.json template

Tip: Update `tools/generators/plugin/files/` to add inline comments in complex templates explaining how a variable is
used.

## Tests

Unit tests for the generator should live next to the implementation (e.g., `tools/generators/plugin/__tests__/`). If
tests are not present, add a minimal dry-run test that verifies files would be created without writing to disk.

Example (Bun test) to add at `tools/generators/plugin/index.test.ts`:

```ts
import { describe, it, expect } from 'bun:test';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import generator from './index';

describe('plugin generator', () => {
  it('creates files (dry run)', async () => {
    const tree = createTreeWithEmptyWorkspace();
    await generator(tree, { name: 'test-plugin', directory: 'packages', addTests: false });
    expect(tree.exists('packages/opencode-test-plugin/package.json')).toBeTruthy();
  });
});
```

If you already have tests, add a short section here describing how to run them:

```bash
# Run only generator tests
bun test tools/generators/plugin
```

## Modifying the Generator

To customize the generator:

1. Edit `tools/generators/plugin/index.ts` for generator logic
2. Update `tools/generators/plugin/schema.json` to add/modify options
3. Modify template files in `tools/generators/plugin/files/` to change generated structure

## Troubleshooting

### Generator not found

If you get an error that the generator is not found, try:

```bash
# Clear Nx cache
nx reset

# Reinstall dependencies
bun install
```

### Generator errors

The generator uses Nx's built-in utilities. Make sure:

- Nx is installed (already in devDependencies)
- You're running the command from the workspace root

## Related Commands

- `nx build <plugin-name>` - Build a plugin
- `nx pack <plugin-name>` - Pack a plugin for distribution
- `nx run-many --target=build --all` - Build all plugins
- `nx affected:build` - Build only affected plugins
