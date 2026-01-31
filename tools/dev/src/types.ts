import type { ChildProcess } from 'node:child_process';

export type Opts = {
  plugins: string[];
  symlinkRoot: string;
  apply: boolean;
  revert: boolean;
  workspaceRoot: string;
  disposeEnabled: boolean;
  disposeUrl: string;
};

export interface JsoncResult {
  json: unknown;
  raw: string;
}

export interface OpencodeConfig {
  plugin?: unknown[];
}

export interface FetchError {
  name: string;
  message: string;
}

export interface MtimeState {
  latest: number;
  stack: string[];
}

export interface BuildConfig {
  dir: string;
  distPath: string;
  projectName: string;
}

export interface CleanupState {
  buildProcesses: ChildProcess[];
  opProcess: ChildProcess | null;
}

export interface ReloadResult {
  shouldRestart: boolean;
  message: string;
}
