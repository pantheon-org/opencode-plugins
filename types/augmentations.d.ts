// Consolidated local type augmentations for the workspace
// - ProcessEnv augmentation (tools relied on a local declaration)
// - semver module declarations (consolidated from per-package types)

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
}

// Provide lightweight semver typings when not provided by external @types/semver
declare module 'semver' {
  export function valid(v: string | null | undefined): string | null;
  export function satisfies(version: string, range: string): boolean;
  export function gt(v1: string, v2: string): boolean;
  export function lt(v1: string, v2: string): boolean;
  export const SEMVER_SPEC_VERSION: string;
}

export {};
