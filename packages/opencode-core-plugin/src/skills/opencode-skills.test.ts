/**
 * Tests for OpenCode Skills Skill
 */

import { describe, expect, it } from 'bun:test';

import { opencodeSkillsSkill } from './opencode-skills';

describe('opencodeSkillsSkill', () => {
  it('should have correct name', () => {
    expect(opencodeSkillsSkill.name).toBe('opencode-skills');
  });

  it('should have description', () => {
    expect(opencodeSkillsSkill.description).toBeDefined();
    expect(opencodeSkillsSkill.description.length).toBeGreaterThan(0);
  });

  it('should have content', () => {
    expect(opencodeSkillsSkill.content).toBeDefined();
    expect(opencodeSkillsSkill.content.length).toBeGreaterThan(100);
  });

  it('should have keywords for pattern matching', () => {
    expect(opencodeSkillsSkill.keywords).toBeDefined();
    expect(Array.isArray(opencodeSkillsSkill.keywords)).toBe(true);
    expect(opencodeSkillsSkill.keywords!.length).toBeGreaterThan(0);
  });

  it('should include key skill concepts in keywords', () => {
    const keywords = opencodeSkillsSkill.keywords || [];
    expect(keywords).toContain('skill');
    expect(keywords).toContain('skills');
    expect(keywords).toContain('SKILL.md');
  });

  it('should have development category', () => {
    expect(opencodeSkillsSkill.category).toBe('development');
  });

  it('should have version', () => {
    expect(opencodeSkillsSkill.version).toBeDefined();
  });

  it('should have updatedAt timestamp', () => {
    expect(opencodeSkillsSkill.updatedAt).toBeDefined();
  });

  it('should contain essential skill sections', () => {
    const { content } = opencodeSkillsSkill;

    // Check for key sections
    expect(content).toContain('# OpenCode Agent Skills');
    expect(content).toContain('## Overview');
    expect(content).toContain('## File Placement');
    expect(content).toContain('## Discovery');
    expect(content).toContain('## Frontmatter Configuration');
    expect(content).toContain('## Permissions');
    expect(content).toContain('## Best Practices');
    expect(content).toContain('## Troubleshooting');
  });

  it('should include SKILL.md file structure examples', () => {
    const { content } = opencodeSkillsSkill;

    expect(content).toContain('SKILL.md');
    expect(content).toContain('.opencode/skills/');
    expect(content).toContain('~/.config/opencode/skills/');
  });

  it('should include frontmatter validation rules', () => {
    const { content } = opencodeSkillsSkill;

    expect(content).toContain('name');
    expect(content).toContain('description');
    expect(content).toContain('1–64 characters');
    expect(content).toContain('1-1024 characters');
  });

  it('should include permission configuration examples', () => {
    const { content } = opencodeSkillsSkill;

    expect(content).toContain('permission');
    expect(content).toContain('allow');
    expect(content).toContain('deny');
    expect(content).toContain('ask');
  });

  it('should include code examples', () => {
    const { content } = opencodeSkillsSkill;

    // Check for code blocks
    expect(content).toContain('```markdown');
    expect(content).toContain('```json');
    expect(content).toContain('```yaml');
  });

  it('should reference official documentation', () => {
    const { content } = opencodeSkillsSkill;

    expect(content).toContain('https://opencode.ai/docs');
  });
});
