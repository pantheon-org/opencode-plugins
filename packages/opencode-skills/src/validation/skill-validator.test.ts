import { describe, it, expect } from 'bun:test';
import { validateSkill, formatValidationResult } from './skill-validator';
import type { Skill } from '../types';

describe('validateSkill', () => {
  it('should validate skill with all required fields', () => {
    const skill: Skill = {
      name: 'test-skill',
      description: 'A test skill',
      whatIDo: 'Core capabilities of the skill that are very detailed',
      whenToUseMe: 'Use when you need this',
      instructions: 'Follow these steps',
      checklist: ['Item 1', 'Item 2'],
      license: 'MIT',
      compatibility: 'opencode',
      metadata: {
        category: 'workflow',
      },
    };

    const result = validateSkill(skill);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('should error on missing name', () => {
    const skill = {
      description: 'A test skill',
    } as Skill;

    const result = validateSkill(skill);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'name')).toBe(true);
  });

  it('should error on invalid name format', () => {
    const skill: Skill = {
      name: 'InvalidName',
      description: 'A test skill',
    };

    const result = validateSkill(skill);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'name' && e.message.includes('kebab-case'))).toBe(true);
  });

  it('should error on missing description', () => {
    const skill = {
      name: 'test-skill',
    } as Skill;

    const result = validateSkill(skill);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'description')).toBe(true);
  });

  it('should error on missing structured content', () => {
    const skill: Skill = {
      name: 'test-skill',
      description: 'A test skill',
    };

    const result = validateSkill(skill);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'content')).toBe(true);
  });

  it('should warn on deprecated content field', () => {
    const skill: Skill = {
      name: 'test-skill',
      description: 'A test skill',
      content: 'Legacy content',
    };

    const result = validateSkill(skill);

    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.field === 'content' && w.message.includes('deprecated'))).toBe(true);
  });

  it('should error on missing whatIDo', () => {
    const skill: Skill = {
      name: 'test-skill',
      description: 'A test skill',
      whenToUseMe: 'When',
      instructions: 'How',
      checklist: ['Item'],
    };

    const result = validateSkill(skill);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'whatIDo')).toBe(true);
  });

  it('should error on missing whenToUseMe', () => {
    const skill: Skill = {
      name: 'test-skill',
      description: 'A test skill',
      whatIDo: 'What',
      instructions: 'How',
      checklist: ['Item'],
    };

    const result = validateSkill(skill);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'whenToUseMe')).toBe(true);
  });

  it('should error on missing instructions', () => {
    const skill: Skill = {
      name: 'test-skill',
      description: 'A test skill',
      whatIDo: 'What',
      whenToUseMe: 'When',
      checklist: ['Item'],
    };

    const result = validateSkill(skill);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'instructions')).toBe(true);
  });

  it('should error on empty checklist', () => {
    const skill: Skill = {
      name: 'test-skill',
      description: 'A test skill',
      whatIDo: 'What',
      whenToUseMe: 'When',
      instructions: 'How',
      checklist: [],
    };

    const result = validateSkill(skill);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'checklist')).toBe(true);
  });

  it('should warn on missing license', () => {
    const skill: Skill = {
      name: 'test-skill',
      description: 'A test skill',
      whatIDo: 'Core capabilities of the skill',
      whenToUseMe: 'When',
      instructions: 'How',
      checklist: ['Item'],
    };

    const result = validateSkill(skill);

    expect(result.warnings.some((w) => w.field === 'license')).toBe(true);
  });

  it('should warn on missing compatibility', () => {
    const skill: Skill = {
      name: 'test-skill',
      description: 'A test skill',
      whatIDo: 'Core capabilities of the skill',
      whenToUseMe: 'When',
      instructions: 'How',
      checklist: ['Item'],
    };

    const result = validateSkill(skill);

    expect(result.warnings.some((w) => w.field === 'compatibility')).toBe(true);
  });

  it('should warn on missing metadata.category', () => {
    const skill: Skill = {
      name: 'test-skill',
      description: 'A test skill',
      whatIDo: 'Core capabilities of the skill',
      whenToUseMe: 'When',
      instructions: 'How',
      checklist: ['Item'],
    };

    const result = validateSkill(skill);

    expect(result.warnings.some((w) => w.field === 'metadata.category')).toBe(true);
  });

  it('should suggest expanding short whatIDo', () => {
    const skill: Skill = {
      name: 'test-skill',
      description: 'A test skill',
      whatIDo: 'Short',
      whenToUseMe: 'When',
      instructions: 'How',
      checklist: ['Item 1', 'Item 2'],
    };

    const result = validateSkill(skill);

    expect(result.suggestions.some((s) => s.field === 'whatIDo')).toBe(true);
  });

  it('should suggest adding more checklist items', () => {
    const skill: Skill = {
      name: 'test-skill',
      description: 'A test skill',
      whatIDo: 'Core capabilities of the skill that are very detailed',
      whenToUseMe: 'When',
      instructions: 'How',
      checklist: ['Single item'],
    };

    const result = validateSkill(skill);

    expect(result.suggestions.some((s) => s.field === 'checklist')).toBe(true);
  });

  it('should fail in strict mode with warnings', () => {
    const skill: Skill = {
      name: 'test-skill',
      description: 'A test skill',
      whatIDo: 'Core capabilities of the skill',
      whenToUseMe: 'When',
      instructions: 'How',
      checklist: ['Item 1', 'Item 2'],
    };

    const result = validateSkill(skill, true);

    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe('formatValidationResult', () => {
  it('should format validation result with errors', () => {
    const skill = {
      name: 'test-skill',
    } as Skill;

    const result = validateSkill(skill);
    const formatted = formatValidationResult(result, 'test-skill');

    expect(formatted).toContain('Validation Results for "test-skill"');
    expect(formatted).toContain('❌ Errors');
    expect(formatted).toContain('description: Description is required');
    expect(formatted).toContain('Skill validation failed');
  });

  it('should format validation result with warnings', () => {
    const skill: Skill = {
      name: 'test-skill',
      description: 'A test skill',
      whatIDo: 'Core capabilities of the skill',
      whenToUseMe: 'When',
      instructions: 'How',
      checklist: ['Item 1', 'Item 2'],
    };

    const result = validateSkill(skill);
    const formatted = formatValidationResult(result, 'test-skill');

    expect(formatted).toContain('⚠️  Warnings');
    expect(formatted).toContain('license');
    expect(formatted).toContain('✅ Skill is valid');
  });

  it('should format validation result for valid skill', () => {
    const skill: Skill = {
      name: 'test-skill',
      description: 'A test skill',
      whatIDo: 'Core capabilities of the skill that are very detailed',
      whenToUseMe: 'When',
      instructions: 'How',
      checklist: ['Item 1', 'Item 2'],
      license: 'MIT',
      compatibility: 'opencode',
      metadata: {
        category: 'workflow',
      },
    };

    const result = validateSkill(skill);
    const formatted = formatValidationResult(result, 'test-skill');

    expect(formatted).toContain('✅ Skill is valid');
    expect(formatted).not.toContain('❌ Errors');
  });
});
