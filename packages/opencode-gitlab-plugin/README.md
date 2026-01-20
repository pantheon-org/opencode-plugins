# Gitlab

GitLab integration plugin for OpenCode

> **Note**: This plugin is part of the `pantheon-org/opencode-plugins` monorepo. All development and contributions
> should be made in the main repository at: **https://github.com/pantheon-org/opencode-plugins**
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
nx build opencode-gitlab-plugin

# Pack the plugin for distribution
nx pack opencode-gitlab-plugin
```

## Usage

```typescript
import { pluginName } from '@pantheon-org/opencode-gitlab-plugin';

console.log(pluginName()); // opencode-gitlab-plugin
```

## Building

```bash
nx build opencode-gitlab-plugin
```

## Testing

```bash
nx test opencode-gitlab-plugin
```
