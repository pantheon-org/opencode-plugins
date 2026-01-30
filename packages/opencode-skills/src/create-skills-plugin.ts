/**
 * Create Skills Plugin Factory
 *
 * Factory function to create an OpenCode plugin with skill injection capabilities.
 * Provides automatic skill injection into chat context using smart pattern matching
 * and BM25-based relevance ranking.
 */

import type { Plugin } from '@opencode-ai/plugin';

import { type BM25Index, buildBM25Index, getTopSkillsByBM25 } from './bm25/index';
import { hasIntentToUse } from './pattern-matching/index';
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
  bm25: {
    enabled: false,
    k1: 1.5,
    b: 0.75,
    threshold: 0.0,
    maxSkills: 3,
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
export function createSkillsPlugin(
  skills: Record<string, Skill>,
  userConfig: Partial<SkillsPluginConfig> = {},
): Plugin {
  const config: SkillsPluginConfig = {
    ...DEFAULT_CONFIG,
    ...userConfig,
    patternMatching: {
      ...DEFAULT_CONFIG.patternMatching,
      ...userConfig.patternMatching,
    },
    bm25: {
      ...DEFAULT_CONFIG.bm25,
      ...userConfig.bm25,
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

    // Build BM25 index if enabled
    let bm25Index: BM25Index | null = null;
    if (config.bm25?.enabled) {
      const skillsMap = new Map<string, string>();
      for (const [name, skill] of Object.entries(skills)) {
        // Combine all skill content for BM25 indexing
        const content =
          skill.content || [skill.whatIDo, skill.whenToUseMe, skill.instructions].filter(Boolean).join(' ');
        skillsMap.set(name, `${skill.description} ${content}`);
      }
      bm25Index = buildBM25Index(skillsMap);

      if (config.debug) {
        console.log('[opencode-skills] BM25 index built with', bm25Index.totalDocs, 'skills');
      }
    }

    if (config.debug) {
      console.log(`[opencode-skills] Plugin loaded with ${skillNames.length} skills`);
      console.log('[opencode-skills] Skills:', skillNames.join(', '));
      console.log('[opencode-skills] Config:', config);
    }

    return {
      // Auto-inject skills via chat message hook
      // eslint-disable-next-line complexity, max-statements
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

        // Determine which skills to inject based on mode
        const skillsToInject: string[] = [];

        if (config.bm25?.enabled && bm25Index) {
          // BM25 mode: Rank skills by relevance
          const maxSkills = config.bm25.maxSkills ?? 3;
          const candidates = getTopSkillsByBM25(textContent, skillNames, bm25Index, maxSkills, config.bm25);

          if (config.debug) {
            console.log(`[opencode-skills] BM25 top ${maxSkills} candidates:`, candidates);
          }

          // Filter candidates through pattern matching for negation detection
          for (const name of candidates) {
            const keywords = skillKeywords.get(name) || [];
            const result = hasIntentToUse(textContent, name, keywords, config.patternMatching);

            // Only inject if not negated
            if (!result.hasNegation) {
              skillsToInject.push(name);
            } else if (config.debug) {
              console.log(`[opencode-skills] Skipping skill "${name}" due to negation`);
            }
          }
        } else {
          // Pattern matching mode: Check each skill
          for (const name of skillNames) {
            const keywords = skillKeywords.get(name) || [];
            const result = hasIntentToUse(textContent, name, keywords, config.patternMatching);

            if (result.matches) {
              skillsToInject.push(name);
            }
          }
        }

        // Inject selected skills
        for (const name of skillsToInject) {
          // Skip if already injected
          if (injectedSkills.has(name)) {
            continue;
          }

          const skill = skills[name];
          if (!skill) continue;

          // Create skill content from structured fields or legacy content
          const content =
            skill.content ||
            [
              `## What I do`,
              skill.whatIDo || '',
              '',
              `## When to use me`,
              skill.whenToUseMe || '',
              '',
              `## Instructions`,
              skill.instructions || '',
              '',
              `## Checklist`,
              ...(skill.checklist?.map((item) => `- [ ] ${item}`) || []),
            ].join('\n');

          // Create skill content
          const skillContent = [
            '',
            '',
            `<skill name="${skill.name}">`,
            `# ${skill.description}`,
            '',
            content,
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
      },
    };
  };
}
