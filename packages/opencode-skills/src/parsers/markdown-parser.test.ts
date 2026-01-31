import { describe, expect, it } from 'bun:test';

import { markdownToSkill, parseSkillMarkdown, skillToMarkdown } from './markdown-parser';

describe('parseSkillMarkdown', () => {
  it('should parse valid SKILL.md with frontmatter', () => {
    const markdown = `---
name: test-skill
description: A test skill
license: MIT
compatibility: opencode
metadata:
  category: workflow
---

# Test Skill

## What I do
Core capabilities of the skill

## When to use me
Use conditions for the skill

## Instructions
Step-by-step instructions

## Checklist
- [ ] Item 1
- [ ] Item 2
`;

    const result = parseSkillMarkdown(markdown);

    expect(result.frontmatter.name).toBe('test-skill');
    expect(result.frontmatter.description).toBe('A test skill');
    expect(result.frontmatter.license).toBe('MIT');
    expect(result.frontmatter.compatibility).toBe('opencode');
    expect(result.frontmatter.metadata?.category).toBe('workflow');

    expect(result.sections.whatIDo).toContain('Core capabilities');
    expect(result.sections.whenToUseMe).toContain('Use conditions');
    expect(result.sections.instructions).toContain('Step-by-step');
    expect(result.sections.checklist).toEqual(['Item 1', 'Item 2']);
  });

  it('should handle missing frontmatter', () => {
    const markdown = `# Test Skill

## What I do
Content`;

    expect(() => parseSkillMarkdown(markdown)).toThrow('No YAML frontmatter found');
  });

  it('should handle empty sections', () => {
    const markdown = `---
name: empty-skill
description: Empty skill
---

# Empty Skill

## What I do

## When to use me

## Instructions

## Checklist
`;

    const result = parseSkillMarkdown(markdown);

    expect(result.sections.whatIDo).toBe('');
    expect(result.sections.whenToUseMe).toBe('');
    expect(result.sections.instructions).toBe('');
    expect(result.sections.checklist).toEqual([]);
  });

  it('should parse checklist with checked items', () => {
    const markdown = `---
name: test-skill
description: Test
---

## Checklist
- [x] Completed item
- [ ] Pending item
`;

    const result = parseSkillMarkdown(markdown);

    expect(result.sections.checklist).toEqual(['Completed item', 'Pending item']);
  });
});

describe('markdownToSkill', () => {
  it('should convert parsed markdown to Skill object', () => {
    const markdown = `---
name: test-skill
description: A test skill
license: MIT
compatibility: opencode
metadata:
  category: development
---

# Test Skill

## What I do
Core capabilities

## When to use me
Use conditions

## Instructions
Instructions here

## Checklist
- [ ] Task 1
- [ ] Task 2
`;

    const skill = markdownToSkill(markdown);

    expect(skill.name).toBe('test-skill');
    expect(skill.description).toBe('A test skill');
    expect(skill.license).toBe('MIT');
    expect(skill.compatibility).toBe('opencode');
    expect(skill.metadata?.category).toBe('development');
    expect(skill.whatIDo).toContain('Core capabilities');
    expect(skill.whenToUseMe).toContain('Use conditions');
    expect(skill.instructions).toContain('Instructions here');
    expect(skill.checklist).toEqual(['Task 1', 'Task 2']);
  });
});

describe('skillToMarkdown', () => {
  it('should convert Skill object to markdown', () => {
    const skill = {
      name: 'test-skill',
      description: 'A test skill',
      license: 'MIT',
      compatibility: 'opencode',
      metadata: {
        category: 'workflow',
      },
      whatIDo: 'Core capabilities',
      whenToUseMe: 'Use conditions',
      instructions: 'Step-by-step',
      checklist: ['Item 1', 'Item 2'],
    };

    const markdown = skillToMarkdown(skill);

    expect(markdown).toContain('---');
    expect(markdown).toContain('name: test-skill');
    expect(markdown).toContain('description: A test skill');
    expect(markdown).toContain('license: MIT');
    expect(markdown).toContain('compatibility: opencode');
    expect(markdown).toContain('category: workflow');
    expect(markdown).toContain('## What I do');
    expect(markdown).toContain('Core capabilities');
    expect(markdown).toContain('## When to use me');
    expect(markdown).toContain('## Instructions');
    expect(markdown).toContain('## Checklist');
    expect(markdown).toContain('- [ ] Item 1');
    expect(markdown).toContain('- [ ] Item 2');
  });

  it('should handle optional fields', () => {
    const skill = {
      name: 'minimal-skill',
      description: 'Minimal skill',
      whatIDo: 'Core',
      whenToUseMe: 'When',
      instructions: 'How',
      checklist: ['Check'],
    };

    const markdown = skillToMarkdown(skill);

    expect(markdown).toContain('name: minimal-skill');
    expect(markdown).not.toContain('license:');
    expect(markdown).not.toContain('compatibility:');
    expect(markdown).not.toContain('metadata:');
  });

  it('should round-trip successfully', () => {
    const originalMarkdown = `---
name: roundtrip-skill
description: Roundtrip test
license: MIT
compatibility: opencode
metadata:
  category: testing
---

# Roundtrip Skill

## What I do
Core capabilities here

## When to use me
Use when testing

## Instructions
Follow these steps

## Checklist
- [ ] Step 1
- [ ] Step 2
`;

    const skill = markdownToSkill(originalMarkdown);
    const regeneratedMarkdown = skillToMarkdown(skill);
    const skillAgain = markdownToSkill(regeneratedMarkdown);

    expect(skillAgain.name).toBe('roundtrip-skill');
    expect(skillAgain.description).toBe('Roundtrip test');
    expect(skillAgain.license).toBe('MIT');
    expect(skillAgain.compatibility).toBe('opencode');
    expect(skillAgain.metadata?.category).toBe('testing');
    expect(skillAgain.whatIDo).toContain('Core capabilities');
    expect(skillAgain.checklist).toEqual(['Step 1', 'Step 2']);
  });
});
