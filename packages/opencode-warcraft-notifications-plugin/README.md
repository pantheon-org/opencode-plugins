# WarcraftNotifications

OpenCode plugin for warcraft-notifications

<!-- START doctoc -->
<!-- END doctoc -->

## Installation

```bash
# Install dependencies
bun install

# Build the plugin
nx build opencode-warcraft-notifications-plugin

# Pack the plugin for distribution
nx pack opencode-warcraft-notifications-plugin
```

## Development

The main plugin logic is in `src/index.ts`. Implement your OpenCode plugin functionality there.

## Usage

```typescript
import { pluginName } from '@pantheon-org/opencode-warcraft-notifications-plugin';

console.log(pluginName()); // opencode-warcraft-notifications-plugin
```

## Building

```bash
nx build opencode-warcraft-notifications-plugin
```

## Testing

```bash
nx test opencode-warcraft-notifications-plugin
```
