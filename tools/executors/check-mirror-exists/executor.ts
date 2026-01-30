/* eslint-disable max-lines -- Executor file with comprehensive error handling and documentation */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ExecutorContext } from '@nx/devkit';
import { Octokit } from '@octokit/rest';

interface ExecutorOptions {
  packageJsonPath?: string;
}

interface ExecutorResult {
  success: boolean;
  mirrorUrl?: string;
  error?: string;
}

interface PackageJson {
  name: string;
  repository?: string | { type: string; url: string };
}

interface GitHubError extends Error {
  status?: number;
  message: string;
}

interface RepositoryInfo {
  owner: string;
  repo: string;
  url: string;
}

/**
 * Extract GitHub owner and repo from repository URL
 * @param repoUrl - Repository URL from package.json
 * @returns Object with owner and repo, or null if invalid
 */
const parseGitHubUrl = (repoUrl: string): { owner: string; repo: string } | null => {
  // Handle formats:
  // - git+https://github.com/org/repo.git
  // - https://github.com/org/repo.git
  // - https://github.com/org/repo
  // - github:org/repo

  const patterns = [/github\.com[/:]([a-zA-Z0-9-]+)\/([\w-]+?)(\.git)?$/, /^github:([a-zA-Z0-9-]+)\/([\w-]+)$/];

  for (const pattern of patterns) {
    const match = repoUrl.match(pattern);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }
  }

  return null;
};

/**
 * Check if a GitHub repository exists
 * @param octokit - Octokit instance
 * @param owner - Repository owner
 * @param repo - Repository name
 * @returns True if repository exists and is accessible
 */
const checkRepositoryExists = async (octokit: Octokit, owner: string, repo: string): Promise<boolean> => {
  try {
    await octokit.rest.repos.get({ owner, repo });
    return true;
  } catch (error) {
    const gitHubError = error as GitHubError;
    if (gitHubError.status === 404) {
      return false;
    }
    // For other errors (403, 401, network issues), throw
    throw error;
  }
};

/**
 * Create a GitHub issue for missing mirror repository
 * @param octokit - Octokit instance
 * @param currentOwner - Owner of the current repository (monorepo)
 * @param currentRepo - Name of the current repository (monorepo)
 * @param packageName - Name of the package
 * @param mirrorUrl - Expected mirror repository URL
 */
const createMissingMirrorIssue = async (
  octokit: Octokit,
  currentOwner: string,
  currentRepo: string,
  packageName: string,
  mirrorUrl: string,
): Promise<void> => {
  const title = `Missing Mirror Repository: ${packageName}`;
  const labels = ['chore', 'mirror-repository'];

  // Check if issue already exists
  const existingIssues = await octokit.rest.issues.listForRepo({
    owner: currentOwner,
    repo: currentRepo,
    state: 'open',
    labels: 'mirror-repository',
  });

  const existingIssue = existingIssues.data.find((issue) => issue.title === title);

  const body = `## ⚠️ Mirror Repository Does Not Exist

The package \`${packageName}\` specifies a mirror repository in its \`package.json\`, but the repository does not exist or is not accessible.

### Details

- **Package**: \`${packageName}\`
- **Expected Mirror URL**: ${mirrorUrl}

### Next Steps

1. Create the mirror repository at ${mirrorUrl}
2. Ensure the repository is accessible (check permissions)
3. Re-run the check workflow or wait for the next scheduled check

### Automation

This issue was automatically created by the \`check-mirror-exists\` executor when changes were pushed to \`main\`.

---
_Last checked: ${new Date().toISOString()}_
`;

  if (existingIssue) {
    // Update existing issue with a comment
    await octokit.rest.issues.createComment({
      owner: currentOwner,
      repo: currentRepo,
      issue_number: existingIssue.number,
      body: `⚠️ Mirror repository still does not exist. Last checked: ${new Date().toISOString()}`,
    });
  } else {
    // Create new issue
    await octokit.rest.issues.create({
      owner: currentOwner,
      repo: currentRepo,
      title,
      body,
      labels,
    });
  }
};

/**
 * Read and parse package.json
 */
const readPackageJson = (packageJsonPath: string): PackageJson => {
  const content = readFileSync(packageJsonPath, 'utf-8');
  return JSON.parse(content) as PackageJson;
};

/**
 * Extract repository URL from package.json
 */
const getRepositoryUrl = (packageJson: PackageJson): string | null => {
  if (typeof packageJson.repository === 'string') {
    return packageJson.repository;
  }
  return packageJson.repository?.url || null;
};

/**
 * Get current GitHub repository information from environment
 */
const getCurrentRepoInfo = (): { owner: string; repo: string } | null => {
  const owner = process.env.GITHUB_REPOSITORY_OWNER || process.env.REPO_OWNER;
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || process.env.REPO_NAME;
  return owner && repo ? { owner, repo } : null;
};

/**
 * Handle missing mirror repository
 */
const handleMissingMirror = async (
  octokit: Octokit,
  packageName: string,
  mirrorUrl: string,
): Promise<ExecutorResult> => {
  console.error(`❌ Mirror repository does not exist: ${mirrorUrl}`);

  const currentRepo = getCurrentRepoInfo();
  if (currentRepo) {
    try {
      await createMissingMirrorIssue(octokit, currentRepo.owner, currentRepo.repo, packageName, mirrorUrl);
    } catch (error) {
      const gitHubError = error as GitHubError;
      console.error(`⚠️  Failed to create issue:`, gitHubError.message);
    }
  }

  return {
    success: false,
    mirrorUrl,
    error: `Mirror repository does not exist: ${mirrorUrl}`,
  };
};

/**
 * Check repository existence and handle result
 */
const checkAndVerifyRepository = async (
  octokit: Octokit,
  repoInfo: RepositoryInfo,
  packageName: string,
): Promise<ExecutorResult> => {
  let exists: boolean;
  try {
    exists = await checkRepositoryExists(octokit, repoInfo.owner, repoInfo.repo);
  } catch (error) {
    const gitHubError = error as GitHubError;
    console.error(`❌ Failed to check repository ${repoInfo.owner}/${repoInfo.repo}:`, gitHubError.message);
    if (gitHubError.status === 401 || gitHubError.status === 403) {
      console.error('   Check that GITHUB_TOKEN has appropriate permissions');
    }
    return { success: false, error: `GitHub API error: ${gitHubError.message}` };
  }

  if (!exists) {
    return handleMissingMirror(octokit, packageName, repoInfo.url);
  }
  return { success: true, mirrorUrl: repoInfo.url };
};

/**
 * Nx executor to check if mirror repository exists
 * @param options - Executor options
 * @param context - Nx executor context
 * @returns Executor result indicating success or failure
 */
// eslint-disable-next-line max-statements -- Main executor function needs to handle multiple cases
const runExecutor = async (options: ExecutorOptions, context: ExecutorContext): Promise<ExecutorResult> => {
  const projectName = context.projectName;
  if (!projectName) {
    console.error('❌ No project name found in context');
    return { success: false, error: 'No project name in context' };
  }

  const projectConfig = context.projectGraph?.nodes[projectName];
  if (!projectConfig) {
    console.error(`❌ Project configuration not found for ${projectName}`);
    return { success: false, error: 'Project configuration not found' };
  }

  const projectRoot = projectConfig.data.root;
  const packageJsonPath = options.packageJsonPath || join(context.root, projectRoot, 'package.json');

  // Read package.json
  let packageJson: PackageJson;
  try {
    packageJson = readPackageJson(packageJsonPath);
  } catch (error) {
    const err = error as Error;
    console.error(`❌ Failed to read package.json at ${packageJsonPath}:`, err.message);
    return { success: false, error: `Failed to read package.json: ${err.message}` };
  }

  // Extract repository URL
  const repoUrl = getRepositoryUrl(packageJson);
  if (!repoUrl) {
    return { success: true };
  }

  // Parse GitHub URL
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    console.error(`❌ Invalid GitHub URL format: ${repoUrl}`);
    return { success: false, error: 'Invalid GitHub URL format' };
  }

  const repoInfo: RepositoryInfo = {
    owner: parsed.owner,
    repo: parsed.repo,
    url: `https://github.com/${parsed.owner}/${parsed.repo}`,
  };

  // Get GitHub token
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('❌ GITHUB_TOKEN environment variable is required');
    return { success: false, error: 'GITHUB_TOKEN not set' };
  }

  // Check repository
  const octokit = new Octokit({ auth: token });
  return checkAndVerifyRepository(octokit, repoInfo, packageJson.name);
};

export default runExecutor;
