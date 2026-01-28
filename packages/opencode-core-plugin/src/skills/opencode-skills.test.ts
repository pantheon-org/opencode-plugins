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

  it('should have instructions', () => {
    expect(opencodeSkillsSkill.instructions).toBeDefined();
    expect(opencodeSkillsSkill.instructions!.length).toBeGreaterThan(100);
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
    expect(opencodeSkillsSkill.metadata?.category).toBe('development');
  });

  it('should have version', () => {
    expect(opencodeSkillsSkill.version).toBeDefined();
  });

  it('should have updatedAt timestamp', () => {
    expect(opencodeSkillsSkill.updatedAt).toBeDefined();
  });

  it('should contain essential skill sections', () => {
    const { instructions } = opencodeSkillsSkill;

    // Check for key sections
    expect(instructions!).toContain('# OpenCode Agent Skills');
    expect(instructions!).toContain('## Overview');
    expect(instructions!).toContain('## File Placement');
    expect(instructions!).toContain('## Discovery');
    expect(instructions!).toContain('## Frontmatter Configuration');
    expect(instructions!).toContain('## Permissions');
    expect(instructions!).toContain('## Best Practices');
    expect(instructions!).toContain('## Troubleshooting');
  });

  it('should include SKILL.md file structure examples', () => {
    const { instructions } = opencodeSkillsSkill;

    expect(instructions!).toContain('SKILL.md');
    expect(instructions!).toContain('.opencode/skills/');
    expect(instructions!).toContain('~/.config/opencode/skills/');
  });

  it('should include frontmatter validation rules', () => {
    const { instructions } = opencodeSkillsSkill;

    expect(instructions!).toContain('name');
    expect(instructions!).toContain('description');
    expect(instructions!).toContain('1–64 characters');
    expect(instructions!).toContain('1-1024 characters');
  });

  it('should include permission configuration examples', () => {
    const { instructions } = opencodeSkillsSkill;

    expect(instructions!).toContain('permission');
    expect(instructions!).toContain('allow');
    expect(instructions!).toContain('deny');
    expect(instructions!).toContain('ask');
  });

  it('should include code examples', () => {
    const { instructions } = opencodeSkillsSkill;

    // Check for code blocks
    expect(instructions!).toContain('```markdown');
    expect(instructions!).toContain('```json');
    expect(instructions!).toContain('```yaml');
  });

  it('should reference official documentation', () => {
    const { instructions } = opencodeSkillsSkill;

    expect(instructions!).toContain('https://opencode.ai/docs');
  });
});
