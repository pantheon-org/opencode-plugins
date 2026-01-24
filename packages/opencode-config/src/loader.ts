import { access } from 'fs/promises';

import type { Logger } from '@pantheon-org/opencode-notification';

import { getConfigPaths } from './paths.js';
import type { PluginConfig } from './types.js';

/**
 * Options for loading plugin configuration
 */
export interface LoadConfigOptions<T> {
  /** Name of the plugin to load configuration for */
  pluginName: string;
  /** Configuration file name (default: 'plugin.json') */
  configFileName?: string;
  /** Optional validator function for plugin-specific config */
  validator?: (config: unknown) => T;
  /** Default configuration to return if no config file is found */
  defaultConfig?: T;
  /** Enable debug logging */
  debug?: boolean;
  /** Optional logger for debug messages (uses console if not provided) */
  logger?: Logger;
}

/**
 * Attempt to load and validate configuration from a specific file
 */
const tryLoadFromPath = async <T>(
  configPath: string,
  pluginName: string,
  validator?: (config: unknown) => T,
  debug?: boolean,
  logger?: Logger,
): Promise<T | null> => {
  const log = logger?.debug || (debug ? console.log : () => {});

  log('[opencode-config] Checking configuration path:', { configPath });

  try {
    await access(configPath);
  } catch {
    log('[opencode-config] Configuration file not found:', { configPath });
    return null;
  }

  log('[opencode-config] Configuration file found:', { configPath });

  const configFile = Bun.file(configPath);
  const configData: PluginConfig = await configFile.json();

  if (!configData[pluginName]) {
    log('[opencode-config] Configuration file exists but does not contain plugin configuration:', {
      configPath,
      pluginName,
    });
    return null;
  }

  log('[opencode-config] Loading plugin configuration:', { configPath, pluginName });

  const rawConfig = configData[pluginName];

  // Apply validator if provided
  if (validator) {
    try {
      const validatedConfig = validator(rawConfig);
      log('[opencode-config] Configuration loaded and validated successfully:', {
        configPath,
        pluginName,
        config: validatedConfig,
      });
      return validatedConfig;
    } catch (validationError) {
      // Re-throw validation errors with context about the config file location
      if (validationError instanceof Error) {
        throw new Error(`${validationError.message}\n  Configuration file: ${configPath}`);
      }
      throw validationError;
    }
  }

  // Return raw config if no validator
  log('[opencode-config] Configuration loaded successfully (no validation):', {
    configPath,
    pluginName,
  });
  return rawConfig as T;
};

/**
 * Load plugin configuration from plugin.json files
 *
 * Looks for configuration in:
 * 1. CWD/.opencode/plugin.json (or custom config file)
 * 2. ~/.config/opencode/plugin.json (or custom config file)
 *
 * Configuration can optionally be validated with a custom validator function.
 *
 * @param options - Configuration loading options
 * @returns Plugin configuration object (validated if validator provided)
 * @throws Error If configuration validation fails
 *
 * @example
 * ```typescript
 * // Load configuration with defaults (no validation)
 * const config = await loadPluginConfig({
 *   pluginName: 'my-plugin',
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Load configuration with validation
 * const config = await loadPluginConfig({
 *   pluginName: 'my-plugin',
 *   validator: (raw) => {
 *     // Validate and transform config
 *     if (typeof raw !== 'object') throw new Error('Config must be object');
 *     return raw as MyPluginConfig;
 *   },
 *   defaultConfig: { enabled: true },
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Load from custom config file with debug logging
 * const config = await loadPluginConfig({
 *   pluginName: 'my-plugin',
 *   configFileName: 'custom-config.json',
 *   debug: true,
 * });
 * ```
 */
export const loadPluginConfig = async <T = unknown>(options: LoadConfigOptions<T>): Promise<T> => {
  const { pluginName, configFileName = 'plugin.json', validator, defaultConfig, debug = false, logger } = options;

  const log = logger?.debug || (debug ? console.log : () => {});
  const warn = logger?.warn || (debug ? console.warn : () => {});

  log('[opencode-config] Starting configuration discovery:', { pluginName, configFileName });

  const configPaths = getConfigPaths(configFileName);

  log('[opencode-config] Configuration search paths:', { configPaths });

  for (const configPath of configPaths) {
    try {
      const config = await tryLoadFromPath(configPath, pluginName, validator, debug, logger);
      if (config !== null) {
        return config;
      }
    } catch (error: unknown) {
      // For validation errors, re-throw to notify the user immediately
      if (error instanceof Error && error.message.includes('Configuration validation failed')) {
        throw error;
      }

      // Only warn for other errors when explicit debug flag is set
      if (debug || logger) {
        warn(`[opencode-config] Failed to load plugin config from ${configPath}`, { error });
      }
    }
  }

  log('[opencode-config] No configuration found, using default:', { pluginName, defaultConfig });

  // Return default config if provided, otherwise return empty object
  if (defaultConfig !== undefined) {
    return defaultConfig;
  }

  // If validator is provided, use it with empty config
  if (validator) {
    return validator({});
  }

  return {} as T;
};
