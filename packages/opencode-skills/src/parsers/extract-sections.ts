/**
 * Extract Markdown Sections
 *
 * Parse markdown content and extract structured sections by heading.
 */

import { parseChecklistItems } from './parse-checklist-items';
import { splitByHeadings } from './split-by-headings';
import type { SkillSections } from './types';

/**
 * Parse markdown content and extract sections by heading
 *
 * Extracts the following sections from markdown:
 * - ## What I do
 * - ## When to use me
 * - ## Instructions
 * - ## Checklist
 *
 * @param markdown - Markdown content to parse
 * @returns Structured sections object
 *
 * @example
 * ```typescript
 * const content = `
 * ## What I do
 * I help with TypeScript development.
 *
 * ## Checklist
 * - [ ] Write tests
 * - [ ] Implement feature
 * `;
 *
 * const sections = extractSections(content);
 * // => { whatIDo: 'I help...', checklist: ['Write tests', 'Implement feature'], ... }
 * ```
 */
export const extractSections = (markdown: string): SkillSections => {
  const sections: SkillSections = {
    whatIDo: '',
    whenToUseMe: '',
    instructions: '',
    checklist: [],
  };

  const parts = splitByHeadings(markdown);

  for (const part of parts) {
    const heading = part.heading.toLowerCase();

    if (heading === 'what i do') {
      sections.whatIDo = part.content;
    } else if (heading === 'when to use me') {
      sections.whenToUseMe = part.content;
    } else if (heading === 'instructions') {
      sections.instructions = part.content;
    } else if (heading === 'checklist') {
      sections.checklist = parseChecklistItems(part.content);
    }
  }

  return sections;
};
