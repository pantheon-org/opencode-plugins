---
name: opencode-plugin-development
description: Build OpenCode plugins using TypeScript. Covers plugin structure, tools, authentication providers, event handlers, hooks (chat, permissions, tool execution), shell integration, testing, and configuration.
license: MIT
compatibility: opencode
metadata:
  category: plugin-development
  audience: plugin-developers
---

# OpenCode Plugin Development

Build custom OpenCode plugins with TypeScript to extend AI assistant functionality.

## Quick Start

### 1. Create Plugin Package

```bash
mkdir my-opencode-plugin
cd my-opencode-plugin
bun init
```

### 2. Install Dependencies

```json
{
  "dependencies": {
    "@opencode-ai/plugin": "latest",
    "@opencode-ai/sdk": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "@types/node": "latest",
    "typescript": "latest"
  }
}
```

### 3. Configure TypeScript

```json
{
  "extends": "@tsconfig/node22/tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "module": "preserve",
    "declaration": true,
    "moduleResolution": "bundler"
  },
  "include": ["src"]
}
```

### 4. Create Plugin

```typescript
// src/index.ts
import { Plugin, tool } from '@opencode-ai/plugin'

export const MyPlugin: Plugin = async (ctx) => {
  return {
    tool: {
      hello: tool({
        description: 'Say hello',
        args: {
          name: tool.schema.string().describe('Name to greet'),
        },
        async execute({ name }) {
          return `Hello, ${name}!`
        },
      }),
    },
  }
}
```

## Plugin Structure

A plugin exports a function returning an object with hooks:

```typescript
import { Plugin, tool } from '@opencode-ai/plugin'

export const MyPlugin: Plugin = async (ctx) => {
  return {
    tool: { /* custom tools */ },
    auth: { /* authentication provider */ },
    event: async ({ event }) => { /* event handler */ },
    config: async (config) => { /* modify config */ },
    'chat.message': async ({}, { message }) => { /* intercept messages */ },
    'chat.params': async ({}, { temperature, options }) => { /* modify params */ },
    'permission.ask': async (perm, out) => { /* handle permissions */ },
    'tool.execute.before': async ({}, { args }) => { /* before hook */ },
    'tool.execute.after': async ({}, { output }) => { /* after hook */ },
  }
}
```

## Context API (ctx)

```typescript
ctx.client              // OpenCode SDK client (localhost:4096)
ctx.project.id          // Project identifier (git hash or "global")
ctx.project.worktree    // Git worktree root
ctx.project.vcs         // Version control ("git" or undefined)
ctx.directory           // Current working directory
ctx.worktree            // Alias for ctx.project.worktree
ctx.$`command`          // Bun shell for commands
```

## Tools

Define custom tools for AI to use:

```typescript
import { tool } from '@opencode-ai/plugin'

tool({
  description: 'Custom tool',
  args: {
    param: tool.schema.string().describe('Parameter'),
    count: tool.schema.number().optional().describe('Optional count'),
  },
  async execute(args, context) {
    // context: { sessionID, messageID, agent, abort }
    return `Result: ${args.param}`
  },
})
```

## Authentication Providers

Add custom auth methods:

```typescript
export const MyPlugin: Plugin = async (ctx) => {
  return {
    auth: {
      provider: 'myservice',
      loader: async (auth, provider) => ({
        apiKey: 'loaded-key'
      }),
      methods: [{
        type: 'oauth',
        label: 'Connect MyService',
        async authorize() {
          return {
            url: 'https://myservice.com/oauth/authorize',
            instructions: 'Authorize access',
            method: 'code',
            async callback(code) {
              return {
                type: 'success',
                access: 'token',
                refresh: 'refresh',
                expires: Date.now() + 3600000,
              }
            },
          }
        },
      }],
    },
  }
}
```

## Events

Handle system events:

```typescript
export const MyPlugin: Plugin = async (ctx) => {
  return {
    event: async ({ event }) => {
      console.log('Event:', event.type)
    },
  }
}
```

**Event Types:**

- **Session:** `session.created`, `session.updated`, `session.deleted`, `session.error`, `session.idle`
- **Message:** `message.updated`, `message.removed`, `message.part.updated`, `message.part.removed`
- **File:** `file.edited`, `file.watcher.updated`
- **Permission:** `permission.updated`, `permission.replied`
- **Server:** `server.connected`
- **LSP:** `lsp.updated`, `lsp.diagnostics`
- **Command:** `command.executed`
- **TUI:** `tui.prompt.append`, `tui.command.execute`, `tui.toast.show`
- **Other:** `installation.updated`, `ide.installed`

## Hooks

### Chat Message Hook

Intercept and modify chat messages:

```typescript
'chat.message': async ({}, { message, parts }) => {
  console.log('Message:', message.content)
}
```

### Chat Parameters Hook

Modify LLM parameters:

```typescript
'chat.params': async ({}, { temperature, topP, options }) => {
  temperature = 0.7
  options.customParam = 'value'
}
```

### Permission Hook

Control permission requests:

```typescript
'permission.ask': async (permission, output) => {
  if (permission.type === 'read_file') {
    output.status = 'allow'
  }
}
```

### Tool Execution Hooks

```typescript
// Before execution
'tool.execute.before': async ({ tool }, { args }) => {
  if (tool === 'mytool') {
    args.modified = true
  }
}

// After execution
'tool.execute.after': async ({ tool }, { title, output, metadata }) => {
  console.log(`Tool ${tool} completed:`, output)
}
```

### Configuration Hook

Modify OpenCode configuration:

```typescript
config: async (config) => {
  config.myPlugin = { enabled: true }
}
```

## Shell Integration

Execute commands using Bun shell:

```typescript
tool({
  description: 'Run git command',
  args: {},
  async execute() {
    const result = await ctx.$`git status --porcelain`
    return result.text()
  },
})
```

## Configuration

### Local Development

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["file:///path/to/plugin/dist/index.js"]
}
```

### Published Plugins

```json
{
  "plugin": ["my-plugin@1.0.0"]
}
```

### Multiple Plugins

```json
{
  "plugin": [
    "plugin-one@latest",
    "plugin-two@2.0.0",
    "file:///path/to/local/plugin"
  ]
}
```

## Naming Convention

Use `opencode-` prefix:

- `opencode-my-service`
- `opencode-custom-tools`

## Testing

### Unit Tests

```typescript
// src/index.test.ts
import { describe, it, expect } from 'bun:test'
import { MyPlugin } from './index'

describe('MyPlugin', () => {
  it('registers tools', async () => {
    const mockCtx = createMockContext()
    const hooks = await MyPlugin(mockCtx)
    expect(hooks.tool).toBeDefined()
  })
})
```

### Integration Testing

```bash
# Link local plugin
bun link
cd /path/to/project
bun link my-opencode-plugin
```

## Debugging

```bash
# Check plugin loading
opencode --verbose
```

```typescript
// Add logging
export const MyPlugin: Plugin = async (ctx) => {
  console.log('Loading:', ctx.project.name)
  // ...
}
```

## Best Practices

### Error Handling

```typescript
tool({
  description: 'Risky operation',
  async execute() {
    try {
      const result = await ctx.$`some-command`
      return result.text()
    } catch (error) {
      return `Error: ${error.message}`
    }
  },
})
```

### Type Safety

```typescript
import { z } from 'zod'

tool({
  description: 'Typed tool',
  args: {
    url: tool.schema.string().url().describe('Valid URL'),
    count: tool.schema.number().min(1).max(100),
  },
  async execute(args) {
    // args.url is typed as string
    // args.count is typed as number
    return `Processing ${args.url}`
  },
})
```

### Resource Management

```typescript
export const MyPlugin: Plugin = async (ctx) => {
  const cleanup = setupResource()
  
  return {
    event: async ({ event }) => {
      if (event.type === 'shutdown') {
        await cleanup()
      }
    },
  }
}
```

## Examples

### File System Plugin

```typescript
tool({
  description: 'List directory',
  args: {
    path: tool.schema.string().describe('Directory path'),
  },
  async execute({ path }) {
    const result = await ctx.$`ls -la ${path}`
    return result.text()
  },
})
```

### API Integration

```typescript
tool({
  description: 'Fetch API data',
  args: {
    url: tool.schema.string().url(),
    method: tool.schema.enum(['GET', 'POST']).default('GET'),
  },
  async execute({ url, method }) {
    const response = await fetch(url, { method })
    return await response.text()
  },
})
```

### Session Prompt (noReply)

```typescript
tool({
  description: 'Send context message',
  async execute(args, toolCtx) {
    ctx.client.session.prompt({
      path: { id: toolCtx.sessionID },
      body: {
        noReply: true, // Prevents AI response
        parts: [{ type: 'text', text: 'Progress update...' }],
      },
    })
  },
})
```

## Resources

- OpenCode Docs: https://opencode.ai/docs
- Plugin SDK: https://opencode.ai/docs/sdk
- Source: https://gist.github.com/rstacruz/946d02757525c9a0f49b25e316fbe715
