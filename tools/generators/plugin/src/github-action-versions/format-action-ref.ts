import { GitHubAction } from './types';

/**
 * Helper to format action reference for workflow files
 *
 * @param action - GitHub action configuration
 * @returns Formatted action reference (e.g., "actions/checkout\@93cb6efe... # v5.0.1")
 *
 * @example
 * ```typescript
 * formatActionRef(githubActionsVersions().github.checkout)
 * // Returns: "actions/checkout@93cb6efe18208431cddfb8368fd83d5badbf9bfd # v5.0.1"
 * ```
 */
export const formatActionRef = (action: GitHubAction): string => {
  return `${action.name}@${action.sha} # ${action.version}`;
};
