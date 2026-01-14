# OpenCode Warcraft Notifications Plugin

Bring the nostalgia of Warcraft II to your OpenCode development workflow! This plugin plays authentic Warcraft II sound
effects when your AI assistant goes idle, complete with voice lines and toast notifications.

> **Note**: This plugin is part of the `pantheon-org/opencode-plugins` monorepo. All development and contributions
> should be made in the main repository at: **https://github.com/pantheon-org/opencode-plugins**
>
> If you're viewing this as a mirror repository, it is read-only. Submit issues, PRs, and contributions to the main
> monorepo.

## Features

- 🎮 **Classic Warcraft II Sounds**: Authentic sound effects from both Alliance and Horde factions
- 🔊 **Idle Notifications**: Plays a random sound when OpenCode session goes idle
- 📱 **Toast Notifications**: Shows voice line text with session summary
- ⚙️ **Configurable**: Choose Alliance, Horde, or both factions
- 🎵 **Bundled Sounds**: Includes 100+ sound files, automatically installed on first run
- 🔇 **Graceful Fallback**: Uses system sounds if sound files are missing

## Installation

Install the plugin via npm or your preferred package manager:

```bash
npm install @pantheon-org/opencode-warcraft-notifications-plugin
```

Or add it directly to your `opencode.json`:

```json
{
  "plugin": ["@pantheon-org/opencode-warcraft-notifications-plugin"]
}
```

## Quick Start

1. **Install the plugin** (see above)
2. **Restart OpenCode** - The plugin will automatically install sound files on first run
3. **Work with OpenCode** - When a session goes idle, you'll hear a Warcraft II sound and see a toast notification!

## Configuration

Configure the plugin in your `opencode.json`:

```json
{
  "plugin": ["@pantheon-org/opencode-warcraft-notifications-plugin"],
  "@pantheon-ai/opencode-warcraft-notifications": {
    "faction": "both",
    "soundsDir": "~/.config/opencode/sounds",
    "showDescriptionInToast": true
  }
}
```

### Configuration Options

| Option                   | Type                              | Default                     | Description                                 |
| ------------------------ | --------------------------------- | --------------------------- | ------------------------------------------- |
| `faction`                | `'alliance' \| 'horde' \| 'both'` | `'both'`                    | Which faction sounds to play                |
| `soundsDir`              | `string`                          | `~/.config/opencode/sounds` | Directory for sound files                   |
| `showDescriptionInToast` | `boolean`                         | `true`                      | Show voice line text in toast notifications |

## Sound Files

The plugin includes authentic Warcraft II sound files:

### Alliance Sounds (59 files)

- Peasant acknowledgments and selections
- Knight battle cries
- Elven ranger responses
- Dwarven rifleman calls
- Mage incantations
- Ship acknowledgments
- Classic "Jobs done!" and "Work completed"

### Horde Sounds (46 files)

- Orc peon responses
- Troll berserker calls
- Ogre grunts
- Death knight commands
- Dragon roars
- Goblin sapper acknowledgments
- Classic "Work completed"

Sound files are automatically installed to `~/.config/opencode/sounds/` on first run.

## Platform Support

| Platform | Sound Playback     | Status                 |
| -------- | ------------------ | ---------------------- |
| macOS    | `afplay`           | ✅ Fully supported     |
| Linux    | `paplay` / `aplay` | ✅ Fully supported     |
| Windows  | -                  | ⚠️ Not yet implemented |

## Development

### Building

```bash
# Build the plugin
nx build opencode-warcraft-notifications-plugin

# Build and watch for changes
nx build opencode-warcraft-notifications-plugin --watch

# Or use npm scripts
cd packages/opencode-warcraft-notifications-plugin
bun run build
bun run dev  # Watch mode
```

### Testing

```bash
# Run all tests
nx test opencode-warcraft-notifications-plugin

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage
```

### Local Development

1. Clone the monorepo:

   ```bash
   git clone https://github.com/pantheon-org/opencode-plugins.git
   cd opencode-plugins
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Build the plugin:

   ```bash
   nx build opencode-warcraft-notifications-plugin
   ```

4. Link locally for testing:

   ```bash
   cd packages/opencode-warcraft-notifications-plugin
   npm link

   # In your OpenCode project
   npm link @pantheon-org/opencode-warcraft-notifications-plugin
   ```

## Troubleshooting

### No Sound Playing

1. **Check sound files**: Verify files exist in `~/.config/opencode/sounds/`
2. **Platform support**: Ensure you're on macOS or Linux
3. **Sound command**: Verify `afplay` (macOS) or `paplay`/`aplay` (Linux) is available:
   ```bash
   which afplay  # macOS
   which paplay  # Linux
   ```

### Plugin Not Loading

1. **Check opencode.json**: Ensure plugin is properly configured
2. **Rebuild**: Run `nx build opencode-warcraft-notifications-plugin`
3. **Check logs**: Enable debug mode with `DEBUG_OPENCODE=1`

### Sound Files Not Installing

1. **Permissions**: Ensure write access to `~/.config/opencode/`
2. **Disk space**: Verify sufficient disk space (need ~1MB)
3. **Manual installation**: Copy `data/` directory to `~/.config/opencode/sounds/`

## License

MIT

## Credits

Sound effects are from Warcraft II: Tides of Darkness, created by Blizzard Entertainment. This is a fan project and is
not affiliated with or endorsed by Blizzard Entertainment.

## Contributing

This plugin is part of the [opencode-plugins monorepo](https://github.com/pantheon-org/opencode-plugins). Please submit
issues and pull requests there.

## Documentation

For more detailed documentation, see:

- [User Guide](./docs/user-guide.md)
- [API Documentation](./docs/api.md)
- [Development Guide](./docs/development.md)
- [Troubleshooting Guide](./docs/troubleshooting.md)
