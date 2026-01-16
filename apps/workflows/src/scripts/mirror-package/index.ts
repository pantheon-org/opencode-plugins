/**
 * Mirror Package Scripts
 *
 * TypeScript utilities for the mirror-packages.yml workflow
 */

export { parseTag, setOutput as setGitHubOutput } from './parse-tag';
export { validateMirrorUrl } from './validate-mirror-url';
export { enableGitHubPages } from './enable-github-pages';
export { setBranchReadonly } from './set-branch-readonly';
export { detectChanges } from './detect-changes';
export type {
  PackageInfo,
  MirrorUrl,
  ChangeDetection,
  EnablePagesResult,
  BranchProtectionResult,
  GitHubPagesConfig,
} from './types';
