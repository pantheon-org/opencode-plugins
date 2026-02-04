# OpenCode Skills Skill

Comprehensive guide for creating and configuring agent skills in OpenCode.

## Overview

This skill provides complete guidance on creating reusable agent behavior via SKILL.md definitions, including file
placement, frontmatter configuration, permissions, and best practices.

## Triggers

This skill is auto-injected when users mention:

- `skill`, `skills`
- `agent-skill`
- `SKILL.md`
- `skill-definition`, `skill-frontmatter`, `skill-permissions`
- `skill-tool`
- `reusable-behavior`

## What This Skill Covers

### File Placement and Discovery

- Where to place SKILL.md files (project vs global)
- OpenCode and Claude-compatible locations
- Directory structure requirements
- Discovery mechanism and precedence

### Frontmatter Configuration

- Required fields (`name`, `description`)
- Optional fields (`license`, `compatibility`, `metadata`)
- Name validation rules and regex pattern
- Description length requirements

### Skill Content

- Structuring skill instructions
- Best practices for clarity
- Example skills for common use cases
- Template patterns

### Permissions

- Pattern-based permission control
- Global vs per-agent permissions
- Permission values (`allow`, `deny`, `ask`)
- Wildcard patterns for skill groups

### Tool Integration

- How agents discover available skills
- Loading skills on-demand
- Disabling skill tool for specific agents

### Troubleshooting

- Common issues and solutions
- Name validation errors
- Permission problems
- Loading failures

## Example Usage

**User**: "How do I create a custom skill for code reviews?"

**Assistant**: _[Skill auto-injected]_ Creates comprehensive response covering:

- File structure for `.opencode/skills/code-review/SKILL.md`
- Required frontmatter with name and description
- Example skill content structure
- Permission configuration examples

## Testing

```bash
cd packages/opencode-core-plugin
bun test src/skills/opencode-skills.test.ts
```

Tests cover:

- Skill metadata (name, description, keywords)
- Content structure and sections
- Code examples presence
- Documentation references

## Source

Based on official OpenCode documentation:

- https://opencode.ai/docs/skills/

## Integration

This skill is automatically registered with the OpenCode Core Plugin and injected when relevant keywords are detected in
user messages.

## Related Skills

- **opencode-agents** - Agent configuration and management
- **opencode-configuration** - OpenCode configuration options
- **opencode-custom-tools** - Creating custom tools
- **opencode-commands** - Custom slash commands
