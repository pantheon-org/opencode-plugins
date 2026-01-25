# OpenCode Core Plugin

Core agent specifications and skills for OpenCode, providing specialized agents and auto-injected knowledge for
configuration, usage guidance, and plugin development.

> **Note**: This plugin is part of the `pantheon-org/opencode-plugins` monorepo. All development and contributions
> should be made in the main repository at: **https://github.com/pantheon-org/opencode-plugins**
>
> If you're viewing this as a mirror repository, it is read-only. Submit issues, PRs, and contributions to the main
> monorepo.

<!-- START doctoc -->
<!-- END doctoc -->

## Features

### OpenCode Specialist Agent

The `opencode` agent is a specialized subagent focused on OpenCode configuration, usage patterns, and best practices.

**Capabilities:**

- OpenCode configuration help (opencode.json, .opencode/ directory)
- Plugin development guidance
- Agent creation and customization
- Tool configuration and permissions
- Authentication providers
- Hook implementations
- Session management and SDK usage
- CLI commands and workflows
- Troubleshooting

**Access to Documentation:** The agent has access to the official OpenCode documentation at https://opencode.ai/docs and
will consult it when answering questions.

### OpenCode Plugin Development Skill

The `opencode-plugin-development` skill is automatically injected when you mention plugin-related topics. It provides
comprehensive guidance for developing OpenCode plugins.

**Auto-injected when you mention:**

- "opencode plugin"
- "create a plugin"
- "plugin development"
- "custom tool"
- "opencode hook"
- "plugin integration"

**Includes:**

- Complete plugin architecture overview
- All available hooks (tools, events, chat, permissions, compaction)
- Code examples and best practices
- TypeScript type safety guidance
- Testing patterns
- Resource management
- External dependency integration

**See:** [Skill Documentation](docs/skills/opencode-plugin-development.md)

## Installation

Add this plugin to your `opencode.json`:

```json
{
  "plugin": ["@pantheon-org/opencode-core-plugin"]
}
```

Then the `opencode` agent will be available:

```bash
# Use the opencode agent for configuration help
opencode --agent opencode "How do I configure custom agents?"
```

## Usage

The plugin automatically registers the core agents when loaded. You can use them via the OpenCode CLI or SDK.

### Using the OpenCode Agent

```typescript
// The agent is automatically available once the plugin is loaded
// Use it via CLI:
// opencode --agent opencode "How do I create a custom plugin?"
```

## Building

```bash
nx build opencode-core-plugin
```

## Testing

```bash
nx test opencode-core-plugin
```
