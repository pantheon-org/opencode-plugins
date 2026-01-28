import { defineSkill } from '@pantheon-org/opencode-skills';
import type { Skill } from '@pantheon-org/opencode-skills';

/**
 * OpenCode Configuration Skill
 *
 * Comprehensive guide for configuring OpenCode through opencode.json.
 * Covers all configuration options, precedence, locations, and best practices.
 *
 * Source: https://opencode.ai/docs/config/
 */
export const opencodeConfigurationSkill: Skill = defineSkill({
  name: 'opencode-configuration',
  description: 'Complete guide for configuring OpenCode through opencode.json and config locations',
  license: 'MIT',
  compatibility: 'opencode',
  metadata: {
    category: 'configuration',
  },
  keywords: [
    'opencode.json',
    'config',
    'configuration',
    'opencode-config',
    'settings',
    'preferences',
    'global-config',
    'project-config',
    'remote-config',
  ],

  whatIDo: `
I provide comprehensive guidance for OpenCode configuration:

- Multiple config locations with merge behavior and precedence
- Schema validation via $schema field
- Variable substitution for environment variables and files
- All configuration options (TUI, server, tools, models, themes, agents, etc.)
- Security best practices for API keys and secrets
- Organization and maintainability strategies
- Common configuration patterns and examples
  `.trim(),

  whenToUseMe: `
Use this skill when you need to:

- Understand OpenCode configuration file locations and precedence
- Configure providers, models, agents, tools, or themes
- Set up project-specific or global settings
- Use environment variables or file substitution
- Control permissions, autoupdate, or sharing behavior
- Troubleshoot configuration loading issues
- Organize configuration for team projects
  `.trim(),

  instructions: `# OpenCode Configuration Guide

## Overview

OpenCode uses JSON/JSONC configuration files to customize behavior, providers, models, tools, themes, agents, and more. Configuration can be set globally, per-project, remotely, or via environment variables.

**Key Concepts:**
- **Multiple config locations** with merge behavior
- **Precedence order** determines which settings win
- **Schema validation** via \`$schema\` field
- **Variable substitution** for env vars and files
- **Flexible formats**: JSON and JSONC (JSON with Comments)

**Official Documentation:** https://opencode.ai/docs/config/

---

## Configuration Formats

OpenCode supports both JSON and JSONC (JSON with Comments):

\`\`\`jsonc
// opencode.jsonc
{
  "$schema": "https://opencode.ai/config.json",
  
  // Theme configuration
  "theme": "opencode",
  
  // Model selection
  "model": "anthropic/claude-sonnet-4-5",
  
  // Auto-update behavior
  "autoupdate": true
}
\`\`\`

**Schema Benefits:**
- Autocomplete in editors (VS Code, JetBrains, etc.)
- Validation of config options
- Inline documentation
- Type checking

**Schema URL:** \`https://opencode.ai/config.json\`

---

## Configuration Locations

### Precedence Order

Configuration files are **merged together**, not replaced. Settings from multiple locations combine, with later sources overriding earlier ones only for conflicting keys.

**Load Order (lowest to highest priority):**

1. **Remote config** (from \`.well-known/opencode\`) - organizational defaults
2. **Global config** (\`~/.config/opencode/opencode.json\`) - user preferences
3. **Custom config** (\`OPENCODE_CONFIG\` env var) - custom overrides
4. **Project config** (\`opencode.json\` in project) - project-specific settings
5. **\`.opencode\` directories** - agents, commands, plugins
6. **Inline config** (\`OPENCODE_CONFIG_CONTENT\` env var) - runtime overrides

**Example Merge Behavior:**

Global config:
\`\`\`json
{
  "theme": "opencode",
  "autoupdate": true
}
\`\`\`

Project config:
\`\`\`json
{
  "model": "anthropic/claude-sonnet-4-5"
}
\`\`\`

**Result:** All three settings are preserved (theme + autoupdate + model).

### Remote Config

Organizations can provide default configuration via the \`.well-known/opencode\` endpoint. This is fetched automatically when you authenticate with a provider that supports it.

**Example Remote Config:**
\`\`\`json
{
  "mcp": {
    "jira": {
      "type": "remote",
      "url": "https://jira.example.com/mcp",
      "enabled": false
    }
  }
}
\`\`\`

**Override in Local Config:**
\`\`\`json
{
  "mcp": {
    "jira": {
      "enabled": true
    }
  }
}
\`\`\`

### Global Config

**Location:** \`~/.config/opencode/opencode.json\`

**Use Cases:**
- User-wide preferences (theme, keybinds)
- Provider API keys
- Default models
- Personal tools configuration

**Example:**
\`\`\`json
{
  "$schema": "https://opencode.ai/config.json",
  "theme": "dracula",
  "autoupdate": true,
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "{env:ANTHROPIC_API_KEY}"
      }
    }
  }
}
\`\`\`

### Per-Project Config

**Location:** \`opencode.json\` in project root

**Use Cases:**
- Project-specific models
- Team-wide agents
- Project tools configuration
- Custom commands for the project

**Example:**
\`\`\`json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",
  "agent": {
    "code-reviewer": {
      "description": "Reviews code for best practices",
      "model": "anthropic/claude-sonnet-4-5",
      "prompt": "You are a code reviewer.",
      "tools": {
        "write": false,
        "edit": false
      }
    }
  }
}
\`\`\`

**Best Practice:** Check project config into Git for team consistency.

### Custom Config Path

Use \`OPENCODE_CONFIG\` environment variable:

\`\`\`bash
export OPENCODE_CONFIG=/path/to/custom-config.json
opencode run "Hello world"
\`\`\`

**Use Cases:**
- Testing different configurations
- Temporary overrides
- CI/CD environments
- Multiple configuration profiles

### Custom Config Directory

Use \`OPENCODE_CONFIG_DIR\` environment variable:

\`\`\`bash
export OPENCODE_CONFIG_DIR=/path/to/config-directory
opencode run "Hello world"
\`\`\`

**Directory Structure:**
\`\`\`
/path/to/config-directory/
├── agents/          # Custom agent definitions
├── commands/        # Custom commands
├── modes/           # Custom modes
├── plugins/         # Custom plugins
├── skills/          # Custom skills
├── themes/          # Custom themes
└── tools/           # Custom tools
\`\`\`

**Note:** Use **plural names** for subdirectories (e.g., \`agents/\`, not \`agent/\`).

---

## Configuration Schema

### TUI Settings

Configure terminal user interface behavior:

\`\`\`json
{
  "tui": {
    "scroll_speed": 3,
    "scroll_acceleration": {
      "enabled": true
    },
    "diff_style": "auto"
  }
}
\`\`\`

**Options:**
- \`scroll_acceleration.enabled\` - Enable macOS-style scroll acceleration (overrides \`scroll_speed\`)
- \`scroll_speed\` - Custom scroll speed multiplier (default: 3, minimum: 1)
- \`diff_style\` - Diff rendering: \`"auto"\` (adapts to terminal width) or \`"stacked"\` (single column)

### Server Settings

Configure \`opencode serve\` and \`opencode web\` commands:

\`\`\`json
{
  "server": {
    "port": 4096,
    "hostname": "0.0.0.0",
    "mdns": true,
    "cors": ["http://localhost:5173"]
  }
}
\`\`\`

**Options:**
- \`port\` - Port to listen on (default: 4096)
- \`hostname\` - Hostname to listen on (default: 0.0.0.0 when mdns enabled)
- \`mdns\` - Enable mDNS service discovery
- \`cors\` - Additional CORS origins (full origins: scheme + host + optional port)

**Example:**
\`\`\`bash
# Start server with custom config
opencode serve --port 8080
\`\`\`

### Tools Configuration

Enable or disable tools available to LLM:

\`\`\`json
{
  "tools": {
    "write": false,
    "bash": false,
    "edit": true,
    "read": true
  }
}
\`\`\`

**Common Tools:**
- \`read\` - Read files
- \`write\` - Create/overwrite files
- \`edit\` - Edit existing files
- \`bash\` - Execute shell commands
- \`glob\` - Find files by pattern
- \`grep\` - Search file contents
- \`task\` - Spawn subagents

**Use Cases:**
- Disable dangerous tools (\`bash\`, \`write\`)
- Review-only agents (disable \`write\`, \`edit\`)
- Read-only exploration (disable all modification tools)

### Models Configuration

Configure providers and models:

\`\`\`json
{
  "provider": {
    "anthropic": {
      "options": {
        "timeout": 600000,
        "setCacheKey": true,
        "apiKey": "{env:ANTHROPIC_API_KEY}"
      }
    }
  },
  "model": "anthropic/claude-sonnet-4-5",
  "small_model": "anthropic/claude-haiku-4-5"
}
\`\`\`

**Options:**
- \`model\` - Primary model for main tasks
- \`small_model\` - Cheaper model for lightweight tasks (title generation, etc.)
- \`provider.options.timeout\` - Request timeout in milliseconds (default: 300000)
- \`provider.options.setCacheKey\` - Ensure cache key is always set
- \`provider.options.apiKey\` - API key (use variable substitution)

**Provider-Specific: Amazon Bedrock**
\`\`\`json
{
  "provider": {
    "amazon-bedrock": {
      "options": {
        "region": "us-east-1",
        "profile": "my-aws-profile",
        "endpoint": "https://bedrock-runtime.us-east-1.vpce-xxxxx.amazonaws.com"
      }
    }
  }
}
\`\`\`

**Bedrock Options:**
- \`region\` - AWS region (defaults to \`AWS_REGION\` env var or \`us-east-1\`)
- \`profile\` - AWS named profile from \`~/.aws/credentials\`
- \`endpoint\` - Custom endpoint URL for VPC endpoints

### Themes Configuration

Set your preferred theme:

\`\`\`json
{
  "theme": "opencode"
}
\`\`\`

**Built-in Themes:**
- \`opencode\` - Default theme
- \`dracula\`
- \`nord\`
- \`solarized-dark\`
- Custom themes from \`~/.config/opencode/themes/\`

### Agents Configuration

Define specialized agents for specific tasks:

\`\`\`json
{
  "agent": {
    "code-reviewer": {
      "description": "Reviews code for best practices and potential issues",
      "model": "anthropic/claude-sonnet-4-5",
      "prompt": "You are a code reviewer. Focus on security, performance, and maintainability.",
      "tools": {
        "write": false,
        "edit": false
      }
    },
    "test-writer": {
      "description": "Writes comprehensive unit tests",
      "model": "anthropic/claude-haiku-4-5",
      "prompt": "You are a test engineer. Write thorough, maintainable tests.",
      "tools": {
        "bash": true
      }
    }
  }
}
\`\`\`

**Alternative:** Define agents in \`~/.config/opencode/agents/\` or \`.opencode/agents/\` using markdown files.

### Default Agent

Set the default agent for new sessions:

\`\`\`json
{
  "default_agent": "plan"
}
\`\`\`

**Requirements:**
- Must be a **primary agent** (not a subagent)
- Can be built-in (\`"build"\`, \`"plan"\`) or custom
- Applies to TUI, CLI, desktop app, and GitHub Action
- Falls back to \`"build"\` if agent doesn't exist or is a subagent

### Sharing Configuration

Configure conversation sharing behavior:

\`\`\`json
{
  "share": "manual"
}
\`\`\`

**Options:**
- \`"manual"\` - Allow manual sharing via commands (default)
- \`"auto"\` - Automatically share new conversations
- \`"disabled"\` - Disable sharing entirely

**Manual Sharing:**
\`\`\`bash
# In OpenCode session
/share
\`\`\`

### Commands Configuration

Define custom commands for repetitive tasks:

\`\`\`json
{
  "command": {
    "test": {
      "template": "Run the full test suite with coverage report and show any failures.\\nFocus on the failing tests and suggest fixes.",
      "description": "Run tests with coverage",
      "agent": "build",
      "model": "anthropic/claude-haiku-4-5"
    },
    "component": {
      "template": "Create a new React component named $ARGUMENTS with TypeScript support.\\nInclude proper typing and basic structure.",
      "description": "Create a new component"
    }
  }
}
\`\`\`

**Variables:**
- \`$ARGUMENTS\` - User-provided arguments to the command

**Alternative:** Define commands in \`~/.config/opencode/commands/\` or \`.opencode/commands/\` using markdown files.

### Keybinds Configuration

Customize keyboard shortcuts:

\`\`\`json
{
  "keybinds": {
    "submit": "ctrl+enter",
    "cancel": "ctrl+c",
    "toggle_mode": "tab"
  }
}
\`\`\`

See https://opencode.ai/docs/keybinds/ for available keybinds.

### Autoupdate Configuration

Control automatic updates:

\`\`\`json
{
  "autoupdate": false
}
\`\`\`

**Options:**
- \`true\` - Automatically download and install updates (default)
- \`false\` - Disable automatic updates
- \`"notify"\` - Notify when updates are available (only if not installed via package manager)

**Note:** Homebrew installations should use \`brew upgrade opencode\` instead.

### Formatters Configuration

Configure code formatters:

\`\`\`json
{
  "formatter": {
    "prettier": {
      "disabled": true
    },
    "custom-prettier": {
      "command": ["npx", "prettier", "--write", "$FILE"],
      "environment": {
        "NODE_ENV": "development"
      },
      "extensions": [".js", ".ts", ".jsx", ".tsx"]
    }
  }
}
\`\`\`

**Variables:**
- \`$FILE\` - File path being formatted

### Permissions Configuration

Control which operations require user approval:

\`\`\`json
{
  "permission": {
    "edit": "ask",
    "bash": "ask",
    "write": "allow",
    "read": "allow"
  }
}
\`\`\`

**Options:**
- \`"ask"\` - Request user approval before execution
- \`"allow"\` - Allow without approval (default for all tools)
- \`"deny"\` - Deny all attempts

**Default Behavior:** All operations are allowed without approval.

**Common Patterns:**
\`\`\`json
{
  "permission": {
    // Review-only mode
    "edit": "ask",
    "write": "ask",
    "bash": "ask",
    
    // Safe exploration
    "read": "allow",
    "glob": "allow",
    "grep": "allow"
  }
}
\`\`\`

### Compaction Configuration

Control context compaction behavior:

\`\`\`json
{
  "compaction": {
    "auto": true,
    "prune": true
  }
}
\`\`\`

**Options:**
- \`auto\` - Automatically compact when context is full (default: true)
- \`prune\` - Remove old tool outputs to save tokens (default: true)

**Use Cases:**
- Disable for debugging (\`"auto": false\`)
- Keep full context history (\`"prune": false\`)
- Let OpenCode manage context automatically (both true)

### Watcher Configuration

Configure file watcher ignore patterns:

\`\`\`json
{
  "watcher": {
    "ignore": [
      "node_modules/**",
      "dist/**",
      ".git/**",
      "*.log",
      "coverage/**"
    ]
  }
}
\`\`\`

**Use Cases:**
- Exclude noisy directories
- Prevent watch triggers for generated files
- Reduce resource usage

**Pattern Syntax:** Standard glob patterns

### MCP Servers Configuration

Configure Model Context Protocol (MCP) servers:

\`\`\`json
{
  "mcp": {
    "jira": {
      "type": "remote",
      "url": "https://jira.example.com/mcp",
      "enabled": true
    },
    "database": {
      "type": "stdio",
      "command": "node",
      "args": ["./mcp-server.js"],
      "enabled": true
    }
  }
}
\`\`\`

See https://opencode.ai/docs/mcp-servers/ for detailed MCP configuration.

### Plugins Configuration

Load OpenCode plugins from npm or local files:

\`\`\`json
{
  "plugin": [
    "opencode-helicone-session",
    "@my-org/custom-plugin",
    "@pantheon-org/opencode-core-plugin"
  ]
}
\`\`\`

**Plugin Locations:**
- \`~/.config/opencode/plugins/\` - Global plugins
- \`.opencode/plugins/\` - Project-specific plugins
- npm packages (via \`plugin\` array)

**Example Plugin Structure:**
\`\`\`
.opencode/
└── plugins/
    └── my-plugin/
        └── index.js
\`\`\`

See https://opencode.ai/docs/plugins/ for plugin development.

### Instructions Configuration

Configure instruction files for the model:

\`\`\`json
{
  "instructions": [
    "CONTRIBUTING.md",
    "docs/guidelines.md",
    ".cursor/rules/*.md"
  ]
}
\`\`\`

**Supported:**
- Direct file paths
- Glob patterns
- Multiple files (merged together)

**Use Cases:**
- Project-specific coding guidelines
- Team best practices
- API documentation
- Style guides

See https://opencode.ai/docs/rules/ for creating instruction files.

### Disabled Providers

Prevent specific providers from loading:

\`\`\`json
{
  "disabled_providers": ["openai", "gemini"]
}
\`\`\`

**Behavior:**
- Won't load even if API keys are set
- Won't appear in model selection
- Takes priority over \`enabled_providers\`

**Use Cases:**
- Enforce organizational provider restrictions
- Disable unused providers
- Prevent accidental usage

### Enabled Providers

Allowlist specific providers:

\`\`\`json
{
  "enabled_providers": ["anthropic", "openai"]
}
\`\`\`

**Behavior:**
- Only specified providers will load
- All others are ignored
- \`disabled_providers\` takes priority if both are set

**Use Cases:**
- Restrict to approved providers
- Simplify provider selection
- Organizational compliance

### Experimental Options

**Warning:** These options are unstable and may change without notice.

\`\`\`json
{
  "experimental": {
    // Experimental features go here
  }
}
\`\`\`

---

## Variable Substitution

### Environment Variables

Use \`{env:VARIABLE_NAME}\` syntax:

\`\`\`json
{
  "model": "{env:OPENCODE_MODEL}",
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "{env:ANTHROPIC_API_KEY}"
      }
    }
  }
}
\`\`\`

**Behavior:**
- Replaced with environment variable value
- Empty string if not set
- Resolved at config load time

**Use Cases:**
- Secure API key storage
- Dynamic model selection
- CI/CD environments

### File Contents

Use \`{file:path/to/file}\` syntax:

\`\`\`json
{
  "instructions": ["./custom-instructions.md"],
  "provider": {
    "openai": {
      "options": {
        "apiKey": "{file:~/.secrets/openai-key}"
      }
    }
  }
}
\`\`\`

**Path Resolution:**
- Relative to config file directory
- Absolute paths (starting with \`/\` or \`~\`)
- Tilde expansion supported

**Use Cases:**
- Separate API key files
- Include large instruction files
- Share common configuration snippets
- Keep secrets out of config files

---

## Best Practices

### Security

1. **Never commit API keys to Git:**
   \`\`\`json
   {
     "provider": {
       "anthropic": {
         "options": {
           "apiKey": "{env:ANTHROPIC_API_KEY}"
         }
       }
     }
   }
   \`\`\`

2. **Use file substitution for secrets:**
   \`\`\`json
   {
     "provider": {
       "openai": {
         "options": {
           "apiKey": "{file:~/.secrets/openai-key}"
         }
       }
     }
   }
   \`\`\`

3. **Add \`.opencode/\` to \`.gitignore\` for sensitive local configs**

### Organization

1. **Use global config for personal preferences:**
   - Theme
   - Keybinds
   - Personal API keys
   - Autoupdate settings

2. **Use project config for team standards:**
   - Project-specific models
   - Shared agents
   - Team commands
   - Project instructions

3. **Use remote config for organization defaults:**
   - Approved MCP servers
   - Corporate themes
   - Compliance rules
   - Shared agents

### Performance

1. **Configure watcher to ignore large directories:**
   \`\`\`json
   {
     "watcher": {
       "ignore": ["node_modules/**", "dist/**", ".git/**"]
     }
   }
   \`\`\`

2. **Use small_model for lightweight tasks:**
   \`\`\`json
   {
     "model": "anthropic/claude-sonnet-4-5",
     "small_model": "anthropic/claude-haiku-4-5"
   }
   \`\`\`

3. **Enable compaction for long sessions:**
   \`\`\`json
   {
     "compaction": {
       "auto": true,
       "prune": true
     }
   }
   \`\`\`

### Maintainability

1. **Add schema reference for validation:**
   \`\`\`json
   {
     "$schema": "https://opencode.ai/config.json"
   }
   \`\`\`

2. **Use comments in JSONC for documentation:**
   \`\`\`jsonc
   {
     // Theme configuration
     "theme": "opencode",
     
     // Primary model for complex tasks
     "model": "anthropic/claude-sonnet-4-5"
   }
   \`\`\`

3. **Split complex configs into multiple files:**
   \`\`\`
   ~/.config/opencode/
   ├── opencode.json          # Main config
   ├── agents/                # Agent definitions
   ├── commands/              # Custom commands
   └── plugins/               # Custom plugins
   \`\`\`

---

## Common Configurations

### Minimal Setup

\`\`\`json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5"
}
\`\`\`

### Review-Only Agent

\`\`\`json
{
  "$schema": "https://opencode.ai/config.json",
  "agent": {
    "reviewer": {
      "description": "Code reviewer - cannot modify code",
      "tools": {
        "write": false,
        "edit": false,
        "bash": false
      }
    }
  },
  "permission": {
    "read": "allow",
    "write": "deny",
    "edit": "deny",
    "bash": "deny"
  }
}
\`\`\`

### Team Project Config

\`\`\`json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",
  "small_model": "anthropic/claude-haiku-4-5",
  "instructions": [
    "CONTRIBUTING.md",
    "docs/coding-standards.md"
  ],
  "formatter": {
    "prettier": {
      "command": ["npm", "run", "format"],
      "extensions": [".js", ".ts", ".jsx", ".tsx"]
    }
  },
  "watcher": {
    "ignore": ["node_modules/**", "dist/**", "coverage/**"]
  }
}
\`\`\`

### Enterprise Config

\`\`\`json
{
  "$schema": "https://opencode.ai/config.json",
  "enabled_providers": ["anthropic", "openai"],
  "model": "anthropic/claude-sonnet-4-5",
  "permission": {
    "bash": "ask",
    "write": "ask"
  },
  "share": "disabled",
  "mcp": {
    "jira": {
      "type": "remote",
      "url": "https://jira.company.com/mcp",
      "enabled": true
    }
  }
}
\`\`\`

---

## Troubleshooting

### Config Not Loading

1. **Check file location:**
   \`\`\`bash
   # Global config
   ls -la ~/.config/opencode/opencode.json
   
   # Project config
   ls -la opencode.json
   \`\`\`

2. **Validate JSON syntax:**
   \`\`\`bash
   # Use jq to validate
   jq . opencode.json
   \`\`\`

3. **Check environment variables:**
   \`\`\`bash
   echo $OPENCODE_CONFIG
   echo $OPENCODE_CONFIG_DIR
   \`\`\`

### Provider Not Loading

1. **Check if disabled:**
   \`\`\`json
   {
     "disabled_providers": ["openai"]  // Remove if unintended
   }
   \`\`\`

2. **Check enabled providers list:**
   \`\`\`json
   {
     "enabled_providers": ["anthropic"]  // Add provider if missing
   }
   \`\`\`

3. **Verify API key:**
   \`\`\`bash
   echo $ANTHROPIC_API_KEY
   \`\`\`

### Variable Substitution Not Working

1. **Check syntax:**
   \`\`\`json
   {
     "model": "{env:OPENCODE_MODEL}",  // Correct
     "model": "$OPENCODE_MODEL"         // Incorrect
   }
   \`\`\`

2. **Verify environment variable exists:**
   \`\`\`bash
   env | grep OPENCODE
   \`\`\`

3. **Check file paths for file substitution:**
   \`\`\`bash
   # Verify file exists
   cat ~/.secrets/api-key
   \`\`\`

---

## Related Documentation

- **Tools Configuration:** https://opencode.ai/docs/tools/
- **Agents Configuration:** https://opencode.ai/docs/agents/
- **Models Configuration:** https://opencode.ai/docs/models/
- **Themes Configuration:** https://opencode.ai/docs/themes/
- **Keybinds Configuration:** https://opencode.ai/docs/keybinds/
- **Commands Configuration:** https://opencode.ai/docs/commands/
- **Formatters Configuration:** https://opencode.ai/docs/formatters/
- **Permissions Configuration:** https://opencode.ai/docs/permissions/
- **MCP Servers:** https://opencode.ai/docs/mcp-servers/
- **Plugins:** https://opencode.ai/docs/plugins/
- **Rules:** https://opencode.ai/docs/rules/

---

## Summary

OpenCode configuration is highly flexible with:

- **Multiple config locations** with merge behavior
- **Variable substitution** for dynamic values
- **Schema validation** for correctness
- **Precedence rules** for predictable overrides
- **Comprehensive options** for all aspects of OpenCode

**Key Takeaways:**

1. Use \`$schema\` for editor validation and autocomplete
2. Global config for personal preferences, project config for team standards
3. Leverage variable substitution for security and flexibility
4. Understand precedence order when troubleshooting
5. Check project config into Git for team consistency
6. Use remote config for organization-wide defaults

**Official Documentation:** https://opencode.ai/docs/config/
  `,

  checklist: [
    'Added $schema reference for validation and autocomplete',
    'Configured settings in appropriate location (global vs project)',
    'Used environment variable substitution for sensitive data (API keys)',
    'Avoided committing secrets to version control',
    'Tested configuration loads correctly with precedence rules',
    'Documented project-specific config for team members',
    'Configured watcher to ignore large directories if needed',
    'Set appropriate permissions for tools and operations',
  ],
});
