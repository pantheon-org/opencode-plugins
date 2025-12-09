export interface GitHubAction {
  /** Action identifier (e.g., "actions/checkout") */
  name: string;
  /** Pinned commit SHA */
  sha: string;
  /** Semantic version for reference (e.g., "v4.2.2") */
  version: string;
  /** Short description of the action */
  description: string;
}

export interface GitHubActionsVersions {
  /** GitHub's official actions */
  github: {
    checkout: GitHubAction;
    setupNode: GitHubAction;
    cache: GitHubAction;
    githubScript: GitHubAction;
    codeqlUploadSarif: GitHubAction;
  };
  /** Third-party actions */
  thirdParty: {
    setupBun: GitHubAction;
    trivyAction: GitHubAction;
    ghPages: GitHubAction;
    codecov: GitHubAction;
    releasePlease: GitHubAction;
  };
}
