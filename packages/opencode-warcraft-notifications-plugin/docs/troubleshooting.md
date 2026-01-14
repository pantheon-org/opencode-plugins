# Troubleshooting Guide

Solutions to common issues with the OpenCode Warcraft Notifications Plugin.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Sound Playback Issues](#sound-playback-issues)
- [Configuration Issues](#configuration-issues)
- [Platform-Specific Issues](#platform-specific-issues)
- [Performance Issues](#performance-issues)
- [Advanced Debugging](#advanced-debugging)
- [Getting Help](#getting-help)

## Installation Issues

### Plugin Not Loading

**Symptoms:**

- No sounds play when session goes idle
- No installation toast appears
- Plugin seems inactive

**Solutions:**

1. **Verify plugin is in configuration**

Check your `opencode.json`:

```json
{
  "plugin": ["@pantheon-org/opencode-warcraft-notifications-plugin"]
}
```

2. **Restart OpenCode**

After adding the plugin, restart OpenCode completely:

```bash
# Exit OpenCode
# Then start it again
opencode
```

3. **Check plugin installation**

```bash
npm list @pantheon-org/opencode-warcraft-notifications-plugin
```

Should show the installed version.

4. **Reinstall plugin**

```bash
npm uninstall @pantheon-org/opencode-warcraft-notifications-plugin
npm install @pantheon-org/opencode-warcraft-notifications-plugin
```

### Installation Error: Permission Denied

**Symptoms:**

- Error during `npm install`
- Cannot write to directory

**Solutions:**

1. **Check npm permissions**

```bash
npm config get prefix
```

If it's a system directory, configure user-level installation:

```bash
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

2. **Use sudo (not recommended)**

```bash
sudo npm install -g @pantheon-org/opencode-warcraft-notifications-plugin
```

Better: Fix npm permissions instead.

### Sound Files Not Installing

**Symptoms:**

- Toast says "Installed 0 sound files"
- Sounds don't play
- Directory `~/.config/opencode/sounds/` is empty

**Solutions:**

1. **Check directory permissions**

```bash
ls -la ~/.config/opencode/
chmod 755 ~/.config/opencode/
```

2. **Manual installation**

```bash
# Find plugin path
npm list -g @pantheon-org/opencode-warcraft-notifications-plugin

# Copy sounds manually
cp -r /path/to/plugin/data/* ~/.config/opencode/sounds/
```

3. **Verify sound files exist in package**

```bash
npm pack @pantheon-org/opencode-warcraft-notifications-plugin --dry-run
```

Should list `data/alliance/` and `data/horde/` files.

## Sound Playback Issues

### No Sound Playing

**Symptoms:**

- Session goes idle but no sound plays
- Toast appears but silent

**Solutions:**

1. **Check system audio**

Test system audio:

```bash
# macOS
afplay /System/Library/Sounds/Glass.aiff

# Linux
paplay /usr/share/sounds/alsa/Front_Center.wav
```

2. **Verify sound files exist**

```bash
ls -l ~/.config/opencode/sounds/alliance/
ls -l ~/.config/opencode/sounds/horde/
```

Should show .wav files.

3. **Check audio command availability**

```bash
# macOS
which afplay

# Linux
which paplay
which aplay
```

4. **Test manual playback**

```bash
# macOS
afplay ~/.config/opencode/sounds/alliance/jobs_done.wav

# Linux
paplay ~/.config/opencode/sounds/horde/orc_work_completed.wav
```

### Sound Plays Wrong File

**Symptoms:**

- Alliance faction configured but Horde sounds play
- Unexpected sound files

**Solutions:**

1. **Check faction configuration**

```json
{
  "@pantheon-ai/opencode-warcraft-notifications": {
    "faction": "alliance" // or "horde" or "both"
  }
}
```

2. **Restart OpenCode**

Configuration changes require restart.

3. **Verify configuration loading**

Enable debug mode:

```bash
DEBUG_OPENCODE=1 opencode
```

Look for configuration log messages.

### Sound Quality Issues

**Symptoms:**

- Distorted audio
- Crackling sounds
- Volume too low/high

**Solutions:**

1. **Check system volume**

Adjust your system volume mixer.

2. **Check audio output device**

Ensure correct output device is selected in system preferences.

3. **Test with system sounds**

If system sounds work properly, the issue is likely with the WAV files.

## Configuration Issues

### Configuration Not Loading

**Symptoms:**

- Custom settings not applied
- Always uses defaults

**Solutions:**

1. **Verify JSON syntax**

Use a JSON validator:

```bash
cat opencode.json | python -m json.tool
```

2. **Check plugin name**

Must match exactly:

```json
{
  "@pantheon-ai/opencode-warcraft-notifications": {
    "faction": "horde"
  }
}
```

Note: Different from package name `@pantheon-org/opencode-warcraft-notifications-plugin`

3. **Check configuration location**

OpenCode looks for `opencode.json` in:

- Current directory
- Project root
- Home directory

### Custom Directory Not Working

**Symptoms:**

- Sounds install to default location
- Custom `soundsDir` ignored

**Solutions:**

1. **Use absolute path**

```json
{
  "@pantheon-ai/opencode-warcraft-notifications": {
    "soundsDir": "/Users/yourname/Documents/opencode-sounds"
  }
}
```

Not relative paths like `../sounds`.

2. **Expand tilde manually**

If `~` doesn't work:

```json
{
  "soundsDir": "/Users/yourname/.config/opencode/sounds"
}
```

3. **Check directory permissions**

```bash
mkdir -p /path/to/custom/dir
chmod 755 /path/to/custom/dir
```

### Toast Notifications Not Showing

**Symptoms:**

- Sound plays but no toast
- Expected notification missing

**Solutions:**

1. **Check configuration**

```json
{
  "@pantheon-ai/opencode-warcraft-notifications": {
    "showDescriptionInToast": true
  }
}
```

2. **Check OpenCode TUI**

Ensure OpenCode's TUI is running properly.

3. **Check for errors**

```bash
DEBUG_OPENCODE=1 opencode
```

Look for toast-related errors.

## Platform-Specific Issues

### macOS Issues

#### Sound Command Not Found

**Symptom:** `afplay: command not found`

**Solution:** This should never happen on macOS. If it does, reinstall macOS or contact Apple Support.

#### Permission Denied

**Symptom:** Cannot access sound files

**Solution:**

```bash
chmod -R 755 ~/.config/opencode/sounds/
```

### Linux Issues

#### No Audio Command Available

**Symptom:** Neither `paplay` nor `aplay` found

**Solution:** Install audio utilities:

```bash
# Debian/Ubuntu
sudo apt-get install pulseaudio-utils alsa-utils

# Fedora/RHEL
sudo dnf install pulseaudio-utils alsa-utils

# Arch
sudo pacman -S pulseaudio alsa-utils
```

#### PulseAudio Not Running

**Symptom:** `paplay` fails with connection error

**Solution:**

```bash
# Start PulseAudio
pulseaudio --start

# Check status
pulseaudio --check
echo $?  # Should print 0
```

#### ALSA Playback Issues

**Symptom:** `aplay` fails or no sound

**Solution:**

```bash
# List audio devices
aplay -l

# Test with specific device
aplay -D hw:0,0 ~/.config/opencode/sounds/alliance/jobs_done.wav
```

### Windows Issues

**Symptom:** Plugin logs warning about Windows support

**Solution:** Windows support is not yet implemented. The plugin will:

- Log a warning
- Not play sounds
- Still work otherwise

**Workaround:** Use WSL2 with Linux audio forwarding.

## Performance Issues

### Plugin Causes Slowdown

**Symptoms:**

- OpenCode feels slower
- High CPU usage

**Solutions:**

1. **Check for excessive logging**

Disable debug mode if enabled:

```bash
unset DEBUG_OPENCODE
```

2. **Check for file I/O issues**

Move sounds directory to faster storage:

```json
{
  "soundsDir": "/path/to/ssd/sounds"
}
```

3. **Reduce toast notifications**

```json
{
  "showDescriptionInToast": false
}
```

### High Memory Usage

**Symptom:** OpenCode uses more RAM than expected

**Solution:** This shouldn't happen. The plugin:

- Doesn't cache sound files in memory
- Uses minimal memory (<1MB)
- Doesn't keep large data structures

If memory issues persist, it's likely not this plugin.

## Advanced Debugging

### Enable Debug Logging

```bash
DEBUG_OPENCODE=1 opencode
```

**Debug Output Includes:**

- Event types received
- Sound file selection
- File existence checks
- Configuration loading
- Playback commands

### Check Event Flow

1. **Session idle event**

Look for:

```
Event received: session.idle
```

2. **Sound selection**

Look for:

```
Selected sound: orc_work_completed.wav
Sound path: /path/to/sounds/horde/orc_work_completed.wav
```

3. **File check**

Look for:

```
Sound file exists: true
```

4. **Playback command**

Look for:

```
Executing: afplay /path/to/sound.wav
```

### Test Plugin Loading

Check if plugin exports are available:

```bash
node -e "import('@pantheon-org/opencode-warcraft-notifications-plugin').then(m => console.log(Object.keys(m)))"
```

Should show:

```
[
  'OpencodeWarcraftNotificationsPlugin',
  'loadPluginConfig',
  'installBundledSoundsIfMissing',
  ...
]
```

### Verify Sound File Integrity

Check file sizes and formats:

```bash
# Check file sizes
du -h ~/.config/opencode/sounds/alliance/* | head -5

# Check file types
file ~/.config/opencode/sounds/horde/orc_selected1.wav

# Play specific file
afplay ~/.config/opencode/sounds/alliance/jobs_done.wav
```

### Check OpenCode Version

Some features may require specific OpenCode versions:

```bash
opencode --version
```

## Common Error Messages

### "Sound file not found"

**Cause:** Selected sound file doesn't exist

**Solution:** Reinstall sounds:

```bash
rm -rf ~/.config/opencode/sounds/
# Restart OpenCode to trigger reinstallation
```

### "Failed to install sound files"

**Cause:** Permission or I/O error

**Solution:**

```bash
mkdir -p ~/.config/opencode/sounds
chmod 755 ~/.config/opencode/sounds
```

### "Plugin not found"

**Cause:** Plugin not installed or not in node_modules

**Solution:**

```bash
npm install @pantheon-org/opencode-warcraft-notifications-plugin
```

### "Configuration invalid"

**Cause:** Malformed JSON or invalid values

**Solution:** Validate JSON and check configuration options.

## Getting Help

If you're still experiencing issues:

### 1. Search GitHub Issues

Check existing issues: https://github.com/pantheon-org/opencode-plugins/issues

### 2. Create New Issue

Include the following information:

**System Info:**

```bash
# OS version
uname -a

# OpenCode version
opencode --version

# Node/Bun version
node --version
bun --version

# Plugin version
npm list @pantheon-org/opencode-warcraft-notifications-plugin
```

**Configuration:**

```json
// Your opencode.json (sanitize any sensitive data)
{
  "plugin": ["@pantheon-org/opencode-warcraft-notifications-plugin"],
  "@pantheon-ai/opencode-warcraft-notifications": {
    // your config
  }
}
```

**Debug Output:**

```bash
DEBUG_OPENCODE=1 opencode 2>&1 | tee debug.log
# Attach debug.log
```

**Error Messages:** Copy exact error messages and stack traces.

### 3. Check Documentation

- [User Guide](./user-guide.md) - Usage instructions
- [API Documentation](./api.md) - API reference
- [Development Guide](./development.md) - Contributing

### 4. Community Support

- OpenCode Discord server
- GitHub Discussions

## Quick Fixes Summary

| Problem            | Quick Fix                                 |
| ------------------ | ----------------------------------------- |
| Plugin not loading | Check `opencode.json`, restart OpenCode   |
| No sound           | Test `afplay`/`paplay`, check files exist |
| Wrong faction      | Fix `faction` config, restart             |
| Config ignored     | Check JSON syntax, plugin name            |
| Permission error   | `chmod 755 ~/.config/opencode/sounds/`    |
| Missing files      | Delete sounds dir, restart to reinstall   |
| Toast not showing  | Set `showDescriptionInToast: true`        |
| Debug needed       | `DEBUG_OPENCODE=1 opencode`               |

## Related Documentation

- [User Guide](./user-guide.md) - Complete usage guide
- [API Documentation](./api.md) - Detailed API reference
- [Development Guide](./development.md) - Contributing guide

## Still Need Help?

If this guide doesn't solve your issue:

1. Enable debug logging
2. Reproduce the issue
3. Capture debug output
4. Create a GitHub issue with details

We'll help you resolve it!
