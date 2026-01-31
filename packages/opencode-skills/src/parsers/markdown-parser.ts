import { parse as parseYAML, stringify as stringifyYAML } from 'yaml';

import type { Skill, SkillMetadata } from '../types';

export interface ParsedSkill {
  frontmatter: SkillFrontmatter;
  sections: SkillSections;
}

export interface SkillFrontmatter {
  name: string;
  description: string;
  license?: string;
  compatibility?: string;
  metadata?: SkillMetadata;
}

export interface SkillSections {
  whatIDo: string;
  whenToUseMe: string;
  instructions: string;
  checklist: string[];
}

/**
 * Extract YAML frontmatter from markdown
 */
const extractFrontmatter = (markdown: string): { frontmatter: SkillFrontmatter; content: string } => {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    throw new Error('No YAML frontmatter found. Expected format:\n---\nname: skill-name\n...\n---');
  }

  const [, yamlContent, markdownContent] = match;
  const frontmatter = parseYAML(yamlContent) as SkillFrontmatter;

  return { frontmatter, content: markdownContent };
};

/**
 * Parse markdown content and extract sections by heading
 */
// biome-ignore lint: Section extraction requires multiple heading pattern checks
const extractSections = (markdown: string): SkillSections => {
  const sections = {
    whatIDo: '',
    whenToUseMe: '',
    instructions: '',
    checklist: [] as string[],
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
};

/**
 * Parse SKILL.md file and convert to Skill object
 */
export const parseSkillMarkdown = (markdown: string): ParsedSkill => {
  const { frontmatter, content } = extractFrontmatter(markdown);
  const sections = extractSections(content);

  return { frontmatter, sections };
};

/**
 * Convert parsed markdown to Skill object
 */
export const markdownToSkill = (markdown: string): Skill => {
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
};

/**
 * Convert Skill object back to markdown format
 */
export const skillToMarkdown = (skill: Skill): string => {
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
};
