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

  console.log(`Checking GitHub Pages configuration for ${repo}...`);

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
      console.log('✅ Pages is enabled');
    } else {
      console.log('⚠️  Pages may not be enabled or is not built');
    }

    // Check build type (should be "workflow" for GitHub Actions)
    const buildType = data.build_type || 'unknown';

    if (buildType === 'workflow') {
      console.log('✅ Pages is correctly configured to deploy from GitHub Actions');
      process.exit(0);
    } else if (buildType === 'legacy') {
      console.log('❌ Pages is configured to deploy from a branch (legacy mode)');
      console.log('   Please change to "GitHub Actions" in repository settings:');
      console.log('   Settings → Pages → Source → GitHub Actions');
      process.exit(1);
    } else {
      console.log(`⚠️  Could not determine Pages build type (got: ${buildType})`);
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
