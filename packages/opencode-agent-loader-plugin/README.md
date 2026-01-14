# OpenCode Augmented Plugin

**Dynamic Agent Specification Loader for OpenCode**

This OpenCode plugin enables you to dynamically load custom agent specifications from TypeScript files, allowing you to
extend OpenCode with specialized AI agents without modifying core configuration.

## Features

- **Built-in Agents**: Ships with 6 production-ready specialized agents
- **Dynamic Agent Loading**: Automatically discover and load custom agent specs from `.opencode/agent/` directory
- **Class-Based Specs**: Define agents as TypeScript classes implementing the `AgentSpec` interface
- **Type-Safe**: Full TypeScript support with OpenCode's `AgentConfig` type
- **Validation**: Automatic validation of agent specifications
- **Zero Configuration**: Works out of the box with sensible defaults
- **Flexible**: Enable/disable default agents or create your own

## Installation

```bash
# In your OpenCode project
bun install @pantheon-org/opencode-agent-loader-plugin
```

Add the plugin to your `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["@pantheon-org/opencode-agent-loader-plugin"]
}
```

## Default Agents

The plugin includes 6 production-ready specialized agents that are enabled by default:

### 1. **Code Reviewer** (`code-reviewer`)

Expert code reviewer specializing in best practices, security, and performance analysis. Read-only agent focused on
providing thorough, constructive feedback.

### 2. **Security Auditor** (`security-auditor`)

Security expert specializing in vulnerability detection and secure coding practices. Analyzes code for OWASP Top 10
vulnerabilities, cryptography issues, and security misconfigurations.

### 3. **Test Engineer** (`test-engineer`)

Testing expert specializing in unit tests, integration tests, and quality assurance. Can both analyze and write
comprehensive test suites with good coverage.

### 4. **Documentation Writer** (`documentation-writer`)

Technical writing expert specializing in clear, comprehensive documentation. Creates README files, API docs, tutorials,
and inline code comments.

### 5. **Refactoring Expert** (`refactoring-expert`)

Code refactoring specialist focused on improving code quality and reducing technical debt. Applies design patterns and
SOLID principles systematically.

### 6. **Performance Optimizer** (`performance-optimizer`)

Performance expert specializing in optimization, profiling, and eliminating bottlenecks. Analyzes algorithmic complexity
and system-level performance.

### Using Default Agents

```bash
# Use the code reviewer
opencode --agent code-reviewer "Review this PR for best practices"

# Use the security auditor
opencode --agent security-auditor "Audit this authentication module"

# Use the test engineer
opencode --agent test-engineer "Write tests for the UserService class"
```

### Configuring Default Agents

Create a `.opencode/plugin.json` file in your project to customize the plugin:

```json
{
  "@pantheon-org/opencode-agent-loader-plugin": {
    "enableDefaultAgents": true,
    "disabledDefaultAgents": ["code-reviewer", "security-auditor"]
  }
}
```

Or disable all default agents:

```json
{
  "@pantheon-org/opencode-agent-loader-plugin": {
    "enableDefaultAgents": false
  }
}
```

## Quick Start

### 1. Create Your Own Agent Spec File

Create a file in `.opencode/agent/` (e.g., `.opencode/agent/code-reviewer.ts`):

```typescript
import type { AgentSpec } from '@pantheon-org/opencode-agent-loader-plugin';
import type { AgentConfig } from '@opencode-ai/sdk';

export class CodeReviewAgent implements AgentSpec {
  name = 'code-review-expert';

  config: AgentConfig = {
    description: 'Expert code reviewer for best practices and quality',
    model: 'anthropic/claude-3-5-sonnet-20241022',
    temperature: 0.3,
    mode: 'subagent',

    prompt: `You are an expert code reviewer...`,

    tools: {
      read: true,
      grep: true,
      edit: false, // Review only
    },

    permission: {
      edit: 'deny',
      bash: 'deny',
    },
  };
}
```

### 2. Use Your Custom Agent

Your agent is now available in OpenCode:

```bash
opencode --agent code-review-expert "Review this PR"
```

## Agent Specification API

### AgentSpec Interface

```typescript
interface AgentSpec {
  /**
   * Unique agent identifier (kebab-case)
   * Example: 'my-custom-agent'
   */
  name: string;

  /**
   * Agent configuration (follows OpenCode's AgentConfig type)
   */
  config: AgentConfig;
}
```

### AgentConfig Properties

The `config` property follows OpenCode's `AgentConfig` type from `@opencode-ai/sdk`:

```typescript
{
  // Agent description shown in UI
  description?: string;

  // Preferred model (e.g., 'anthropic/claude-3-5-sonnet-20241022')
  model?: string;

  // Temperature (0.0 - 2.0)
  temperature?: number;

  // Top-p sampling
  top_p?: number;

  // System prompt defining agent behavior
  prompt?: string;

  // Available tools
  tools?: {
    [toolName: string]: boolean;
  };

  // Disable the agent
  disable?: boolean;

  // Agent mode: "subagent" | "primary" | "all"
  mode?: "subagent" | "primary" | "all";

  // UI color (hex code, e.g., '#FF5733')
  color?: string;

  // Maximum agentic iterations
  maxSteps?: number;

  // Permission settings
  permission?: {
    edit?: "ask" | "allow" | "deny";
    bash?: "ask" | "allow" | "deny" | { [command: string]: "ask" | "allow" | "deny" };
    webfetch?: "ask" | "allow" | "deny";
    doom_loop?: "ask" | "allow" | "deny";
    external_directory?: "ask" | "allow" | "deny";
  };
}
```

## Configuration

The plugin can be configured via `.opencode/plugin.json` in your project root:

```json
{
  "@pantheon-org/opencode-agent-loader-plugin": {
    "agentsDir": ".opencode/agent",
    "verbose": true,
    "enableDefaultAgents": true,
    "disabledDefaultAgents": ["code-reviewer"]
  }
}
```

The configuration file is optional - the plugin works out of the box with sensible defaults.

### Configuration Options

- **`agentsDir`**: Directory where custom agent specs are located (default: `.opencode/agent`)
- **`verbose`**: Enable detailed logging during agent loading (default: `false`)
- **`enableDefaultAgents`**: Enable built-in default agents (default: `true`)
- **`disabledDefaultAgents`**: Array of default agent names to disable (default: `[]`)

### Creating Default Configuration

You can programmatically create a default `.opencode/plugin.json` file:

```typescript
import { createDefaultPluginConfig } from '@pantheon-org/opencode-agent-loader-plugin';

// Creates .opencode/plugin.json with default configuration
await createDefaultPluginConfig('/path/to/project');
```

## Examples

### Example 1: Code Review Agent

```typescript
export class CodeReviewAgent implements AgentSpec {
  name = 'code-review-expert';

  config: AgentConfig = {
    description: 'Expert code reviewer',
    temperature: 0.3,
    prompt: 'You are an expert code reviewer...',
    tools: {
      read: true,
      grep: true,
      edit: false,
    },
    permission: {
      edit: 'deny',
      bash: 'deny',
    },
  };
}
```

### Example 2: DevOps Agent

```typescript
export class DevOpsAgent implements AgentSpec {
  name = 'devops-expert';

  config: AgentConfig = {
    description: 'Infrastructure and deployment specialist',
    temperature: 0.5,
    prompt: 'You are a DevOps expert...',
    tools: {
      read: true,
      bash: true,
      edit: true,
    },
    permission: {
      bash: 'ask',
      edit: 'ask',
    },
    color: '#10B981',
  };
}
```

### Example 3: Documentation Writer

```typescript
export class DocumentationAgent implements AgentSpec {
  name = 'documentation-expert';

  config: AgentConfig = {
    description: 'Technical documentation specialist',
    temperature: 0.7,
    prompt: 'You are a technical writer...',
    tools: {
      read: true,
      edit: true,
      write: true,
    },
    color: '#8B5CF6',
  };
}
```

See [examples/sample-agents.ts](./examples/sample-agents.ts) for complete examples.

## Project Structure

```
.opencode/
└── agents/              # Your agent specifications
    ├── code-reviewer.ts
    ├── devops.ts
    └── documentation.ts
```

## Best Practices

### 1. Agent Naming

Use kebab-case for agent names:

```typescript
// ✅ Good
name = 'code-review-expert';
name = 'devops-specialist';

// ❌ Bad
name = 'CodeReviewExpert';
name = 'devOps_specialist';
```

### 2. Permission Settings

Be explicit about permissions for security:

```typescript
config: AgentConfig = {
  permission: {
    edit: 'ask', // Always ask before editing
    bash: 'deny', // Prevent command execution if not needed
    webfetch: 'ask',
  },
};
```

### 3. Tool Selection

Only enable tools your agent actually needs:

```typescript
// ✅ Good: Minimal tool set
tools: {
  read: true,
  grep: true,
}

// ❌ Bad: Everything enabled
tools: {
  read: true,
  write: true,
  edit: true,
  bash: true,
  // ... unnecessary tools
}
```

### 4. Clear Prompts

Write specific, actionable system prompts:

```typescript
prompt: `You are an expert code reviewer.

Your responsibilities:
- Review code for bugs and security issues
- Suggest improvements following SOLID principles
- Check for code style consistency

Guidelines:
- Be thorough but concise
- Prioritize critical issues
- Provide actionable feedback`;
```

## Troubleshooting

### Agent Not Loading

**Problem**: Agent spec file isn't being discovered

**Solution**:

1. Check file location: Must be in `.opencode/agent/`
2. Check file extension: Must be `.ts` or `.js`
3. Check export: Must export a class implementing `AgentSpec`
4. Enable verbose logging: `export OPENCODE_VERBOSE=true`

### Agent Name Invalid

**Problem**: Error about invalid agent name

**Solution**: Agent names must be:

- Kebab-case (lowercase letters, numbers, hyphens)
- Start with a letter
- Example: `my-agent-123` ✅, `MyAgent` ❌, `123-agent` ❌

### TypeScript Errors

**Problem**: Type errors when defining agent specs

**Solution**:

1. Install the SDK: `bun install @opencode-ai/sdk`
2. Import types:
   ```typescript
   import type { AgentSpec } from '@pantheon-org/opencode-agent-loader-plugin';
   import type { AgentConfig } from '@opencode-ai/sdk';
   ```

## Development

```bash
# Install dependencies
bun install

# Build the plugin
bun run build

# Run tests
bun test

# Type check
bun run type-check
```

## Contributing

Contributions are welcome! Please see the [main repository](https://github.com/pantheon-org/opencode-plugins) for
contribution guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details

## Links

- **Main Repository**: https://github.com/pantheon-org/opencode-plugins
- **OpenCode Documentation**: https://opencode.ai/docs
- **OpenCode SDK**: https://www.npmjs.com/package/@opencode-ai/sdk

## Support

- Report issues: https://github.com/pantheon-org/opencode-agent-loader-plugin/issues
- OpenCode Discord: https://discord.gg/opencode
