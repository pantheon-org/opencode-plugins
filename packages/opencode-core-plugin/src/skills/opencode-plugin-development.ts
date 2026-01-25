/**
 * OpenCode Plugin Development Skill
 *
 * Comprehensive guide for developing OpenCode plugins based on official documentation.
 */

import type { Skill } from '@pantheon-org/opencode-skills';

import { defineSkill } from '@pantheon-org/opencode-skills';

/**
 * OpenCode Plugin Development Skill
 *
 * This skill provides guidance on creating plugins for OpenCode,
 * including hook implementations, tool definitions, and best practices.
 */
export const opencodePluginDevelopmentSkill: Skill = defineSkill({
  name: 'opencode-plugin-development',
  description: 'Complete guide for developing OpenCode plugins with hooks, tools, and integrations',
  keywords: [
    'opencode',
    'plugin',
    'plugins',
    'extension',
    'hook',
    'hooks',
    'tool',
    'tools',
    'custom-tool',
    'integration',
  ],
  category: 'development',
  content: `
# OpenCode Plugin Development

Complete guide for developing plugins that extend OpenCode functionality.

## Overview

OpenCode plugins allow you to:
- Add custom tools that the AI can use
- Subscribe to events (file changes, sessions, messages, etc.)
- Modify chat behavior and parameters
- Control permissions
- Integrate with external services
- Add logging and monitoring

## Quick Start

### Basic Plugin Structure

\`\`\`typescript
import type { Plugin } from '@opencode-ai/plugin';

export const MyPlugin: Plugin = async ({ project, client, $, directory, worktree }) => {
  console.log("Plugin initialized!");
  
  return {
    // Hook implementations
  };
};
\`\`\`

### Context Parameters

The plugin function receives:
- \`project\`: Current project information
- \`directory\`: Current working directory
- \`worktree\`: Git worktree path
- \`client\`: OpenCode SDK client for API interactions
- \`$\`: Bun's shell API for executing commands

## Plugin Installation

### From Local Files

Place plugins in:
- \`.opencode/plugins/\` - Project-level (JavaScript/TypeScript)
- \`~/.config/opencode/plugins/\` - Global

Files are automatically loaded at startup.

### From npm

In \`opencode.json\`:

\`\`\`json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "opencode-helicone-session",
    "@my-org/custom-plugin"
  ]
}
\`\`\`

## Plugin Hooks

### Custom Tools

Add tools that the AI can invoke:

\`\`\`typescript
import { tool } from '@opencode-ai/plugin';

export const MyPlugin: Plugin = async (ctx) => {
  return {
    tool: {
      mytool: tool({
        description: "This is a custom tool",
        args: {
          foo: tool.schema.string(),
          count: tool.schema.number().optional(),
        },
        async execute(args, toolCtx) {
          // toolCtx includes: sessionID, messageID, agent, abort
          return \`Hello \${args.foo}! Count: \${args.count || 1}\`;
        },
      }),
    },
  };
};
\`\`\`

### Event Subscription

Subscribe to OpenCode events:

\`\`\`typescript
export const MyPlugin: Plugin = async ({ $ }) => {
  return {
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        await $\`osascript -e 'display notification "Session completed!" with title "opencode"'\`;
      }
    },
  };
};
\`\`\`

**Available Events:**
- Command: \`command.executed\`
- File: \`file.edited\`, \`file.watcher.updated\`
- Installation: \`installation.updated\`
- LSP: \`lsp.client.diagnostics\`, \`lsp.updated\`
- Message: \`message.part.removed\`, \`message.part.updated\`, \`message.removed\`, \`message.updated\`
- Permission: \`permission.replied\`, \`permission.updated\`
- Server: \`server.connected\`
- Session: \`session.created\`, \`session.compacted\`, \`session.deleted\`, \`session.diff\`, \`session.error\`, \`session.idle\`, \`session.status\`, \`session.updated\`
- Todo: \`todo.updated\`
- Tool: \`tool.execute.after\`, \`tool.execute.before\`
- TUI: \`tui.prompt.append\`, \`tui.command.execute\`, \`tui.toast.show\`

### Tool Execution Hooks

Intercept tool execution before/after:

\`\`\`typescript
export const EnvProtection: Plugin = async () => {
  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool === "read" && output.args.filePath.includes(".env")) {
        throw new Error("Do not read .env files");
      }
    },
  };
};
\`\`\`

### Chat Message Hook

Modify messages before sending to LLM:

\`\`\`typescript
export const MyPlugin: Plugin = async () => {
  return {
    "chat.message": async ({}, { parts }) => {
      // Modify message parts
      console.log("Message parts:", parts);
    },
  };
};
\`\`\`

### Chat Parameters Hook

Modify LLM parameters:

\`\`\`typescript
export const MyPlugin: Plugin = async () => {
  return {
    "chat.params": async (
      { model, provider, message },
      { temperature, topP, options }
    ) => {
      temperature = 0.7;
      options.customParam = 'value';
    },
  };
};
\`\`\`

### Compaction Hooks (Experimental)

Customize context when sessions are compacted:

\`\`\`typescript
export const CompactionPlugin: Plugin = async () => {
  return {
    "experimental.session.compacting": async (input, output) => {
      // Inject additional context
      output.context.push(\`## Custom Context
Include state that should persist:
- Current task status
- Important decisions
- Active files\`);
      
      // Or replace the entire prompt
      output.prompt = "Custom compaction prompt...";
    },
  };
};
\`\`\`

## External Dependencies

Local plugins can use npm packages. Add \`package.json\` to your config directory:

\`\`\`.opencode/package.json
{
  "dependencies": {
    "shescape": "^2.1.0"
  }
}
\`\`\`

OpenCode runs \`bun install\` at startup. Import in your plugins:

\`\`\`.opencode/plugins/my-plugin.ts
import { escape } from "shescape";

export const MyPlugin = async (ctx) => {
  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool === "bash") {
        output.args.command = escape(output.args.command);
      }
    },
  };
};
\`\`\`

## Best Practices

### 1. Use Structured Logging

Use \`client.app.log()\` instead of \`console.log\`:

\`\`\`typescript
export const MyPlugin: Plugin = async ({ client }) => {
  await client.app.log({
    service: "my-plugin",
    level: "info",
    message: "Plugin initialized",
    extra: { foo: "bar" },
  });
  
  return {};
};
\`\`\`

Levels: \`debug\`, \`info\`, \`warn\`, \`error\`

### 2. Handle Errors Gracefully

Always catch and handle errors:

\`\`\`typescript
export const MyPlugin: Plugin = async ({ client }) => {
  return {
    tool: {
      riskyTool: tool({
        description: "Tool that might fail",
        args: {},
        async execute() {
          try {
            const result = await someOperation();
            return result;
          } catch (error) {
            await client.app.log({
              service: "my-plugin",
              level: "error",
              message: "Tool failed",
              extra: { error },
            });
            return \`Error: \${error.message}\`;
          }
        },
      }),
    },
  };
};
\`\`\`

### 3. Type Safety

Use TypeScript types from the plugin package:

\`\`\`typescript
import type { Plugin } from '@opencode-ai/plugin';

export const MyPlugin: Plugin = async (ctx) => {
  // Type-safe hook implementations
  return {};
};
\`\`\`

### 4. Clean Resource Management

Clean up resources when needed:

\`\`\`typescript
export const MyPlugin: Plugin = async (ctx) => {
  const cleanup = setupResource();
  
  return {
    event: async ({ event }) => {
      if (event.type === 'server.connected') {
        await cleanup();
      }
    },
  };
};
\`\`\`

### 5. Validate Tool Arguments

Use Zod schema for type-safe tool arguments:

\`\`\`typescript
import { tool } from '@opencode-ai/plugin';

export const MyPlugin: Plugin = async () => {
  return {
    tool: {
      typedTool: tool({
        description: "Tool with validated arguments",
        args: {
          url: tool.schema.string().url().describe("Valid URL"),
          count: tool.schema.number().min(1).max(100).describe("Count 1-100"),
        },
        async execute(args) {
          // args are fully typed and validated
          return \`Processing \${args.url} \${args.count} times\`;
        },
      }),
    },
  };
};
\`\`\`

## Common Patterns

### Sending Session Prompts

Send prompts to sessions programmatically:

\`\`\`typescript
export const MyPlugin: Plugin = async (ctx) => {
  return {
    tool: {
      sendPrompt: tool({
        description: "Send a prompt to the session",
        args: {
          text: tool.schema.string(),
        },
        async execute(args, toolCtx) {
          await ctx.client.session.prompt({
            path: { id: toolCtx.sessionID },
            body: {
              noReply: true,
              parts: [{ type: 'text', text: args.text }],
            },
          });
          return "Prompt sent";
        },
      }),
    },
  };
};
\`\`\`

### Using Bun Shell

Execute commands with Bun's shell API:

\`\`\`typescript
export const MyPlugin: Plugin = async ({ $ }) => {
  return {
    tool: {
      gitStatus: tool({
        description: "Get git status",
        args: {},
        async execute() {
          const result = await $\`git status --porcelain\`;
          return result.text();
        },
      }),
    },
  };
};
\`\`\`

### File System Operations

Use Bun.file for file operations:

\`\`\`typescript
export const MyPlugin: Plugin = async () => {
  return {
    tool: {
      readConfig: tool({
        description: "Read configuration file",
        args: {
          path: tool.schema.string(),
        },
        async execute({ path }) {
          const file = Bun.file(path);
          return await file.text();
        },
      }),
    },
  };
};
\`\`\`

## Load Order

Plugins load in this order:
1. Global config (\`~/.config/opencode/opencode.json\`)
2. Project config (\`opencode.json\`)
3. Global plugin directory (\`~/.config/opencode/plugins/\`)
4. Project plugin directory (\`.opencode/plugins/\`)

## Testing Plugins

### Unit Testing

Test plugin functions independently:

\`\`\`typescript
import { describe, it, expect } from 'bun:test';
import { MyPlugin } from './my-plugin';

describe('MyPlugin', () => {
  it('should register tools', async () => {
    const mockCtx = createMockContext();
    const hooks = await MyPlugin(mockCtx);
    
    expect(hooks.tool).toBeDefined();
    expect(hooks.tool.mytool).toBeDefined();
  });
});
\`\`\`

### Integration Testing

Test with actual OpenCode instance:

\`\`\`bash
# Link local plugin
bun link
cd /path/to/opencode/project
bun link my-opencode-plugin

# Add to opencode.json and test
\`\`\`

## Publishing Plugins

Use the \`opencode-\` prefix for plugin names:
- \`opencode-my-service\`
- \`opencode-custom-tools\`

Publish to npm and users can install via \`opencode.json\`.

## Resources

- [OpenCode Documentation](https://opencode.ai/docs)
- [OpenCode SDK](https://opencode.ai/docs/sdk)
- [Plugin Examples](https://opencode.ai/docs/ecosystem#plugins)
- [Bun Documentation](https://bun.sh/docs)

## Example: Complete Plugin

\`\`\`typescript
import type { Plugin } from '@opencode-ai/plugin';
import { tool } from '@opencode-ai/plugin';

export const ExamplePlugin: Plugin = async ({ client, $, worktree }) => {
  // Initialize
  await client.app.log({
    service: 'example-plugin',
    level: 'info',
    message: 'Plugin initialized',
    extra: { worktree },
  });
  
  return {
    // Custom tools
    tool: {
      hello: tool({
        description: "Say hello",
        args: {
          name: tool.schema.string().describe("Name to greet"),
        },
        async execute({ name }) {
          return \`Hello, \${name}!\`;
        },
      }),
      
      gitInfo: tool({
        description: "Get git repository info",
        args: {},
        async execute() {
          const branch = await $\`git branch --show-current\`;
          const status = await $\`git status --short\`;
          return \`Branch: \${branch.text()}\nStatus:\n\${status.text()}\`;
        },
      }),
    },
    
    // Event handlers
    event: async ({ event }) => {
      if (event.type === 'session.created') {
        await client.app.log({
          service: 'example-plugin',
          level: 'info',
          message: 'New session created',
        });
      }
    },
    
    // Tool execution hooks
    "tool.execute.before": async (input, output) => {
      await client.app.log({
        service: 'example-plugin',
        level: 'debug',
        message: \`Executing tool: \${input.tool}\`,
      });
    },
    
    // Chat hooks
    "chat.params": async ({ model }, { temperature }) => {
      // Adjust temperature for specific models
      if (model === 'gpt-4') {
        temperature = 0.5;
      }
    },
  };
};
\`\`\`

This skill provides everything you need to develop OpenCode plugins following best practices and official patterns.
`,
});
