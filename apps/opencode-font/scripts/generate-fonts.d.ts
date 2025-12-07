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
export {};
