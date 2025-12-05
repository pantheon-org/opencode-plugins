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

import fs from 'fs';
import path from 'path';

// Colors for terminal output
const colors = {
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

  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                     Documentation Link Fixer                             ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log('');

  if (dryRun) {
    console.log(`${colors.yellow}DRY RUN MODE - No changes will be made${colors.nc}`);
    console.log('');
  }

  // Check if docs directory exists
  if (!fs.existsSync(DOCS_DIR)) {
    console.log(`${colors.red}Error: Documentation directory not found: ${DOCS_DIR}${colors.nc}`);
    process.exit(1);
  }

  // Create backup (unless dry run)
  if (!dryRun) {
    console.log(`${colors.blue}Creating backup...${colors.nc}`);
    if (fs.existsSync(BACKUP_DIR)) {
      console.log(`${colors.yellow}Warning: Backup already exists${colors.nc}`);
      console.log(`${colors.yellow}Removing old backup...${colors.nc}`);
      fs.rmSync(BACKUP_DIR, { recursive: true, force: true });
    }
    fs.cpSync(DOCS_DIR, BACKUP_DIR, { recursive: true });
    console.log(`${colors.green}✓ Backup created${colors.nc}`);
    console.log('');
  }

  // Get all markdown files
  const files = getMarkdownFiles(DOCS_DIR);
  console.log(`${colors.blue}Found ${files.length} markdown files${colors.nc}`);
  console.log('');

  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('                              Applying Fixes                                ');
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('');

  let totalChanges = 0;
  let filesModified = 0;

  // Apply fixes to each file
  for (const fix of fixes) {
    console.log(`${colors.yellow}${fix.name}${colors.nc}`);
    let fixCount = 0;

    for (const file of files) {
      const changes = applyFixes(file, dryRun);
      if (changes > 0) {
        console.log(
          `  ${dryRun ? 'Would fix' : 'Fixed'}: ${path.basename(file)} (${changes} change${changes > 1 ? 's' : ''})`,
        );
        fixCount += changes;
        filesModified++;
      }
    }

    if (fixCount === 0) {
      console.log(`  ${colors.green}No changes needed${colors.nc}`);
    } else {
      console.log(
        `  ${colors.green}✓ ${fixCount} change${fixCount > 1 ? 's' : ''} ${dryRun ? 'would be' : ''} applied${colors.nc}`,
      );
    }
    console.log('');

    totalChanges += fixCount;
  }

  // Summary
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('                                 Summary                                    ');
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('');

  if (dryRun) {
    console.log(`${colors.green}DRY RUN COMPLETE${colors.nc}`);
    console.log('');
    console.log(
      `Would modify ${filesModified} file${filesModified !== 1 ? 's' : ''} with ${totalChanges} total change${totalChanges !== 1 ? 's' : ''}`,
    );
    console.log('');
    console.log('Run without --dry-run to apply changes');
  } else {
    console.log(`${colors.green}FIXES APPLIED${colors.nc}`);
    console.log('');
    console.log(
      `Modified ${filesModified} file${filesModified !== 1 ? 's' : ''} with ${totalChanges} total change${totalChanges !== 1 ? 's' : ''}`,
    );
    console.log('');
    console.log('Next steps:');
    console.log('  1. Run validation: bun run validate:docs-links');
    console.log('  2. Review changes: git diff docs/');
    console.log('  3. Test locally: cd docs && bun run dev');
    console.log('');
    console.log('To restore from backup:');
    console.log(`  rm -rf ${DOCS_DIR}`);
    console.log(`  mv ${BACKUP_DIR} ${DOCS_DIR}`);
  }

  console.log('');
  console.log(`${colors.blue}Done!${colors.nc}`);
}

main();
