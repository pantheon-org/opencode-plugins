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

import fs from 'node:fs';
import path from 'node:path';

// Configuration
const DOCS_DIR = path.join(import.meta.dir, '../docs');
const DOCS_ROOT = path.join(import.meta.dir, '../docs');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
} as const;

interface Link {
  text: string;
  url: string;
  line: number;
  filePath: string;
}

interface BrokenLink extends Link {
  reason: string;
  targetFile?: string;
  anchor?: string;
}

interface MissingAnchor {
  file: string;
  anchor: string;
}

// Results tracking
const results = {
  totalFiles: 0,
  totalLinks: 0,
  brokenLinks: [] as BrokenLink[],
  missingFiles: [] as string[],
  missingAnchors: [] as MissingAnchor[],
  externalLinks: [] as Link[],
  validLinks: 0,
};

/**
 * Get all markdown files recursively
 */
function getMarkdownFiles(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules, .git, etc.
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        getMarkdownFiles(fullPath, files);
      }
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Extract all links from markdown content
 */
function extractLinks(content: string, filePath: string): Link[] {
  const links: Link[] = [];
  const lines = content.split('\n');

  // Match markdown links: [text](url) and [text](url "title")
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  lines.forEach((line, index) => {
    let match;
    while ((match = linkRegex.exec(line)) !== null) {
      const [, text, url] = match;
      links.push({
        text,
        url,
        line: index + 1,
        filePath,
      });
    }
  });

  return links;
}

/**
 * Extract headings from markdown content
 */
function extractHeadings(content: string): Set<string> {
  const headings = new Set<string>();
  const lines = content.split('\n');

  lines.forEach((line) => {
    const match: RegExpMatchArray | null = line.match(/^#+\s+(.+)$/);
    if (match) {
      const heading = match[1].trim();
      // Convert heading to anchor format
      const anchor = heading
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      headings.add(anchor);
    }
  });

  return headings;
}

/**
 * Check if a link is external
 */
function isExternalLink(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
}

/**
 * Validate a single link
 */
function validateLink(link: Link, currentFile: string): void {
  results.totalLinks++;

  const url = link.url.trim();

  // Skip external links (we'll track them separately)
  if (isExternalLink(url)) {
    results.externalLinks.push(link);
    results.validLinks++;
    return;
  }

  // Parse URL and anchor
  const [linkPath, anchor] = url.split('#');

  // Handle different link formats
  let targetFile: string;
  if (!linkPath || linkPath === '') {
    // Same-file anchor link (#anchor)
    targetFile = currentFile;
  } else if (linkPath.startsWith('/')) {
    // Absolute path from docs root
    targetFile = path.join(DOCS_DIR, linkPath.replace(/^\//, ''));
    if (!targetFile.endsWith('.md')) {
      targetFile += '.md';
    }
  } else if (linkPath.startsWith('./') || linkPath.startsWith('../')) {
    // Relative path
    const currentDir = path.dirname(currentFile);
    targetFile = path.resolve(currentDir, linkPath);
    if (!targetFile.endsWith('.md')) {
      targetFile += '.md';
    }
  } else {
    // Relative path without ./
    const currentDir = path.dirname(currentFile);
    targetFile = path.resolve(currentDir, linkPath);
    if (!targetFile.endsWith('.md')) {
      targetFile += '.md';
    }
  }

  // Check if file exists
  if (!fs.existsSync(targetFile)) {
    results.brokenLinks.push({
      ...link,
      reason: 'File not found',
      targetFile,
    });
    results.missingFiles.push(targetFile);
    return;
  }

  // Check if anchor exists (if specified)
  if (anchor) {
    const targetContent = fs.readFileSync(targetFile, 'utf-8');
    const headings = extractHeadings(targetContent);

    if (!headings.has(anchor)) {
      results.brokenLinks.push({
        ...link,
        reason: 'Anchor not found',
        targetFile,
        anchor,
      });
      results.missingAnchors.push({
        file: targetFile,
        anchor,
      });
      return;
    }
  }

  results.validLinks++;
}

/**
 * Validate all links in a file
 */
function validateFile(filePath: string): void {
  results.totalFiles++;

  const content = fs.readFileSync(filePath, 'utf-8');
  const links = extractLinks(content, filePath);

  links.forEach((link) => validateLink(link, filePath));
}

/**
 * Generate report
 */
function generateReport(): void {
  // Broken links details
  if (results.brokenLinks.length > 0) {
    const groupedByFile: Record<string, BrokenLink[]> = {};
    results.brokenLinks.forEach((link) => {
      const relPath = path.relative(DOCS_ROOT, link.filePath);
      if (!groupedByFile[relPath]) {
        groupedByFile[relPath] = [];
      }
      groupedByFile[relPath].push(link);
    });

    Object.entries(groupedByFile).forEach(([_file, links]) => {
      links.forEach((link) => {
        if (link.targetFile) {
          const _relTarget = path.relative(DOCS_ROOT, link.targetFile);
        }
        if (link.anchor) {
        }
      });
    });
  }

  // Missing files
  if (results.missingFiles.length > 0) {
    const uniqueMissingFiles = [...new Set(results.missingFiles)];
    uniqueMissingFiles.forEach((file) => {
      const _relPath = path.relative(DOCS_ROOT, file);
    });
  }

  // Missing anchors
  if (results.missingAnchors.length > 0) {
    const groupedByFile: Record<string, string[]> = {};
    results.missingAnchors.forEach(({ file, anchor }) => {
      const relPath = path.relative(DOCS_ROOT, file);
      if (!groupedByFile[relPath]) {
        groupedByFile[relPath] = [];
      }
      groupedByFile[relPath].push(anchor);
    });

    Object.entries(groupedByFile).forEach(([_file, anchors]) => {
      const uniqueAnchors = [...new Set(anchors)];
      uniqueAnchors.forEach((_anchor) => {});
    });
  }

  // External links summary
  if (results.externalLinks.length > 0) {
    // Group by domain
    const domains: Record<string, number> = {};
    results.externalLinks.forEach((link) => {
      try {
        const url = new URL(link.url);
        const domain = url.hostname;
        domains[domain] = (domains[domain] || 0) + 1;
      } catch (_e) {
        // Invalid URL, skip
      }
    });
    Object.entries(domains)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([_domain, _count]) => {});
  }
  if (results.brokenLinks.length === 0) {
  } else {
  }
}

/**
 * Main execution
 */
function main(): void {
  if (!fs.existsSync(DOCS_DIR)) {
    console.error(`${colors.red}Error: Documentation directory not found: ${DOCS_DIR}${colors.reset}`);
    process.exit(1);
  }

  const files = getMarkdownFiles(DOCS_DIR);

  if (files.length === 0) {
    console.error(`${colors.red}Error: No markdown files found${colors.reset}`);
    process.exit(1);
  }

  files.forEach((file) => {
    const _relPath = path.relative(DOCS_ROOT, file);
    validateFile(file);
  });

  generateReport();

  // Exit with error code if broken links found
  process.exit(results.brokenLinks.length > 0 ? 1 : 0);
}

// Run the script
main();
