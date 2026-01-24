import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import type { Logger } from '@pantheon-org/opencode-notification';

/**
 * Get the directory containing this module
 * @returns Directory path of the current module
 */
const getModuleDir = (): string => {
  // In ES modules, we use import.meta.url to get the file path
  // This works reliably regardless of CWD
  try {
    const moduleUrl = import.meta.url;
    const modulePath = fileURLToPath(moduleUrl);
    return dirname(modulePath);
  } catch {
    // Fallback to process.cwd() if import.meta.url is not available
    return process.cwd();
  }
};

/**
 * Get the plugin root directory (parent of src/)
 * @returns Plugin root directory path
 */
const getPluginRootDir = (): string => {
  const moduleDir = getModuleDir();
  // If we're in src/, go up one level to the plugin root
  if (moduleDir.endsWith('src') || moduleDir.includes(join('src', 'config'))) {
    // Go up from src/config -> src -> root OR src -> root
    let root = dirname(moduleDir);
    if (root.endsWith('src')) {
      root = dirname(root);
    }
    return root;
  }
  return moduleDir;
};

/**
 * Try to read package.json from multiple locations
 * @param debug - Enable debug logging
 * @param logger - Optional logger for debug messages (uses console if not provided)
 * @returns package name or null if not found
 *
 * @example
 * ```typescript
 * const packageName = getPackageName();
 * console.log(packageName); // '\@pantheon-org/my-plugin'
 * ```
 *
 * @example
 * ```typescript
 * // Enable debug logging
 * const packageName = getPackageName(true);
 * // Logs will show search paths and results
 * ```
 */
export const getPackageName = (debug: boolean = false, logger?: Logger): string | null => {
  const log = logger?.debug || (debug ? console.log : () => {});
  const warn = logger?.warn || (debug ? console.warn : () => {});

  // Strategy:
  // 1. Try plugin root FIRST (for production when running from OpenCode)
  // 2. Fall back to CWD (for tests and development only)
  // This ensures we always get the plugin's own package.json, not the user's project

  const locations = [
    join(getPluginRootDir(), 'package.json'), // Plugin root (production) - PRIORITY
    join(process.cwd(), 'package.json'), // CWD (tests/development) - FALLBACK
  ];

  log('[opencode-config] Looking for package.json in:', { locations });

  for (const pkgPath of locations) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
        name?: string;
      };
      if (pkg && typeof pkg.name === 'string') {
        log('[opencode-config] Found package name:', { name: pkg.name, path: pkgPath });
        return pkg.name;
      }
    } catch (err) {
      log('[opencode-config] Failed to read:', { path: pkgPath, error: err });
      // Try next location
      continue;
    }
  }

  warn('[opencode-config] Could not determine package name from any location');

  return null;
};
