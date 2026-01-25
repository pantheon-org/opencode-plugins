---
title: OpenCode Agents Skill
description: Comprehensive guide for creating and configuring OpenCode agents
---

# OpenCode Agents Skill

## Overview

The **OpenCode Agents** skill provides comprehensive guidance for creating and configuring OpenCode agents. This skill
auto-injects when users mention agent-related keywords in their conversations.

**Source:** [OpenCode Agents Documentation](https://opencode.ai/docs/agents/)

## Triggers

This skill automatically injects when any of these keywords are detected in user messages:

- `agent`
- `agents`
- `subagent`
- `subagents`
- `primary-agent`
- `agent-config`
- `agent-mode`
- `agent-prompt`
- `agent-tools`
- `agent-permissions`

## What It Covers

### Agent Types

- **Primary Agents** - Main assistants (tab-switchable, direct interaction)
  - Build (full access)
  - Plan (restricted)
- **Subagents** - Specialized assistants (@ mention or auto-invoked)
  - General (multi-step tasks)
  - Explore (read-only codebase exploration)

### Configuration Methods

- **JSON Configuration** - Define in `opencode.json`
- **Markdown Files** - Create `.md` files in `agents/` directory
- **Locations** - Global (`~/.config/opencode/agents/`) vs project (`.opencode/agents/`)

### Agent Options

- **description** (required) - Purpose and when to use
- **mode** - `primary`, `subagent`, or `all`
- **temperature** - Response randomness (0.0-1.0)
- **maxSteps** - Iteration limits
- **prompt** - Custom system prompt
- **model** - Model selection
- **tools** - Tool access control
- **permissions** - Action approval settings
- **task** permissions - Subagent invocation control
- **hidden** - Hide from autocomplete
- **disable** - Disable agent
- Provider-specific options

### Creating Agents

- **Interactive Creation** - `opencode agent create`
- **Manual Creation** - Markdown or JSON config

### Use Cases

- Development workflow agents (build, plan, debug)
- Specialized review agents (code reviewer, security auditor)
- Documentation agents (docs writer)

### Best Practices

- Clear, specific descriptions
- Appropriate permissions
- Temperature tuning by task type
- Model selection (haiku for fast, sonnet for complex)
- Focused prompts

### Example Agents

- Test runner agent
- Architecture advisor
- Dependency updater

### Agent Orchestration

- Multi-agent workflows
- Session navigation (`<Leader>+Left/Right`)

## Example Usage

**User asks about creating agents:**

> "How do I create a code review agent?"

**Skill auto-injects** because "agent" is a keyword match.

**User asks about agent types:**

> "What's the difference between primary agents and subagents?"

**Skill auto-injects** with detailed explanations of both types.

## Testing

The skill includes comprehensive tests covering:

- Name and description validation
- Keyword presence
- Category assignment
- Content structure
- Key sections (agent types, configuration, options)
- Documentation completeness

**Run Tests:**

\`\`\`bash cd packages/opencode-core-plugin bun test src/skills/opencode-agent-development.test.ts \`\`\`

## Integration

This skill is automatically registered with the `@pantheon-org/opencode-core-plugin` and will auto-inject into
conversations when agent-related topics are detected.

**Configuration:**

\`\`\`typescript const skillsPlugin = createSkillsPlugin({ 'opencode-agents': opencodeAgentsSkill, // ... other skills
}, { debug: false, autoInject: true }); \`\`\`

## Related Skills

- **opencode-commands** - Custom commands (used with agents)
- **opencode-configuration** - OpenCode.json configuration (where agents are defined)
- **opencode-custom-tools** - Custom tool creation (used by agents)
- **opencode-plugin-development** - Plugin development (creating agent hooks)

## Related Documentation

- [OpenCode Agents](https://opencode.ai/docs/agents/)
- [OpenCode Configuration](https://opencode.ai/docs/config/)
- [Permissions](https://opencode.ai/docs/permissions/)
- [Tools Configuration](https://opencode.ai/docs/tools/)
- [Custom Commands](https://opencode.ai/docs/commands/)
