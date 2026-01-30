/**
 * Markdown to Skill Converter
 *
 * Convert markdown content to Skill object.
 */

import type { Skill } from '../types';
import { parseSkillMarkdown } from './parse-skill-markdown';

/**
 * Convert parsed markdown to Skill object
 *
 * @param markdown - Complete markdown content with YAML frontmatter
 * @returns Fully structured Skill object ready for use
 *
 * @example
 * ```typescript
 * const markdown = `---
 * name: typescript-tdd
 * description: TypeScript with TDD
 * ---
 *
 * ## What I do
 * I help with TypeScript development.
 * `;
 *
 * const skill = markdownToSkill(markdown);
 * // => { name: 'typescript-tdd', description: '...', whatIDo: '...', ... }
 * ```
 */
export function markdownToSkill(markdown: string): Skill {
  const { frontmatter, sections } = parseSkillMarkdown(markdown);

  return {
    name: frontmatter.name,
    description: frontmatter.description,
    license: frontmatter.license,
    compatibility: frontmatter.compatibility,
    metadata: frontmatter.metadata,
    whatIDo: sections.whatIDo,
    whenToUseMe: sections.whenToUseMe,
    instructions: sections.instructions,
    checklist: sections.checklist,
  };
}
