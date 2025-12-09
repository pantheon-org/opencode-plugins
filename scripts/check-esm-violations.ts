#!/usr/bin/env bun
/**
 * Check for require() usage in ESM packages
 *
 * This script scans all packages and apps for package.json files with "type": "module",
 * then checks their .js files for require() usage, which is invalid in ESM.
 *
 * Intentionally excludes:
 * - .cjs files (CommonJS by extension)
 * - .test.js and .spec.js files (test files may use different module systems)
 * - node_modules directories
 * - Nx executors and generators (they use CommonJS by convention)
 */

import { readFile, readdir } from 'fs/promises';
import * as path from 'path';

interface Violation {
  file: string;
  line: number;
  content: string;
}

interface ESMPackage {
  packagePath: string;
  violations: Violation[];
}

/**
 * Recursively find all files matching a pattern
 */
async function findFiles(dir: string, pattern: RegExp, ignore: string[] = []): Promise<string[]> {
  const results: string[] = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip ignored directories
      if (ignore.some((ig) => fullPath.includes(ig))) {
        continue;
      }

      if (entry.isDirectory()) {
        const subResults = await findFiles(fullPath, pattern, ignore);
        results.push(...subResults);
      } else if (entry.isFile() && pattern.test(entry.name)) {
        results.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }

  return results;
}

/**
 * Find all package.json files with "type": "module"
 */
async function findESMPackages(rootDir: string): Promise<string[]> {
  const packageFiles = await findFiles(rootDir, /^package\.json$/, ['node_modules', 'dist']);

  const esmPackages: string[] = [];

  for (const pkgPath of packageFiles) {
    try {
      const content = await readFile(pkgPath, 'utf-8');
      const pkg = JSON.parse(content);

      if (pkg.type === 'module') {
        esmPackages.push(path.dirname(pkgPath));
      }
    } catch (error) {
      console.warn(`Warning: Could not parse ${pkgPath}`);
    }
  }

  return esmPackages;
}

/**
 * Check a file for require() usage
 */
async function checkFileForRequire(filePath: string): Promise<Violation[]> {
  const violations: Violation[] = [];

  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match require() but not in comments
      // This is a simple check - may have false positives in strings
      if (line.includes('require(') && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
        violations.push({
          file: filePath,
          line: i + 1,
          content: line.trim(),
        });
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read ${filePath}`);
  }

  return violations;
}

/**
 * Check all .js files in an ESM package for require() usage
 */
async function checkPackage(packageDir: string): Promise<Violation[]> {
  const jsFiles = await findFiles(packageDir, /\.js$/, ['node_modules', 'dist', '.test.js', '.spec.js']);

  const allViolations: Violation[] = [];

  for (const file of jsFiles) {
    // Skip .cjs files
    if (file.endsWith('.cjs')) {
      continue;
    }

    // Skip test files
    if (file.includes('.test.') || file.includes('.spec.')) {
      continue;
    }

    // Skip Nx executors and generators (they use CommonJS by convention)
    if (file.includes('/executors/') || file.includes('/generators/')) {
      continue;
    }

    const violations = await checkFileForRequire(file);
    allViolations.push(...violations);
  }

  return allViolations;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Checking for require() usage in ESM packages...\n');

  const rootDir = process.cwd();
  const esmPackages = await findESMPackages(rootDir);

  if (esmPackages.length === 0) {
    console.log('✅ No ESM packages found (all packages are CommonJS)');
    return;
  }

  console.log(`Found ${esmPackages.length} ESM package(s):\n`);
  esmPackages.forEach((pkg) => {
    console.log(`  - ${path.relative(rootDir, pkg)}`);
  });
  console.log();

  const results: ESMPackage[] = [];

  for (const packageDir of esmPackages) {
    const violations = await checkPackage(packageDir);

    if (violations.length > 0) {
      results.push({
        packagePath: path.relative(rootDir, packageDir),
        violations,
      });
    }
  }

  if (results.length === 0) {
    console.log('✅ No require() violations found in ESM packages!\n');
    process.exit(0);
  }

  // Report violations
  console.log('❌ Found require() violations in ESM packages:\n');

  for (const result of results) {
    console.log(`Package: ${result.packagePath}`);
    console.log(`Violations: ${result.violations.length}\n`);

    for (const violation of result.violations) {
      const relPath = path.relative(rootDir, violation.file);
      console.log(`  ${relPath}:${violation.line}`);
      console.log(`    ${violation.content}\n`);
    }
  }

  console.log('💡 Tip: Convert require() to ESM import statements:');
  console.log("   Before: const fs = require('fs')");
  console.log("   After:  import fs from 'fs'\n");
  console.log("   Or use dynamic import: const fs = await import('fs')\n");

  process.exit(1);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
