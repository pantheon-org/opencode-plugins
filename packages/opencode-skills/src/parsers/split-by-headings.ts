/**
 * Split Markdown by Headings
 *
 * Parse markdown and split into heading/content pairs.
 */

interface HeadingPart {
  heading: string;
  content: string;
}

/**
 * Split markdown content by ## headings
 *
 * @param markdown - Markdown content to parse
 * @returns Array of heading/content pairs
 *
 * @example
 * ```typescript
 * const content = `
 * ## What I do
 * Content here
 * ## Checklist
 * - Item 1
 * `;
 *
 * const parts = splitByHeadings(content);
 * // => [{ heading: 'What I do', content: 'Content here' }, ...]
 * ```
 */
export const splitByHeadings = (markdown: string): HeadingPart[] => {
  const headingRegex = /^##\s+(.+?)$/gm;
  const parts: HeadingPart[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null = headingRegex.exec(markdown);

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

  return parts;
};
