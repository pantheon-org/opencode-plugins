# API Documentation

This document provides complete API documentation for the OpenCode Warcraft Notifications Plugin.

## Table of Contents

- [Plugin Export](#plugin-export)
- [Configuration Types](#configuration-types)
- [Utility Functions](#utility-functions)
- [Sound Management](#sound-management)
- [Event Handling](#event-handling)

## Plugin Export

### `OpencodeWarcraftNotificationsPlugin`

The main plugin export that implements the OpenCode Plugin interface.

```typescript
import { Plugin } from '@opencode-ai/plugin';

export const OpencodeWarcraftNotificationsPlugin: Plugin = async (ctx) => {
  // Plugin implementation
  return {
    event: async ({ event }) => {
      // Handle events
    },
  };
};
```

**Usage:**

```json
{
  "plugin": ["@pantheon-org/opencode-warcraft-notifications-plugin"]
}
```

## Configuration Types

### `WarcraftNotificationConfig`

Configuration interface for the plugin.

```typescript
interface WarcraftNotificationConfig {
  /** Directory where sound files should be stored and cached */
  soundsDir?: string;

  /** Which faction sounds to use: 'alliance', 'horde', or 'both' (default: 'both') */
  faction?: Faction;

  /** Whether to show toast notifications when idle (default: true) */
  showDescriptionInToast?: boolean;
}
```

**Properties:**

- **`soundsDir`** (optional): Custom directory for sound files
  - Default: `~/.config/opencode/sounds`
  - Must be an absolute path
  - Will be created if it doesn't exist

- **`faction`** (optional): Which faction sounds to play
  - Type: `'alliance' | 'horde' | 'both'`
  - Default: `'both'`
  - Affects random sound selection

- **`showDescriptionInToast`** (optional): Show voice line text in toast
  - Type: `boolean`
  - Default: `true`
  - When false, only plays sound without toast

**Example:**

```json
{
  "@pantheon-ai/opencode-warcraft-notifications": {
    "faction": "horde",
    "soundsDir": "/custom/path/to/sounds",
    "showDescriptionInToast": true
  }
}
```

### `Faction`

Type alias for faction selection.

```typescript
type Faction = 'alliance' | 'horde' | 'both';
```

## Utility Functions

### `loadPluginConfig(pluginName: string): Promise<WarcraftNotificationConfig>`

Loads plugin configuration from OpenCode's configuration system.

**Parameters:**

- `pluginName`: The plugin identifier (e.g., `'@pantheon-ai/opencode-warcraft-notifications'`)

**Returns:** Promise resolving to the plugin configuration

**Example:**

```typescript
import { loadPluginConfig } from '@pantheon-org/opencode-warcraft-notifications-plugin';

const config = await loadPluginConfig('@pantheon-ai/opencode-warcraft-notifications');
console.log('Faction:', config.faction);
console.log('Sounds Directory:', config.soundsDir);
```

### `getSoundFileList(): string[]`

Returns an array of all bundled sound filenames.

**Returns:** Array of sound filenames

**Example:**

```typescript
import { getSoundFileList } from '@pantheon-org/opencode-warcraft-notifications-plugin';

const sounds = getSoundFileList();
console.log(`Total sounds: ${sounds.length}`);

// Filter by faction
const allianceSounds = sounds.filter((s) => s.includes('human_') || s.includes('peasant_') || s.includes('knight_'));
console.log(`Alliance sounds: ${allianceSounds.length}`);
```

## Sound Management

### `installBundledSoundsIfMissing(dataDir?: string): Promise<number>`

Installs bundled sound files to the data directory if they don't already exist.

**Parameters:**

- `dataDir` (optional): Target directory for sound files
  - Default: `~/.config/opencode/sounds`

**Returns:** Promise resolving to the number of files installed

**Behavior:**

- Only copies files that don't already exist
- Creates directory structure automatically
- Skips non-WAV files
- Handles both faction subdirectories

**Example:**

```typescript
import { installBundledSoundsIfMissing } from '@pantheon-org/opencode-warcraft-notifications-plugin';

// Install to default location
const count = await installBundledSoundsIfMissing();
console.log(`Installed ${count} sound files`);

// Install to custom directory
const customCount = await installBundledSoundsIfMissing('/custom/sounds');
if (customCount > 0) {
  console.log(`Installed ${customCount} new files`);
} else {
  console.log('All sounds already installed');
}
```

### `soundExists(filename: string, faction: Faction, dataDir?: string): Promise<boolean>`

Checks if a sound file exists in the data directory.

**Parameters:**

- `filename`: Name of the sound file (e.g., `'orc_selected1.wav'`)
- `faction`: Faction of the sound (`'alliance'` or `'horde'`)
- `dataDir` (optional): Base data directory

**Returns:** Promise resolving to `true` if file exists

**Example:**

```typescript
import { soundExists, determineSoundFaction } from '@pantheon-org/opencode-warcraft-notifications-plugin';

const filename = 'orc_work_completed.wav';
const faction = determineSoundFaction(filename);
const exists = await soundExists(filename, faction);

if (exists) {
  console.log('Sound is ready to play');
} else {
  console.log('Sound file not found');
}
```

### `getRandomSoundPathFromFaction(faction: Faction, dataDir?: string): string`

Gets a random sound file path from the specified faction(s).

**Parameters:**

- `faction`: Which faction to select from (`'alliance'`, `'horde'`, or `'both'`)
- `dataDir` (optional): Base data directory

**Returns:** Full path to a random sound file

**Example:**

```typescript
import { getRandomSoundPathFromFaction } from '@pantheon-org/opencode-warcraft-notifications-plugin';

// Get random sound from both factions
const soundPath = getRandomSoundPathFromFaction('both');
console.log('Selected:', soundPath);

// Get only Horde sounds
const hordePath = getRandomSoundPathFromFaction('horde');
console.log('Horde sound:', hordePath);
```

### `determineSoundFaction(filename: string): Faction`

Determines which faction a sound file belongs to based on its name.

**Parameters:**

- `filename`: Sound filename

**Returns:** `'alliance'` or `'horde'`

**Example:**

```typescript
import { determineSoundFaction } from '@pantheon-org/opencode-warcraft-notifications-plugin';

console.log(determineSoundFaction('peasant_selected1.wav')); // 'alliance'
console.log(determineSoundFaction('orc_acknowledge1.wav')); // 'horde'
console.log(determineSoundFaction('dragon_selected1.wav')); // 'horde'
```

### `getSoundDescription(filename: string): string | undefined`

Gets the human-readable description (voice line text) for a sound file.

**Parameters:**

- `filename`: Sound filename

**Returns:** Voice line description or `undefined` if not found

**Example:**

```typescript
import { getSoundDescription } from '@pantheon-org/opencode-warcraft-notifications-plugin';

const description = getSoundDescription('jobs_done.wav');
console.log(description); // "Job's done!"

const orc = getSoundDescription('orc_work_completed.wav');
console.log(orc); // "Work complete."
```

## Event Handling

The plugin listens to OpenCode events and responds accordingly.

### Handled Events

#### `session.idle`

Triggered when an OpenCode session becomes idle (no activity for a period).

**Plugin Behavior:**

1. Selects a random sound based on configuration
2. Checks if sound file exists locally
3. Plays the sound using platform-specific command
4. Shows toast notification with voice line and session summary

**Sound Playback:**

| Platform | Command                           | Notes                                     |
| -------- | --------------------------------- | ----------------------------------------- |
| macOS    | `afplay <path>`                   | Built-in, no dependencies                 |
| Linux    | `paplay <path>` or `aplay <path>` | Falls back to aplay if paplay unavailable |
| Windows  | Not implemented                   | Logs warning                              |

**Fallback Behavior:**

If the selected sound file is missing:

- macOS: Plays `/System/Library/Sounds/Glass.aiff`
- Linux: Plays system sound via `canberra-gtk-play`
- Shows toast notification about missing file

#### `message.part.updated`

Tracks the latest message text for use in idle summaries.

**Plugin Behavior:**

1. Saves message ID and text content
2. Used to generate summary when session goes idle
3. Only stores last message (not full history)

## Environment Variables

### `DEBUG_OPENCODE`

Enable debug logging for the plugin.

```bash
DEBUG_OPENCODE=1 opencode
```

**Debug Output:**

- Event types received
- Sound file paths selected
- Installation progress
- Error details

### `SOUNDS_DATA_DIR` (Deprecated)

Override the default sounds directory. Use `soundsDir` configuration instead.

## Error Handling

The plugin handles errors gracefully:

- **Missing sound files**: Falls back to system sounds, shows toast
- **Installation failures**: Logs warning, continues with fallback
- **Toast errors**: Silently ignored (non-critical)
- **Sound playback errors**: Logs error, doesn't crash plugin

All errors are logged via the internal logger with context.

## TypeScript Types

All types are exported for TypeScript users:

```typescript
import type { WarcraftNotificationConfig, Faction } from '@pantheon-org/opencode-warcraft-notifications-plugin';
```

## Complete Example

```typescript
import {
  OpencodeWarcraftNotificationsPlugin,
  loadPluginConfig,
  getSoundFileList,
  installBundledSoundsIfMissing,
  getRandomSoundPathFromFaction,
  determineSoundFaction,
  getSoundDescription,
} from '@pantheon-org/opencode-warcraft-notifications-plugin';

// Load configuration
const config = await loadPluginConfig('@pantheon-ai/opencode-warcraft-notifications');

// Install sounds if needed
const installed = await installBundledSoundsIfMissing(config.soundsDir);
console.log(`Installed ${installed} sound files`);

// List available sounds
const sounds = getSoundFileList();
console.log(`Total sounds available: ${sounds.length}`);

// Get a random sound
const soundPath = getRandomSoundPathFromFaction(config.faction || 'both', config.soundsDir);
const filename = soundPath.split('/').pop()!;
const faction = determineSoundFaction(filename);
const description = getSoundDescription(filename);

console.log('Selected sound:', filename);
console.log('Faction:', faction);
console.log('Voice line:', description);
```

## Related Documentation

- [User Guide](./user-guide.md) - End-user documentation
- [Development Guide](./development.md) - Contributing to the plugin
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions
