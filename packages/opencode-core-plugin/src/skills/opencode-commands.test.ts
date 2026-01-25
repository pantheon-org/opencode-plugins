import { describe, it, expect } from 'bun:test';

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
    expect(opencodeCommandsSkill.category).toBe('configuration');
  });

  it('should have content', () => {
    expect(opencodeCommandsSkill.content).toBeDefined();
    expect(opencodeCommandsSkill.content.length).toBeGreaterThan(0);
  });

  it('should have content starting with heading', () => {
    expect(opencodeCommandsSkill.content).toMatch(/^#\s+/);
  });

  it('should include JSON configuration section', () => {
    expect(opencodeCommandsSkill.content).toContain('JSON Configuration');
  });

  it('should include markdown files section', () => {
    expect(opencodeCommandsSkill.content).toContain('Markdown Files');
  });

  it('should include prompt templates section', () => {
    expect(opencodeCommandsSkill.content).toContain('Prompt Templates');
  });

  it('should include arguments documentation', () => {
    expect(opencodeCommandsSkill.content).toContain('$ARGUMENTS');
  });

  it('should include shell output documentation', () => {
    expect(opencodeCommandsSkill.content).toContain('Shell Output');
  });

  it('should include file references documentation', () => {
    expect(opencodeCommandsSkill.content).toContain('File References');
  });

  it('should include troubleshooting section', () => {
    expect(opencodeCommandsSkill.content).toContain('Troubleshooting');
  });
});
