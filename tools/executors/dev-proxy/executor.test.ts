import fs from 'fs';
import path from 'path';

import { ExecutorContext } from '@nx/devkit';

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
  } as any;
  return iterator;
}

// Globally monkeypatch child_process.spawn to prevent spawning long-running processes during tests
// This ensures CI and local test runs do not actually start watchers or runtime processes.
// The tests still exercise signal handling and executor shutdown logic via mocks.

const childProcess = require('child_process');
const _originalSpawn = childProcess.spawn;
function _fakeSpawn(cmd: string, args: string[], opts: any) {
  return {
    kill: () => {},
    on: (ev: string, cb: Function) => {},
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
  // @ts-ignore override for test
  process.exit = ((code?: number) => {
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
    const mockSpawnSync = (cmd: string, args: string[], opts: any) => ({ status: 0 });

    // Minimal executor context
    const context = {
      root: process.cwd(),
      projectName: 'opencode-warcraft-notifications-plugin',
    } as unknown as ExecutorContext;

    // Snapshot existing SIGINT listeners
    const beforeListeners = process.listeners('SIGINT').slice();

    const resPromise = runExecutor(
      {
        plugins: ['opencode-warcraft-notifications-plugin'],
        __runExecutor: mockRunExecutor,
        __spawnSync: mockSpawnSync,
      },
      context,
    );

    // Wait briefly to let executor start and attach iterator
    await new Promise((r) => setTimeout(r, 50));

    // Simulate SIGINT by sending the signal to the process
    process.emit('SIGINT' as any);

    // Wait for shutdown to propagate
    await new Promise((r) => setTimeout(r, 50));

    expect(iterator._returned()).toBe(true);

    const res = await resPromise;
    expect(res && res.success).toBe(true);

    // Restore SIGINT listeners to avoid side effects on other tests
    const afterListeners = process.listeners('SIGINT');
    for (const l of afterListeners) {
      if (!beforeListeners.includes(l)) process.removeListener('SIGINT', l);
    }
  });

  it('falls back to CLI watcher and kills child on SIGINT', async () => {
    const mockRunExecutor = async () => {
      throw new Error('not available');
    };

    let childKilled = false;
    // Monkeypatch child_process.spawn

    const childProcess = require('child_process');
    const originalSpawn = childProcess.spawn;
    childProcess.spawn = (cmd: string, args: string[], opts: any) => {
      // return a fake child with kill()
      return {
        kill: () => {
          childKilled = true;
        },
        on: (ev: string, cb: Function) => {},
      } as any;
    };

    const mockSpawnSync = (cmd: string, args: string[], opts: any) => ({ status: 0 });
    const context = {
      root: process.cwd(),
      projectName: 'opencode-warcraft-notifications-plugin',
    } as unknown as ExecutorContext;

    const beforeListeners = process.listeners('SIGINT').slice();

    const resPromise = runExecutor(
      {
        plugins: ['opencode-warcraft-notifications-plugin'],
        __runExecutor: mockRunExecutor,
        __spawnSync: mockSpawnSync,
      },
      context,
    );

    await new Promise((r) => setTimeout(r, 50));

    process.emit('SIGINT' as any);
    await new Promise((r) => setTimeout(r, 50));

    expect(childKilled).toBe(true);

    const res = await resPromise;
    expect(res && res.success).toBe(true);

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

    const mockSpawnSync = (cmd: string, args: string[], opts: any) => ({ status: 0 });
    const context = { root: process.cwd(), projectName: 'pA' } as unknown as ExecutorContext;

    const beforeListeners = process.listeners('SIGINT').slice();

    const resPromise = runExecutor(
      { plugins: ['pA', 'pB'], __runExecutor: mockRunExecutor, __spawnSync: mockSpawnSync },
      context,
    );

    await new Promise((r) => setTimeout(r, 50));

    process.emit('SIGINT' as any);
    await new Promise((r) => setTimeout(r, 50));

    expect(iterA._returned()).toBe(true);
    expect(iterB._returned()).toBe(true);

    const res = await resPromise;
    expect(res && res.success).toBe(true);

    const afterListeners = process.listeners('SIGINT');
    for (const l of afterListeners) {
      if (!beforeListeners.includes(l)) process.removeListener('SIGINT', l);
    }
  });
});
