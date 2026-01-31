# OpenCode Plugin Development Skill

This skill provides comprehensive guidance for developing OpenCode plugins.

## Overview

The `opencode-plugin-development` skill is automatically injected when developers mention plugin-related topics in their
messages. It provides:

- Complete OpenCode plugin architecture overview
- Hook implementations (tools, events, chat, permissions)
- Code examples and best practices
- TypeScript type safety guidance
- Testing patterns
- Resource management
- Integration with external dependencies

## Skill Definition

**Name:** `opencode-plugin-development`  
**Category:** `development`  
**Keywords:** `opencode`, `plugin`, `plugins`, `extension`, `hook`, `hooks`, `tool`, `tools`, `custom-tool`,
`integration`

## Auto-Injection

The skill is automatically injected when users mention:

- "opencode plugin"
- "create a plugin"
- "plugin development"
- "custom tool"
- "opencode hook"
- "plugin integration"
- And any combination of the keywords above

## Content Structure

1. **Overview** - Plugin capabilities and use cases
2. **Quick Start** - Basic plugin structure and context parameters
3. **Plugin Installation** - Local files and npm packages
4. **Plugin Hooks** - All available hooks with examples:
   - Custom Tools
   - Event Subscription
   - Tool Execution Hooks
   - Chat Message Hook
   - Chat Parameters Hook
   - Compaction Hooks
5. **External Dependencies** - Using npm packages in plugins
6. **Best Practices** - Logging, error handling, type safety, etc.
7. **Common Patterns** - Reusable code patterns
8. **Testing Plugins** - Unit and integration testing
9. **Publishing Plugins** - npm publishing guidelines

## Usage Examples

### User mentions plugin development:

```
User: "How do I create an opencode plugin that sends notifications?"
```

**Result:** Skill is auto-injected, providing complete plugin development guidance including event subscription and tool
creation.

### User mentions custom tools:

```
User: "I want to add a custom tool for git operations"
```

**Result:** Skill is auto-injected with tool creation examples and git integration patterns.

### User asks about hooks:

```
User: "What hooks are available in opencode plugins?"
```

**Result:** Skill is auto-injected with comprehensive hook documentation.

## Integration with OpenCode Core Plugin

The skill is integrated into the `@pantheon-org/opencode-core-plugin` and works alongside the OpenCode specialist agent:

- **Agent:** Provides interactive guidance and documentation lookups
- **Skill:** Provides comprehensive reference material automatically injected based on context

## Testing

Run tests:

```bash
bun test src/skills/opencode-plugin-development.test.ts
```

## Related

- **OpenCode Specialist Agent** - Interactive agent for OpenCode configuration help
- **OpenCode Skills Plugin** - Pattern matching and auto-injection system
- **OpenCode Documentation** - https://opencode.ai/docs/plugins
