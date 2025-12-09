/**
 * GitHub Actions versions with pinned SHAs for security and reproducibility.
 *
 * All action versions are pinned to specific commit SHAs to prevent supply chain attacks
 * and ensure consistent behavior across all generated plugins.
 *
 * Update Policy:
 * - Review and update quarterly or when security advisories are published
 * - Always verify SHA matches the expected version tag
 * - Test updates in a single plugin before regenerating all plugins
 */

import { GitHubActionsVersions } from './types';

/**
 * Centralized GitHub Actions version management
 *
 * @example
 * ```typescript
 * const actions = githubActionsVersions();
 * // Use in template: actions.github.checkout.sha
 * // Outputs: "93cb6efe18208431cddfb8368fd83d5badbf9bfd"
 * ```
 */
export const githubActionsVersions = (): GitHubActionsVersions => ({
  github: {
    checkout: {
      name: 'actions/checkout',
      sha: '93cb6efe18208431cddfb8368fd83d5badbf9bfd',
      version: 'v5.0.1',
      description: 'Checkout repository code',
    },
    setupNode: {
      name: 'actions/setup-node',
      sha: '2028fbc5c25fe9cf00d9f06a71cc4710d4507903',
      version: 'v6.0.0',
      description: 'Setup Node.js environment',
    },
    cache: {
      name: 'actions/cache',
      sha: '0057852bfaa89a56745cba8c7296529d2fc39830',
      version: 'v4.3.0',
      description: 'Cache dependencies and build outputs',
    },
    githubScript: {
      name: 'actions/github-script',
      sha: 'ed597411d8f924073f98dfc5c65a23a2325f34cd',
      version: 'v8.0.0',
      description: 'Run GitHub API scripts',
    },
    codeqlUploadSarif: {
      name: 'github/codeql-action/upload-sarif',
      sha: 'c3d42c5d08633d8b33635fbd94b000a0e2585b3c',
      version: 'v3.31.4',
      description: 'Upload SARIF security scan results',
    },
  },
  thirdParty: {
    setupBun: {
      name: 'oven-sh/setup-bun',
      sha: '735343b667d3e6f658f44d0eca948eb6282f2b76',
      version: 'v2.0.2',
      description: 'Setup Bun runtime environment',
    },
    trivyAction: {
      name: 'aquasecurity/trivy-action',
      sha: 'b6643a29fecd7f34b3597bc6acb0a98b03d33ff8',
      version: '0.33.1',
      description: 'Run Trivy security scanner',
    },
    ghPages: {
      name: 'peaceiris/actions-gh-pages',
      sha: '4f9cc6602d3f66b9c108549d475ec49e8ef4d45e',
      version: 'v4.0.0',
      description: 'Deploy to GitHub Pages',
    },
    codecov: {
      name: 'codecov/codecov-action',
      sha: '5a1091511ad55cbe89839c7260b706298ca349f7',
      version: 'v5.5.1',
      description: 'Upload coverage reports to Codecov',
    },
    releasePlease: {
      name: 'googleapis/release-please-action',
      sha: '7987652d64b4581673a76e33ad5e98e3dd56832f',
      version: 'v4.1.3',
      description: 'Automated releases with conventional commits',
    },
  },
});
<<<<<<<< HEAD:tools/generators/plugin/github-actions-versions.ts

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
========
>>>>>>>> 20ed61e (refactor(tools): convert executors and generators to ESM and register as Nx projects):tools/generators/plugin/src/github-action-versions/index.ts
