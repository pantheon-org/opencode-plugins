/**
 * Event handlers for the Snyk plugin
 */

import type { PluginInput } from '@opencode-ai/plugin';
import { createLogger } from '@pantheon-org/opencode-core';

const log = createLogger({ plugin: 'snyk' });

const DEPENDENCY_FILES = [
  'package.json',
  'package-lock.json',
  'yarn.lock',
  'requirements.txt',
  'Pipfile',
  'Pipfile.lock',
  'pom.xml',
  'build.gradle',
  'Gemfile',
  'Gemfile.lock',
  'go.mod',
  'go.sum',
];

const isDependencyManifestFile = (filePath: string): boolean => {
  return DEPENDENCY_FILES.some((file) => filePath?.endsWith(file));
};

const handleFileEditedEvent = (event: any, config: any): void => {
  if (!config.fileChanges) return;

  const filePath = event.path;
  if (isDependencyManifestFile(filePath)) {
    log.info('Dependency manifest file changed', {
      path: filePath,
      note: 'Consider running snyk_query_issues to scan for security vulnerabilities',
    });
  }
};

const handleSessionEvents = (event: any, config: any, ctx: any): void => {
  if (!config.sessionLifecycle) return;

  if (event.type === 'session.created') {
    log.info('New OpenCode session started', {
      sessionID: event.sessionID,
      project: ctx.project.worktree,
    });
  } else if (event.type === 'session.idle') {
    log.debug('OpenCode session became idle', {
      sessionID: event.sessionID,
    });
  } else if (event.type === 'session.error') {
    log.error('OpenCode session error', {
      sessionID: event.sessionID,
      error: event.error,
    });
  }
};

/**
 * Main event handler for the Snyk plugin
 */
export const handlePluginEvent = async (ctx: PluginInput, event: any): Promise<void> => {
  const config = (ctx.client.config as any)?.snyk?.events || { enabled: true };
  if (!config.enabled) return;

  log.debug('OpenCode event received', {
    type: event.type,
    plugin: 'snyk',
  });

  if (event.type === 'file.edited') {
    handleFileEditedEvent(event, config);
  } else if (event.type.startsWith('session.')) {
    handleSessionEvents(event, config, ctx);
  }
};
