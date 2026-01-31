# @pantheon-org/opencode-config

Configuration utilities for OpenCode plugins.

> **Note**: This package is part of the `pantheon-org/opencode-plugins` monorepo. All development and contributions
> should be made in the main repository at: **https://github.com/pantheon-org/opencode-plugins**
>
> If you're viewing this as a mirror repository, it is read-only. Submit issues, PRs, and contributions to the main
> monorepo.

## Features

- **Configuration Loading**: Load plugin configuration from standard OpenCode locations
- **Path Utilities**: Get platform-specific config and data directories
- **Package Utilities**: Determine plugin package names reliably
- **Type-Safe**: Full TypeScript support with generic configuration types
- **Validation**: Optional configuration validation with custom validators

## Installation

```bash
bun add @pantheon-org/opencode-config
```

## Usage

### Basic Configuration Loading

```typescript
import { loadPluginConfig } from '@pantheon-org/opencode-config';

// Load configuration with defaults
const config = await loadPluginConfig({
  pluginName: 'my-plugin',
});
```

### Configuration with Validation

```typescript
import { loadPluginConfig } from '@pantheon-org/opencode-config';

interface MyPluginConfig {
  enabled: boolean;
  apiKey?: string;
}

const config = await loadPluginConfig<MyPluginConfig>({
  pluginName: 'my-plugin',
  validator: (raw) => {
    if (typeof raw !== 'object') {
      throw new Error('Configuration must be an object');
    }
    return {
      enabled: Boolean((raw as any).enabled ?? true),
      apiKey: (raw as any).apiKey,
    };
  },
  defaultConfig: { enabled: true },
});
```

### Path Utilities

```typescript
import { getConfigDir, getDataDir, getPluginStorageDir } from '@pantheon-org/opencode-config';

// Get config directory
const configDir = getConfigDir();
// macOS: /Users/username/.config
// Linux: /home/username/.config
// Windows: C:\Users\username\AppData\Roaming

// Get data directory
const dataDir = getDataDir();
// macOS/Linux: /Users/username/.local/share
// Windows: C:\Users\username\AppData\Roaming

// Get plugin storage directory
const storageDir = getPluginStorageDir('@pantheon-org/my-plugin', 'sounds');
// macOS/Linux: ~/.local/share/opencode/storage/plugin/@pantheon-org/my-plugin/sounds
```

### Package Name Detection

```typescript
import { getPackageName } from '@pantheon-org/opencode-config';

const packageName = getPackageName();
console.log(packageName); // '@pantheon-org/my-plugin'
```

## API

### `loadPluginConfig<T>(options: LoadConfigOptions<T>): Promise<T>`

Load plugin configuration from standard OpenCode locations.

**Options:**

- `pluginName` (required): Name of the plugin
- `configFileName` (optional): Configuration file name (default: 'plugin.json')
- `validator` (optional): Function to validate and transform configuration
- `defaultConfig` (optional): Default configuration if no file found
- `debug` (optional): Enable debug logging

**Configuration Search Paths:**

1. `<cwd>/.opencode/plugin.json`
2. `~/.config/opencode/plugin.json` (or platform equivalent)

### `getConfigDir(): string`

Get the platform-specific configuration directory.

### `getDataDir(): string`

Get the platform-specific data directory.

### `getPluginStorageDir(pluginName: string, subdirectory?: string): string`

Get the OpenCode plugin storage directory.

### `getConfigPaths(configFileName?: string): string[]`

Get configuration file search paths in priority order.

### `getPackageName(debug?: boolean): string | null`

Get the package name from package.json.

## Types

```typescript
// Plugin configuration file structure
interface PluginConfig {
  [pluginName: string]: unknown;
}

// Configuration loading options
interface LoadConfigOptions<T> {
  pluginName: string;
  configFileName?: string;
  validator?: (config: unknown) => T;
  defaultConfig?: T;
  debug?: boolean;
}
```

## License

MIT
