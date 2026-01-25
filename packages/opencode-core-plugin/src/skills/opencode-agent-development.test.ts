/**
 * Tests for OpenCode Agent Development Skill
 */

import { describe, expect, it } from 'bun:test';

import { opencodeAgentDevelopmentSkill } from './opencode-agent-development';

describe('opencodeAgentDevelopmentSkill', () => {
  it('should have correct name', () => {
    expect(opencodeAgentDevelopmentSkill.name).toBe('opencode-agent-development');
  });

  it('should have description', () => {
    expect(opencodeAgentDevelopmentSkill.description).toBeDefined();
    expect(opencodeAgentDevelopmentSkill.description.length).toBeGreaterThan(0);
  });

  it('should have content', () => {
    expect(opencodeAgentDevelopmentSkill.content).toBeDefined();
    expect(opencodeAgentDevelopmentSkill.content.length).toBeGreaterThan(100);
  });

  it('should have keywords for pattern matching', () => {
    expect(opencodeAgentDevelopmentSkill.keywords).toBeDefined();
    expect(Array.isArray(opencodeAgentDevelopmentSkill.keywords)).toBe(true);
    expect(opencodeAgentDevelopmentSkill.keywords!.length).toBeGreaterThan(0);
  });

  it('should include key OpenCode agent concepts in keywords', () => {
    const keywords = opencodeAgentDevelopmentSkill.keywords || [];
    expect(keywords).toContain('agent');
    expect(keywords).toContain('subagent');
    expect(keywords).toContain('agent-config');
  });

  it('should have development category', () => {
    expect(opencodeAgentDevelopmentSkill.category).toBe('development');
  });

  it('should have version', () => {
    expect(opencodeAgentDevelopmentSkill.version).toBeDefined();
  });

  it('should have updatedAt timestamp', () => {
    expect(opencodeAgentDevelopmentSkill.updatedAt).toBeDefined();
  });

  it('should contain essential agent development sections', () => {
    const { content } = opencodeAgentDevelopmentSkill;

    // Check for key sections
    expect(content).toContain('# OpenCode Agent Development');
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
    const { content } = opencodeAgentDevelopmentSkill;

    // Check for code blocks
    expect(content).toContain('```json');
    expect(content).toContain('```markdown');
  });

  it('should reference official documentation', () => {
    const { content } = opencodeAgentDevelopmentSkill;

    expect(content).toContain('https://opencode.ai/docs');
  });

  it('should document built-in agents', () => {
    const { content } = opencodeAgentDevelopmentSkill;

    expect(content).toContain('Build');
    expect(content).toContain('Plan');
    expect(content).toContain('General');
    expect(content).toContain('Explore');
  });

  it('should document agent modes', () => {
    const { content } = opencodeAgentDevelopmentSkill;

    expect(content).toContain('primary');
    expect(content).toContain('subagent');
  });

  it('should document permissions', () => {
    const { content } = opencodeAgentDevelopmentSkill;

    expect(content).toContain('ask');
    expect(content).toContain('allow');
    expect(content).toContain('deny');
  });

  it('should include example agents', () => {
    const { content } = opencodeAgentDevelopmentSkill;

    expect(content).toContain('## Example Agents');
    expect(content).toContain('Test Runner');
    expect(content).toContain('Architecture Advisor');
  });
});
