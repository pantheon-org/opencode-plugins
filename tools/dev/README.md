# OpenCode Dev Tool

A development utility for OpenCode plugin authors. Manages plugin builds, symlinks, and hot-reloading during development.

## Overview

`opencode-dev` provides a development workflow that:

1. **Builds plugins** in watch mode using Nx
2. **Creates symlinks** from plugin dist folders to `.opencode/plugin/`
3. **Updates opencode.json** with plugin file:// URLs
4. **Hot-reloads** the OpenCode CLI or HTTP server on changes
5. **Cleans up** on exit (SIGINT)

## Installation

```bash
# In your workspace root
bun link tools/dev
```

## Usage

```bash
# Basic usage - develop one or more plugins
opencode-dev opencode-my-plugin

# Multiple plugins
opencode-dev opencode-plugin-a opencode-plugin-b

# Custom symlink location
opencode-dev --symlink-root ./custom/plugins opencode-my-plugin

# Preview changes without modifying opencode.json
opencode-dev --no-apply opencode-my-plugin

# Restore opencode.json from backup
opencode-dev --revert

# Disable HTTP dispose calls (always restart CLI)
opencode-dev --no-dispose opencode-my-plugin

# Custom dispose endpoint
opencode-dev --dispose-url http://localhost:8080/dispose opencode-my-plugin
```

## How It Works

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Your Plugin   │────▶│  Nx Build    │────▶│  dist/ folder    │
│   (source)      │     │  (watch)     │     │                  │
└─────────────────┘     └──────────────┘     └────────┬─────────┘
                                                      │
                                                      ▼
┌─────────────────┐     ┌──────────────┐     ┌──────────────────┐
│  opencode.json  │◀────│ File URI     │◀────│  Symlink in      │
│  (updated)      │     │  (file://)   │     │ .opencode/plugin/│
└─────────────────┘     └──────────────┘     └──────────────────┘
                                                      │
┌─────────────────┐     ┌──────────────┐     ┌────────┴─────────┐
│ OpenCode CLI    │◀────│ Auto-restart │◀────│ File watcher     │
│ or Server       │     │ or reload    │     │ (polling 1s)     │
└─────────────────┘     └──────────────┘     └──────────────────┘
```

## Architecture

### Single Function Per Module

This package follows strict single-function-per-module architecture:

```
src/
├── args/          # CLI argument parsing (6 modules)
├── build/         # Build operations (5 modules)
├── config/        # Configuration management (6 modules)
├── fs/            # Filesystem operations (10 modules)
├── server/        # Server lifecycle (8 modules)
├── types.ts       # Shared type definitions
├── index.ts       # Barrel exports
└── create-file-uris.ts      # File URI generation
└── setup-cleanup-handlers.ts # Signal handling
```

Each module exports exactly **one primary function** using arrow functions:

```typescript
// ✅ Correct: Single arrow function export
export const ensureDir = async (dir: string): Promise<void> => {
  await fs.mkdir(dir, { recursive: true });
};

// ❌ Incorrect: Function declaration
export async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}
```

### Key Functions

| Function | Module | Purpose |
|----------|--------|---------|
| `parseArgs` | `args/parse-args.ts` | Parse CLI arguments |
| `createBuildConfig` | `build/create-build-config.ts` | Resolve plugin paths |
| `startBuildWatcher` | `build/start-build-watcher.ts` | Start Nx watch build |
| `createPluginLink` | `fs/create-plugin-link.ts` | Symlink or copy dist |
| `updateOpencodeJson` | `config/update-opencode-json.ts` | Update opencode.json |
| `spawnOpencode` | `server/spawn-opencode.ts` | Start OpenCode CLI |
| `handleReload` | `server/handle-reload.ts` | Hot-reload logic |
| `setupCleanupHandlers` | `setup-cleanup-handlers.ts` | SIGINT handling |

## Testing

Tests are collocated with implementation:

```
src/
├── args/
│   ├── parse-args.ts
│   └── parse-args.test.ts  # Collocated test
```

Run tests:

```bash
# All tests
bun test

# Specific module
bun test src/args/parse-args.test.ts

# Watch mode
bun test --watch
```

### Test Coverage Requirements

All exported functions should have:

- Unit tests for core logic
- Edge case handling
- Error path validation

Current coverage:

- ✅ Args parsing (100%)
- ✅ Config operations (100%)
- ✅ Filesystem utilities (100%)
- ✅ Server lifecycle (90%)
- ⚠️ Build operations (needs more coverage)

## Development

```bash
# Type check
bunx tsc --noEmit

# Lint
bun run lint

# Build
bun run build

# Run locally
bun run opencode-dev opencode-my-plugin
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENCODE_DEV_DISPOSE_URL` | `http://localhost:4096/instance/dispose` | HTTP endpoint for reload |

### Plugin Resolution

Plugins are resolved in order:

1. As relative/absolute path: `./packages/my-plugin`
2. As package name: `opencode-my-plugin`
3. With `opencode-` prefix: `my-plugin` → `opencode-my-plugin`

## Troubleshooting

### Symlink fails on Windows

The tool automatically falls back to file copy if symlink creation fails (common on Windows without admin rights).

### Build watcher not starting

Ensure the plugin has a valid `project.json` with a `build` target:

```json
{
  "targets": {
    "build": {
      "executor": "nx:run-commands",
      "options": {
        "command": "bun run build"
      }
    }
  }
}
```

### Changes not detected

The file watcher polls every 1 second. If changes aren't detected:

1. Check that `dist/` folder exists and has updated timestamps
2. Verify the symlink points to the correct location
3. Run with `--no-apply` to see the file URIs that would be registered

## License

MIT - Part of the OpenCode ecosystem.
