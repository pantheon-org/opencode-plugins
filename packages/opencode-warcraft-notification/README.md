# @pantheon-org/opencode-warcraft-notification

> **Note for Mirror Repo**: If this README appears in the mirror repo `pantheon-org/opencode-warcraft-notification`, add this banner at the top:
> 
> ```markdown
> > **Note**: This is a read-only mirror. For issues, PRs, and contributions, visit [pantheon-org/opencode-plugins](https://github.com/pantheon-org/opencode-plugins).
> ```

OpenCode plugin for Warcraft notifications.

## Development (Monorepo)

This package is developed in the [opencode-plugins](https://github.com/pantheon-org/opencode-plugins) monorepo.

### Build

```bash
# From package directory
bun install
bun run build

# Or from monorepo root
bunx nx run opencode-warcraft-notification:build
```

### Pack (dry-run publish)

```bash
cd packages/opencode-warcraft-notification
bunx npm pack
```

### Documentation

Static site content lives in `docs/`. On release, the mirror repo deploys this to GitHub Pages.

## Installation (End Users)

```bash
npm install @pantheon-org/opencode-warcraft-notification
# or
bun add @pantheon-org/opencode-warcraft-notification
```

## Usage

```typescript
import { pluginName } from '@pantheon-org/opencode-warcraft-notification';

console.log(pluginName()); // 'opencode-warcraft-notification'
```

## Resources

- [Monorepo](https://github.com/pantheon-org/opencode-plugins)
- [Documentation](https://pantheon-org.github.io/opencode-warcraft-notification/)
- [Migration Guide](https://github.com/pantheon-org/opencode-plugins/blob/main/PLUGINS_MIGRATION.md)
