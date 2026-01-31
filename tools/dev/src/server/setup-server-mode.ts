import type { ChildProcess } from 'node:child_process';
import { detectServerAvailability } from './detect-server-availability';
import { spawnOpencode } from './spawn-opencode';

interface ServerModeResult {
  isServerMode: boolean;
  opProcess: ChildProcess | null;
}

export const setupServerMode = async (
  disposeUrl: string,
  disposeEnabled: boolean,
  workspaceRoot: string,
): Promise<ServerModeResult> => {
  const serverAvailable = await detectServerAvailability(disposeUrl, disposeEnabled);

  if (serverAvailable) {
    console.log(`Server detected at ${disposeUrl}; reload via HTTP.`);
    return { isServerMode: true, opProcess: null };
  }

  console.log('No server detected; starting local opencode CLI.');
  const opProcess = spawnOpencode(workspaceRoot);
  return { isServerMode: false, opProcess };
};
