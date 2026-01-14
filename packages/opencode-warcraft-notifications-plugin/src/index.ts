/**
 * OpenCode Warcraft Notifications Plugin
 *
 * Plays Warcraft II sound notifications when your OpenCode AI assistant goes idle.
 * Supports both Alliance and Horde factions with configurable sound directories.
 *
 * Package: `@pantheon-org/opencode-warcraft-notifications-plugin`
 */

// Export the main plugin
export { NotificationPlugin as OpencodeWarcraftNotificationsPlugin } from './notification.js';

// Export types for user configuration
export type { WarcraftNotificationConfig, Faction } from './config/types.js';

// Export utility functions for advanced use cases
export { loadPluginConfig } from './config/index.js';
export { installBundledSoundsIfMissing, getSoundFileList } from './bundled-sounds.js';
export {
  getRandomSoundPathFromFaction,
  soundExists,
  determineSoundFaction,
  getSoundDescription,
} from './sounds/index.js';
