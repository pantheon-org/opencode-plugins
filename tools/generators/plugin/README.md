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
| `addTests`    | `boolean` | `false`      | Add test configuration                              |
| `addLint`     | `boolean` | `false`      | Add lint configuration                              |

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
   cd packages/opencode-<name>
   ```

2. Build the plugin:

   ```bash
   nx build opencode-<name>
   ```

3. Pack the plugin for distribution:
   ```bash
   nx pack opencode-<name>
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
