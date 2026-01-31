# Using @pantheon-org/opencode-core in Plugins

This guide shows how to use the opencode-core notification library in OpenCode plugins.

## Installation

Add the dependency to your plugin's `package.json`:

```json
{
  "dependencies": {
    "@pantheon-org/opencode-core": "workspace:*"
  }
}
```

Run `bun install` to install the dependency.

## Basic Usage

### Import the notification utilities

```typescript
import { createNotifier } from '@pantheon-org/opencode-core/notification';
import type { Plugin } from '@opencode-ai/plugin';

export const MyPlugin: Plugin = async (ctx) => {
  // Create notifier with plugin context
  const notify = createNotifier(ctx);

  // Use notifications
  await notify.success('Plugin Loaded', 'MyPlugin initialized successfully');

  return {
    // Plugin implementation
  };
};
```

## Available Notification Methods

### Toast Notifications (Default)

```typescript
// Success toast
await notify.success('Success', 'Operation completed');

// Error toast
await notify.error('Error', 'Something went wrong');

// Warning toast
await notify.warning('Warning', 'Potential issue detected');

// Info toast
await notify.info('Info', 'Process started');
```

### Message Notifications (DCP-style)

Send ignored messages to chat UI (like the DCP plugin does):

```typescript
// Send message only (no toast)
await notify.success('Complete', 'Task finished', false);

// Send custom message
await notify.sendIgnoredMessage({
  text: '✅ Custom notification message',
  sessionID: ctx.sessionID,
  noReply: true,
  ignored: true,
});
```

### Combined Notifications (Both Toast and Message)

```typescript
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
```

### Custom Toast

```typescript
await notify.showToast({
  title: 'Custom Notification',
  message: 'Custom message content',
  variant: 'info',
  duration: 8000, // milliseconds
});
```

## Example: Plugin with Loading Messages

```typescript
import { Plugin } from '@opencode-ai/plugin';
import { createNotifier } from '@pantheon-org/opencode-core/notification';

export const MyPlugin: Plugin = async (ctx) => {
  const notify = createNotifier(ctx);

  // Show loading message
  await notify.info('Loading', 'MyPlugin is initializing...');

  try {
    // Do plugin initialization
    await initializePlugin();

    // Show success
    await notify.success('Ready', 'MyPlugin loaded successfully');
  } catch (error) {
    // Show error
    await notify.error('Failed', `Plugin initialization failed: ${error.message}`);
  }

  return {
    config: async (config) => {
      // Plugin configuration
    },

    tool: {
      myTool: tool({
        description: 'Example tool',
        args: { input: tool.schema.string() },
        async execute(args) {
          // Notify when tool is executed
          await notify.info('Tool Executed', `Running myTool with: ${args.input}`);
          return `Result: ${args.input}`;
        },
      }),
    },
  };
};
```

## Example: Progress Notifications

```typescript
async function processFiles(ctx, files) {
  const notify = createNotifier(ctx);

  await notify.info('Starting', `Processing ${files.length} files...`);

  try {
    for (const file of files) {
      // Process file
      await processFile(file);
    }

    await notify.success('Complete', `Processed ${files.length} files successfully`);
  } catch (error) {
    await notify.error('Failed', `Processing failed: ${error.message}`);
  }
}
```

## Example: With Logger

```typescript
import { createNotifier } from '@pantheon-org/opencode-core/notification';

const logger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
};

const notify = createNotifier(ctx, logger);

// Errors will be logged if notifications fail
await notify.success('Test', 'This will be logged if it fails');
```

## Default Toast Durations

- Success: 3000ms (3 seconds)
- Info: 4000ms (4 seconds)
- Warning: 5000ms (5 seconds)
- Error: 6000ms (6 seconds)

## Error Handling

The notification system handles errors gracefully:

- Toast failures are logged (if DEBUG_OPENCODE is set) but don't crash the plugin
- Message failures are logged with full error details
- All methods return Promises that never reject

## Migration from Direct API Calls

### Before (Direct API calls):

```typescript
try {
  await ctx.client.tui.showToast({
    body: {
      title: 'Success',
      message: 'Operation completed',
      variant: 'success',
      duration: 3000,
    },
  });
} catch (error) {
  if (process.env.DEBUG_OPENCODE && logger?.debug) {
    logger.debug('Toast notification failed', { error });
  }
}
```

### After (Using opencode-core):

```typescript
import { createNotifier } from '@pantheon-org/opencode-core/notification';

const notify = createNotifier(ctx, logger);
await notify.success('Success', 'Operation completed');
```

## Benefits

1. **Simplified API**: One line instead of try/catch blocks
2. **Consistent Error Handling**: Built-in error handling
3. **Type Safety**: Full TypeScript support
4. **Dual Notification Support**: Toast + Message in one call
5. **Reusable**: Share code across all plugins
6. **Maintained**: Updates to notification system benefit all plugins

## Plugins Using opencode-core

- `@pantheon-org/opencode-warcraft-notifications-plugin` - Available via `notification-core.ts`
- `@pantheon-org/opencode-agent-loader-plugin` - Ready to use

## See Also

- [opencode-core README](../../libs/opencode-core/README.md)
- [opencode-core API Documentation](../../libs/opencode-core/src/notification/index.ts)
