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

  it('should have structured content fields', () => {
    expect(opencodeAgentsSkill.whatIDo).toBeDefined();
    expect(opencodeAgentsSkill.whenToUseMe).toBeDefined();
    expect(opencodeAgentsSkill.instructions).toBeDefined();
    expect(opencodeAgentsSkill.checklist).toBeDefined();
    expect(opencodeAgentsSkill.instructions?.length).toBeGreaterThan(100);
  });

  it('should have keywords for pattern matching', () => {
    expect(opencodeAgentsSkill.keywords).toBeDefined();
    expect(Array.isArray(opencodeAgentsSkill.keywords)).toBe(true);
    expect(opencodeAgentsSkill.keywords?.length).toBeGreaterThan(0);
  });

  it('should include key OpenCode agent concepts in keywords', () => {
    const keywords = opencodeAgentsSkill.keywords || [];
    expect(keywords).toContain('agent');
    expect(keywords).toContain('subagent');
    expect(keywords).toContain('agent-config');
  });

  it('should have development category', () => {
    expect(opencodeAgentsSkill.metadata?.category).toBe('development');
  });

  it('should have version', () => {
    expect(opencodeAgentsSkill.version).toBeDefined();
  });

  it('should have updatedAt timestamp', () => {
    expect(opencodeAgentsSkill.updatedAt).toBeDefined();
  });

  it('should contain essential agent sections', () => {
    const { instructions } = opencodeAgentsSkill;

    // Check for key sections
    expect(instructions).toContain('# OpenCode Agents');
    expect(instructions).toContain('## Overview');
    expect(instructions).toContain('## Agent Types');
    expect(instructions).toContain('### Primary Agents');
    expect(instructions).toContain('### Subagents');
    expect(instructions).toContain('## Configuration Methods');
    expect(instructions).toContain('## Agent Options');
    expect(instructions).toContain('## Creating Agents');
    expect(instructions).toContain('## Best Practices');
  });

  it('should include code examples', () => {
    const { instructions } = opencodeAgentsSkill;

    // Check for code blocks
    expect(instructions).toContain('```json');
    expect(instructions).toContain('```markdown');
  });

  it('should reference official documentation', () => {
    const { instructions } = opencodeAgentsSkill;

    expect(instructions).toContain('https://opencode.ai/docs');
  });

  it('should document built-in agents', () => {
    const { instructions } = opencodeAgentsSkill;

    expect(instructions).toContain('Build');
    expect(instructions).toContain('Plan');
    expect(instructions).toContain('General');
    expect(instructions).toContain('Explore');
  });

  it('should document agent modes', () => {
    const { instructions } = opencodeAgentsSkill;

    expect(instructions).toContain('primary');
    expect(instructions).toContain('subagent');
  });

  it('should document permissions', () => {
    const { instructions } = opencodeAgentsSkill;

    expect(instructions).toContain('ask');
    expect(instructions).toContain('allow');
    expect(instructions).toContain('deny');
  });

  it('should include example agents', () => {
    const { instructions } = opencodeAgentsSkill;

    expect(instructions).toContain('## Example Agents');
    expect(instructions).toContain('Test Runner');
    expect(instructions).toContain('Architecture Advisor');
  });
});
