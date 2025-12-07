#!/usr/bin/env bun
/**
 * Documentation Link Validator
 *
 * This script validates all internal links in the documentation to ensure
 * they point to existing files and sections.
 *
 * Usage:
 *   bun run scripts/validate-docs-links.ts
 *
 * Features:
 * - Validates markdown links in docs/src/content/docs/
 * - Checks if linked files exist
 * - Validates section anchors
 * - Reports broken links with line numbers
 * - Generates summary report
 */
export {};
