/**
 * OpenCode Agent Development Skill
 *
 * Comprehensive guide for creating and configuring OpenCode agents.
 */

import type { Skill } from '@pantheon-org/opencode-skills';
import { defineSkill } from '@pantheon-org/opencode-skills';

/**
 * OpenCode Agent Development Skill
 *
 * This skill provides guidance on creating and configuring agents for OpenCode,
 * including primary agents, subagents, permissions, and agent options.
 */
export const opencodeAgentDevelopmentSkill: Skill = defineSkill({
  name: 'opencode-agent-development',
  description:
    'Complete guide for creating and configuring OpenCode agents with custom prompts, tools, and permissions',
  keywords: [
    'agent',
    'agents',
    'subagent',
    'subagents',
    'primary-agent',
    'agent-config',
    'agent-mode',
    'agent-prompt',
    'agent-tools',
    'agent-permissions',
  ],
  category: 'development',
  content: `
# OpenCode Agent Development

Complete guide for creating and configuring specialized agents in OpenCode.

## Overview

Agents are specialized AI assistants configured for specific tasks and workflows. They enable:
- Focused tools with custom prompts and models
- Task-specific tool access and permissions
- Automatic invocation by other agents
- Manual invocation via @ mentions
- Session navigation between parent and child agents

## Agent Types

### Primary Agents

Primary agents are main assistants you interact with directly.

**Characteristics:**
- Cycle through with **Tab** key or configured \`switch_agent\` keybind
- Handle main conversation flow
- Tool access configured via permissions
- Examples: Build (full access), Plan (restricted)

**Built-in Primary Agents:**

**Build:**
- Default primary agent with all tools enabled
- Standard agent for development work
- Full access to file operations and system commands

**Plan:**
- Restricted agent for planning and analysis
- File edits and bash commands set to \`ask\` by default
- Analyzes code and suggests changes without modifications

### Subagents

Subagents are specialized assistants invoked for specific tasks.

**Invocation methods:**
- Automatically by primary agents based on descriptions
- Manually via **@ mention** (e.g., \`@general help me search\`)
- Programmatically via Task tool from other agents

**Built-in Subagents:**

**General:**
- General-purpose for complex questions and multi-step tasks
- Full tool access (except todo)
- Can make file changes when needed
- Use for parallel work execution

**Explore:**
- Fast, read-only codebase exploration
- Cannot modify files
- Quick file pattern matching and code search

**Session Navigation:**
- **<Leader>+Right** - Cycle forward through parent → children → parent
- **<Leader>+Left** - Cycle backward through parent ← children ← parent

## Configuration Methods

### JSON Configuration

Configure agents in \`opencode.json\`:

\`\`\`json
{
  "$schema": "https://opencode.ai/config.json",
  "agent": {
    "build": {
      "mode": "primary",
      "model": "anthropic/claude-sonnet-4-20250514",
      "prompt": "{file:./prompts/build.txt}",
      "tools": {
        "write": true,
        "edit": true,
        "bash": true
      }
    },
    "plan": {
      "mode": "primary",
      "model": "anthropic/claude-haiku-4-20250514",
      "tools": {
        "write": false,
        "edit": false,
        "bash": false
      }
    },
    "code-reviewer": {
      "description": "Reviews code for best practices and potential issues",
      "mode": "subagent",
      "model": "anthropic/claude-sonnet-4-20250514",
      "prompt": "You are a code reviewer. Focus on security, performance, and maintainability.",
      "tools": {
        "write": false,
        "edit": false
      }
    }
  }
}
\`\`\`

### Markdown Configuration

Define agents using markdown files:

**Locations:**
- Global: \`~/.config/opencode/agents/\`
- Project: \`.opencode/agents/\`

**Example:**

\`\`\`markdown
---
description: Reviews code for quality and best practices
mode: subagent
model: anthropic/claude-sonnet-4-20250514
temperature: 0.1
tools:
  write: false
  edit: false
  bash: false
---

You are in code review mode. Focus on:
- Code quality and best practices
- Potential bugs and edge cases
- Performance implications
- Security considerations

Provide constructive feedback without making direct changes.
\`\`\`

**Note:** File name becomes agent name (e.g., \`review.md\` → \`review\` agent)

## Agent Options

### Description (Required)

Brief description of agent purpose and when to use it:

\`\`\`json
{
  "agent": {
    "review": {
      "description": "Reviews code for best practices and potential issues"
    }
  }
}
\`\`\`

### Mode

Control agent invocation type:

\`\`\`json
{
  "agent": {
    "review": {
      "mode": "subagent"  // "primary" | "subagent" | "all"
    }
  }
}
\`\`\`

**Values:**
- \`primary\`: Main agent (tab-switchable)
- \`subagent\`: Specialized agent (@ mention or auto-invoked)
- \`all\`: Can be used as either (default)

### Temperature

Control response randomness and creativity (0.0-1.0):

\`\`\`json
{
  "agent": {
    "analyze": {
      "temperature": 0.1  // Focused and deterministic
    },
    "build": {
      "temperature": 0.3  // Balanced
    },
    "brainstorm": {
      "temperature": 0.7  // Creative and varied
    }
  }
}
\`\`\`

**Guidelines:**
- **0.0-0.2**: Very focused, ideal for code analysis
- **0.3-0.5**: Balanced, good for general development
- **0.6-1.0**: Creative, useful for brainstorming

**Defaults:** 0 for most models, 0.55 for Qwen models

### Max Steps

Limit maximum agentic iterations:

\`\`\`json
{
  "agent": {
    "quick-thinker": {
      "description": "Fast reasoning with limited iterations",
      "maxSteps": 5
    }
  }
}
\`\`\`

When limit reached, agent summarizes work and recommends remaining tasks.

### Prompt

Custom system prompt file:

\`\`\`json
{
  "agent": {
    "review": {
      "prompt": "{file:./prompts/code-review.txt}"
    }
  }
}
\`\`\`

Path is relative to config file location (works for global and project configs).

### Model

Override model for specific agent:

\`\`\`json
{
  "agent": {
    "plan": {
      "model": "anthropic/claude-haiku-4-20250514"
    }
  }
}
\`\`\`

**Format:** \`provider/model-id\`

**Default behavior:**
- Primary agents: Use globally configured model
- Subagents: Inherit model from invoking primary agent

**Check available models:** \`opencode models\`

### Tools

Control tool access:

\`\`\`json
{
  "$schema": "https://opencode.ai/config.json",
  "tools": {
    "write": true,
    "bash": true
  },
  "agent": {
    "plan": {
      "tools": {
        "write": false,
        "bash": false
      }
    }
  }
}
\`\`\`

**Wildcards:**

\`\`\`json
{
  "agent": {
    "readonly": {
      "tools": {
        "mymcp_*": false,
        "write": false,
        "edit": false
      }
    }
  }
}
\`\`\`

### Permissions

Manage action approvals:

\`\`\`json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "edit": "deny"  // "ask" | "allow" | "deny"
  },
  "agent": {
    "build": {
      "permission": {
        "edit": "ask"
      }
    }
  }
}
\`\`\`

**Tool-specific permissions:**

\`\`\`json
{
  "agent": {
    "build": {
      "permission": {
        "bash": {
          "*": "ask",
          "git status *": "allow",
          "git push": "ask",
          "grep *": "allow"
        },
        "webfetch": "deny"
      }
    }
  }
}
\`\`\`

**Markdown configuration:**

\`\`\`markdown
---
description: Code review without edits
mode: subagent
permission:
  edit: deny
  bash:
    "*": ask
    "git diff": allow
    "git log*": allow
    "grep *": allow
  webfetch: deny
---

Only analyze code and suggest changes.
\`\`\`

**Permission values:**
- \`ask\`: Prompt for approval
- \`allow\`: Auto-approve all
- \`deny\`: Disable tool

**Rule precedence:** Last matching rule wins (use \`*\` first, then specific)

### Task Permissions

Control subagent invocation via Task tool:

\`\`\`json
{
  "agent": {
    "orchestrator": {
      "mode": "primary",
      "permission": {
        "task": {
          "*": "deny",
          "orchestrator-*": "allow",
          "code-reviewer": "ask"
        }
      }
    }
  }
}
\`\`\`

**When set to \`deny\`:** Subagent removed from Task tool description entirely.

**Note:** Users can always @ mention any subagent directly, regardless of task permissions.

### Hidden

Hide subagent from @ autocomplete:

\`\`\`json
{
  "agent": {
    "internal-helper": {
      "mode": "subagent",
      "hidden": true
    }
  }
}
\`\`\`

**Use case:** Internal agents invoked only programmatically via Task tool.

**Note:** Only applies to \`mode: subagent\`.

### Disable

Disable agent:

\`\`\`json
{
  "agent": {
    "review": {
      "disable": true
    }
  }
}
\`\`\`

### Additional Options

Provider-specific options passed through directly:

\`\`\`json
{
  "agent": {
    "deep-thinker": {
      "description": "High reasoning effort for complex problems",
      "model": "openai/gpt-5",
      "reasoningEffort": "high",
      "textVerbosity": "low"
    }
  }
}
\`\`\`

Check provider documentation for available parameters.

## Creating Agents

### Interactive Creation

\`\`\`bash
opencode agent create
\`\`\`

**Steps:**
1. Choose location (global or project-specific)
2. Provide agent description
3. Auto-generate prompt and identifier
4. Select tool access
5. Creates markdown file with configuration

### Manual Creation

**1. Create markdown file:**

\`.opencode/agents/docs-writer.md\`

\`\`\`markdown
---
description: Writes and maintains project documentation
mode: subagent
tools:
  bash: false
---

You are a technical writer. Create clear, comprehensive documentation.

Focus on:
- Clear explanations
- Proper structure
- Code examples
- User-friendly language
\`\`\`

**2. Or use JSON config:**

\`\`\`json
{
  "agent": {
    "docs-writer": {
      "description": "Writes and maintains project documentation",
      "mode": "subagent",
      "tools": {
        "bash": false
      },
      "prompt": "{file:./.opencode/prompts/docs-writer.txt}"
    }
  }
}
\`\`\`

## Use Cases

### Development Workflow Agents

**Build Agent:**
- Full development work
- All tools enabled
- Direct code changes

**Plan Agent:**
- Analysis and planning
- Read-only operations
- Change suggestions without modifications

**Debug Agent:**
- Investigation focused
- Bash and read tools enabled
- Limited write access

### Specialized Review Agents

**Code Reviewer:**

\`\`\`markdown
---
description: Reviews code for best practices and potential issues
mode: subagent
tools:
  write: false
  edit: false
---

You are a code reviewer. Focus on security, performance, and maintainability.
\`\`\`

**Security Auditor:**

\`\`\`markdown
---
description: Performs security audits and identifies vulnerabilities
mode: subagent
tools:
  write: false
  edit: false
---

You are a security expert. Focus on identifying potential security issues.

Look for:
- Input validation vulnerabilities
- Authentication and authorization flaws
- Data exposure risks
- Dependency vulnerabilities
- Configuration security issues
\`\`\`

### Documentation Agents

**Docs Writer:**

\`\`\`markdown
---
description: Writes and maintains project documentation
mode: subagent
tools:
  bash: false
---

You are a technical writer. Create clear, comprehensive documentation.

Focus on:
- Clear explanations
- Proper structure
- Code examples
- User-friendly language
\`\`\`

## Best Practices

### 1. Clear Descriptions

Make descriptions specific to help auto-invocation:

\`\`\`json
{
  "agent": {
    "api-tester": {
      "description": "Tests API endpoints and validates responses"
    }
  }
}
\`\`\`

### 2. Appropriate Permissions

Set permissions matching agent purpose:

\`\`\`json
{
  "agent": {
    "analyzer": {
      "mode": "subagent",
      "permission": {
        "edit": "deny",
        "bash": {
          "*": "ask",
          "grep *": "allow",
          "git diff": "allow"
        }
      }
    }
  }
}
\`\`\`

### 3. Temperature Tuning

Adjust temperature for task type:

\`\`\`json
{
  "agent": {
    "code-analyzer": {
      "temperature": 0.1  // Deterministic
    },
    "naming-helper": {
      "temperature": 0.6  // Creative
    }
  }
}
\`\`\`

### 4. Model Selection

Use appropriate models:

\`\`\`json
{
  "agent": {
    "quick-scan": {
      "model": "anthropic/claude-haiku-4-20250514"  // Fast
    },
    "deep-analysis": {
      "model": "anthropic/claude-sonnet-4-20250514"  // Capable
    }
  }
}
\`\`\`

### 5. Focused Prompts

Keep prompts specific to agent purpose:

\`\`\`markdown
---
description: API testing specialist
mode: subagent
---

You are an API testing specialist. 

For each endpoint:
1. Validate request/response structure
2. Test error handling
3. Check authentication
4. Verify data validation

Report findings clearly.
\`\`\`

## Example Agents

### Test Runner Agent

\`\`\`json
{
  "agent": {
    "test-runner": {
      "description": "Runs tests and analyzes failures",
      "mode": "subagent",
      "temperature": 0.1,
      "tools": {
        "write": false,
        "edit": false
      },
      "permission": {
        "bash": {
          "*": "deny",
          "npm test*": "allow",
          "bun test*": "allow",
          "pytest*": "allow"
        }
      },
      "prompt": "{file:./.opencode/prompts/test-runner.txt}"
    }
  }
}
\`\`\`

### Architecture Advisor

\`\`\`markdown
---
description: Provides architecture and design pattern guidance
mode: subagent
temperature: 0.3
tools:
  write: false
  edit: false
  bash: false
---

You are a software architecture expert.

Analyze code structure and suggest:
- Design patterns
- Separation of concerns
- Scalability improvements
- Maintainability enhancements

Explain trade-offs clearly.
\`\`\`

### Dependency Updater

\`\`\`json
{
  "agent": {
    "dependency-updater": {
      "description": "Updates project dependencies safely",
      "mode": "subagent",
      "maxSteps": 10,
      "permission": {
        "edit": "ask",
        "bash": {
          "*": "deny",
          "npm outdated": "allow",
          "npm update*": "ask",
          "bun update*": "ask"
        }
      },
      "prompt": "You update dependencies carefully. Check compatibility, test after updates, and explain changes."
    }
  }
}
\`\`\`

## Agent Orchestration

### Multi-Agent Workflows

Primary agents can orchestrate multiple subagents:

\`\`\`json
{
  "agent": {
    "orchestrator": {
      "description": "Coordinates multiple specialized agents",
      "mode": "primary",
      "maxSteps": 20,
      "permission": {
        "task": {
          "*": "deny",
          "code-reviewer": "allow",
          "test-runner": "allow",
          "security-auditor": "allow"
        }
      }
    }
  }
}
\`\`\`

### Session Navigation

Navigate between parent and child agent sessions:

- **<Leader>+Right**: parent → child1 → child2 → … → parent
- **<Leader>+Left**: parent ← child1 ← child2 ← … ← parent

## Resources

- [OpenCode Documentation](https://opencode.ai/docs/agents)
- [Agent Configuration Reference](https://opencode.ai/docs/config)
- [Permissions Guide](https://opencode.ai/docs/permissions)
- [Tools Configuration](https://opencode.ai/docs/tools)
- [Custom Commands](https://opencode.ai/docs/commands)

This skill provides comprehensive guidance for creating and configuring OpenCode agents following official patterns and best practices.
`,
});
