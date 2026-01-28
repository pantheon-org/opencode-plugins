import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createNotifier } from './index';

// Mock OpenCode client
const createMockClient = () => ({
  tui: {
    showToast: mock(async (_options: any) => {}),
  },
  session: {
    prompt: mock(async (_options: any) => {}),
  },
});

// Mock logger
const createMockLogger = () => ({
  info: mock((_msg: string, ..._args: any[]) => {}),
  warn: mock((_msg: string, ..._args: any[]) => {}),
  error: mock((_msg: string, ..._args: any[]) => {}),
  debug: mock((_msg: string, ..._args: any[]) => {}),
});

describe('createNotifier', () => {
  let mockClient: any;
  let mockLogger: any;
  let mockCtx: any;

  beforeEach(() => {
    mockClient = createMockClient();
    mockLogger = createMockLogger();
    mockCtx = {
      client: mockClient,
      sessionID: 'test-session',
      agent: 'test-agent',
      model: 'test-model',
      variant: 'test-variant',
    };
  });

  it('should create notifier with all required methods', () => {
    const notifier = createNotifier(mockCtx, mockLogger);

    expect(notifier).toHaveProperty('showToast');
    expect(notifier).toHaveProperty('sendIgnoredMessage');
    expect(notifier).toHaveProperty('notify');
    expect(notifier).toHaveProperty('success');
    expect(notifier).toHaveProperty('warning');
    expect(notifier).toHaveProperty('info');
    expect(notifier).toHaveProperty('error');
  });

  describe('showToast', () => {
    it('should call client.tui.showToast with correct options', async () => {
      const notifier = createNotifier(mockCtx, mockLogger);

      await notifier.showToast({
        title: 'Test Title',
        message: 'Test Message',
        variant: 'success',
        duration: 3000,
      });

      expect(mockClient.tui.showToast).toHaveBeenCalledTimes(1);
      expect(mockClient.tui.showToast).toHaveBeenCalledWith({
        body: {
          title: 'Test Title',
          message: 'Test Message',
          variant: 'success',
          duration: 3000,
        },
      });
    });

    it('should handle toast errors gracefully', async () => {
      const errorClient = {
        ...mockClient,
        tui: {
          showToast: mock(async () => {
            throw new Error('Toast failed');
          }),
        },
      };

      const notifier = createNotifier({ ...mockCtx, client: errorClient }, mockLogger);

      // Should not throw
      await expect(
        notifier.showToast({
          title: 'Test',
          message: 'Message',
          variant: 'info',
        }),
      ).resolves.toBeUndefined();

      // Should log debug if DEBUG_OPENCODE is set
      const originalDebug = process.env.DEBUG_OPENCODE;
      process.env.DEBUG_OPENCODE = 'true';
      await notifier.showToast({
        title: 'Test',
        message: 'Message',
        variant: 'info',
      });
      expect(mockLogger.debug).toHaveBeenCalled();
      process.env.DEBUG_OPENCODE = originalDebug;
    });
  });

  describe('sendIgnoredMessage', () => {
    it('should send ignored message with correct parameters', async () => {
      const notifier = createNotifier(mockCtx, mockLogger);

      await notifier.sendIgnoredMessage({
        text: 'Test ignored message',
      });

      expect(mockClient.session.prompt).toHaveBeenCalledTimes(1);
      expect(mockClient.session.prompt).toHaveBeenCalledWith({
        path: { id: 'test-session' },
        body: {
          noReply: true,
          agent: 'test-agent',
          model: 'test-model',
          variant: 'test-variant',
          parts: [
            {
              type: 'text',
              text: 'Test ignored message',
              ignored: true,
            },
          ],
        },
      });
    });

    it('should warn if no sessionID available', async () => {
      const ctxNoSession = { ...mockCtx, sessionID: undefined };
      const notifier = createNotifier(ctxNoSession, mockLogger);

      await notifier.sendIgnoredMessage({
        text: 'Test message',
      });

      expect(mockClient.session.prompt).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith('No sessionID available for message notification');
    });

    it('should handle message errors', async () => {
      const errorClient = {
        ...mockClient,
        session: {
          prompt: mock(async () => {
            throw new Error('Message failed');
          }),
        },
      };

      const notifier = createNotifier({ ...mockCtx, client: errorClient }, mockLogger);

      await expect(
        notifier.sendIgnoredMessage({
          text: 'Test message',
        }),
      ).resolves.toBeUndefined();

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to send message notification', expect.any(Object));
    });
  });

  describe('convenience methods', () => {
    it('should send success notification with toast', async () => {
      const notifier = createNotifier(mockCtx, mockLogger);

      await notifier.success('Success Title', 'Success Message', true);

      expect(mockClient.tui.showToast).toHaveBeenCalledWith({
        body: {
          title: 'Success Title',
          message: 'Success Message',
          variant: 'success',
          duration: 3000,
        },
      });
      expect(mockClient.session.prompt).not.toHaveBeenCalled();
    });

    it('should send success notification with message', async () => {
      const notifier = createNotifier(mockCtx, mockLogger);

      await notifier.success('Success Title', 'Success Message', false);

      expect(mockClient.session.prompt).toHaveBeenCalledWith({
        path: { id: 'test-session' },
        body: {
          noReply: true,
          agent: 'test-agent',
          model: 'test-model',
          variant: 'test-variant',
          parts: [
            {
              type: 'text',
              text: '✅ Success Title: Success Message',
              ignored: true,
            },
          ],
        },
      });
      expect(mockClient.tui.showToast).not.toHaveBeenCalled();
    });

    it('should send warning notification', async () => {
      const notifier = createNotifier(mockCtx, mockLogger);

      await notifier.warning('Warning Title', 'Warning Message');

      expect(mockClient.tui.showToast).toHaveBeenCalledWith({
        body: {
          title: 'Warning Title',
          message: 'Warning Message',
          variant: 'warning',
          duration: 5000,
        },
      });
    });

    it('should send info notification', async () => {
      const notifier = createNotifier(mockCtx, mockLogger);

      await notifier.info('Info Title', 'Info Message');

      expect(mockClient.tui.showToast).toHaveBeenCalledWith({
        body: {
          title: 'Info Title',
          message: 'Info Message',
          variant: 'info',
          duration: 4000,
        },
      });
    });

    it('should send error notification', async () => {
      const notifier = createNotifier(mockCtx, mockLogger);

      await notifier.error('Error Title', 'Error Message');

      expect(mockClient.tui.showToast).toHaveBeenCalledWith({
        body: {
          title: 'Error Title',
          message: 'Error Message',
          variant: 'error',
          duration: 6000,
        },
      });
    });
  });

  describe('notify method', () => {
    it('should send both toast and message when both enabled', async () => {
      const notifier = createNotifier(mockCtx, mockLogger);

      await notifier.notify({
        useToast: true,
        useMessage: true,
        toast: {
          title: 'Toast Title',
          message: 'Toast Message',
          variant: 'info',
        },
        message: {
          text: 'Message content',
        },
      });

      expect(mockClient.tui.showToast).toHaveBeenCalled();
      expect(mockClient.session.prompt).toHaveBeenCalled();
    });

    it('should send only toast when only toast enabled', async () => {
      const notifier = createNotifier(mockCtx, mockLogger);

      await notifier.notify({
        useToast: true,
        useMessage: false,
        toast: {
          title: 'Toast Title',
          message: 'Toast Message',
          variant: 'success',
        },
      });

      expect(mockClient.tui.showToast).toHaveBeenCalled();
      expect(mockClient.session.prompt).not.toHaveBeenCalled();
    });

    it('should send only message when only message enabled', async () => {
      const notifier = createNotifier(mockCtx, mockLogger);

      await notifier.notify({
        useToast: false,
        useMessage: true,
        message: {
          text: 'Message content',
        },
      });

      expect(mockClient.tui.showToast).not.toHaveBeenCalled();
      expect(mockClient.session.prompt).toHaveBeenCalled();
    });
  });
});
