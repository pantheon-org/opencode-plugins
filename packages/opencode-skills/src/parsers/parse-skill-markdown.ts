/**
 * Parse Skill Markdown
 *
 * Main parser to convert SKILL.md file into structured ParsedSkill object.
 */

import { extractFrontmatter } from './extract-frontmatter';
import { extractSections } from './extract-sections';
import type { ParsedSkill } from './types';

/**
 * Parse SKILL.md file and convert to ParsedSkill object
 *
 * @param markdown - Complete markdown content with YAML frontmatter
 * @returns Structured ParsedSkill with frontmatter and sections
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
 * const parsed = parseSkillMarkdown(markdown);
 * // => { frontmatter: { name: 'typescript-tdd', ... }, sections: { whatIDo: '...', ... } }
 * ```
 */
export function parseSkillMarkdown(markdown: string): ParsedSkill {
  const { frontmatter, content } = extractFrontmatter(markdown);
  const sections = extractSections(content);

  return { frontmatter, sections };
}
