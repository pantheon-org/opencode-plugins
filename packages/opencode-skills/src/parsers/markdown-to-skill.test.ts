/**
 * Markdown to Skill Tests
 *
 * Tests for converting markdown content to Skill objects.
 */

import { describe, expect, it } from 'bun:test';
import { markdownToSkill } from './markdown-to-skill';

describe('markdownToSkill', () => {
  it('should convert markdown to skill object', () => {
    const markdown = `---
name: converted-skill
description: Converted from markdown
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

    const skill = markdownToSkill(markdown);

    expect(skill.name).toBe('full-skill');
    expect(skill.description).toBe('Full skill test');
    expect(skill.whatIDo).toBe('Core capabilities');
    expect(skill.whenToUseMe).toBe('Use cases');
    expect(skill.instructions).toBe('Follow these steps');
    expect(skill.checklist).toEqual(['Step 1', 'Step 2']);
  });

  it('should set default compatibility to opencode', () => {
    const markdown = `---
name: test-skill
description: Test description
---

## What I do
Test content
`;

    const skill = markdownToSkill(markdown);

    expect(skill.compatibility).toBe('opencode');
  });

  it('should set timestamp on conversion', () => {
    const markdown = `---
name: test-skill
description: Test description
---

## What I do
Test content
`;

    const before = new Date().toISOString();
    const skill = markdownToSkill(markdown);
    const after = new Date().toISOString();

    expect(skill.updatedAt).toBeDefined();
    expect(skill.updatedAt! >= before).toBe(true);
    expect(skill.updatedAt! <= after).toBe(true);
  });

  it('should throw error for markdown without frontmatter', () => {
    const markdown = `## What I do
Just content here`;

    expect(() => markdownToSkill(markdown)).toThrow('No YAML frontmatter found');
  });
});
