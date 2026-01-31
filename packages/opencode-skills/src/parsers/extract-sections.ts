/**
 * Extract Markdown Sections
 *
 * Parse markdown content and extract structured sections by heading.
 */

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
// biome-ignore lint: Section extraction requires multiple heading pattern checks
export function extractSections(markdown: string): SkillSections {
  const sections: SkillSections = {
    whatIDo: '',
    whenToUseMe: '',
    instructions: '',
    checklist: [],
  };

  // Split by ## headings
  const headingRegex = /^##\s+(.+?)$/gm;
  const parts: Array<{ heading: string; content: string }> = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  match = headingRegex.exec(markdown);
  while (match !== null) {
    if (lastIndex > 0) {
      const previousHeading = parts[parts.length - 1];
      previousHeading.content = markdown.slice(lastIndex, match.index).trim();
    }
    parts.push({ heading: match[1].trim(), content: '' });
    lastIndex = match.index + match[0].length;
    match = headingRegex.exec(markdown);
  }

  // Get content for last heading
  if (parts.length > 0) {
    parts[parts.length - 1].content = markdown.slice(lastIndex).trim();
  }

  // Map headings to sections
  for (const part of parts) {
    const heading = part.heading.toLowerCase();

    if (heading === 'what i do') {
      sections.whatIDo = part.content;
    } else if (heading === 'when to use me') {
      sections.whenToUseMe = part.content;
    } else if (heading === 'instructions') {
      sections.instructions = part.content;
    } else if (heading === 'checklist') {
      // Parse checklist items (markdown list format)
      const checklistRegex = /^[-*]\s+\[[ x]\]\s+(.+)$/gm;
      const items: string[] = [];
      let itemMatch: RegExpExecArray | null = null;

      itemMatch = checklistRegex.exec(part.content);
      while (itemMatch !== null) {
        items.push(itemMatch[1].trim());
        itemMatch = checklistRegex.exec(part.content);
      }

      sections.checklist = items;
    }
  }

  return sections;
}
