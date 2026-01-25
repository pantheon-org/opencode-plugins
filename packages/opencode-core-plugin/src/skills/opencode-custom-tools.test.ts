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

  it('should have content', () => {
    expect(opencodeCustomToolsSkill.content).toBeDefined();
    expect(opencodeCustomToolsSkill.content.length).toBeGreaterThan(100);
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
    expect(opencodeCustomToolsSkill.category).toBe('development');
  });

  it('should have version', () => {
    expect(opencodeCustomToolsSkill.version).toBeDefined();
  });

  it('should have updatedAt timestamp', () => {
    expect(opencodeCustomToolsSkill.updatedAt).toBeDefined();
  });

  it('should contain essential custom tools sections', () => {
    const { content } = opencodeCustomToolsSkill;

    // Check for key sections
    expect(content).toContain('# OpenCode Custom Tools Development');
    expect(content).toContain('## Overview');
    expect(content).toContain('## Creating a Tool');
    expect(content).toContain('### Location');
    expect(content).toContain('### Basic Structure');
    expect(content).toContain('## Arguments');
    expect(content).toContain('## Tool Context');
    expect(content).toContain('## Examples');
    expect(content).toContain('## Tools in Other Languages');
    expect(content).toContain('## Best Practices');
    expect(content).toContain('## Security Considerations');
  });

  it('should include code examples', () => {
    const { content } = opencodeCustomToolsSkill;

    // Check for code blocks
    expect(content).toContain('```typescript');
    expect(content).toContain('```python');
    expect(content).toContain('```bash');
  });

  it('should reference official documentation', () => {
    const { content } = opencodeCustomToolsSkill;

    expect(content).toContain('https://opencode.ai/docs');
  });

  it('should document tool.schema', () => {
    const { content } = opencodeCustomToolsSkill;

    expect(content).toContain('tool.schema');
    expect(content).toContain('Zod');
  });

  it('should document tool context properties', () => {
    const { content } = opencodeCustomToolsSkill;

    expect(content).toContain('agent');
    expect(content).toContain('sessionID');
    expect(content).toContain('messageID');
    expect(content).toContain('abort');
  });

  it('should include example tools', () => {
    const { content } = opencodeCustomToolsSkill;

    expect(content).toContain('Database Query Tool');
    expect(content).toContain('API Integration Tool');
    expect(content).toContain('File System Tool');
  });

  it('should document security best practices', () => {
    const { content } = opencodeCustomToolsSkill;

    expect(content).toContain('Sanitize Inputs');
    expect(content).toContain('Limit File Access');
    expect(content).toContain('Protect Sensitive Data');
  });
});
