/**
 * Tests for OpenCode Plugins Skill
 */

import { describe, expect, it } from 'bun:test';

import { opencodePluginsSkill } from './opencode-plugins';

describe('opencodePluginsSkill', () => {
  it('should have correct name', () => {
    expect(opencodePluginsSkill.name).toBe('opencode-plugins');
  });

  it('should have description', () => {
    expect(opencodePluginsSkill.description).toBeDefined();
    expect(opencodePluginsSkill.description.length).toBeGreaterThan(0);
  });

  it('should have instructions', () => {
    expect(opencodePluginsSkill.instructions).toBeDefined();
    expect(opencodePluginsSkill.instructions?.length).toBeGreaterThan(100);
  });

  it('should have keywords for pattern matching', () => {
    expect(opencodePluginsSkill.keywords).toBeDefined();
    expect(Array.isArray(opencodePluginsSkill.keywords)).toBe(true);
    expect(opencodePluginsSkill.keywords?.length).toBeGreaterThan(0);
  });

  it('should include key OpenCode plugin concepts in keywords', () => {
    const keywords = opencodePluginsSkill.keywords || [];
    expect(keywords).toContain('opencode');
    expect(keywords).toContain('plugin');
    expect(keywords).toContain('hook');
    expect(keywords).toContain('tool');
  });

  it('should have development category', () => {
    expect(opencodePluginsSkill.metadata?.category).toBe('development');
  });

  it('should have version', () => {
    expect(opencodePluginsSkill.version).toBeDefined();
  });

  it('should have updatedAt timestamp', () => {
    expect(opencodePluginsSkill.updatedAt).toBeDefined();
  });

  it('should contain essential plugin development sections', () => {
    const { instructions } = opencodePluginsSkill;

    // Check for key sections
    expect(instructions!).toContain('# OpenCode Plugin Development');
    expect(instructions!).toContain('## Overview');
    expect(instructions!).toContain('## Quick Start');
    expect(instructions!).toContain('## Plugin Hooks');
    expect(instructions!).toContain('### Custom Tools');
    expect(instructions!).toContain('### Event Subscription');
    expect(instructions!).toContain('## Best Practices');
  });

  it('should include code examples', () => {
    const { instructions } = opencodePluginsSkill;

    // Check for code blocks
    expect(instructions!).toContain('```typescript');
    expect(instructions!).toContain('```json');
  });

  it('should reference official documentation', () => {
    const { instructions } = opencodePluginsSkill;

    expect(instructions!).toContain('https://opencode.ai/docs');
  });
});
