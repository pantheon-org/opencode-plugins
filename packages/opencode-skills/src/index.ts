/**
 * opencode-skills - TypeScript-based skill injection plugin for OpenCode
 *
 * This plugin provides automatic skill injection into chat context using smart
 * pattern matching. Skills are TypeScript-defined knowledge blocks that are
 * seamlessly injected when the user mentions them with intent.
 *
 * Key Features:
 * - Type-safe skill definitions
 * - Smart pattern matching with intent detection
 * - Automatic injection via chat.message hook
 * - No file system side effects
 * - Configurable pattern matching behavior
 *
 * @see https://github.com/pantheon-org/opencode-skills
 */

import type { Plugin } from '@opencode-ai/plugin';

import { hasIntentToUse } from './pattern-matching';
import type { Skill, SkillsPluginConfig } from './types';

/**
 * Default configuration for the skills plugin
 */
const DEFAULT_CONFIG: SkillsPluginConfig = {
  autoInject: true,
  debug: false,
  patternMatching: {
    wordBoundary: true,
    intentDetection: true,
    negationDetection: true,
  },
};

/**
 * Create the OpenCode skills plugin with the given skills and configuration
 *
 * @param skills - Record of skill name to Skill object
 * @param userConfig - Optional configuration overrides
 * @returns Plugin function for OpenCode
 *
 * @example
 * ```typescript
 * const skills = {
 *   'typescript-tdd': {
 *     name: 'typescript-tdd',
 *     description: 'TypeScript development with TDD',
 *     content: '# TypeScript TDD\n\n...',
 *   },
 * };
 *
 * export const MyPlugin = createSkillsPlugin(skills, { debug: true });
 * ```
 */
export const createSkillsPlugin = (
  skills: Record<string, Skill>,
  userConfig: Partial<SkillsPluginConfig> = {},
): Plugin => {
  const config: SkillsPluginConfig = {
    ...DEFAULT_CONFIG,
    ...userConfig,
    patternMatching: {
      ...DEFAULT_CONFIG.patternMatching,
      ...userConfig.patternMatching,
    },
  };

  return async (ctx) => {
    const skillNames = Object.keys(skills);
    const skillKeywords = new Map<string, string[]>();

    // Build keyword map for each skill
    for (const [name, skill] of Object.entries(skills)) {
      if (skill.keywords && skill.keywords.length > 0) {
        skillKeywords.set(name, skill.keywords);
      }
    }

    if (config.debug) {
      console.log(`[opencode-skills] Plugin loaded with ${skillNames.length} skills`);
      console.log('[opencode-skills] Skills:', skillNames.join(', '));
      console.log('[opencode-skills] Config:', config);
    }

    return {
      // Auto-inject skills via chat message hook
      'chat.message': async ({ sessionID }, { parts }) => {
        // Skip if auto-inject is disabled
        if (!config.autoInject) {
          return;
        }

        // Extract text content from message parts
        const textContent = parts
          .filter((p) => p.type === 'text')
          .map((p) => ('text' in p ? p.text : ''))
          .join('\n');

        // Skip empty messages
        if (!textContent.trim()) {
          return;
        }

        // Track which skills have been injected to avoid duplicates
        const injectedSkills = new Set<string>();

        // Check each skill for pattern matches
        for (const [name, skill] of Object.entries(skills)) {
          // Skip if already injected
          if (injectedSkills.has(name)) {
            continue;
          }

          // Check if skill should be injected
          const keywords = skillKeywords.get(name) || [];
          const result = hasIntentToUse(textContent, name, keywords, config.patternMatching);

          if (result.matches) {
            // Create skill content
            const skillContent = [
              '',
              '',
              `<skill name="${skill.name}">`,
              `# ${skill.description}`,
              '',
              skill.content,
              '</skill>',
            ].join('\n');

            // Inject via session prompt (noReply pattern from malhashemi example)
            try {
              await ctx.client.session.prompt({
                path: { id: sessionID },
                body: {
                  noReply: true,
                  parts: [{ type: 'text', text: skillContent }],
                },
              });

              injectedSkills.add(name);

              // Log injection for debugging/observability
              if (config.debug) {
                console.log(`[opencode-skills] Auto-injected skill "${name}" in session ${sessionID}`);
                console.log(`[opencode-skills] Matched pattern: ${result.matchedPattern}`);
              } else {
                // Always log injection (non-debug mode shows minimal info)
                console.log(`[opencode-skills] Injected skill: ${name}`);
              }
            } catch (error) {
              if (config.debug) {
                console.error(`[opencode-skills] Failed to inject skill "${name}":`, error);
              }
            }
          }
        }
      },
    };
  };
};

/**
 * Helper function to create a skill object with validation
 *
 * @param skill - Partial skill object (name and content required)
 * @returns Complete Skill object
 */
export const defineSkill = (
  skill: Pick<Skill, 'name' | 'description' | 'content'> & Partial<Omit<Skill, 'name' | 'description' | 'content'>>,
): Skill => {
  return {
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    ...skill,
  };
};

// Re-export types for convenience
export type { Skill, SkillsPluginConfig, MatchResult } from './types';
export { hasIntentToUse, findMatchingSkills } from './pattern-matching';
