import { mkdtemp, writeFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

import { afterEach, beforeEach, describe, it, expect } from 'bun:test';

import { loadAgentSpec } from './load-agent-spec';

describe('loadAgentSpec', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'load-spec-test-'));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('should load a valid agent spec from default export', async () => {
    const filePath = join(testDir, 'agent.ts');
    const content = `
      export default class MyAgent {
        name = 'my-agent';
        config = {
          description: 'Test agent',
          model: 'anthropic/claude-3-5-sonnet-20241022',
        };
      }
    `;
    await writeFile(filePath, content);

    const result = await loadAgentSpec(filePath);

    expect(result.spec).toBeDefined();
    expect(result.spec?.name).toBe('my-agent');
    expect(result.error).toBeUndefined();
  });

  it('should load a valid agent spec from named export', async () => {
    const filePath = join(testDir, 'agent.ts');
    const content = `
      export class TestAgent {
        name = 'test-agent';
        config = {
          description: 'Test agent',
          model: 'anthropic/claude-3-5-sonnet-20241022',
        };
      }
    `;
    await writeFile(filePath, content);

    const result = await loadAgentSpec(filePath);

    expect(result.spec).toBeDefined();
    expect(result.spec?.name).toBe('test-agent');
    expect(result.error).toBeUndefined();
  });

  it('should return error when no valid AgentSpec class is found', async () => {
    const filePath = join(testDir, 'not-agent.ts');
    const content = `
      export const someValue = 'not an agent';
    `;
    await writeFile(filePath, content);

    const result = await loadAgentSpec(filePath);

    expect(result.spec).toBeUndefined();
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('No valid AgentSpec class found');
  });

  it('should return error when agent has invalid name', async () => {
    const filePath = join(testDir, 'invalid-agent.ts');
    const content = `
      export class InvalidAgent {
        name = 'InvalidName'; // Not kebab-case
        config = {
          description: 'Test agent',
          model: 'anthropic/claude-3-5-sonnet-20241022',
        };
      }
    `;
    await writeFile(filePath, content);

    const result = await loadAgentSpec(filePath);

    expect(result.spec).toBeUndefined();
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('kebab-case');
  });

  it('should return error when agent is missing config', async () => {
    const filePath = join(testDir, 'no-config.ts');
    const content = `
      export class NoConfigAgent {
        name = 'no-config';
      }
    `;
    await writeFile(filePath, content);

    const result = await loadAgentSpec(filePath);

    expect(result.spec).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  it('should return error when file does not exist', async () => {
    const filePath = join(testDir, 'nonexistent.ts');

    const result = await loadAgentSpec(filePath);

    expect(result.spec).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  it('should return error when file has syntax errors', async () => {
    const filePath = join(testDir, 'syntax-error.ts');
    const content = `
      export class SyntaxError {
        name = 'syntax-error'
        config = { // Missing semicolon above will cause syntax error
          description: 'Test'
      }
    `;
    await writeFile(filePath, content);

    const result = await loadAgentSpec(filePath);

    expect(result.spec).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  it('should include file path in result', async () => {
    const filePath = join(testDir, 'agent.ts');
    const content = `
      export default class Agent {
        name = 'test';
        config = { description: 'Test', model: 'test' };
      }
    `;
    await writeFile(filePath, content);

    const result = await loadAgentSpec(filePath);

    expect(result.filePath).toBe(filePath);
  });

  it('should handle verbose mode without throwing', async () => {
    const filePath = join(testDir, 'agent.ts');
    const content = `
      export default class Agent {
        name = 'verbose-test';
        config = { description: 'Test', model: 'test' };
      }
    `;
    await writeFile(filePath, content);

    const result = await loadAgentSpec(filePath, true);

    expect(result.spec).toBeDefined();
  });
});
