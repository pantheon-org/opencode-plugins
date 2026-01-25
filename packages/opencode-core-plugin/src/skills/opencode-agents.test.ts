/**
 * Tests for OpenCode Agents Skill
 */

import { describe, expect, it } from 'bun:test';

import { opencodeAgentsSkill } from './opencode-agents';

describe('opencodeAgentsSkill', () => {
  it('should have correct name', () => {
    expect(opencodeAgentsSkill.name).toBe('opencode-agents');
  });

  it('should have description', () => {
    expect(opencodeAgentsSkill.description).toBeDefined();
    expect(opencodeAgentsSkill.description.length).toBeGreaterThan(0);
  });

  it('should have content', () => {
    expect(opencodeAgentsSkill.content).toBeDefined();
    expect(opencodeAgentsSkill.content.length).toBeGreaterThan(100);
  });

  it('should have keywords for pattern matching', () => {
    expect(opencodeAgentsSkill.keywords).toBeDefined();
    expect(Array.isArray(opencodeAgentsSkill.keywords)).toBe(true);
    expect(opencodeAgentsSkill.keywords!.length).toBeGreaterThan(0);
  });

  it('should include key OpenCode agent concepts in keywords', () => {
    const keywords = opencodeAgentsSkill.keywords || [];
    expect(keywords).toContain('agent');
    expect(keywords).toContain('subagent');
    expect(keywords).toContain('agent-config');
  });

  it('should have development category', () => {
    expect(opencodeAgentsSkill.category).toBe('development');
  });

  it('should have version', () => {
    expect(opencodeAgentsSkill.version).toBeDefined();
  });

  it('should have updatedAt timestamp', () => {
    expect(opencodeAgentsSkill.updatedAt).toBeDefined();
  });

  it('should contain essential agent sections', () => {
    const { content } = opencodeAgentsSkill;

    // Check for key sections
    expect(content).toContain('# OpenCode Agents');
    expect(content).toContain('## Overview');
    expect(content).toContain('## Agent Types');
    expect(content).toContain('### Primary Agents');
    expect(content).toContain('### Subagents');
    expect(content).toContain('## Configuration Methods');
    expect(content).toContain('## Agent Options');
    expect(content).toContain('## Creating Agents');
    expect(content).toContain('## Best Practices');
  });

  it('should include code examples', () => {
    const { content } = opencodeAgentsSkill;

    // Check for code blocks
    expect(content).toContain('```json');
    expect(content).toContain('```markdown');
  });

  it('should reference official documentation', () => {
    const { content } = opencodeAgentsSkill;

    expect(content).toContain('https://opencode.ai/docs');
  });

  it('should document built-in agents', () => {
    const { content } = opencodeAgentsSkill;

    expect(content).toContain('Build');
    expect(content).toContain('Plan');
    expect(content).toContain('General');
    expect(content).toContain('Explore');
  });

  it('should document agent modes', () => {
    const { content } = opencodeAgentsSkill;

    expect(content).toContain('primary');
    expect(content).toContain('subagent');
  });

  it('should document permissions', () => {
    const { content } = opencodeAgentsSkill;

    expect(content).toContain('ask');
    expect(content).toContain('allow');
    expect(content).toContain('deny');
  });

  it('should include example agents', () => {
    const { content } = opencodeAgentsSkill;

    expect(content).toContain('## Example Agents');
    expect(content).toContain('Test Runner');
    expect(content).toContain('Architecture Advisor');
  });
});
