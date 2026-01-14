import { describe, it, expect } from 'bun:test';

import { DEFAULT_CONFIG } from './config';

describe('DEFAULT_CONFIG', () => {
  it('should have correct default agentsDir', () => {
    expect(DEFAULT_CONFIG.agentsDir).toBe('.opencode/agent');
  });

  it('should have correct default patterns', () => {
    expect(DEFAULT_CONFIG.patterns).toEqual(['**/*.ts', '**/*.js']);
  });

  it('should have verbose disabled by default', () => {
    expect(DEFAULT_CONFIG.verbose).toBe(false);
  });

  it('should be a readonly object with all required properties', () => {
    expect(DEFAULT_CONFIG).toHaveProperty('agentsDir');
    expect(DEFAULT_CONFIG).toHaveProperty('patterns');
    expect(DEFAULT_CONFIG).toHaveProperty('verbose');
  });
});
