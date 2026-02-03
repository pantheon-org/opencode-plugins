/**
 * Skill to Markdown Tests
 *
 * Tests for converting Skill objects to markdown format.
 */

import { describe, expect, it } from 'bun:test';
import { markdownToSkill } from './markdown-to-skill';
import { skillToMarkdown } from './skill-to-markdown';

describe('skillToMarkdown', () => {
  it('should convert skill to markdown', () => {
    const skill = {
      name: 'test-skill',
      description: 'A test skill',
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

  it('should omit optional fields when not provided', () => {
    const skill = {
      name: 'minimal-skill',
      description: 'Minimal skill',
      whatIDo: 'Do minimal things',
    };

    const markdown = skillToMarkdown(skill);

    expect(markdown).not.toContain('license:');
    expect(markdown).not.toContain('compatibility:');
    expect(markdown).not.toContain('metadata:');
  });

  it('should handle empty checklist', () => {
    const skill = {
      name: 'no-checklist-skill',
      description: 'Skill without checklist',
      whatIDo: 'Work without checklist',
      checklist: [],
    };

    const markdown = skillToMarkdown(skill);

    expect(markdown).toContain('## Checklist');
  });

  it('should handle skill with special characters in content', () => {
    const skill = {
      name: 'special-skill',
      description: 'Skill with special chars: "quotes" and \'apostrophes\'',
      whatIDo: 'Handle content with: colons, dashes - and asterisks *',
      checklist: ['Item with "quotes"', "Item with 'apostrophes'"],
    };

    const markdown = skillToMarkdown(skill);

    expect(markdown).toContain('---');
    expect(markdown).toContain('name: special-skill');
    expect(markdown).toContain('- [ ] Item with "quotes"');
  });
});
