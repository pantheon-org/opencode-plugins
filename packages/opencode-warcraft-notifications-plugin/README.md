# OpenCode Warcraft Notifications Plugin

Enhance your OpenCode experience with iconic Warcraft-style audio notifications for development events.

> **Note**: This plugin is part of the `pantheon-org/opencode-plugins` monorepo. All development and contributions
> should be made in the main repository at: **https://github.com/pantheon-org/opencode-plugins**
>
> If you're viewing this as a mirror repository, it is read-only. Submit issues, PRs, and contributions to the main
> monorepo.

<!-- START doctoc -->
<!-- END doctoc -->

## Features

- 🎮 **Audio Feedback** - Get Warcraft-style notifications for important development events
- ⚡ **Event Listening** - Automatically responds to OpenCode session and file events
- 🔊 **Smart Notifications** - Different sounds for different event types
- 🎯 **Zero Configuration** - Works out of the box once installed

## Installation

```bash
npm install @pantheon-org/opencode-warcraft-notifications-plugin
```

Or add to your `opencode.json`:

```json
{
  "plugin": ["@pantheon-org/opencode-warcraft-notifications-plugin"]
}
```

## Usage

The plugin automatically activates when OpenCode starts. It listens for the following events:

- **Session Created** - When a new OpenCode session begins
- **Session Error** - When an error occurs in the session
- **File Edited** - When files are modified
- **Command Executed** - When commands complete

No additional configuration required!

## Building

```bash
nx build opencode-warcraft-notifications-plugin
```

## Testing

```bash
nx test opencode-warcraft-notifications-plugin
```
