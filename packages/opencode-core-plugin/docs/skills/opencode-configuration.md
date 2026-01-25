---
title: OpenCode Configuration Skill
description: Comprehensive guide for configuring OpenCode through opencode.json
---

# OpenCode Configuration Skill

## Overview

The **OpenCode Configuration** skill provides comprehensive guidance for configuring OpenCode through `opencode.json`
configuration files. This skill auto-injects when users mention configuration-related keywords in their conversations.

**Source:** [OpenCode Configuration Documentation](https://opencode.ai/docs/config/)

## Triggers

This skill automatically injects when any of these keywords are detected in user messages:

- `opencode.json`
- `config`
- `configuration`
- `opencode-config`
- `settings`
- `preferences`
- `global-config`
- `project-config`
- `remote-config`

## What It Covers

### Configuration Fundamentals

- **Config Formats**: JSON and JSONC (JSON with Comments)
- **Schema Validation**: Using `$schema` for editor support
- **Variable Substitution**: `{env:VAR}` and `{file:path}` syntax
- **Merge Behavior**: How multiple configs combine

### Configuration Locations

1. **Remote Config** (`.well-known/opencode`) - Organizational defaults
2. **Global Config** (`~/.config/opencode/opencode.json`) - User preferences
3. **Custom Config** (`OPENCODE_CONFIG` env var) - Custom overrides
4. **Project Config** (`opencode.json`) - Project-specific settings
5. **`.opencode` Directories** - Agents, commands, plugins
6. **Inline Config** (`OPENCODE_CONFIG_CONTENT`) - Runtime overrides

### All Configuration Options

- **TUI Settings** - Scroll speed, diff style
- **Server Settings** - Port, hostname, CORS
- **Tools Configuration** - Enable/disable tools
- **Models Configuration** - Provider settings, model selection
- **Themes** - Theme selection and customization
- **Agents** - Custom agent definitions
- **Default Agent** - Default agent selection
- **Sharing** - Conversation sharing settings
- **Commands** - Custom command definitions
- **Keybinds** - Keyboard shortcut customization
- **Autoupdate** - Update behavior
- **Formatters** - Code formatter configuration
- **Permissions** - Tool permission settings
- **Compaction** - Context management
- **Watcher** - File watcher configuration
- **MCP Servers** - Model Context Protocol servers
- **Plugins** - Plugin loading
- **Instructions** - Instruction files
- **Provider Management** - Disabled/enabled providers
- **Experimental** - Experimental features

### Variable Substitution

- **Environment Variables**: `{env:VARIABLE_NAME}`
- **File Contents**: `{file:path/to/file}`
- **Use Cases**: API keys, dynamic configuration

### Best Practices

- **Security**: Never commit API keys
- **Organization**: Global vs project config
- **Performance**: Watcher optimization, small models
- **Maintainability**: Schema validation, comments

### Common Configurations

- Minimal setup
- Review-only agent
- Team project config
- Enterprise config

### Troubleshooting

- Config not loading
- Provider not loading
- Variable substitution issues

## Example Usage

**User asks about configuration:**

> "How do I configure OpenCode to use Claude Sonnet?"

**Skill auto-injects** because "configure" matches "configuration" keyword.

**User asks about specific setting:**

> "How do I set up my opencode.json for my team?"

**Skill auto-injects** because "opencode.json" is a direct keyword match.

## Testing

The skill includes comprehensive tests covering:

- Name and description validation
- Keyword presence
- Category assignment
- Content structure
- Key sections presence
- Documentation links
- Best practices
- Troubleshooting

**Run Tests:**

\`\`\`bash cd packages/opencode-core-plugin bun test src/skills/opencode-configuration.test.ts \`\`\`

## Integration

This skill is automatically registered with the `@pantheon-org/opencode-core-plugin` and will auto-inject into
conversations when configuration-related topics are detected.

**Configuration:**

\`\`\`typescript const skillsPlugin = createSkillsPlugin({ 'opencode-configuration': opencodeConfigurationSkill, // ...
other skills }, { debug: false, autoInject: true }); \`\`\`

## Related Skills

- **opencode-agent-development** - Agent configuration and development
- **opencode-plugin-development** - Plugin hooks and development
- **opencode-custom-tools** - Custom tool creation

## Related Documentation

- [OpenCode Configuration](https://opencode.ai/docs/config/)
- [Tools Configuration](https://opencode.ai/docs/tools/)
- [Models Configuration](https://opencode.ai/docs/models/)
- [Agents Configuration](https://opencode.ai/docs/agents/)
- [Themes Configuration](https://opencode.ai/docs/themes/)
- [Keybinds Configuration](https://opencode.ai/docs/keybinds/)
- [Commands Configuration](https://opencode.ai/docs/commands/)
- [Formatters Configuration](https://opencode.ai/docs/formatters/)
- [Permissions Configuration](https://opencode.ai/docs/permissions/)
- [MCP Servers](https://opencode.ai/docs/mcp-servers/)
- [Plugins](https://opencode.ai/docs/plugins/)
- [Rules](https://opencode.ai/docs/rules/)
