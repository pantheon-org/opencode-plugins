/**
 * Tests for OpenCode Custom Tools Skill
 */

import { describe, expect, it } from 'bun:test';

import { opencodeCustomToolsSkill } from './opencode-custom-tools';

describe('opencodeCustomToolsSkill', () => {
  it('should have correct name', () => {
    expect(opencodeCustomToolsSkill.name).toBe('opencode-custom-tools');
  });

  it('should have description', () => {
    expect(opencodeCustomToolsSkill.description).toBeDefined();
    expect(opencodeCustomToolsSkill.description.length).toBeGreaterThan(0);
  });

  it('should have instructions', () => {
    expect(opencodeCustomToolsSkill.instructions).toBeDefined();
    expect(opencodeCustomToolsSkill.instructions!.length).toBeGreaterThan(100);
  });

  it('should have keywords for pattern matching', () => {
    expect(opencodeCustomToolsSkill.keywords).toBeDefined();
    expect(Array.isArray(opencodeCustomToolsSkill.keywords)).toBe(true);
    expect(opencodeCustomToolsSkill.keywords!.length).toBeGreaterThan(0);
  });

  it('should include key custom tools concepts in keywords', () => {
    const keywords = opencodeCustomToolsSkill.keywords || [];
    expect(keywords).toContain('custom-tool');
    expect(keywords).toContain('tool-definition');
    expect(keywords).toContain('tool-schema');
  });

  it('should have development category', () => {
    expect(opencodeCustomToolsSkill.metadata?.category).toBe('development');
  });

  it('should have version', () => {
    expect(opencodeCustomToolsSkill.version).toBeDefined();
  });

  it('should have updatedAt timestamp', () => {
    expect(opencodeCustomToolsSkill.updatedAt).toBeDefined();
  });

  it('should contain essential custom tools sections', () => {
    const { instructions } = opencodeCustomToolsSkill;

    // Check for key sections
    expect(instructions!).toContain('# OpenCode Custom Tools Development');
    expect(instructions!).toContain('## Overview');
    expect(instructions!).toContain('## Creating a Tool');
    expect(instructions!).toContain('### Location');
    expect(instructions!).toContain('### Basic Structure');
    expect(instructions!).toContain('## Arguments');
    expect(instructions!).toContain('## Tool Context');
    expect(instructions!).toContain('## Examples');
    expect(instructions!).toContain('## Tools in Other Languages');
    expect(instructions!).toContain('## Best Practices');
    expect(instructions!).toContain('## Security Considerations');
  });

  it('should include code examples', () => {
    const { instructions } = opencodeCustomToolsSkill;

    // Check for code blocks
    expect(instructions!).toContain('```typescript');
    expect(instructions!).toContain('```python');
    expect(instructions!).toContain('```bash');
  });

  it('should reference official documentation', () => {
    const { instructions } = opencodeCustomToolsSkill;

    expect(instructions!).toContain('https://opencode.ai/docs');
  });

  it('should document tool.schema', () => {
    const { instructions } = opencodeCustomToolsSkill;

    expect(instructions!).toContain('tool.schema');
    expect(instructions!).toContain('Zod');
  });

  it('should document tool context properties', () => {
    const { instructions } = opencodeCustomToolsSkill;

    expect(instructions!).toContain('agent');
    expect(instructions!).toContain('sessionID');
    expect(instructions!).toContain('messageID');
    expect(instructions!).toContain('abort');
  });

  it('should include example tools', () => {
    const { instructions } = opencodeCustomToolsSkill;

    expect(instructions!).toContain('Database Query Tool');
    expect(instructions!).toContain('API Integration Tool');
    expect(instructions!).toContain('File System Tool');
  });

  it('should document security best practices', () => {
    const { instructions } = opencodeCustomToolsSkill;

    expect(instructions!).toContain('Sanitize Inputs');
    expect(instructions!).toContain('Limit File Access');
    expect(instructions!).toContain('Protect Sensitive Data');
  });
});
