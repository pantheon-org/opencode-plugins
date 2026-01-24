# @pantheon-org/opencode-notification

Notification utilities for OpenCode plugins.

## Features

- **Notification System**: Unified API for both toast notifications and message notifications
- **Type Safety**: Full TypeScript support with comprehensive interfaces
- **Error Handling**: Graceful degradation when notification methods fail
- **Reusable**: Designed to be imported and used across multiple OpenCode plugins

## Installation

```bash
bun add @pantheon-org/opencode-notification
```

## Usage

### Basic Notifications

```typescript
import { createNotifier } from '@pantheon-org/opencode-notification';

export const MyPlugin: Plugin = async (ctx) => {
  const notify = createNotifier(ctx);

  // Success toast
  await notify.success('Operation Complete', 'Task completed successfully');

  // Error toast
  await notify.error('Error', 'Something went wrong');

  // Warning toast
  await notify.warning('Warning', 'Potential issue detected');

  // Info toast
  await notify.info('Info', 'Process started');
};
```

### Message Notifications (like DCP plugin)

```typescript
import { createNotifier } from '@pantheon-org/opencode-notification';

export const MyPlugin: Plugin = async (ctx) => {
  const notify = createNotifier(ctx);

  // Send ignored message to chat UI
  await notify.sendIgnoredMessage({
    text: '🔄 Process completed successfully',
    sessionID: ctx.sessionID,
  });

  // Send with specific options
  await notify.sendIgnoredMessage({
    text: 'Custom message',
    noReply: true, // Don't trigger AI response
    ignored: true, // Show as ignored message
    agent: 'custom-agent',
    model: 'gpt-4',
    variant: 'chat',
  });
};
```

### Combined Notifications

```typescript
import { createNotifier } from '@pantheon-org/opencode-notification';

export const MyPlugin: Plugin = async (ctx) => {
  const notify = createNotifier(ctx);

  // Send both toast and message
  await notify.notify({
    useToast: true,
    useMessage: true,
    toast: {
      title: 'Task Complete',
      message: 'Files processed successfully',
      variant: 'success',
      duration: 5000,
    },
    message: {
      text: '✅ Task Complete: Files processed successfully',
    },
  });
};
```

### Advanced Configuration

```typescript
import { createNotifier, Logger } from '@pantheon-org/opencode-notification';

export const MyPlugin: Plugin = async (ctx) => {
  const notify = createNotifier(ctx, {
    info: console.log,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  });

  // Custom toast notification
  await notify.showToast({
    title: 'Custom Notification',
    message: 'Custom message',
    variant: 'info',
    duration: 8000, // Custom duration
  });

  // Custom notification options
  await notify.notify({
    useToast: false,
    useMessage: true,
    message: {
      text: 'Only send message, no toast',
      ignored: false, // Normal message (not ignored)
      noReply: false, // Will trigger AI response
    },
  });
};
```

## API Reference

### createNotifier(ctx, logger?)

Creates a notification utility with the following methods:

#### Methods

- `showToast(options)` - Send toast notification
- `sendIgnoredMessage(options)` - Send ignored message to chat
- `notify(options)` - Send notification with custom options
- `success(title, message, useToastOnly?)` - Success notification
- `warning(title, message, useToastOnly?)` - Warning notification
- `info(title, message, useToastOnly?)` - Info notification
- `error(title, message, useToastOnly?)` - Error notification

### Types

```typescript
interface ToastOptions {
  title: string;
  message: string;
  variant: 'success' | 'warning' | 'info' | 'error';
  duration?: number;
}

interface MessageOptions {
  text: string;
  sessionID?: string;
  agent?: string;
  model?: string;
  variant?: string;
  noReply?: boolean;
  ignored?: boolean;
}

interface NotificationOptions {
  useToast?: boolean;
  useMessage?: boolean;
  toast?: ToastOptions;
  message?: MessageOptions;
}

interface PluginContext {
  client: OpenCodeClient;
  sessionID?: string;
  agent?: string;
  model?: string;
  variant?: string;
}
```

### Default Durations

- Success: 3000ms
- Info: 4000ms
- Warning: 5000ms
- Error: 6000ms

## Patterns

### Toast-Only Notifications (Default)

Use `useToastOnly: true` or the convenience methods:

```typescript
await notify.success('Complete', 'Task finished'); // Toast only
```

### Message-Only Notifications

Use `useToastOnly: false`:

```typescript
await notify.success('Complete', 'Task finished', false); // Message only
```

### Both Notifications

Use `notify()` method with both options:

```typescript
await notify.notify({
  useToast: true,
  useMessage: true,
  toast: { title: 'Title', message: 'Message', variant: 'success' },
  message: { text: '✅ Title: Message' },
});
```

## Error Handling

The notification system handles errors gracefully:

- Toast failures are logged (if DEBUG_OPENCODE is set) but don't crash the plugin
- Message failures are logged with full error details
- All methods return Promises that never reject

## Examples

### Plugin Setup with Loading Messages

```typescript
import { Plugin, createNotifier } from '@pantheon-org/opencode-notification';

export const MyPlugin: Plugin = async (ctx) => {
  const notify = createNotifier(ctx);

  // Initial loading message
  await notify.info('Plugin Loading', 'MyPlugin is initializing...');

  return {
    config: async (config) => {
      await notify.success('Plugin Ready', 'MyPlugin has been loaded successfully');
    },

    tool: {
      myTool: tool({
        description: 'Example tool',
        args: { input: tool.schema.string() },
        async execute(args) {
          await notify.info('Tool Executed', `myTool called with: ${args.input}`);
          return `Result: ${args.input}`;
        },
      }),
    },
  };
};
```

### Progress Notifications

```typescript
async function longRunningOperation() {
  const notify = createNotifier(ctx);

  await notify.info('Starting', 'Beginning long operation...');

  try {
    // Do work...
    await notify.success('Complete', 'Operation finished successfully');
  } catch (error) {
    await notify.error('Failed', `Operation failed: ${error.message}`);
  }
}
```

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build
bun run build

# Development mode
bun run dev
```

## License

MIT
