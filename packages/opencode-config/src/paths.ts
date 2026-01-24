import { homedir } from 'os';
import { join } from 'path';

/**
 * Get the appropriate config directory based on the operating system
 * @returns The config directory path
 *
 * @example
 * ```typescript
 * const configDir = getConfigDir();
 * // macOS: /Users/username/.config
 * // Linux: /home/username/.config (or XDG_CONFIG_HOME if set)
 * // Windows: C:\Users\username\AppData\Roaming (or APPDATA if set)
 * ```
 */
export const getConfigDir = (): string => {
  const home = homedir();

  switch (process.platform) {
    case 'darwin':
      return join(home, '.config');
    case 'win32':
      return process.env.APPDATA ?? join(home, 'AppData', 'Roaming');
    default: // Linux and other Unix-like systems
      return process.env.XDG_CONFIG_HOME ?? join(home, '.config');
  }
};

/**
 * Get the platform-specific data directory
 * @returns The data directory path
 *
 * @example
 * ```typescript
 * const dataDir = getDataDir();
 * // macOS/Linux: /Users/username/.local/share (or XDG_DATA_HOME if set)
 * // Windows: C:\Users\username\AppData\Roaming (or APPDATA if set)
 * ```
 */
export const getDataDir = (): string => {
  if (process.platform === 'win32') {
    // Use APPDATA on Windows, fallback to %USERPROFILE%/AppData/Roaming
    return process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming');
  }
  // Use XDG_DATA_HOME when available, otherwise fall back to ~/.local/share
  return process.env.XDG_DATA_HOME ?? join(homedir(), '.local', 'share');
};

/**
 * Get the OpenCode plugin storage directory for a specific plugin
 * @param pluginName - The name of the plugin (e.g., '@pantheon-org/my-plugin')
 * @param subdirectory - Optional subdirectory within the plugin storage
 * @returns The plugin storage directory path
 *
 * @example
 * ```typescript
 * const storageDir = getPluginStorageDir('@pantheon-org/my-plugin');
 * // macOS/Linux: ~/.local/share/opencode/storage/plugin/@pantheon-org/my-plugin
 * // Windows: %APPDATA%\opencode\storage\plugin\@pantheon-org\my-plugin
 * ```
 *
 * @example
 * ```typescript
 * const soundsDir = getPluginStorageDir('@pantheon-org/my-plugin', 'sounds');
 * // macOS/Linux: ~/.local/share/opencode/storage/plugin/@pantheon-org/my-plugin/sounds
 * ```
 */
export const getPluginStorageDir = (pluginName: string, subdirectory?: string): string => {
  const baseDataDir = getDataDir();
  const pluginPath = join(baseDataDir, 'opencode', 'storage', 'plugin', pluginName);

  if (subdirectory) {
    return join(pluginPath, subdirectory);
  }

  return pluginPath;
};

/**
 * Get the OpenCode configuration paths
 * Returns an array of paths where OpenCode configuration files may be located
 * @param configFileName - Name of the configuration file (default: 'plugin.json')
 * @returns Array of configuration file paths in priority order
 *
 * @example
 * ```typescript
 * const paths = getConfigPaths();
 * // [
 * //   '/current/working/directory/.opencode/plugin.json',
 * //   '/Users/username/.config/opencode/plugin.json'
 * // ]
 * ```
 *
 * @example
 * ```typescript
 * const paths = getConfigPaths('custom.json');
 * // [
 * //   '/current/working/directory/.opencode/custom.json',
 * //   '/Users/username/.config/opencode/custom.json'
 * // ]
 * ```
 */
export const getConfigPaths = (configFileName: string = 'plugin.json'): string[] => {
  return [join(process.cwd(), '.opencode', configFileName), join(getConfigDir(), 'opencode', configFileName)];
};
