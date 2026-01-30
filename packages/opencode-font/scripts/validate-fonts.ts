#!/usr/bin/env bun

/**
 * Font Validation Script
 *
 * Validates generated font files for correctness and size constraints.
 *
 * Usage:
 *   bun run scripts/validate-fonts.ts
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Configuration
const FONT_DIR = 'fonts';
const FONT_NAME = 'OpenCodeLogo';
const MAX_WOFF2_SIZE = 51200; // 50KB
const MAX_WOFF_SIZE = 102400; // 100KB
const MAX_TTF_SIZE = 204800; // 200KB

interface FontValidationResult {
  success: boolean;
  fileName: string;
  size: number;
  maxSize: number;
  format?: string;
}

/**
 * Get file size in bytes
 */
function getFileSize(filePath: string): number {
  const stats = fs.statSync(filePath);
  return stats.size;
}

/**
 * Check if a command exists
 */
function commandExists(command: string): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn('command', ['-v', command], { shell: true });
    proc.on('close', (code) => resolve(code === 0));
  });
}

/**
 * Get file type using the 'file' command
 */
function getFileType(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('file', [filePath]);
    let output = '';

    proc.stdout.on('data', (data) => {
      output += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(new Error(`file command failed with code ${code}`));
      }
    });
  });
}

/**
 * Get WOFF2 magic bytes
 */
function getWoff2Header(filePath: string): Promise<string> {
  return new Promise((resolve) => {
    const proc = spawn('xxd', ['-p', '-l', '4', filePath]);
    let output = '';

    proc.stdout.on('data', (data) => {
      output += data.toString();
    });

    proc.on('close', () => {
      resolve(output.trim());
    });

    proc.on('error', () => {
      resolve('');
    });
  });
}

/**
 * Validate a font file
 */
function validateFont(fileName: string, maxSize: number): FontValidationResult {
  const filePath = path.join(FONT_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    return { success: false, fileName, size: 0, maxSize };
  }

  const size = getFileSize(filePath);

  if (size === 0) {
    return { success: false, fileName, size, maxSize };
  }

  if (size > maxSize) {
    return { success: false, fileName, size, maxSize };
  }
  return { success: true, fileName, size, maxSize };
}

/**
 * Main validation function
 */
async function main(): Promise<void> {
  const woff2Result = validateFont(`${FONT_NAME}.woff2`, MAX_WOFF2_SIZE);
  const woffResult = validateFont(`${FONT_NAME}.woff`, MAX_WOFF_SIZE);
  const ttfResult = validateFont(`${FONT_NAME}.ttf`, MAX_TTF_SIZE);

  // Check if all validations passed
  if (!woff2Result.success || !woffResult.success || !ttfResult.success) {
    process.exit(1);
  }

  const hasFileCommand = await commandExists('file');

  if (hasFileCommand) {
    // Check TTF format
    try {
      const ttfType = await getFileType(path.join(FONT_DIR, `${FONT_NAME}.ttf`));
      if (ttfType.includes('TrueType') || ttfType.includes('OpenType')) {
      } else {
      }
    } catch (_error) {}

    // Check WOFF format
    try {
      const woffType = await getFileType(path.join(FONT_DIR, `${FONT_NAME}.woff`));
      if (woffType.includes('WOFF') || woffType.includes('Web Open Font Format')) {
      } else {
      }
    } catch (_error) {}
  } else {
  }

  // Check WOFF2 magic bytes
  const woff2Header = await getWoff2Header(path.join(FONT_DIR, `${FONT_NAME}.woff2`));
  if (woff2Header === '774f4632') {
  } else if (woff2Header) {
  } else {
  }

  // Summary
  const _totalSize = woff2Result.size + woffResult.size + ttfResult.size;
}

main().catch((error) => {
  console.error('Error during validation:', error);
  process.exit(1);
});
