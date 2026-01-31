import { type ChildProcess } from 'node:child_process';
import { spawnWatchBuild } from './spawn-watch-build';

export async function startBuildWatcher(projectName: string): Promise<ChildProcess | null> {
  try {
    return spawnWatchBuild(projectName);
  } catch (err) {
    console.warn('Failed to start build watcher for', projectName, String(err));
    return null;
  }
}