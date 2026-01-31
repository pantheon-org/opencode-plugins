import { type ChildProcess, spawn } from 'node:child_process';

export const spawnOpencode = (workspaceRoot: string): ChildProcess => {
  console.log('Starting opencode CLI in', workspaceRoot);
  const opProcess = spawn('opencode', [], { cwd: workspaceRoot, stdio: 'inherit' });
  opProcess.on('exit', (code) => {
    console.log('opencode exited', code);
    process.exit(code ?? 0);
  });
  return opProcess;
};
