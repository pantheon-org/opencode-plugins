# WarcraftNotifications

OpenCode plugin for warcraft-notifications

> **Note**: This plugin is part of the `pantheon-org/opencode-plugins` monorepo. All development and
> contributions should be made in the main repository at:
> **https://github.com/pantheon-org/opencode-plugins**
>
> If you're viewing this as a mirror repository, it is read-only. Submit issues, PRs, and
> contributions to the main monorepo.

<!-- START doctoc -->
<!-- END doctoc -->

## Installation

```bash
# Install dependencies
bun install

# Build the plugin
nx build opencode-warcraft-notifications

# Pack the plugin for distribution
nx pack opencode-warcraft-notifications
```

## Usage

```typescript
import { pluginName } from '@pantheon-org/opencode-warcraft-notifications';

console.log(pluginName()); // opencode-warcraft-notifications
```

## Building

```bash
nx build opencode-warcraft-notifications
```

## Testing

```bash
nx test opencode-warcraft-notifications
```
