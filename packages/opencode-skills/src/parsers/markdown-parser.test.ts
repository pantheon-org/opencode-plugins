/**
 * Parser Module Tests
 *
 * Tests for the markdown parser modules.
 */

import { describe, expect, it } from 'bun:test';
import { markdownToSkill } from './markdown-to-skill';
import { parseSkillMarkdown } from './parse-skill-markdown';
import { skillToMarkdown } from './skill-to-markdown';

describe('parseSkillMarkdown', () => {
  it('should parse skill from markdown with frontmatter', () => {
    const markdown = `---
name: test-skill
description: A test skill
version: 1.0.0
license: MIT
---

## What I do
Test the parser

## Checklist
- [ ] Item 1
- [ ] Item 2
`;

    const result = parseSkillMarkdown(markdown);

    expect(result.frontmatter.name).toBe('test-skill');
    expect(result.frontmatter.description).toBe('A test skill');
    expect(result.sections.whatIDo).toBe('Test the parser');
    expect(result.sections.checklist).toEqual(['Item 1', 'Item 2']);
  });

  it('should handle markdown without frontmatter', () => {
    const markdown = `## What I do
Just content here`;

    expect(() => parseSkillMarkdown(markdown)).toThrow('No YAML frontmatter found');
  });

  it('should parse all standard sections', () => {
    const markdown = `---
name: full-skill
description: Full skill test
---

## What I do
Core capabilities

## When to use me
Use cases

## Instructions
Follow these steps

## Checklist
- [ ] Step 1
- [ ] Step 2
`;

    const result = parseSkillMarkdown(markdown);

    expect(result.sections.whatIDo).toBe('Core capabilities');
    expect(result.sections.whenToUseMe).toBe('Use cases');
    expect(result.sections.instructions).toBe('Follow these steps');
    expect(result.sections.checklist).toEqual(['Step 1', 'Step 2']);
  });
});

describe('markdownToSkill', () => {
  it('should convert markdown to skill object', () => {
    const markdown = `---
name: converted-skill
description: Converted from markdown
version: 2.0.0
license: Apache-2.0
metadata:
  category: testing
---

## What I do
Conversion test

## Checklist
- [ ] Test conversion
`;

    const skill = markdownToSkill(markdown);

    expect(skill.name).toBe('converted-skill');
    expect(skill.description).toBe('Converted from markdown');
    expect(skill.version).toBe('2.0.0');
    expect(skill.license).toBe('Apache-2.0');
    expect(skill.metadata?.category).toBe('testing');
    expect(skill.whatIDo).toBe('Conversion test');
    expect(skill.checklist).toEqual(['Test conversion']);
  });

  it('should handle minimal skill markdown', () => {
    const markdown = `---
name: minimal
description: Minimal skill
---

## What I do
Minimal content
`;

    const skill = markdownToSkill(markdown);

    expect(skill.name).toBe('minimal');
    expect(skill.description).toBe('Minimal skill');
    expect(skill.whatIDo).toBe('Minimal content');
    expect(skill.checklist).toEqual([]);
  });
});

describe('skillToMarkdown', () => {
  it('should convert skill to markdown', () => {
    const skill = {
      name: 'test-skill',
      description: 'A test skill',
      version: '1.0.0',
      whatIDo: 'Test functionality',
      whenToUseMe: 'When testing',
      instructions: 'Run tests',
      checklist: ['Setup', 'Execute', 'Verify'],
      license: 'MIT',
      compatibility: 'opencode',
    };

    const markdown = skillToMarkdown(skill);

    expect(markdown).toContain('---');
    expect(markdown).toContain('name: test-skill');
    expect(markdown).toContain('description: A test skill');
    expect(markdown).toContain('## What I do');
    expect(markdown).toContain('Test functionality');
    expect(markdown).toContain('- [ ] Setup');
  });

  it('should handle skill with metadata', () => {
    const skill = {
      name: 'meta-skill',
      description: 'Skill with metadata',
      whatIDo: 'Testing',
      metadata: {
        category: 'testing',
        author: 'test-author',
      },
    };

    const markdown = skillToMarkdown(skill);

    expect(markdown).toContain('metadata:');
    expect(markdown).toContain('category: testing');
  });

  it('should produce round-trip compatible markdown', () => {
    const originalSkill = {
      name: 'round-trip-skill',
      description: 'Round trip test',
      version: '1.0.0',
      whatIDo: 'Test round trip',
      whenToUseMe: 'Use for testing',
      instructions: 'Follow steps',
      checklist: ['Step 1', 'Step 2'],
      license: 'MIT',
    };

    const markdown = skillToMarkdown(originalSkill);
    const parsedSkill = markdownToSkill(markdown);

    expect(parsedSkill.name).toBe(originalSkill.name);
    expect(parsedSkill.description).toBe(originalSkill.description);
    expect(parsedSkill.whatIDo).toBe(originalSkill.whatIDo);
    expect(parsedSkill.checklist).toEqual(originalSkill.checklist);
  });
});
