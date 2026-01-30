import { githubActionsVersions } from '.';
import { formatActionRef } from './format-action-ref';

/**
 * Get all actions as a flat object for easy template access
 *
 * @returns Flattened object with all action references
 *
 * @example
 * ```typescript
 * const actions = getFlattenedActions();
 * // Use in template: <%= actions.checkout %>
 * // Outputs: "actions/checkout@93cb6efe18208431cddfb8368fd83d5badbf9bfd # v5.0.1"
 * ```
 */
export const getFlattenedActions = (): Record<string, string> => {
  const versions = githubActionsVersions();

  return {
    // GitHub official actions
    checkout: formatActionRef(versions.github.checkout),
    setupNode: formatActionRef(versions.github.setupNode),
    cache: formatActionRef(versions.github.cache),
    githubScript: formatActionRef(versions.github.githubScript),
    codeqlUploadSarif: formatActionRef(versions.github.codeqlUploadSarif),

    // Third-party actions
    setupBun: formatActionRef(versions.thirdParty.setupBun),
    trivyAction: formatActionRef(versions.thirdParty.trivyAction),
    ghPages: formatActionRef(versions.thirdParty.ghPages),
    codecov: formatActionRef(versions.thirdParty.codecov),
    releasePlease: formatActionRef(versions.thirdParty.releasePlease),
  };
};
