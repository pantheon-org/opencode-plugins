---
name: opencode-plugin-ui
description: Build OpenCode plugins with TUI integration using Toast notifications, session prompts, and prompt manipulation. Covers client.tui.showToast(), client.session.prompt() with noReply, and client.tui.appendPrompt() APIs with TypeScript examples and best practices.
license: MIT
compatibility: opencode
metadata:
  category: plugin-development
  audience: plugin-developers
---

# OpenCode Plugin UI Integration

Build rich user experiences in OpenCode plugins using TUI (Terminal User Interface) APIs.

## Core APIs

### Toast Notifications

Show non-intrusive feedback with `client.tui.showToast()`:

```typescript
import { Plugin, tool } from "@opencode-ai/plugin"

export const MyPlugin: Plugin = async ({ client }) => {
  return {
    tool: {
      processData: tool({
        description: "Process with status notifications",
        args: { input: tool.schema.string() },
        async execute({ input }) {
          // Show loading toast
          await client.tui.showToast({
            body: { message: "Processing...", variant: "loading" }
          })
          
          const result = await processData(input)
          
          // Show success toast
          await client.tui.showToast({
            body: { message: "Complete!", variant: "success" }
          })
          
          return result
        }
      })
    }
  }
}
```

**Toast Variants:**

- `"default"` - General information (neutral)
- `"success"` - Operation completed (green)
- `"error"` - Error occurred (red)
- `"loading"` - Operation in progress (spinner)

**Error Handling:**

```typescript
async execute({ input }) {
  try {
    const result = await riskyOperation(input)
    await client.tui.showToast({
      body: { message: "Success!", variant: "success" }
    })
    return result
  } catch (error) {
    await client.tui.showToast({
      body: { message: `Error: ${error.message}`, variant: "error" }
    })
    throw error
  }
}
```

### User Messaging (Session Prompts)

Send messages to users without triggering AI responses using `noReply: true`:

```typescript
export const MyPlugin: Plugin = async ({ client }) => {
  return {
    tool: {
      notifyUser: tool({
        description: "Send notification to user",
        args: { message: tool.schema.string() },
        async execute({ message }, context) {
          const { sessionID } = context
          
          await client.session.prompt({
            path: { id: sessionID },
            body: {
              noReply: true, // Critical: prevents AI response
              parts: [{ type: "text", text: message }]
            }
          })
          
          return "Message sent"
        }
      })
    }
  }
}
```

**Tool Context:**

- `sessionID` - Target session identifier
- `messageID` - Current message identifier
- `agent` - Current agent name
- `abort` - Abort signal

### Prompt Suggestions

Insert text into user's prompt input:

```typescript
async execute({ suggestion }) {
  await client.tui.appendPrompt({
    body: { text: suggestion }
  })
  return "Suggestion added"
}
```

## Best Practices

### 1. Always Use noReply: true

```typescript
// Correct - context-only message
await client.session.prompt({
  path: { id: sessionID },
  body: {
    noReply: true,
    parts: [{ type: "text", text: "Progress update..." }]
  }
})

// Incorrect - triggers AI response
await client.session.prompt({
  path: { id: sessionID },
  body: {
    parts: [{ type: "text", text: "Progress update..." }]
  }
})
```

### 2. Get Session ID from Context

```typescript
async execute(args, context) {
  const { sessionID } = context // Use this
  // ...
}
```

### 3. Graceful Error Handling

```typescript
async execute(args, context) {
  try {
    await client.tui.showToast({
      body: { message: "Working...", variant: "loading" }
    })
    // Do work...
  } catch (error) {
    try {
      await client.tui.showToast({
        body: { message: `Error: ${error.message}`, variant: "error" }
      })
    } catch (toastError) {
      console.error("Failed to show error toast:", toastError)
    }
    throw error
  }
}
```

### 4. Appropriate Toast Usage

- **Loading**: Operations taking >1 second
- **Success**: Only after confirmed completion
- **Error**: Actual errors, not warnings
- **Default**: Neutral information/updates

### 5. Limit Notification Count

```typescript
// Too many - avoid this
await client.tui.showToast({ body: { message: "Step 1 done", variant: "success" }})
await client.tui.showToast({ body: { message: "Step 2 done", variant: "success" }})

// Better - single summary
await client.tui.showToast({ 
  body: { message: "All 3 steps completed", variant: "success" }
})
```

## Complete Example

```typescript
import { Plugin, tool } from "@opencode-ai/plugin"

export const UIIntegrationPlugin: Plugin = async ({ client }) => {
  return {
    tool: {
      // Toast notifications
      showStatus: tool({
        description: "Show status toast",
        args: {
          message: tool.schema.string(),
          type: tool.schema.enum(["info", "success", "error", "loading"]).default("info")
        },
        async execute({ message, type }) {
          await client.tui.showToast({
            body: { message, variant: type }
          })
          return `Toast shown: ${message}`
        }
      }),
      
      // User messaging
      sendMessage: tool({
        description: "Send message to user",
        args: { text: tool.schema.string() },
        async execute({ text }, context) {
          const { sessionID } = context
          await client.session.prompt({
            path: { id: sessionID },
            body: {
              noReply: true,
              parts: [{ type: "text", text }]
            }
          })
          return "Message delivered"
        }
      }),
      
      // Prompt suggestions
      suggestInput: tool({
        description: "Suggest text to add to user's prompt",
        args: { suggestion: tool.schema.string() },
        async execute({ suggestion }) {
          await client.tui.appendPrompt({
            body: { text: suggestion }
          })
          return "Suggestion added"
        }
      }),
      
      // Combined workflow
      processWithFeedback: tool({
        description: "Process with full UI feedback",
        args: { data: tool.schema.string() },
        async execute({ data }, context) {
          const { sessionID } = context
          
          // Start notification
          await client.tui.showToast({
            body: { message: "Starting...", variant: "loading" }
          })
          
          await client.session.prompt({
            path: { id: sessionID },
            body: {
              noReply: true,
              parts: [{ type: "text", text: `Processing: ${data}` }]
            }
          })
          
          // Do work
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // Success notification
          await client.tui.showToast({
            body: { message: "Complete!", variant: "success" }
          })
          
          return "Workflow complete"
        }
      })
    }
  }
}
```

## API Reference

### client.tui.showToast({ body })

**Parameters:**

- `body.message` (string): Message to display
- `body.variant` (string): `"default"`, `"success"`, `"error"`, `"loading"`

**Returns:** `boolean`

### client.tui.appendPrompt({ body })

**Parameters:**

- `body.text` (string): Text to append to prompt

**Returns:** `boolean`

### client.session.prompt({ path, body })

**Parameters:**

- `path.id` (string): Session ID
- `body.noReply` (boolean): `true` for context-only
- `body.parts` (array): Message parts `[{ type: "text", text: "..." }]`
- `body.model` (optional): Override model

**Returns:** `AssistantMessage | UserMessage`

### Additional TUI Methods

- `client.tui.openHelp()` - Open help dialog
- `client.tui.openSessions()` - Open session selector
- `client.tui.openThemes()` - Open theme selector
- `client.tui.openModels()` - Open model selector
- `client.tui.submitPrompt()` - Submit current prompt
- `client.tui.clearPrompt()` - Clear prompt input
- `client.tui.executeCommand({ body: { command: "..." } })` - Execute TUI command

## When to Use

Use this skill when:

- Building OpenCode plugins that need user feedback
- Implementing progress notifications for long operations
- Creating interactive workflows with user communication
- Adding contextual help or suggestions to tools

## Resources

- OpenCode SDK: https://opencode.ai/docs/sdk
- OpenCode Plugins: https://opencode.ai/docs/plugins
- Plugin Types: `@opencode-ai/plugin` package
