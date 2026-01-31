import type { ChildProcess } from 'node:child_process';

export interface CleanupState {
  buildProcesses: ChildProcess[];
  opProcess: ChildProcess | null;
}

export const setupCleanupHandlers = (state: CleanupState): void => {
  process.on('SIGINT', async () => {
    console.log('\nInterrupted. Cleaning up...');
    for (const b of state.buildProcesses) {
      try {
        b.kill();
      } catch {}
    }
    if (state.opProcess) {
      try {
        state.opProcess.kill();
      } catch {}
    }
    process.exit(0);
  });
};
