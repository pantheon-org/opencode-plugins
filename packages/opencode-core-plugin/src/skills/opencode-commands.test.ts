import { describe, expect, it } from 'bun:test';

import { opencodeCommandsSkill } from './opencode-commands';

describe('opencodeCommandsSkill', () => {
  it('should have correct name', () => {
    expect(opencodeCommandsSkill.name).toBe('opencode-commands');
  });

  it('should have a description', () => {
    expect(opencodeCommandsSkill.description).toBeDefined();
    expect(opencodeCommandsSkill.description.length).toBeGreaterThan(0);
  });

  it('should have keywords array', () => {
    expect(Array.isArray(opencodeCommandsSkill.keywords)).toBe(true);
    expect(opencodeCommandsSkill.keywords?.length).toBeGreaterThan(0);
  });

  it('should include command keyword', () => {
    expect(opencodeCommandsSkill.keywords?.includes('command')).toBe(true);
  });

  it('should include commands keyword', () => {
    expect(opencodeCommandsSkill.keywords?.includes('commands')).toBe(true);
  });

  it('should include slash-command keyword', () => {
    expect(opencodeCommandsSkill.keywords?.includes('slash-command')).toBe(true);
  });

  it('should include $ARGUMENTS keyword', () => {
    expect(opencodeCommandsSkill.keywords?.includes('$ARGUMENTS')).toBe(true);
  });

  it('should have category set to configuration', () => {
    expect(opencodeCommandsSkill.metadata?.category).toBe('configuration');
  });

  it('should have instructions', () => {
    expect(opencodeCommandsSkill.instructions).toBeDefined();
    expect(opencodeCommandsSkill.instructions!.length).toBeGreaterThan(0);
  });

  it('should have instructions starting with heading', () => {
    expect(opencodeCommandsSkill.instructions!).toMatch(/^#\s+/);
  });

  it('should include JSON configuration section', () => {
    expect(opencodeCommandsSkill.instructions!).toContain('JSON Configuration');
  });

  it('should include markdown files section', () => {
    expect(opencodeCommandsSkill.instructions!).toContain('Markdown Files');
  });

  it('should include prompt templates section', () => {
    expect(opencodeCommandsSkill.instructions!).toContain('Prompt Templates');
  });

  it('should include arguments documentation', () => {
    expect(opencodeCommandsSkill.instructions!).toContain('$ARGUMENTS');
  });

  it('should include shell output documentation', () => {
    expect(opencodeCommandsSkill.instructions!).toContain('Shell Output');
  });

  it('should include file references documentation', () => {
    expect(opencodeCommandsSkill.instructions!).toContain('File References');
  });

  it('should include troubleshooting section', () => {
    expect(opencodeCommandsSkill.instructions!).toContain('Troubleshooting');
  });
});
