/**
 * OpenCode Warcraft Notifications Plugin
 *
 * Plays Warcraft II sound notifications when your OpenCode AI assistant goes idle.
 * Supports both Alliance and Horde factions with configurable sound directories.
 *
 * Package: `@pantheon-org/opencode-warcraft-notifications-plugin`
 */

export { getSoundFileList, installBundledSoundsIfMissing } from './bundled-sounds.js';
// Export utility functions for advanced use cases
export { loadPluginConfig } from './config/index.js';
// Export types for user configuration
export type { Faction, WarcraftNotificationConfig } from './config/types.js';
// Export the main plugin
export { NotificationPlugin as OpencodeWarcraftNotificationsPlugin } from './notification.js';
export {
  determineSoundFaction,
  getRandomSoundPathFromFaction,
  getSoundDescription,
  soundExists,
} from './sounds/index.js';
