/**
 * Extract YAML Frontmatter
 *
 * Extract and parse YAML frontmatter from markdown content.
 */

import { parse as parseYAML } from 'yaml';

import type { SkillFrontmatter } from './types';

/**
 * Extract YAML frontmatter from markdown
 *
 * @param markdown - Markdown content with YAML frontmatter
 * @returns Object containing parsed frontmatter and remaining content
 * @throws Error if no valid YAML frontmatter is found
 *
 * @example
 * ```typescript
 * const md = `---
 * name: typescript-tdd
 * description: TypeScript with TDD
 * ---
 * # Content here`;
 *
 * const { frontmatter, content } = extractFrontmatter(md);
 * // => { frontmatter: { name: 'typescript-tdd', ... }, content: '# Content here' }
 * ```
 */
export const extractFrontmatter = (markdown: string): { frontmatter: SkillFrontmatter; content: string } => {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    throw new Error('No YAML frontmatter found. Expected format:\n---\nname: skill-name\n...\n---');
  }

  const [, yamlContent, markdownContent] = match;
  const frontmatter = parseYAML(yamlContent) as SkillFrontmatter;

  return { frontmatter, content: markdownContent };
};
