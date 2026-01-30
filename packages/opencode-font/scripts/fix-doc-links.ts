#!/usr/bin/env bun

/**
 * Documentation Link Fixer
 *
 * This script fixes common broken link patterns in documentation.
 *
 * Usage:
 *   bun run scripts/fix-doc-links.ts [--dry-run]
 *
 * Options:
 *   --dry-run  Show what would be changed without making changes
 */

import fs from 'node:fs';
import path from 'node:path';

// Colors for terminal output
const _colors = {
  red: '\x1b[0;31m',
  green: '\x1b[0;32m',
  yellow: '\x1b[1;33m',
  blue: '\x1b[0;34m',
  nc: '\x1b[0m',
} as const;

// Configuration
const DOCS_DIR = 'docs/src/content/docs';
const BACKUP_DIR = 'docs/src/content/docs.backup';
const REPO_URL = 'https://github.com/pantheon-org/opencode-warcraft-notifications/blob/main';

interface FixPattern {
  name: string;
  pattern: RegExp;
  replacement: string;
}

const fixes: FixPattern[] = [
  {
    name: 'Remove trailing slashes from internal links',
    pattern: /\]\((\/[^)]*)\//g,
    replacement: ']($1)',
  },
  {
    name: 'Fix ../README.md references',
    pattern: /\.\.\/README\.md/g,
    replacement: `${REPO_URL}/README.md`,
  },
  {
    name: 'Fix ../LICENSE references',
    pattern: /\.\.\/LICENSE/g,
    replacement: `${REPO_URL}/LICENSE`,
  },
  {
    name: 'Fix ../SECURITY.md references',
    pattern: /\.\.\/SECURITY\.md/g,
    replacement: `${REPO_URL}/SECURITY.md`,
  },
  {
    name: 'Fix src/content/README.md references',
    pattern: /src\/content\/README\.md/g,
    replacement: `${REPO_URL}/README.md`,
  },
];

/**
 * Get all markdown files recursively
 */
function getMarkdownFiles(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
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
 * Apply fixes to a file
 */
function applyFixes(filePath: string, dryRun: boolean): number {
  const content = fs.readFileSync(filePath, 'utf-8');
  let modifiedContent = content;
  let changesCount = 0;

  for (const fix of fixes) {
    const matches = content.match(fix.pattern);
    if (matches) {
      modifiedContent = modifiedContent.replace(fix.pattern, fix.replacement);
      changesCount += matches.length;
    }
  }

  if (changesCount > 0 && !dryRun) {
    fs.writeFileSync(filePath, modifiedContent, 'utf-8');
  }

  return changesCount;
}

/**
 * Main execution
 */
function main(): void {
  const dryRun = process.argv.includes('--dry-run');

  if (dryRun) {
  }

  // Check if docs directory exists
  if (!fs.existsSync(DOCS_DIR)) {
    process.exit(1);
  }

  // Create backup (unless dry run)
  if (!dryRun) {
    if (fs.existsSync(BACKUP_DIR)) {
      fs.rmSync(BACKUP_DIR, { recursive: true, force: true });
    }
    fs.cpSync(DOCS_DIR, BACKUP_DIR, { recursive: true });
  }

  // Get all markdown files
  const files = getMarkdownFiles(DOCS_DIR);

  let _totalChanges = 0;
  let _filesModified = 0;

  // Apply fixes to each file
  for (const _fix of fixes) {
    let fixCount = 0;

    for (const file of files) {
      const changes = applyFixes(file, dryRun);
      if (changes > 0) {
        fixCount += changes;
        _filesModified++;
      }
    }

    if (fixCount === 0) {
    } else {
    }

    _totalChanges += fixCount;
  }

  if (dryRun) {
  } else {
  }
}

main();
