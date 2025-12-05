# Nx Generator Setup Complete

## What Was Created

An Nx workspace generator for scaffolding new OpenCode plugin packages has been successfully
created.

### File Structure

```
tools/generators/
├── generators.json                          # Generator registry
├── workspace-generators.json                # Workspace config
└── plugin/
    ├── index.ts                             # Generator implementation
    ├── schema.json                          # Generator schema & options
    ├── README.md                            # Generator documentation
    └── files/                               # Template files
        ├── package.json__template__
        ├── tsconfig.json__template__
        ├── README.md__template__
        └── src/
            └── index.ts__template__
```

### Configuration Changes

1. **package.json** - Added:
   - `@nrwl/devkit` and `@nrwl/workspace` dependencies
   - `generate:plugin` npm script

2. **nx.json** - Added:
   - Generators configuration
   - Workspace layout settings

3. **README.md** - Updated with generator usage instructions

## How To Use

### No Additional Dependencies Needed

The generator uses Nx's built-in utilities - no extra packages required! Just ensure Nx is
installed:

```bash
bun install
```

### Generate a New Plugin

```bash
# Using npm script (recommended)
bun run generate:plugin my-feature

# Using Nx directly
nx workspace-generator plugin my-feature

# With options
nx workspace-generator plugin my-feature \
  --description "My awesome plugin" \
  --addTests \
  --addLint
```

### Available Options

| Option        | Type    | Default    | Description                            |
| ------------- | ------- | ---------- | -------------------------------------- |
| `name`        | string  | (required) | Plugin name without 'opencode-' prefix |
| `description` | string  | ""         | Brief description of the plugin        |
| `directory`   | string  | "packages" | Directory where plugin is placed       |
| `addTests`    | boolean | false      | Add test configuration                 |
| `addLint`     | boolean | false      | Add lint configuration                 |

## Generated Plugin Structure

When you run the generator, it creates:

```
packages/opencode-<name>/
├── src/
│   └── index.ts          # Main entry point
├── package.json          # Package config (@pantheon-org/opencode-<name>)
├── tsconfig.json         # TypeScript config
└── README.md            # Plugin documentation
```

The plugin is automatically registered in `workspace.json` with build and pack targets.

## After Generation

1. **Navigate to the plugin**:

   ```bash
   cd packages/opencode-<name>
   ```

2. **Implement your plugin logic** in `src/index.ts`

3. **Build the plugin**:

   ```bash
   nx build opencode-<name>
   ```

4. **Pack for distribution**:
   ```bash
   nx pack opencode-<name>
   ```

## Troubleshooting

### Generator not found

If you get "Cannot find generator 'plugin'":

1. Make sure dependencies are installed:

   ```bash
   bun install
   ```

2. Clear Nx cache:
   ```bash
   nx reset
   ```

### TypeScript errors in generated code

The generator uses Nx DevKit which requires TypeScript. Make sure:

- `typescript` is installed (already in devDependencies)
- `@nrwl/devkit` and `@nrwl/workspace` are installed

## Testing the Generator

Try creating a test plugin:

```bash
# Create a test plugin
nx workspace-generator plugin test-feature --description "Test plugin"

# Verify it was created
ls -la packages/opencode-test-feature/

# Build it
nx build opencode-test-feature

# Clean up (if needed)
rm -rf packages/opencode-test-feature/
```

## Customizing the Generator

To modify the generator:

1. **Change generator logic**: Edit `tools/generators/plugin/index.ts`
2. **Add/modify options**: Update `tools/generators/plugin/schema.json`
3. **Customize templates**: Modify files in `tools/generators/plugin/files/`

Template files use EJS syntax:

- `<%= variable %>` - Insert variable value
- `<% if (condition) { %>...<% } %>` - Conditional content
- File suffix `__template__` is automatically removed

## Related Commands

- `nx workspace-generator plugin <name>` - Generate new plugin
- `nx build <plugin-name>` - Build a plugin
- `nx pack <plugin-name>` - Pack a plugin
- `nx run-many --target=build --all` - Build all plugins
- `nx affected:build` - Build only affected plugins
- `nx reset` - Clear Nx cache

## Next Steps

1. Install dependencies: `bun install`
2. Test the generator: `bun run generate:plugin test-feature`
3. Start creating your OpenCode plugins!

For more details, see [tools/generators/plugin/README.md](tools/generators/plugin/README.md)
