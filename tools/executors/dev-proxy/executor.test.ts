import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type { spawnSync } from 'node:child_process';
import type { ExecutorContext } from '@nx/devkit';

import runExecutor from './executor';

// Helper to create an async iterator that yields once and records if return() was called
function makeMockIterator() {
  let returned = false;
  const iterator = {
    async *[Symbol.asyncIterator]() {
      try {
        yield { success: true };
        // keep alive until return is called
        await new Promise((res) => setTimeout(res, 10000));
      } finally {
        returned = true;
      }
    },
    // expose return for the executor to call
    async return() {
      returned = true;
      return { value: undefined, done: true };
    },
    _returned() {
      return returned;
    },
  } as {
    [Symbol.asyncIterator](): AsyncGenerator<{ success: boolean }>;
    return(): Promise<IteratorResult<{ success: boolean }>>;
    _returned(): boolean;
  };
  return iterator;
}

// Globally monkeypatch child_process.spawn to prevent spawning long-running processes during tests
// This ensures CI and local test runs do not actually start watchers or runtime processes.
// The tests still exercise signal handling and executor shutdown logic via mocks.

const childProcess = require('node:child_process');
const _originalSpawn = childProcess.spawn;
function _fakeSpawn(_cmd: string, _args: string[], _opts: any) {
  return {
    kill: () => {},
    on: (_ev: string, _cb: (...args: unknown[]) => void) => {},
  } as any;
}

let _originalExit: typeof process.exit;
let _exitCalled = false;

beforeEach(() => {
  // prevent child processes from actually spawning
  childProcess.spawn = _fakeSpawn;

  // stub process.exit so tests can simulate SIGINT without killing the test runner
  _originalExit = process.exit;
  _exitCalled = false;
  process.exit = ((_code?: number) => {
    _exitCalled = true;
    // do not actually exit during tests
  }) as typeof process.exit;
});

afterEach(() => {
  childProcess.spawn = _originalSpawn;
  // restore process.exit
  process.exit = _originalExit;
});

describe('dev-proxy executor with mocked runExecutor', () => {
  it('calls iterator.return() on shutdown', async () => {
    const iterator = makeMockIterator();
    // mock runExecutor that returns the iterator
    const mockRunExecutor = async () => iterator;

    // mock spawnSync to simulate runtime script returning immediately
    const mockSpawnSync = ((_cmd: string, _args?: readonly string[], _opts?: any) =>
      ({ status: 0 }) as any) as typeof spawnSync;

    // Minimal executor context
    const context = {
      root: process.cwd(),
      projectName: 'opencode-warcraft-notifications-plugin',
    } as unknown as ExecutorContext;

    // Snapshot existing SIGINT listeners
    const beforeListeners = process.listeners('SIGINT').slice();

    const gen = runExecutor(
      {
        plugins: ['opencode-warcraft-notifications-plugin'],
        __runExecutor: mockRunExecutor,
        __spawnSync: mockSpawnSync,
        __noExit: true,
      },
      context,
    );

    // Start the generator to execute the executor body
    const resPromise = gen.next();

    // Wait briefly to let executor start and attach iterator
    await new Promise((r) => setTimeout(r, 100));

    // Simulate SIGINT by sending the signal to the process
    process.emit('SIGINT' as any);

    // Wait for shutdown to propagate
    await new Promise((r) => setTimeout(r, 50));

    expect(iterator._returned()).toBe(true);

    const res = await resPromise;
    expect(res?.value?.success).toBe(true);

    const afterListeners = process.listeners('SIGINT');
    for (const l of afterListeners) {
      if (!beforeListeners.includes(l)) process.removeListener('SIGINT', l);
    }
  });

  it.skip('falls back to CLI watcher and kills child on SIGINT', async () => {
    const mockRunExecutor = async () => {
      throw new Error('not available');
    };

    let childKilled = false;
    let _childSpawned = false;
    // Monkeypatch child_process.spawn

    const childProcess = require('node:child_process');
    const originalSpawn = childProcess.spawn;
    childProcess.spawn = (_cmd: string, _args: string[], _opts: any) => {
      _childSpawned = true;
      // return a fake child with kill()
      return {
        kill: () => {
          childKilled = true;
        },
        on: (_ev: string, _cb: (...args: unknown[]) => void) => {},
      } as any;
    };

    // Mock spawnSync to block briefly so SIGINT can be processed
    const mockSpawnSync = ((_cmd: string, _args?: readonly string[], _opts?: any) => {
      // Use synchronous sleep to simulate blocking behavior
      const start = Date.now();
      while (Date.now() - start < 200) {
        // Block for 200ms to allow SIGINT to be processed
      }
      return { status: 0 } as any;
    }) as typeof spawnSync;
    const context = {
      root: process.cwd(),
      projectName: 'opencode-warcraft-notifications-plugin',
    } as unknown as ExecutorContext;

    const beforeListeners = process.listeners('SIGINT').slice();

    const gen = runExecutor(
      {
        plugins: ['opencode-warcraft-notifications-plugin'],
        __runExecutor: mockRunExecutor,
        __spawnSync: mockSpawnSync,
        __noExit: true,
      },
      context,
    );

    // Start the generator to execute the executor body
    const resPromise = gen.next();

    await new Promise((r) => setTimeout(r, 100));

    process.emit('SIGINT' as any);
    await new Promise((r) => setTimeout(r, 300));

    expect(childKilled).toBe(true);

    const res = await resPromise;
    expect(res?.value?.success).toBe(true);

    // restore spawn and listeners
    childProcess.spawn = originalSpawn;
    const afterListeners = process.listeners('SIGINT');
    for (const l of afterListeners) {
      if (!beforeListeners.includes(l)) process.removeListener('SIGINT', l);
    }
  });

  it('starts multiple projects and stops both on SIGINT', async () => {
    const iterA = makeMockIterator();
    const iterB = makeMockIterator();
    const mockRunExecutor = async (opts: any) => {
      if (opts && opts.project === 'pA') return iterA;
      if (opts && opts.project === 'pB') return iterB;
      return iterA;
    };

    const mockSpawnSync = ((_cmd: string, _args?: readonly string[], _opts?: any) =>
      ({ status: 0 }) as any) as typeof spawnSync;
    const context = { root: process.cwd(), projectName: 'pA' } as unknown as ExecutorContext;

    const beforeListeners = process.listeners('SIGINT').slice();

    const gen = runExecutor(
      { plugins: ['pA', 'pB'], __runExecutor: mockRunExecutor, __spawnSync: mockSpawnSync, __noExit: true },
      context,
    );

    // Start the generator to execute the executor body
    const resPromise = gen.next();

    await new Promise((r) => setTimeout(r, 100));

    process.emit('SIGINT' as any);
    await new Promise((r) => setTimeout(r, 50));

    expect(iterA._returned()).toBe(true);
    expect(iterB._returned()).toBe(true);

    const res = await resPromise;
    expect(res?.value?.success).toBe(true);

    const afterListeners = process.listeners('SIGINT');
    for (const l of afterListeners) {
      if (!beforeListeners.includes(l)) process.removeListener('SIGINT', l);
    }
  });
});
