import { describe, it, expect } from 'bun:test';
import { defineSkill } from './index';

describe('defineSkill', () => {
  it('should create skill with structured content', () => {
    const skill = defineSkill(
      {
        name: 'test-skill',
        description: 'A test skill',
        whatIDo: 'Core capabilities of the skill',
        whenToUseMe: 'Use when testing',
        instructions: 'Follow these steps',
        checklist: ['Item 1', 'Item 2'],
        license: 'MIT',
        compatibility: 'opencode',
        metadata: {
          category: 'testing',
        },
      },
      { validate: false },
    );

    expect(skill.name).toBe('test-skill');
    expect(skill.description).toBe('A test skill');
    expect(skill.whatIDo).toBe('Core capabilities of the skill');
    expect(skill.whenToUseMe).toBe('Use when testing');
    expect(skill.instructions).toBe('Follow these steps');
    expect(skill.checklist).toEqual(['Item 1', 'Item 2']);
    expect(skill.license).toBe('MIT');
    expect(skill.compatibility).toBe('opencode');
    expect(skill.metadata?.category).toBe('testing');
    expect(skill.version).toBe('1.0.0');
    expect(skill.updatedAt).toBeDefined();
  });

  it('should auto-add version and updatedAt', () => {
    const skill = defineSkill(
      {
        name: 'test-skill',
        description: 'A test skill',
        content: 'Legacy content',
      },
      { validate: false },
    );

    expect(skill.version).toBe('1.0.0');
    expect(skill.updatedAt).toBeDefined();
    expect(new Date(skill.updatedAt!).getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('should support legacy content field', () => {
    const skill = defineSkill(
      {
        name: 'legacy-skill',
        description: 'Legacy skill',
        content: 'This is legacy content',
      },
      { validate: false },
    );

    expect(skill.content).toBe('This is legacy content');
  });

  it('should support optional fields', () => {
    const skill = defineSkill(
      {
        name: 'optional-skill',
        description: 'Skill with optional fields',
        content: 'Content',
        keywords: ['keyword1', 'keyword2'],
        dependencies: ['dependency1'],
      },
      { validate: false },
    );

    expect(skill.keywords).toEqual(['keyword1', 'keyword2']);
    expect(skill.dependencies).toEqual(['dependency1']);
  });
});
