import { type ChildProcess, spawn } from 'node:child_process';

export function spawnWatchBuild(projectName: string): ChildProcess {
  const cmd = 'bunx';
  const args = ['nx', 'run', `${projectName}:build`, '--watch'];
  console.log(`Starting build watcher: ${cmd} ${args.join(' ')}`);
  const p = spawn(cmd, args, { stdio: 'inherit' });
  p.on('exit', (code) => console.log(`Build watcher for ${projectName} exited (${code})`));
  return p;
}