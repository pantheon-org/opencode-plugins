#!/usr/bin/env bun

/**
 * GitHub Pages Configuration Checker
 *
 * This script checks if GitHub Pages is configured correctly
 * to deploy from GitHub Actions (not a branch).
 *
 * Usage:
 *   bun run scripts/check-pages-source.ts <owner/repo>
 *
 * Example:
 *   bun run scripts/check-pages-source.ts pantheon-org/opencode-font
 */

interface GitHubPagesResponse {
  status?: string;
  build_type?: string;
  [key: string]: unknown;
}

/**
 * Check GitHub Pages configuration for a repository
 */
async function checkPagesConfig(repo: string): Promise<void> {
  if (!repo) {
    console.error("Error: Repository name required (e.g., 'owner/repo')");
    process.exit(1);
  }

  try {
    // Use GitHub API to check Pages configuration
    const response = await fetch(`https://api.github.com/repos/${repo}/pages`, {
      headers: {
        Accept: 'application/vnd.github+json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.error('❌ GitHub Pages is not enabled for this repository');
        process.exit(1);
      }
      throw new Error(`GitHub API returned status ${response.status}`);
    }

    const data = (await response.json()) as GitHubPagesResponse;

    // Check if Pages is enabled
    if (data.status === 'built') {
    } else {
    }

    // Check build type (should be "workflow" for GitHub Actions)
    const buildType = data.build_type || 'unknown';

    if (buildType === 'workflow') {
      process.exit(0);
    } else if (buildType === 'legacy') {
      process.exit(1);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error checking Pages configuration:', error);
    process.exit(1);
  }
}

// Main execution
const repo = process.argv[2];
checkPagesConfig(repo).catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
