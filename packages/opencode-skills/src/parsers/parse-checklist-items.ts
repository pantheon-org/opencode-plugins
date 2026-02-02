/**
 * Parse Checklist Items
 *
 * Extract checklist items from markdown content.
 */

/**
 * Parse checklist items from markdown content
 *
 * Extracts items in format `- [ ] Item` or `- [x] Item`
 *
 * @param content - Markdown content containing checklist
 * @returns Array of checklist item strings
 *
 * @example
 * ```typescript
 * const content = `
 * - [ ] Write tests
 * - [x] Implement feature
 * - [ ] Review code
 * `;
 *
 * const items = parseChecklistItems(content);
 * // => ['Write tests', 'Implement feature', 'Review code']
 * ```
 */
export const parseChecklistItems = (content: string): string[] => {
  const checklistRegex = /^[-*]\s+\[[ x]\]\s+(.+)$/gm;
  const items: string[] = [];
  let match: RegExpExecArray | null = checklistRegex.exec(content);

  while (match !== null) {
    items.push(match[1].trim());
    match = checklistRegex.exec(content);
  }

  return items;
};
