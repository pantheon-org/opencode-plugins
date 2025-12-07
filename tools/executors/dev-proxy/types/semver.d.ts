declare module 'semver' {
  export type ReleaseType = 'major' | 'minor' | 'patch' | 'premajor' | 'preminor' | 'prepatch' | 'prerelease';
  export function valid(v: string | null | undefined): string | null;
  export function satisfies(version: string, range: string): boolean;
  export function gt(v1: string, v2: string): boolean;
  export function lt(v1: string, v2: string): boolean;
  export const SEMVER_SPEC_VERSION: string;
}
