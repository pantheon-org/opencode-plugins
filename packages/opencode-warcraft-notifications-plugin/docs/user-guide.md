# User Guide

Complete guide to using the OpenCode Warcraft Notifications Plugin.

## Table of Contents

- [Getting Started](#getting-started)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Configuration](#configuration)
- [Sound Files](#sound-files)
- [Platform Support](#platform-support)
- [Advanced Usage](#advanced-usage)
- [Best Practices](#best-practices)
- [FAQ](#faq)

## Getting Started

The OpenCode Warcraft Notifications Plugin enhances your development workflow by playing classic Warcraft II sound
effects when your AI assistant goes idle. It's a fun way to stay engaged and get notified when OpenCode finishes
processing.

### What You'll Get

- 105 authentic Warcraft II sound files
- Automatic sound playback on idle sessions
- Toast notifications with voice line text
- Configurable faction preferences
- Cross-platform support (macOS & Linux)

## Installation

### Prerequisites

- OpenCode installed and configured
- macOS or Linux operating system
- Audio playback capability (`afplay` on macOS, `paplay` or `aplay` on Linux)

### Install via npm

```bash
npm install @pantheon-org/opencode-warcraft-notifications-plugin
```

### Install via OpenCode configuration

Add the plugin to your `opencode.json`:

```json
{
  "plugin": ["@pantheon-org/opencode-warcraft-notifications-plugin"]
}
```

### Verify Installation

After restarting OpenCode, the plugin will:

1. Automatically install sound files on first run
2. Show a toast notification confirming installation
3. Begin playing sounds when sessions go idle

## Basic Usage

### Default Behavior

With no configuration, the plugin:

- Plays random sounds from both Alliance and Horde factions
- Shows toast notifications with voice line text
- Stores sound files in `~/.config/opencode/sounds/`

### First Run

When you first use the plugin:

1. **Automatic Installation**: Sound files are copied to your config directory
2. **Toast Notification**: You'll see a confirmation message
3. **Ready to Use**: The plugin is now active

### Idle Notifications

The plugin activates when your OpenCode session goes idle:

1. Session becomes idle (no activity)
2. Random sound is selected based on your faction preference
3. Sound plays using your system's audio
4. Toast notification appears with:
   - Voice line text (e.g., "Job's done!")
   - Short summary of the last message

## Configuration

### Basic Configuration

Add configuration to your `opencode.json`:

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

#### `faction`

Choose which faction sounds to play.

**Options:**

- `"alliance"` - Only Alliance sounds (peasants, knights, elves, etc.)
- `"horde"` - Only Horde sounds (orcs, trolls, ogres, etc.)
- `"both"` - Mix of both factions (default)

**Examples:**

```json
{
  "@pantheon-ai/opencode-warcraft-notifications": {
    "faction": "alliance"
  }
}
```

```json
{
  "@pantheon-ai/opencode-warcraft-notifications": {
    "faction": "horde"
  }
}
```

#### `soundsDir`

Custom directory for sound files.

**Default:** `~/.config/opencode/sounds`

**Example:**

```json
{
  "@pantheon-ai/opencode-warcraft-notifications": {
    "soundsDir": "/Users/myname/Documents/opencode-sounds"
  }
}
```

**Notes:**

- Must be an absolute path
- Directory will be created if it doesn't exist
- Sound files will be installed to this location

#### `showDescriptionInToast`

Show voice line text in toast notifications.

**Default:** `true`

**Examples:**

```json
{
  "@pantheon-ai/opencode-warcraft-notifications": {
    "showDescriptionInToast": true
  }
}
```

When `true`:

- Toast shows voice line (e.g., "Job's done!")
- Includes session summary

When `false`:

- Sound plays without toast
- Silent notification mode

### Configuration Examples

#### Alliance Only, Custom Directory

```json
{
  "plugin": ["@pantheon-org/opencode-warcraft-notifications-plugin"],
  "@pantheon-ai/opencode-warcraft-notifications": {
    "faction": "alliance",
    "soundsDir": "~/my-opencode-sounds",
    "showDescriptionInToast": true
  }
}
```

#### Horde Only, Silent Mode

```json
{
  "plugin": ["@pantheon-org/opencode-warcraft-notifications-plugin"],
  "@pantheon-ai/opencode-warcraft-notifications": {
    "faction": "horde",
    "showDescriptionInToast": false
  }
}
```

#### Minimal Configuration

```json
{
  "plugin": ["@pantheon-org/opencode-warcraft-notifications-plugin"]
}
```

Uses all defaults: both factions, default directory, toasts enabled.

## Sound Files

### Alliance Sounds (59 files)

**Peasants (8 sounds)**

- Acknowledgments: "Yes?", "Ready to work", "What?", "Okay"
- Selected: "Yes, m'lord?", "More work?", "Hmmm?", "Ready sir"

**Knights (8 sounds)**

- Acknowledgments: "Yes, sire", "At once", "For the king!", "As you wish"
- Selected: "My lord?", "Yes?", "Ready", "Orders?"

**Elven Rangers (8 sounds)**

- Acknowledgments: "Yes?", "I go", "Fear not", "By your side"
- Selected: "What is it?", "Hmm?", "Yes?", "I listen"

**Dwarven Riflemen (7 sounds)**

- Acknowledgments: "Aye?", "Locked and loaded", "Fire!", "Ready"
- Selected: "Aye?", "Ready", "Waiting"

**Mages (6 sounds)**

- Acknowledgments: "Yes?", "I'll do it", "Of course"
- Selected: "What?", "Do you require aid?", "Hmm?"

**Ships (7 sounds)**

- Acknowledgments: "Aye aye sir", "Set sail", "What course?"
- Selected: "Awaiting orders", "Yes captain?", "Ready", "Aye?"

**Special (2 sounds)**

- "Job's done!" - Work completed sound
- "Work completed" - Alternative completion

### Horde Sounds (46 files)

**Orcs (10 sounds)**

- Acknowledgments: "Yes?", "What you want?", "Okay", "Zug zug"
- Selected: "Hmmm?", "What?", "Yes?", "Work work", "Me busy", "Leave me alone!"

**Trolls (6 sounds)**

- Acknowledgments: "Ya mon!", "Right away", "I hear and obey"
- Selected: "What you want?", "I'm listening", "Ya?"

**Ogres (7 sounds)**

- Acknowledgments: "Okay", "Right", "Hungry"
- Selected: "Uh?", "What?", "Want something?", "Food?"

**Ogre Mages (7 sounds)**

- Acknowledgments: "I understand", "Of course", "Agreed"
- Selected: "My powers are vast", "What?", "Magic?", "Yes?"

**Death Knights (5 sounds)**

- Acknowledgments: "I will obey", "Dark path", "For darkness"
- Selected: "What is it?", "I serve"

**Dragons (3 sounds)**

- Acknowledgments: "I'll fly", "Dragon's breath"
- Selected: "Dragon ready"

**Goblin Sappers (8 sounds)**

- Acknowledgments: "Heh heh", "Ready to blow", "Boom!", "Let's go"
- Selected: "What?", "Ready", "Waiting", "Yeah?"

**Special (1 sound)**

- "Work complete" - Horde version

### Sound File Locations

After installation, sound files are organized by faction:

```
~/.config/opencode/sounds/
├── alliance/
│   ├── peasant_selected1.wav
│   ├── knight_acknowledge1.wav
│   ├── jobs_done.wav
│   └── ... (59 files)
└── horde/
    ├── orc_selected1.wav
    ├── orc_work_completed.wav
    ├── dragon_acknowledge1.wav
    └── ... (46 files)
```

## Platform Support

### macOS

**Sound Command:** `afplay`

**Requirements:**

- Built into macOS
- No additional installation needed

**Fallback Sound:**

- `/System/Library/Sounds/Glass.aiff`

**Status:** ✅ Fully supported

### Linux

**Sound Commands:** `paplay` (preferred) or `aplay` (fallback)

**Requirements:**

- PulseAudio: `paplay` (usually pre-installed)
- ALSA: `aplay` (fallback if paplay unavailable)

**Installation (if needed):**

```bash
# Debian/Ubuntu
sudo apt-get install pulseaudio-utils

# Fedora/RHEL
sudo dnf install pulseaudio-utils

# Arch
sudo pacman -S pulseaudio
```

**Fallback Sound:**

- System sound via `canberra-gtk-play --id=message`

**Status:** ✅ Fully supported

### Windows

**Status:** ⚠️ Not yet implemented

The plugin will log a warning on Windows but won't crash. Windows support is planned for a future release.

## Advanced Usage

### Custom Sound Directory

Store sounds in a custom location:

```json
{
  "@pantheon-ai/opencode-warcraft-notifications": {
    "soundsDir": "/mnt/storage/opencode-sounds"
  }
}
```

**Use Cases:**

- Network storage
- Shared sound library
- Custom organization

### Faction Switching

Change factions without reinstalling:

```json
{
  "@pantheon-ai/opencode-warcraft-notifications": {
    "faction": "alliance"
  }
}
```

Restart OpenCode to apply changes.

### Debug Mode

Enable detailed logging:

```bash
DEBUG_OPENCODE=1 opencode
```

**Debug Output:**

- Event types received
- Sound selection process
- File existence checks
- Playback commands

### Manual Sound Installation

If automatic installation fails:

1. Locate the plugin installation:

   ```bash
   npm list -g @pantheon-org/opencode-warcraft-notifications-plugin
   ```

2. Copy sound files manually:

   ```bash
   cp -r <plugin-path>/data/* ~/.config/opencode/sounds/
   ```

3. Verify structure:
   ```bash
   ls -l ~/.config/opencode/sounds/
   ```

## Best Practices

### 1. Start with Defaults

Use default configuration initially:

```json
{
  "plugin": ["@pantheon-org/opencode-warcraft-notifications-plugin"]
}
```

Customize after you understand the behavior.

### 2. Choose Your Faction

Pick the faction that matches your preference:

- Alliance: Classic fantasy voice lines
- Horde: Guttural, aggressive sounds
- Both: Maximum variety

### 3. Manage Sound Volume

Adjust system volume for OpenCode sessions:

- Set reasonable volume before starting
- Use volume mixer to control OpenCode specifically
- Consider time of day and environment

### 4. Toast Notification Settings

Choose based on your workflow:

- Enable for voice line text and summaries
- Disable for minimal distraction
- Use debug mode to verify behavior

### 5. Custom Sound Directory

Use custom directory if:

- You want to share sounds across projects
- Default location has permission issues
- You're on a system with limited home directory space

### 6. Keep Sound Files

Don't delete the `data/` directory:

- Sound files are bundled with the plugin
- Needed for fresh installations
- Used to repair missing files

## FAQ

### Q: How many sound files are included?

**A:** 105 total sound files: 59 Alliance, 46 Horde.

### Q: Do I need an internet connection?

**A:** No. All sounds are bundled with the plugin and installed locally.

### Q: Can I add my own sound files?

**A:** Not currently supported. Custom sounds may be added in a future release.

### Q: Will this work on Windows?

**A:** Not yet. Windows support is planned but not currently implemented.

### Q: Why isn't sound playing?

**A:** See the [Troubleshooting Guide](./troubleshooting.md) for detailed solutions.

### Q: Can I disable toast notifications but keep sounds?

**A:** Yes. Set `"showDescriptionInToast": false` in your configuration.

### Q: How do I uninstall the plugin?

**A:**

1. Remove from `opencode.json`
2. Run `npm uninstall @pantheon-org/opencode-warcraft-notifications-plugin`
3. Optionally delete `~/.config/opencode/sounds/`

### Q: What triggers the idle sound?

**A:** OpenCode's internal idle detection. The exact timing depends on session activity.

### Q: Can I change the idle timeout?

**A:** No. Idle timeout is controlled by OpenCode core, not the plugin.

### Q: Are the sounds copyrighted?

**A:** Yes. Sounds are from Warcraft II by Blizzard Entertainment. This is a fan project for personal use.

## Next Steps

- [API Documentation](./api.md) - Detailed API reference
- [Development Guide](./development.md) - Contribute to the plugin
- [Troubleshooting](./troubleshooting.md) - Solve common issues

## Getting Help

Need assistance?

1. Check the [Troubleshooting Guide](./troubleshooting.md)
2. Review [GitHub Issues](https://github.com/pantheon-org/opencode-plugins/issues)
3. Create a new issue with:
   - OpenCode version
   - Operating system
   - Configuration file
   - Error messages
   - Debug output
