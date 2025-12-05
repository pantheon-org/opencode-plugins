#!/usr/bin/env bun

/**
 * Font Generation Script for OpenCodeLogo
 *
 * Converts alphabet module glyphs to web fonts (WOFF2, WOFF, TTF)
 * Uses src/alphabet as the SINGLE SOURCE OF TRUTH for glyph definitions
 * Output: fonts/*.{woff2,woff,ttf}
 *
 * IMPORTANT: This script imports glyphs from src/alphabet/index.ts
 * Do NOT maintain duplicate glyph definitions here. The alphabet module
 * is the authoritative source for all character glyphs (A-Z and symbols).
 *
 * Flow:
 *   1. Import ALPHABET and SYMBOLS from src/alphabet
 *   2. Generate SVG files for each glyph (supports variable width 1-5 columns)
 *   3. Convert to SVG font → TTF → WOFF2/WOFF
 *   4. Output fonts to fonts/ directory
 *
 * Usage:
 *   bun run scripts/generate-fonts.ts
 *   bun run generate:fonts
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { SVGIcons2SVGFontStream } from 'svgicons2svgfont';
import svg2ttf from 'svg2ttf';
import ttf2woff from 'ttf2woff';
import ttf2woff2 from 'ttf2woff2';

// Import alphabet module as single source of truth
import { ALPHABET, SYMBOLS, type Glyph } from '../src/alphabet/index';

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  fontName: 'OpenCodeLogo',
  fontHeight: 1000, // Standard font units
  descent: 200, // Below baseline
  normalize: true,
  outputDir: 'fonts',
  tempDir: 'fonts/.temp-glyphs',
  blockSize: 100, // SVG units per grid cell
};

// ============================================================================
// Glyph Mapping (using alphabet module as single source of truth)
// Maps character names to their Unicode codepoints for font generation
// ============================================================================

// Unicode mappings for letters (A=65, B=66, etc.)
const LETTER_UNICODE_MAP: Record<string, number> = {
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
};

// Unicode mappings for symbols
const SYMBOL_UNICODE_MAP: Record<string, number> = {
  '-': 45,
  '|': 124,
  "'": 39,
  '"': 34,
  '?': 63,
  '!': 33,
};

// Build combined glyph map from alphabet module
const GLYPHS: Record<string, { glyph: Glyph; unicode: number }> = {};

// Add all letters from ALPHABET
for (const [letter, glyph] of Object.entries(ALPHABET)) {
  GLYPHS[letter] = {
    glyph,
    unicode: LETTER_UNICODE_MAP[letter],
  };
}

// Add all symbols from SYMBOLS
for (const [symbol, glyph] of Object.entries(SYMBOLS)) {
  GLYPHS[symbol] = {
    glyph,
    unicode: SYMBOL_UNICODE_MAP[symbol],
  };
}

console.log(`📖 Loaded ${Object.keys(GLYPHS).length} glyphs from alphabet module`);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert a grid-based glyph (7 rows × variable columns) to SVG path
 * Handles variable-width characters from alphabet module (1-5 columns)
 */
function gridToSVGPath(rows: Record<number, number[]>): string {
  const paths: string[] = [];
  const blockSize = CONFIG.blockSize;

  for (let row = 0; row < 7; row++) {
    const columns = rows[row] || [];
    for (let col = 0; col < columns.length; col++) {
      if (columns[col] === 1) {
        const x = col * blockSize;
        const y = row * blockSize;
        // Create a rectangle path for each filled cell
        paths.push(
          `M${x},${y} L${x + blockSize},${y} L${x + blockSize},${y + blockSize} L${x},${y + blockSize} Z`,
        );
      }
    }
  }

  return paths.join(' ');
}

/**
 * Generate individual SVG files for each glyph
 * Handles variable-width characters (1-5 columns) from alphabet module
 */
function generateGlyphSVGs(): void {
  console.log('📐 Generating SVG glyphs from alphabet module...');

  if (!existsSync(CONFIG.tempDir)) {
    mkdirSync(CONFIG.tempDir, { recursive: true });
  }

  let count = 0;
  for (const [char, { glyph }] of Object.entries(GLYPHS)) {
    const svgPath = gridToSVGPath(glyph.rows);

    // Calculate width based on actual glyph columns (variable width support)
    const maxCols = Math.max(...Object.values(glyph.rows).map((row) => row.length));
    const width = maxCols * CONFIG.blockSize;
    const height = 7 * CONFIG.blockSize; // 7 rows (standard)

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <path d="${svgPath}" fill="#000000"/>
</svg>`;

    writeFileSync(join(CONFIG.tempDir, `${char}.svg`), svg);
    count++;
  }

  console.log(`✅ Generated ${count} SVG glyphs from alphabet module`);
}

/**
 * Generate SVG font from individual SVG glyph files
 */
async function generateSVGFont(): Promise<string> {
  console.log('🔤 Creating SVG font...');

  return new Promise((resolve, reject) => {
    const fontStream = new SVGIcons2SVGFontStream({
      fontName: CONFIG.fontName,
      fontHeight: CONFIG.fontHeight,
      descent: CONFIG.descent,
      normalize: CONFIG.normalize,
    });

    let svgFont = '';

    fontStream.on('data', (chunk: Buffer) => {
      svgFont += chunk.toString();
    });

    fontStream.on('finish', () => {
      console.log(`✅ SVG font created with ${Object.keys(GLYPHS).length} glyphs`);
      resolve(svgFont);
    });

    fontStream.on('error', (err: Error) => {
      reject(err);
    });

    // Add each glyph to the font
    for (const [char, { unicode }] of Object.entries(GLYPHS)) {
      const glyphPath = join(CONFIG.tempDir, `${char}.svg`);
      const glyphStream = new Readable();

      glyphStream.push(readFileSync(glyphPath));
      glyphStream.push(null);

      // @ts-expect-error - metadata property exists but not in types
      glyphStream.metadata = {
        unicode: [String.fromCharCode(unicode)],
        name: `glyph-${char}`,
      };

      fontStream.write(glyphStream);
    }

    fontStream.end();
  });
}

/**
 * Convert SVG font to TTF
 */
function generateTTF(svgFont: string): Buffer {
  console.log('🔨 Converting SVG font to TTF...');

  const ttf = svg2ttf(svgFont, {
    copyright: 'OpenCode Logo Font',
    description: 'Custom blocky font for OpenCode branding',
    url: 'https://opencode.ai',
  });

  console.log('✅ TTF generated');
  return Buffer.from(ttf.buffer);
}

/**
 * Convert TTF to WOFF2 (primary web format)
 */
function generateWOFF2(ttfBuffer: Buffer): Buffer {
  console.log('📦 Compressing to WOFF2...');

  const woff2Buffer = ttf2woff2(ttfBuffer);
  const compressionRatio = (
    ((ttfBuffer.length - woff2Buffer.length) / ttfBuffer.length) *
    100
  ).toFixed(1);

  console.log(`✅ WOFF2 generated (${compressionRatio}% compression)`);
  return woff2Buffer;
}

/**
 * Convert TTF to WOFF (fallback web format)
 */
function generateWOFF(ttfBuffer: Buffer): Buffer {
  console.log('📦 Compressing to WOFF...');

  const woffBuffer = Buffer.from(ttf2woff(ttfBuffer).buffer);
  const compressionRatio = (
    ((ttfBuffer.length - woffBuffer.length) / ttfBuffer.length) *
    100
  ).toFixed(1);

  console.log(`✅ WOFF generated (${compressionRatio}% compression)`);
  return woffBuffer;
}

/**
 * Save font files to output directory
 */
function saveFonts(ttf: Buffer, woff2: Buffer, woff: Buffer): void {
  console.log('💾 Saving font files...');

  if (!existsSync(CONFIG.outputDir)) {
    mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  writeFileSync(join(CONFIG.outputDir, `${CONFIG.fontName}.ttf`), ttf);
  writeFileSync(join(CONFIG.outputDir, `${CONFIG.fontName}.woff2`), woff2);
  writeFileSync(join(CONFIG.outputDir, `${CONFIG.fontName}.woff`), woff);

  // Log file sizes
  console.log(`  TTF:   ${(ttf.length / 1024).toFixed(2)} KB`);
  console.log(`  WOFF2: ${(woff2.length / 1024).toFixed(2)} KB`);
  console.log(`  WOFF:  ${(woff.length / 1024).toFixed(2)} KB`);
}

/**
 * Clean up temporary files
 */
function cleanup(): void {
  console.log('🧹 Cleaning up temporary files...');

  if (existsSync(CONFIG.tempDir)) {
    const { rmSync } = require('node:fs');
    rmSync(CONFIG.tempDir, { recursive: true, force: true });
  }

  console.log('✅ Cleanup complete');
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('🚀 Starting font generation...\n');

  const startTime = Date.now();

  try {
    // Step 1: Generate individual SVG files from grids
    generateGlyphSVGs();

    // Step 2: Create SVG font from SVGs
    const svgFont = await generateSVGFont();

    // Step 3: Convert SVG → TTF
    const ttfBuffer = generateTTF(svgFont);

    // Step 4: Convert TTF → WOFF2/WOFF
    const woff2Buffer = generateWOFF2(ttfBuffer);
    const woffBuffer = generateWOFF(ttfBuffer);

    // Step 5: Save all formats
    saveFonts(ttfBuffer, woff2Buffer, woffBuffer);

    // Step 6: Clean up temporary files
    cleanup();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n✅ Font generation complete!');
    console.log(`📁 Output directory: ${CONFIG.outputDir}/`);
    console.log(`⏱️  Total time: ${duration}s`);
  } catch (error) {
    console.error('❌ Font generation failed:', error);
    cleanup(); // Try to clean up even on failure
    process.exit(1);
  }
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  cleanup();
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  cleanup();
  process.exit(1);
});

// Run if executed directly (Bun-specific check)
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  main();
}
