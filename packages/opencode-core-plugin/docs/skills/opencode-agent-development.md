# OpenCode Agent Development Skill

This skill provides comprehensive guidance for creating and configuring OpenCode agents.

## Overview

The `opencode-agent-development` skill is automatically injected when developers mention agent-related topics in their
messages. It provides:

- Complete guide to primary agents and subagents
- Agent configuration in JSON and Markdown formats
- All agent options (mode, temperature, maxSteps, tools, permissions)
- Built-in agents (Build, Plan, General, Explore)
- Best practices for agent creation
- Example agents for common use cases

## Skill Definition

**Name:** `opencode-agent-development`  
**Category:** `development`  
**Keywords:** `agent`, `agents`, `subagent`, `subagents`, `primary-agent`, `agent-config`, `agent-mode`, `agent-prompt`,
`agent-tools`, `agent-permissions`

## Auto-Injection

The skill is automatically injected when users mention:

- "agent"
- "create an agent"
- "subagent"
- "primary agent"
- "agent configuration"
- "agent permissions"
- "agent tools"
- And any combination of the keywords above

## Content Structure

1. **Overview** - Agent types and capabilities
2. **Agent Types** - Primary agents vs subagents with built-in examples
3. **Configuration Methods** - JSON and Markdown configuration
4. **Agent Options** - All available options:
   - Description (required)
   - Mode (primary/subagent/all)
   - Temperature (creativity control)
   - Max Steps (iteration limits)
   - Prompt (custom system prompts)
   - Model (model selection)
   - Tools (tool access control)
   - Permissions (action approvals)
   - Task Permissions (subagent invocation control)
   - Hidden (hide from autocomplete)
   - Disable (disable agent)
   - Additional (provider-specific options)
5. **Creating Agents** - Interactive and manual creation
6. **Use Cases** - Common agent patterns
7. **Best Practices** - Clear descriptions, permissions, temperature tuning, etc.
8. **Example Agents** - Test runner, architecture advisor, dependency updater
9. **Agent Orchestration** - Multi-agent workflows and session navigation

## Usage Examples

### User mentions creating agents:

```
User: "How do I create a code review agent?"
```

**Result:** Skill is auto-injected, providing complete agent creation guidance including configuration, permissions, and
example code review agents.

### User asks about agent types:

```
User: "What's the difference between primary agents and subagents?"
```

**Result:** Skill is auto-injected with detailed explanations of both agent types, how to invoke them, and when to use
each.

### User asks about agent permissions:

```
User: "How do I set permissions for an agent?"
```

**Result:** Skill is auto-injected with comprehensive permission configuration examples for tools and bash commands.

## Integration with OpenCode Core Plugin

The skill is integrated into the `@pantheon-org/opencode-core-plugin` and works alongside:

- **OpenCode Specialist Agent** - Interactive agent for OpenCode configuration help
- **Plugin Development Skill** - Complementary skill for plugin creation

## Testing

Run tests:

```bash
bun test src/skills/opencode-agent-development.test.ts
```

## Related

- **OpenCode Specialist Agent** - Interactive agent for OpenCode configuration
- **OpenCode Plugin Development Skill** - Creating OpenCode plugins
- **OpenCode Skills Plugin** - Pattern matching and auto-injection system
- **OpenCode Documentation** - https://opencode.ai/docs/agents
