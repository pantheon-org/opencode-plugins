/**
 * OpenCode Skills Skill
 *
 * Comprehensive guide for creating and configuring agent skills in OpenCode.
 */

import type { Skill } from '@pantheon-org/opencode-skills';
import { defineSkill } from '@pantheon-org/opencode-skills';

/**
 * OpenCode Skills Skill
 *
 * This skill provides guidance on creating agent skills for OpenCode,
 * including file placement, frontmatter configuration, and permissions.
 */
export const opencodeSkillsSkill: Skill = defineSkill({
  name: 'opencode-skills',
  description:
    'Complete guide for creating and configuring agent skills with SKILL.md files, frontmatter, and permissions',
  keywords: [
    'skill',
    'skills',
    'agent-skill',
    'SKILL.md',
    'skill-definition',
    'skill-frontmatter',
    'skill-permissions',
    'skill-tool',
    'reusable-behavior',
  ],
  category: 'development',
  content: `
# OpenCode Agent Skills

Complete guide for creating reusable agent behavior via SKILL.md definitions.

## Overview

Agent skills let OpenCode discover reusable instructions from your repo or home directory. Skills are loaded on-demand via the native \`skill\` tool—agents see available skills and can load the full content when needed.

**Key Benefits:**
- Reusable behavior across agents and projects
- On-demand loading keeps context efficient
- Pattern-based permissions control access
- Compatible with Claude skill definitions

## File Placement

Create one folder per skill name and put a \`SKILL.md\` inside it.

**OpenCode searches these locations:**

**Project-specific:**
- \`.opencode/skills/<name>/SKILL.md\`
- \`.claude/skills/<name>/SKILL.md\` (Claude-compatible)

**Global:**
- \`~/.config/opencode/skills/<name>/SKILL.md\`
- \`~/.claude/skills/<name>/SKILL.md\` (Claude-compatible)

**Structure:**

\`\`\`
project-root/
├── .opencode/
│   └── skills/
│       ├── git-release/
│       │   └── SKILL.md
│       └── code-review/
│           └── SKILL.md
└── src/
    └── ...

~/.config/opencode/
└── skills/
    ├── global-helper/
    │   └── SKILL.md
    └── team-standards/
        └── SKILL.md
\`\`\`

## Discovery

**Project-local paths:**
OpenCode walks up from your current working directory until it reaches the git worktree. It loads any matching \`skills/*/SKILL.md\` in \`.opencode/\` and \`.claude/skills/\` along the way.

**Global definitions:**
Loaded from \`~/.config/opencode/skills/*/SKILL.md\` and \`~/.claude/skills/*/SKILL.md\`.

## Frontmatter Configuration

Each \`SKILL.md\` must start with YAML frontmatter.

**Required fields:**
- \`name\` (string, 1-64 characters)
- \`description\` (string, 1-1024 characters)

**Optional fields:**
- \`license\` (string)
- \`compatibility\` (string)
- \`metadata\` (object, string-to-string map)

**Unknown frontmatter fields are ignored.**

### Name Validation

\`name\` must:
- Be 1–64 characters
- Be lowercase alphanumeric with single hyphen separators
- Not start or end with \`-\`
- Not contain consecutive \`--\`
- Match the directory name that contains \`SKILL.md\`

**Regex pattern:**

\`\`\`regex
^[a-z0-9]+(-[a-z0-9]+)*$
\`\`\`

**Valid names:**
- ✅ \`git-release\`
- ✅ \`code-review\`
- ✅ \`pr-workflow\`
- ✅ \`api-testing\`

**Invalid names:**
- ❌ \`Git-Release\` (uppercase)
- ❌ \`-git-release\` (starts with hyphen)
- ❌ \`git--release\` (consecutive hyphens)
- ❌ \`git_release\` (underscore)

### Description Rules

\`description\` must be 1-1024 characters. Keep it specific enough for the agent to choose correctly.

**Good descriptions:**
- ✅ "Create consistent releases and changelogs"
- ✅ "Review code for security vulnerabilities and best practices"
- ✅ "Generate API documentation from TypeScript types"

**Bad descriptions:**
- ❌ "Helper" (too vague)
- ❌ "Does stuff" (not specific)
- ❌ "" (empty)

## Example Skill

Create \`.opencode/skills/git-release/SKILL.md\`:

\`\`\`markdown
---
name: git-release
description: Create consistent releases and changelogs
license: MIT
compatibility: opencode
metadata:
  audience: maintainers
  workflow: github
---

## What I do

- Draft release notes from merged PRs
- Propose a version bump
- Provide a copy-pasteable \\\`gh release create\\\` command

## When to use me

Use this when you are preparing a tagged release.
Ask clarifying questions if the target versioning scheme is unclear.
\`\`\`

## Example: Code Review Skill

\`.opencode/skills/code-review/SKILL.md\`:

\`\`\`markdown
---
name: code-review
description: Review code for security vulnerabilities and best practices
license: MIT
compatibility: opencode
metadata:
  focus: security-quality
  language: any
---

## What I do

- Analyze code for security vulnerabilities
- Check adherence to best practices
- Identify potential bugs and edge cases
- Suggest improvements for maintainability

## When to use me

Use this skill when reviewing pull requests or auditing existing code.
I focus on security, performance, and code quality.

## Review checklist

1. **Security**: SQL injection, XSS, authentication issues
2. **Performance**: N+1 queries, inefficient algorithms
3. **Quality**: Code duplication, naming conventions
4. **Testing**: Test coverage, edge cases
5. **Documentation**: Comments, README updates
\`\`\`

## Example: Documentation Skill

\`.opencode/skills/docs-generator/SKILL.md\`:

\`\`\`markdown
---
name: docs-generator
description: Generate comprehensive documentation from code and types
license: MIT
compatibility: opencode
metadata:
  output: markdown
  language: typescript
---

## What I do

- Generate API documentation from TypeScript types
- Create usage examples from code
- Build README sections from JSDoc comments
- Maintain consistent documentation style

## When to use me

Use this when you need to:
- Document new APIs or modules
- Update README files
- Generate API reference documentation
- Create migration guides

## Documentation style

- Clear, concise descriptions
- Code examples for all APIs
- Tables for configuration options
- Links to related documentation
\`\`\`

## Tool Integration

OpenCode lists available skills in the \`skill\` tool description. Each entry includes the skill name and description:

\`\`\`xml
<available_skills>
  <skill>
    <name>git-release</name>
    <description>Create consistent releases and changelogs</description>
  </skill>
  <skill>
    <name>code-review</name>
    <description>Review code for security vulnerabilities and best practices</description>
  </skill>
</available_skills>
\`\`\`

**Loading a skill:**

The agent loads a skill by calling the tool:

\`\`\`typescript
skill({ name: "git-release" })
\`\`\`

When loaded, the full content of \`SKILL.md\` is provided to the agent.

## Permissions

Control which skills agents can access using pattern-based permissions in \`opencode.json\`.

### Global Permissions

\`\`\`json
{
  "permission": {
    "skill": {
      "*": "allow",
      "pr-review": "allow",
      "internal-*": "deny",
      "experimental-*": "ask"
    }
  }
}
\`\`\`

**Permission values:**

| Permission | Behavior |
|------------|----------|
| \`allow\` | Skill loads immediately |
| \`deny\` | Skill hidden from agent, access rejected |
| \`ask\` | User prompted for approval before loading |

**Patterns support wildcards:**
- \`internal-*\` matches \`internal-docs\`, \`internal-tools\`, etc.
- \`experimental-*\` matches \`experimental-feature\`, \`experimental-api\`, etc.

### Per-Agent Permissions

Give specific agents different permissions than the global defaults.

**For custom agents** (in agent frontmatter):

\`\`\`markdown
---
description: Documentation specialist
mode: subagent
permission:
  skill:
    "documents-*": "allow"
    "code-*": "deny"
---

You are a documentation specialist.
\`\`\`

**For built-in agents** (in \`opencode.json\`):

\`\`\`json
{
  "agent": {
    "plan": {
      "permission": {
        "skill": {
          "internal-*": "allow",
          "experimental-*": "deny"
        }
      }
    }
  }
}
\`\`\`

### Disable Skill Tool

Completely disable skills for agents that shouldn't use them.

**For custom agents:**

\`\`\`markdown
---
description: Simple calculator agent
mode: subagent
tools:
  skill: false
---

You are a calculator. Only perform math operations.
\`\`\`

**For built-in agents:**

\`\`\`json
{
  "agent": {
    "plan": {
      "tools": {
        "skill": false
      }
    }
  }
}
\`\`\`

When disabled, the \`<available_skills>\` section is omitted entirely.

## Best Practices

### 1. Clear Naming

Use descriptive names that indicate purpose:

\`\`\`
✅ git-release
✅ code-review
✅ api-docs
✅ test-generator

❌ helper
❌ utils
❌ misc
\`\`\`

### 2. Specific Descriptions

Make descriptions clear enough for agents to choose correctly:

\`\`\`
✅ "Create consistent releases and changelogs"
✅ "Review code for security vulnerabilities"
✅ "Generate API documentation from TypeScript"

❌ "Help with git"
❌ "Code stuff"
❌ "Documentation"
\`\`\`

### 3. Structured Content

Organize skill content with clear sections:

\`\`\`markdown
## What I do
Clear list of capabilities

## When to use me
Specific trigger conditions

## How I work
Step-by-step process or checklist

## Examples
Sample usage patterns
\`\`\`

### 4. Focused Purpose

Keep skills focused on a single responsibility:

\`\`\`
✅ One skill for git releases
✅ Separate skill for code reviews
✅ Separate skill for documentation

❌ One skill that does everything
\`\`\`

### 5. Metadata Usage

Use metadata for additional context:

\`\`\`yaml
metadata:
  audience: maintainers
  language: typescript
  output: markdown
  workflow: github
\`\`\`

## Common Use Cases

### Release Management

\`\`\`markdown
---
name: release-manager
description: Coordinate releases across multiple services
---

## What I do
- Check version compatibility
- Generate changelogs
- Create release PRs
- Coordinate deployment order
\`\`\`

### Testing Workflows

\`\`\`markdown
---
name: test-generator
description: Generate comprehensive test suites from code
---

## What I do
- Analyze function signatures
- Create unit test stubs
- Generate test data
- Add edge case tests
\`\`\`

### Code Migration

\`\`\`markdown
---
name: typescript-migration
description: Migrate JavaScript files to TypeScript
---

## What I do
- Add TypeScript types
- Update imports/exports
- Fix type errors
- Maintain functionality
\`\`\`

### API Development

\`\`\`markdown
---
name: api-validator
description: Validate API design against REST/GraphQL best practices
---

## What I do
- Check endpoint naming
- Validate HTTP methods
- Review error handling
- Ensure consistent patterns
\`\`\`

## Troubleshooting

### Skill Not Showing Up

If a skill does not show up:

1. **Verify filename**: Must be \`SKILL.md\` in all caps
2. **Check frontmatter**: Must include \`name\` and \`description\`
3. **Verify name uniqueness**: Skill names must be unique across all locations
4. **Check permissions**: Skills with \`deny\` are hidden from agents
5. **Validate name format**: Must match \`^[a-z0-9]+(-[a-z0-9]+)*$\`
6. **Check directory name**: Must match \`name\` in frontmatter

### Skill Not Loading

If skill appears but won't load:

1. **Check permissions**: May be set to \`ask\` or \`deny\`
2. **Verify YAML syntax**: Frontmatter must be valid YAML
3. **Check file encoding**: Must be UTF-8
4. **Validate content length**: Description must be 1-1024 characters

### Permission Issues

If permissions aren't working:

1. **Check pattern syntax**: Wildcards use \`*\` not regex
2. **Verify precedence**: More specific patterns override general ones
3. **Check agent overrides**: Per-agent permissions override global
4. **Validate tool config**: \`tools.skill: false\` disables entirely

## Advanced Patterns

### Skill Composition

Skills can reference other skills:

\`\`\`markdown
---
name: full-review
description: Complete code review using multiple review skills
---

## Process

1. Load \`code-review\` skill for code quality
2. Load \`security-audit\` skill for security check
3. Load \`performance-check\` skill for optimization
4. Combine findings into comprehensive report
\`\`\`

### Conditional Skills

Use permissions to enable skills conditionally:

\`\`\`json
{
  "agent": {
    "junior": {
      "permission": {
        "skill": {
          "advanced-*": "deny",
          "basic-*": "allow"
        }
      }
    },
    "senior": {
      "permission": {
        "skill": {
          "*": "allow"
        }
      }
    }
  }
}
\`\`\`

### Project-Specific Skills

Create project-specific skills for team workflows:

\`\`\`
project/
├── .opencode/
│   └── skills/
│       ├── deployment-checklist/
│       │   └── SKILL.md
│       ├── pr-template/
│       │   └── SKILL.md
│       └── code-standards/
│           └── SKILL.md
\`\`\`

## Resources

- [OpenCode Documentation](https://opencode.ai/docs/skills)
- [Agent Configuration](https://opencode.ai/docs/agents)
- [Permissions Guide](https://opencode.ai/docs/permissions)
- [Tools Configuration](https://opencode.ai/docs/tools)
- [Custom Tools](https://opencode.ai/docs/custom-tools)

This skill provides comprehensive guidance for creating and configuring OpenCode agent skills following official patterns and best practices.
`,
});
