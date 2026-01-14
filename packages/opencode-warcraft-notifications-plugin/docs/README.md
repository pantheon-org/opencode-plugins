# OpenCode Warcraft Notifications Plugin - Documentation

Welcome to the documentation for the OpenCode Warcraft Notifications Plugin! This plugin brings the classic sounds of
Warcraft II to your development workflow.

## Quick Links

- **[User Guide](./user-guide.md)** - Complete guide for end users
- **[API Documentation](./api.md)** - Detailed API reference
- **[Development Guide](./development.md)** - Contributing and development
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions

## Overview

The OpenCode Warcraft Notifications Plugin plays authentic Warcraft II sound effects when your AI assistant session goes
idle. It includes 105 classic sound files from both Alliance and Horde factions, complete with toast notifications
displaying the voice line text.

## Installation

```bash
npm install @pantheon-org/opencode-warcraft-notifications-plugin
```

Or add directly to your `opencode.json`:

```json
{
  "plugin": ["@pantheon-org/opencode-warcraft-notifications-plugin"]
}
```

## Features

- **Classic Warcraft II Sounds**: 105 authentic sound files from both factions
- **Automatic Installation**: Bundled sounds are installed on first run
- **Idle Notifications**: Plays random sounds when OpenCode goes idle
- **Toast Notifications**: Shows voice line text with session summary
- **Configurable Factions**: Choose Alliance, Horde, or both
- **Graceful Fallback**: Uses system sounds if files are missing
- **Cross-Platform**: Supports macOS and Linux (Windows coming soon)

## Quick Configuration

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

## Sound Files

### Alliance (59 sounds)

- Peasants, Knights, Elven Rangers
- Dwarven Riflemen, Mages
- Ships and classic "Jobs done!"

### Horde (46 sounds)

- Orcs, Trolls, Ogres
- Death Knights, Dragons
- Goblin Sappers and "Work completed!"

## Platform Support

| Platform | Sound Command      | Status         |
| -------- | ------------------ | -------------- |
| macOS    | `afplay`           | ✅ Supported   |
| Linux    | `paplay` / `aplay` | ✅ Supported   |
| Windows  | TBD                | ⚠️ Coming soon |

## Documentation Structure

- **[User Guide](./user-guide.md)** - Installation, configuration, and usage
- **[API Documentation](./api.md)** - Complete API reference with examples
- **[Development Guide](./development.md)** - Development setup and contribution guide
- **[Troubleshooting](./troubleshooting.md)** - Solutions to common problems

## Getting Help

If you need assistance:

1. Check the [Troubleshooting Guide](./troubleshooting.md)
2. Review the [User Guide](./user-guide.md)
3. Search [GitHub Issues](https://github.com/pantheon-org/opencode-plugins/issues)
4. Create a new issue in the [main monorepo](https://github.com/pantheon-org/opencode-plugins)

## Contributing

This plugin is part of the [opencode-plugins monorepo](https://github.com/pantheon-org/opencode-plugins). See the
[Development Guide](./development.md) for information on contributing.

## License

MIT

## Credits

Sound effects are from Warcraft II: Tides of Darkness by Blizzard Entertainment. This is a fan project and is not
affiliated with or endorsed by Blizzard Entertainment.
