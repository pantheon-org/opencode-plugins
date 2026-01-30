/**
 * Mirror Package Scripts
 *
 * TypeScript utilities for the mirror-packages.yml workflow
 */

export { detectChanges } from './detect-changes';
export { disableRepoFeatures } from './disable-repo-features';
export { enableGitHubPages } from './enable-github-pages';
export { parseTag, setOutput as setGitHubOutput } from './parse-tag';
export { setBranchReadonly } from './set-branch-readonly';
export type {
  BranchProtectionResult,
  ChangeDetection,
  DisableFeaturesResult,
  EnablePagesResult,
  GitHubPagesConfig,
  MirrorUrl,
  PackageInfo,
} from './types';
export { validateMirrorUrl } from './validate-mirror-url';
