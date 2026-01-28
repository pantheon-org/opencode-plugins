import { describe, it, expect } from 'bun:test';

import { opencodeConfigurationSkill } from './opencode-configuration';

describe('opencodeConfigurationSkill', () => {
  it('should have correct name', () => {
    expect(opencodeConfigurationSkill.name).toBe('opencode-configuration');
  });

  it('should have a description', () => {
    expect(opencodeConfigurationSkill.description).toBeDefined();
    expect(opencodeConfigurationSkill.description.length).toBeGreaterThan(0);
  });

  it('should have keywords array', () => {
    expect(Array.isArray(opencodeConfigurationSkill.keywords)).toBe(true);
    expect(opencodeConfigurationSkill.keywords?.length).toBeGreaterThan(0);
  });

  it('should include opencode.json keyword', () => {
    expect(opencodeConfigurationSkill.keywords?.includes('opencode.json')).toBe(true);
  });

  it('should include config keyword', () => {
    expect(opencodeConfigurationSkill.keywords?.includes('config')).toBe(true);
  });

  it('should include configuration keyword', () => {
    expect(opencodeConfigurationSkill.keywords?.includes('configuration')).toBe(true);
  });

  it('should have category set to configuration', () => {
    expect(opencodeConfigurationSkill.metadata?.category).toBe('configuration');
  });

  it('should have instructions', () => {
    expect(opencodeConfigurationSkill.instructions).toBeDefined();
    expect(opencodeConfigurationSkill.instructions!.length).toBeGreaterThan(0);
  });

  it('should have instructions starting with heading', () => {
    expect(opencodeConfigurationSkill.instructions!).toMatch(/^#\s+/);
  });

  it('should include configuration locations section', () => {
    expect(opencodeConfigurationSkill.instructions!).toContain('Configuration Locations');
  });

  it('should include precedence order information', () => {
    expect(opencodeConfigurationSkill.instructions!).toContain('Precedence Order');
  });

  it('should include variable substitution section', () => {
    expect(opencodeConfigurationSkill.instructions!).toContain('Variable Substitution');
  });

  it('should include schema documentation', () => {
    expect(opencodeConfigurationSkill.instructions!).toContain('https://opencode.ai/config.json');
  });

  it('should include best practices section', () => {
    expect(opencodeConfigurationSkill.instructions!).toContain('Best Practices');
  });

  it('should include troubleshooting section', () => {
    expect(opencodeConfigurationSkill.instructions!).toContain('Troubleshooting');
  });
});
