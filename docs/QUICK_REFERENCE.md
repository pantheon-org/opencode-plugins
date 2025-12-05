# OpenCode Plugin Generator - Quick Reference

## One-Line Command

```bash
bun run generate:plugin <plugin-name>
```

## Examples

```bash
# Basic
bun run generate:plugin my-feature

# With description
nx workspace-generator plugin my-feature --description "My awesome feature"

# With tests and lint
nx workspace-generator plugin my-feature --addTests --addLint
```

## What Gets Created

```
packages/opencode-<name>/
├── src/index.ts          # Your plugin code
├── package.json          # @pantheon-org/opencode-<name>
├── tsconfig.json         # TS config
└── README.md            # Plugin docs
```

## After Generation

```bash
# Build
nx build opencode-<name>

# Pack for distribution
nx pack opencode-<name>
```

## First Time Setup

```bash
# Install dependencies (includes @nrwl/devkit and @nrwl/workspace)
bun install
```

## Files Created by This Setup

- `tools/generators/plugin/index.ts` - Generator implementation
- `tools/generators/plugin/schema.json` - Options schema
- `tools/generators/plugin/files/*` - Templates
- `tools/generators/generators.json` - Registry
- Updated: `package.json`, `nx.json`, `README.md`

## More Info

- Full docs: [tools/generators/plugin/README.md](tools/generators/plugin/README.md)
- Setup guide: [GENERATOR_SETUP.md](GENERATOR_SETUP.md)
