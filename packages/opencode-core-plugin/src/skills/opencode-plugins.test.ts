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

  it('should have content', () => {
    expect(opencodePluginsSkill.content).toBeDefined();
    expect(opencodePluginsSkill.content.length).toBeGreaterThan(100);
  });

  it('should have keywords for pattern matching', () => {
    expect(opencodePluginsSkill.keywords).toBeDefined();
    expect(Array.isArray(opencodePluginsSkill.keywords)).toBe(true);
    expect(opencodePluginsSkill.keywords!.length).toBeGreaterThan(0);
  });

  it('should include key OpenCode plugin concepts in keywords', () => {
    const keywords = opencodePluginsSkill.keywords || [];
    expect(keywords).toContain('opencode');
    expect(keywords).toContain('plugin');
    expect(keywords).toContain('hook');
    expect(keywords).toContain('tool');
  });

  it('should have development category', () => {
    expect(opencodePluginsSkill.category).toBe('development');
  });

  it('should have version', () => {
    expect(opencodePluginsSkill.version).toBeDefined();
  });

  it('should have updatedAt timestamp', () => {
    expect(opencodePluginsSkill.updatedAt).toBeDefined();
  });

  it('should contain essential plugin development sections', () => {
    const { content } = opencodePluginsSkill;

    // Check for key sections
    expect(content).toContain('# OpenCode Plugin Development');
    expect(content).toContain('## Overview');
    expect(content).toContain('## Quick Start');
    expect(content).toContain('## Plugin Hooks');
    expect(content).toContain('### Custom Tools');
    expect(content).toContain('### Event Subscription');
    expect(content).toContain('## Best Practices');
  });

  it('should include code examples', () => {
    const { content } = opencodePluginsSkill;

    // Check for code blocks
    expect(content).toContain('```typescript');
    expect(content).toContain('```json');
  });

  it('should reference official documentation', () => {
    const { content } = opencodePluginsSkill;

    expect(content).toContain('https://opencode.ai/docs');
  });
});
