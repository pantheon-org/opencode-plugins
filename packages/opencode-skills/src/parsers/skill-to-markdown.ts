/**
 * Skill to Markdown Converter
 *
 * Convert Skill object back to markdown format.
 */

import { stringify as stringifyYAML } from 'yaml';

import type { Skill } from '../types';

/**
 * Convert Skill object back to markdown format
 *
 * @param skill - Skill object to convert
 * @returns Markdown string with YAML frontmatter
 *
 * @example
 * ```typescript
 * const skill = {
 *   name: 'typescript-tdd',
 *   description: 'TypeScript with TDD',
 *   whatIDo: 'I help with TypeScript development.',
 *   checklist: ['Write tests', 'Implement feature'],
 * };
 *
 * const markdown = skillToMarkdown(skill);
 * // Returns:
 * // ---
 * // name: typescript-tdd
 * // description: TypeScript with TDD
 * // ---
 * //
 * // # typescript-tdd
 * //
 * // ## What I do
 * // I help with TypeScript development.
 * // ...
 * ```
 */
export function skillToMarkdown(skill: Skill): string {
  const frontmatter = {
    name: skill.name,
    description: skill.description,
    ...(skill.license && { license: skill.license }),
    ...(skill.compatibility && { compatibility: skill.compatibility }),
    ...(skill.metadata && { metadata: skill.metadata }),
  };

  const yamlFrontmatter = stringifyYAML(frontmatter);

  const content = `
# ${skill.name}

## What I do
${skill.whatIDo || ''}

## When to use me
${skill.whenToUseMe || ''}

## Instructions
${skill.instructions || ''}

## Checklist
${skill.checklist?.map((item) => `- [ ] ${item}`).join('\n') || ''}
  `.trim();

  return `---\n${yamlFrontmatter}---\n\n${content}`;
}
