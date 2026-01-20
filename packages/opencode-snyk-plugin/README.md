# Snyk

Snyk security scanning plugin for OpenCode

> **Note**: This plugin is part of the `pantheon-org/opencode-plugins` monorepo. All development and contributions
> should be made in the main repository at: <https://github.com/pantheon-org/opencode-plugins>
>
> If you're viewing this as a mirror repository, it is read-only. Submit issues, PRs, and contributions to the main
> monorepo.

<!-- START doctoc -->
<!-- END doctoc -->

## Installation

```bash
# Install dependencies
bun install

# Build the plugin
nx build opencode-snyk-plugin

# Pack the plugin for distribution
nx pack opencode-snyk-plugin
```

## Usage

```typescript
import { pluginName } from '@pantheon-org/opencode-snyk-plugin';

console.log(pluginName()); // opencode-snyk-plugin
```

## Building

```bash
nx build opencode-snyk-plugin
```

## Testing

```bash
nx test opencode-snyk-plugin
```
