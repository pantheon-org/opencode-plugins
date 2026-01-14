# Development Guide

Guide for developers who want to contribute to or modify the OpenCode Warcraft Notifications Plugin.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Building](#building)
- [Code Style](#code-style)
- [Contributing](#contributing)
- [Release Process](#release-process)

## Prerequisites

### Required Tools

- **Bun**: v1.0.0 or higher
- **Node.js**: v20.0.0 or higher (for compatibility)
- **Git**: Latest version
- **TypeScript**: v5.9.2 (included in dependencies)

### Optional Tools

- **Visual Studio Code**: Recommended IDE
- **ESLint Extension**: For real-time linting
- **Prettier Extension**: For code formatting

### System Requirements

- **macOS** or **Linux**: For testing sound playback
- **Audio system**: Working audio output for testing

## Setup

### 1. Clone the Monorepo

This plugin is part of the `opencode-plugins` monorepo:

```bash
git clone https://github.com/pantheon-org/opencode-plugins.git
cd opencode-plugins
```

### 2. Install Dependencies

Install all monorepo dependencies:

```bash
bun install
```

This installs dependencies for all packages in the workspace.

### 3. Navigate to Plugin

```bash
cd packages/opencode-warcraft-notifications-plugin
```

### 4. Verify Setup

Check TypeScript compilation:

```bash
bun run type-check
```

Run tests:

```bash
bun test
```

Build the plugin:

```bash
bun run build
```

## Project Structure

```
opencode-warcraft-notifications-plugin/
├── src/                              # Source code
│   ├── config/                       # Configuration management
│   │   ├── index.ts                  # Main config loader
│   │   ├── loader.ts                 # Config loading logic
│   │   ├── package.ts                # Package.json helpers
│   │   ├── paths.ts                  # Path resolution
│   │   └── types.ts                  # Config types
│   ├── sounds/                       # Sound management
│   │   ├── data/                     # Sound file lists
│   │   │   ├── alliance.ts           # Alliance sounds
│   │   │   ├── horde.ts              # Horde sounds
│   │   │   └── index.ts              # Exports
│   │   ├── descriptions.ts           # Voice line text
│   │   └── index.ts                  # Sound utilities
│   ├── bundled-sounds.ts             # Sound installation
│   ├── logger.ts                     # Logging utility
│   ├── notification.ts               # Main plugin logic
│   ├── notification-utils.ts         # Helper functions
│   ├── schema-validator.ts           # Config validation
│   ├── test-utils.ts                 # Testing helpers
│   └── index.ts                      # Public API exports
├── data/                             # Bundled sound files
│   ├── alliance/                     # Alliance WAV files
│   └── horde/                        # Horde WAV files
├── docs/                             # Documentation
│   ├── README.md                     # Docs overview
│   ├── api.md                        # API reference
│   ├── user-guide.md                 # User documentation
│   ├── development.md                # This file
│   └── troubleshooting.md            # Troubleshooting guide
├── pages/                            # Documentation site (Astro)
├── dist/                             # Build output (gitignored)
├── package.json                      # Package configuration
├── tsconfig.json                     # TypeScript config
├── tsconfig.lib.json                 # Build config
├── tsconfig.test.json                # Test config
├── project.json                      # Nx configuration
└── README.md                         # Package README
```

### Key Files

- **`src/index.ts`**: Public API exports
- **`src/notification.ts`**: Main plugin implementation
- **`src/config/index.ts`**: Configuration loading
- **`src/sounds/index.ts`**: Sound management
- **`src/bundled-sounds.ts`**: Sound installation

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Edit source files in `src/`:

```typescript
// src/notification.ts
export const NotificationPlugin: Plugin = async (ctx) => {
  // Your changes here
};
```

### 3. Run Type Check

```bash
bun run type-check
```

### 4. Run Tests

```bash
bun test
```

### 5. Format Code

```bash
bun run format
```

### 6. Lint Code

```bash
bun run lint
```

### 7. Build

```bash
bun run build
```

### 8. Test Locally

Link the plugin for local testing:

```bash
# In plugin directory
npm link

# In your OpenCode project
npm link @pantheon-org/opencode-warcraft-notifications-plugin
```

Update `opencode.json`:

```json
{
  "plugin": ["@pantheon-org/opencode-warcraft-notifications-plugin"]
}
```

## Testing

### Test Structure

Tests are colocated with source files using the `.test.ts` suffix:

```
src/
├── notification.ts
├── notification.test.ts              # Unit tests
├── notification.unit.test.ts         # Isolated unit tests
├── notification.integration.test.ts  # Integration tests
└── notification.behavior.test.ts     # Behavior tests
```

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test src/notification.test.ts

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage
```

### Writing Tests

Use Bun's built-in test runner:

```typescript
import { describe, test, expect } from 'bun:test';
import { NotificationPlugin } from './notification';

describe('NotificationPlugin', () => {
  test('should be a function', () => {
    expect(typeof NotificationPlugin).toBe('function');
  });

  test('should handle events', async () => {
    const mockCtx = createMockContext();
    const hooks = await NotificationPlugin(mockCtx);

    expect(hooks.event).toBeDefined();
  });
});
```

### Test Categories

1. **Unit Tests** (`*.unit.test.ts`): Test individual functions
2. **Integration Tests** (`*.integration.test.ts`): Test component interaction
3. **Edge Cases** (`*.edge.test.ts`): Test boundary conditions
4. **Behavior Tests** (`*.behavior.test.ts`): Test user-facing behavior
5. **Coverage Tests** (`*.coverage.test.ts`): Ensure code coverage

## Building

### Build Commands

```bash
# Production build
bun run build

# Watch mode (auto-rebuild)
bun run dev

# Clean build
bun run clean && bun run build
```

### Build Output

```
dist/
├── index.js      # ESM bundle
└── index.d.ts    # Type declarations
```

### Build Configuration

Build uses `tsup` configured in `package.json`:

```json
{
  "scripts": {
    "build": "bunx tsup src/index.ts --format esm --dts --out-dir dist --clean"
  }
}
```

### Nx Build

Build via Nx (from monorepo root):

```bash
bunx nx build opencode-warcraft-notifications-plugin
```

## Code Style

### TypeScript Standards

- **Strict mode**: Enabled in `tsconfig.json`
- **ESM modules**: Use `import`/`export`
- **Type safety**: Avoid `any`, use proper types
- **Explicit returns**: Define return types for functions

### Formatting

- **Prettier**: Auto-formats code
- **Line length**: 100 characters
- **Semicolons**: Required
- **Quotes**: Single quotes preferred

### Linting

- **ESLint**: Enforces code quality
- **Import order**: Organized automatically
- **Unused variables**: Not allowed
- **Console logs**: Only in debug mode

### File Naming

- **Source files**: `kebab-case.ts`
- **Test files**: `kebab-case.test.ts`
- **Types**: Use descriptive names

### Code Organization

- **One function per module**: Single responsibility
- **Barrel exports**: Use `index.ts` for public API
- **Test collocation**: Tests next to implementation
- **Type exports**: Separate type exports

## Contributing

### Contribution Workflow

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** changes with tests
4. **Format** and lint code
5. **Build** successfully
6. **Submit** pull request to main monorepo

### Pull Request Guidelines

- **Title**: Clear, descriptive (e.g., "Add support for custom sounds")
- **Description**: Explain changes and motivation
- **Tests**: Include tests for new features
- **Documentation**: Update docs if needed
- **Breaking changes**: Clearly marked

### Commit Messages

Use conventional commits:

```bash
feat: add support for Windows sound playback
fix: resolve sound file path on Linux
docs: update API documentation
test: add edge case tests for sound selection
chore: update dependencies
```

### Code Review

PRs will be reviewed for:

- Code quality and style
- Test coverage
- Documentation completeness
- Breaking changes
- Performance impact

## Release Process

### Version Bump

Update version in `package.json`:

```json
{
  "version": "0.2.0"
}
```

### Tag Release

From monorepo root:

```bash
# Create version tag
git tag opencode-warcraft-notifications-plugin@v0.2.0

# Push tag
git push origin opencode-warcraft-notifications-plugin@v0.2.0
```

### Automated Release

The monorepo's CI/CD will:

1. Detect the package tag
2. Build the plugin
3. Mirror to separate repo
4. Publish to npm
5. Deploy documentation

### Manual Release (if needed)

```bash
# Build
bun run build

# Pack
npm pack

# Verify package contents
tar -tzf *.tgz

# Publish
npm publish
```

## Debugging

### Enable Debug Logging

```bash
DEBUG_OPENCODE=1 opencode
```

### Debug in VS Code

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "bun",
      "runtimeArgs": ["test"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Common Debug Tasks

- **Sound not playing**: Check file existence, platform command
- **Config not loading**: Verify plugin name, JSON syntax
- **Build failing**: Check TypeScript errors, dependencies

## Additional Resources

- [OpenCode Plugin Docs](https://opencode.ai/docs/plugins/)
- [Bun Documentation](https://bun.sh/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Nx Documentation](https://nx.dev/docs)

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/pantheon-org/opencode-plugins/issues)
- **Discussions**: [GitHub Discussions](https://github.com/pantheon-org/opencode-plugins/discussions)
- **OpenCode Discord**: Join for plugin development help

## License

MIT - See [LICENSE](../LICENSE) file for details.
