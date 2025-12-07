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
declare function checkPagesConfig(repo: string): Promise<void>;
declare const repo: string;
