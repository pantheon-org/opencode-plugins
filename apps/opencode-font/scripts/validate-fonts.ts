#!/usr/bin/env bun

/**
 * Font Validation Script
 *
 * Validates generated font files for correctness and size constraints.
 *
 * Usage:
 *   bun run scripts/validate-fonts.ts
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

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
    console.log(`❌ ${fileName} missing: ${filePath}`);
    return { success: false, fileName, size: 0, maxSize };
  }

  const size = getFileSize(filePath);

  if (size === 0) {
    console.log(`❌ ${fileName} is empty`);
    return { success: false, fileName, size, maxSize };
  }

  if (size > maxSize) {
    console.log(`⚠️  ${fileName} size (${size} bytes) exceeds limit (${maxSize} bytes)`);
    return { success: false, fileName, size, maxSize };
  }

  console.log(`✅ ${fileName}: ${size} bytes (under ${Math.floor(maxSize / 1024)}KB limit)`);
  return { success: true, fileName, size, maxSize };
}

/**
 * Main validation function
 */
async function main(): Promise<void> {
  console.log('🔍 Validating generated fonts...\n');

  // Validate WOFF2
  console.log('Checking WOFF2...');
  const woff2Result = validateFont(`${FONT_NAME}.woff2`, MAX_WOFF2_SIZE);
  console.log('');

  // Validate WOFF
  console.log('Checking WOFF...');
  const woffResult = validateFont(`${FONT_NAME}.woff`, MAX_WOFF_SIZE);
  console.log('');

  // Validate TTF
  console.log('Checking TTF...');
  const ttfResult = validateFont(`${FONT_NAME}.ttf`, MAX_TTF_SIZE);
  console.log('');

  // Check if all validations passed
  if (!woff2Result.success || !woffResult.success || !ttfResult.success) {
    process.exit(1);
  }

  // Verify file formats
  console.log('Verifying file formats...\n');

  const hasFileCommand = await commandExists('file');

  if (hasFileCommand) {
    // Check TTF format
    try {
      const ttfType = await getFileType(path.join(FONT_DIR, `${FONT_NAME}.ttf`));
      if (ttfType.includes('TrueType') || ttfType.includes('OpenType')) {
        console.log('✅ TTF format verified');
      } else {
        console.log('⚠️  Warning: TTF file may not be valid TrueType format');
        console.log(`   File type: ${ttfType}`);
      }
    } catch (error) {
      console.log('⚠️  Could not verify TTF format');
    }

    // Check WOFF format
    try {
      const woffType = await getFileType(path.join(FONT_DIR, `${FONT_NAME}.woff`));
      if (woffType.includes('WOFF') || woffType.includes('Web Open Font Format')) {
        console.log('✅ WOFF format verified');
      } else {
        console.log('⚠️  Warning: WOFF file may not be recognized');
        console.log(`   File type: ${woffType}`);
      }
    } catch (error) {
      console.log('⚠️  Could not verify WOFF format');
    }
  } else {
    console.log("⚠️  'file' command not available, skipping format verification");
  }

  // Check WOFF2 magic bytes
  const woff2Header = await getWoff2Header(path.join(FONT_DIR, `${FONT_NAME}.woff2`));
  if (woff2Header === '774f4632') {
    console.log('✅ WOFF2 magic bytes verified (wOF2)');
  } else if (woff2Header) {
    console.log(`⚠️  Warning: WOFF2 magic bytes incorrect (expected 774f4632, got ${woff2Header})`);
  } else {
    console.log('⚠️  Could not verify WOFF2 magic bytes (xxd not available)');
  }

  // Summary
  const totalSize = woff2Result.size + woffResult.size + ttfResult.size;
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ All fonts validated successfully');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📊 Total size: ${Math.floor(totalSize / 1024)} KB\n`);
}

main().catch((error) => {
  console.error('Error during validation:', error);
  process.exit(1);
});
