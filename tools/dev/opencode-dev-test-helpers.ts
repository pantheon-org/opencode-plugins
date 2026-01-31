import type { Context, Logger, Session } from '@opencodeai/types';

export interface DevServerContext {
  logger: Logger;
  sessions: Map<string, Session>;
}

export function createDevServerContext(logger: Logger): DevServerContext {
  return {
    logger,
    sessions: new Map(),
  };
}

// biome-ignore lint: Dev server waiting requires complex polling logic
export async function waitForDevServer(port: number, timeout = 30000): Promise<void> {
  const startTime = Date.now();
  // biome-ignore lint: Dev server waiting requires complex polling logic
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(`http://localhost:${port}/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // Server not ready yet, wait and retry
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Dev server failed to start within ${timeout}ms`);
}

export async function createTestSession(
  ctx: DevServerContext,
  // biome-ignore lint: Test helper uses any for flexible type matching
  overrides?: any,
): Promise<Session> {
  // biome-ignore lint: Test helper uses any for flexible type matching
  const session: any = {
    id: `test-${Date.now()}`,
    ...overrides,
  };
  ctx.sessions.set(session.id, session);
  return session as Session;
}

export async function cleanupTestSession(ctx: DevServerContext, sessionId: string): Promise<void> {
  ctx.sessions.delete(sessionId);
}

export function getTestLogger(): Logger {
  return {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  } as Logger;
}

export async function waitForStableState(ctx: Context, predicate: () => boolean, timeout = 5000): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (predicate()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Timeout waiting for stable state');
}
