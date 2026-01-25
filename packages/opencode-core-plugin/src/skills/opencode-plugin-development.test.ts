/**
 * Tests for OpenCode Plugin Development Skill
 */

import { describe, expect, it } from 'bun:test';

import { opencodePluginDevelopmentSkill } from './opencode-plugin-development';

describe('opencodePluginDevelopmentSkill', () => {
  it('should have correct name', () => {
    expect(opencodePluginDevelopmentSkill.name).toBe('opencode-plugin-development');
  });

  it('should have description', () => {
    expect(opencodePluginDevelopmentSkill.description).toBeDefined();
    expect(opencodePluginDevelopmentSkill.description.length).toBeGreaterThan(0);
  });

  it('should have content', () => {
    expect(opencodePluginDevelopmentSkill.content).toBeDefined();
    expect(opencodePluginDevelopmentSkill.content.length).toBeGreaterThan(100);
  });

  it('should have keywords for pattern matching', () => {
    expect(opencodePluginDevelopmentSkill.keywords).toBeDefined();
    expect(Array.isArray(opencodePluginDevelopmentSkill.keywords)).toBe(true);
    expect(opencodePluginDevelopmentSkill.keywords!.length).toBeGreaterThan(0);
  });

  it('should include key OpenCode plugin concepts in keywords', () => {
    const keywords = opencodePluginDevelopmentSkill.keywords || [];
    expect(keywords).toContain('opencode');
    expect(keywords).toContain('plugin');
    expect(keywords).toContain('hook');
    expect(keywords).toContain('tool');
  });

  it('should have development category', () => {
    expect(opencodePluginDevelopmentSkill.category).toBe('development');
  });

  it('should have version', () => {
    expect(opencodePluginDevelopmentSkill.version).toBeDefined();
  });

  it('should have updatedAt timestamp', () => {
    expect(opencodePluginDevelopmentSkill.updatedAt).toBeDefined();
  });

  it('should contain essential plugin development sections', () => {
    const { content } = opencodePluginDevelopmentSkill;

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
    const { content } = opencodePluginDevelopmentSkill;

    // Check for code blocks
    expect(content).toContain('```typescript');
    expect(content).toContain('```json');
  });

  it('should reference official documentation', () => {
    const { content } = opencodePluginDevelopmentSkill;

    expect(content).toContain('https://opencode.ai/docs');
  });
});
