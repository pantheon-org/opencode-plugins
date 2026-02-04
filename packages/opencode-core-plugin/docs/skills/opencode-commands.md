---
title: OpenCode Commands Skill
description: Comprehensive guide for creating custom slash commands in OpenCode
---

# OpenCode Commands Skill

## Overview

The **OpenCode Commands** skill provides comprehensive guidance for creating custom slash commands in OpenCode. This
skill auto-injects when users mention command-related keywords in their conversations.

**Source:** [OpenCode Commands Documentation](https://opencode.ai/docs/commands/)

## Triggers

This skill automatically injects when any of these keywords are detected in user messages:

- `command`
- `commands`
- `slash-command`
- `custom-command`
- `/command`
- `command-template`
- `command-config`
- `$ARGUMENTS`

## What It Covers

### Command Creation Methods

- **JSON Configuration** - Define commands in `opencode.json`
- **Markdown Files** - Create `.md` files in `commands/` directory
- **Location Options** - Global (`~/.config/opencode/commands/`) vs project (`.opencode/commands/`)

### Prompt Templates

- **Arguments** - `$ARGUMENTS` for all args, `$1`, `$2`, etc. for positional
- **Shell Output** - Inject command output with \`!\`command\`\` syntax
- **File References** - Include file contents with `@filename`

### Configuration Options

- **template** (required) - Prompt sent to LLM
- **description** (optional) - Description shown in TUI
- **agent** (optional) - Which agent executes the command
- **subtask** (optional) - Force subagent invocation
- **model** (optional) - Override default model

### Built-in Commands

- `/init` - Initialize conversation
- `/undo` - Undo last action
- `/redo` - Redo last undone action
- `/share` - Share conversation
- `/help` - Show help

### Common Patterns

- Code review commands
- Test execution commands
- Documentation generation
- Refactoring workflows
- Commit message generation
- Deployment checklists

### Best Practices

- **Naming** - Short, clear, descriptive
- **Template Design** - Specific instructions, clear goals
- **Organization** - Global vs project commands
- **Performance** - Avoid expensive shell operations
- **Security** - No secrets in commands

### Troubleshooting

- Command not found
- Arguments not substituting
- Shell commands failing
- File references not working

### Advanced Patterns

- Conditional logic with shell
- Multi-step workflows
- Context-aware commands
- Agent chaining

## Example Usage

**User asks about creating a command:**

> "How do I create a custom command to run my tests?"

**Skill auto-injects** because "command" is a keyword match.

**User asks about command features:**

> "Can I pass $ARGUMENTS to my slash command?"

**Skill auto-injects** because both "command" and "$ARGUMENTS" are keyword matches.

## Testing

The skill includes comprehensive tests covering:

- Name and description validation
- Keyword presence (command, slash-command, $ARGUMENTS)
- Category assignment
- Content structure
- Key sections presence
- Documentation completeness

**Run Tests:**

\`\`\`bash cd packages/opencode-core-plugin bun test src/skills/opencode-commands.test.ts \`\`\`

## Integration

This skill is automatically registered with the `@pantheon-org/opencode-core-plugin` and will auto-inject into
conversations when command-related topics are detected.

**Configuration:**

\`\`\`typescript const skillsPlugin = createSkillsPlugin({ 'opencode-commands': opencodeCommandsSkill, // ... other
skills }, { debug: false, autoInject: true }); \`\`\`

## Related Skills

- **opencode-agent-development** - Agent configuration (used with `agent` option)
- **opencode-configuration** - OpenCode.json configuration (where commands are defined)
- **opencode-plugin-development** - Plugin development (custom commands via plugins)

## Related Documentation

- [OpenCode Commands](https://opencode.ai/docs/commands/)
- [OpenCode Configuration](https://opencode.ai/docs/config/)
- [Agents Configuration](https://opencode.ai/docs/agents/)
- [TUI Usage](https://opencode.ai/docs/tui/)
- [Tools Configuration](https://opencode.ai/docs/tools/)
- [Rules Configuration](https://opencode.ai/docs/rules/)
