# OpenCode Custom Tools Skill

This skill provides comprehensive guidance for creating custom tools in OpenCode.

## Overview

The `opencode-custom-tools` skill is automatically injected when developers mention custom tool creation topics in their
messages. It provides:

- Complete guide to creating custom tools in TypeScript/JavaScript
- Tool structure and best practices
- Argument validation with Zod schemas
- Tool context and cancellation support
- Examples for databases, APIs, file systems
- Tools in other languages (Python, Shell, Go)
- Security considerations and best practices

## Skill Definition

**Name:** `opencode-custom-tools`  
**Category:** `development`  
**Keywords:** `custom-tool`, `custom-tools`, `tool-definition`, `create-tool`, `tool-helper`, `tool-schema`,
`zod-schema`, `tool-args`, `tool-context`, `execute-tool`

## Auto-Injection

The skill is automatically injected when users mention:

- "custom tool"
- "create a tool"
- "tool definition"
- "tool schema"
- "tool helper"
- "execute tool"
- And any combination of the keywords above

## Content Structure

1. **Overview** - Custom tool capabilities and use cases
2. **Creating a Tool** - Location, basic structure, multiple tools per file
3. **Arguments** - Using tool.schema and Zod for validation
4. **Tool Context** - Session context properties (agent, sessionID, messageID, abort)
5. **Examples** - Database, API, file system, environment variables
6. **Tools in Other Languages** - Python, Shell, Go integration via Bun.$
7. **Advanced Patterns** - Cancellation, error handling, session state, dependencies
8. **Best Practices** - Clear descriptions, validation, error handling, type safety, resource limits
9. **Testing Custom Tools** - Interactive and programmatic testing
10. **Security Considerations** - Input sanitization, file access limits, sensitive data protection

## Usage Examples

### User mentions custom tools:

```
User: "How do I create a custom tool for database queries?"
```

**Result:** Skill is auto-injected, providing complete tool creation guidance including database examples with proper
validation and error handling.

### User asks about tool arguments:

```
User: "How do I validate tool arguments with Zod?"
```

**Result:** Skill is auto-injected with comprehensive Zod schema examples for strings, numbers, arrays, objects, and
more.

### User wants to use external scripts:

```
User: "Can I create a custom tool that runs Python code?"
```

**Result:** Skill is auto-injected with examples showing how to integrate Python, Shell, and Go scripts using Bun.$.

## Integration with OpenCode Core Plugin

The skill is integrated into the `@pantheon-org/opencode-core-plugin` and works alongside:

- **OpenCode Specialist Agent** - Interactive agent for OpenCode help
- **Agent Development Skill** - Creating specialized agents
- **Plugin Development Skill** - Creating full plugins

## Testing

Run tests:

```bash
bun test src/skills/opencode-custom-tools.test.ts
```

## Related

- **OpenCode Specialist Agent** - Interactive agent for OpenCode configuration
- **OpenCode Agent Development Skill** - Creating OpenCode agents
- **OpenCode Plugin Development Skill** - Creating OpenCode plugins
- **OpenCode Skills Plugin** - Pattern matching and auto-injection system
- **OpenCode Documentation** - https://opencode.ai/docs/custom-tools
