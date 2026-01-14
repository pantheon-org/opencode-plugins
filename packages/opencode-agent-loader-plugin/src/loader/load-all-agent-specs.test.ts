import { mkdtemp, mkdir, writeFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

import { afterEach, beforeEach, describe, it, expect } from 'bun:test';

import { loadAllAgentSpecs } from './load-all-agent-specs';

describe('loadAllAgentSpecs', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'load-all-test-'));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('should load multiple valid agent specs', async () => {
    const agentsDir = join(testDir, '.opencode', 'agent');
    await mkdir(agentsDir, { recursive: true });

    const agent1 = `
      export default class Agent1 {
        name = 'agent-one';
        config = { description: 'First agent', model: 'test' };
      }
    `;
    const agent2 = `
      export class Agent2 {
        name = 'agent-two';
        config = { description: 'Second agent', model: 'test' };
      }
    `;

    await writeFile(join(agentsDir, 'agent1.ts'), agent1);
    await writeFile(join(agentsDir, 'agent2.ts'), agent2);

    const specs = await loadAllAgentSpecs(testDir);

    expect(specs).toHaveLength(2);
    expect(specs.map((s) => s.name)).toContain('agent-one');
    expect(specs.map((s) => s.name)).toContain('agent-two');
  });

  it('should return empty array when no agent files exist', async () => {
    const specs = await loadAllAgentSpecs(testDir);

    expect(specs).toHaveLength(0);
  });

  it('should return empty array when agents directory is empty', async () => {
    const agentsDir = join(testDir, '.opencode', 'agent');
    await mkdir(agentsDir, { recursive: true });

    const specs = await loadAllAgentSpecs(testDir);

    expect(specs).toHaveLength(0);
  });

  it('should skip invalid agent specs and load valid ones', async () => {
    const agentsDir = join(testDir, '.opencode', 'agent');
    await mkdir(agentsDir, { recursive: true });

    const validAgent = `
      export default class ValidAgent {
        name = 'valid-agent';
        config = { description: 'Valid', model: 'test' };
      }
    `;
    const invalidAgent = `
      export default class InvalidAgent {
        name = 'InvalidName'; // Not kebab-case
        config = { description: 'Invalid', model: 'test' };
      }
    `;

    await writeFile(join(agentsDir, 'valid.ts'), validAgent);
    await writeFile(join(agentsDir, 'invalid.ts'), invalidAgent);

    const specs = await loadAllAgentSpecs(testDir);

    expect(specs).toHaveLength(1);
    expect(specs[0].name).toBe('valid-agent');
  });

  it('should load agents from nested directories', async () => {
    const agentsDir = join(testDir, '.opencode', 'agent');
    await mkdir(join(agentsDir, 'category1'), { recursive: true });
    await mkdir(join(agentsDir, 'category2'), { recursive: true });

    const agentTemplate = (name: string) => `
      export default class Agent {
        name = '${name}';
        config = { description: 'Test', model: 'test' };
      }
    `;

    await writeFile(join(agentsDir, 'root.ts'), agentTemplate('root-agent'));
    await writeFile(join(agentsDir, 'category1', 'nested1.ts'), agentTemplate('nested-one'));
    await writeFile(join(agentsDir, 'category2', 'nested2.ts'), agentTemplate('nested-two'));

    const specs = await loadAllAgentSpecs(testDir);

    expect(specs).toHaveLength(3);
    expect(specs.map((s) => s.name)).toContain('root-agent');
    expect(specs.map((s) => s.name)).toContain('nested-one');
    expect(specs.map((s) => s.name)).toContain('nested-two');
  });

  it('should work with custom agents directory', async () => {
    const customDir = join(testDir, 'my-agents');
    await mkdir(customDir, { recursive: true });

    const agent = `
      export default class CustomAgent {
        name = 'custom-agent';
        config = { description: 'Custom', model: 'test' };
      }
    `;
    await writeFile(join(customDir, 'custom.ts'), agent);

    const specs = await loadAllAgentSpecs(testDir, { agentsDir: 'my-agents' });

    expect(specs).toHaveLength(1);
    expect(specs[0].name).toBe('custom-agent');
  });

  it('should handle verbose mode without throwing', async () => {
    const agentsDir = join(testDir, '.opencode', 'agent');
    await mkdir(agentsDir, { recursive: true });

    const agent = `
      export default class VerboseAgent {
        name = 'verbose-agent';
        config = { description: 'Verbose test', model: 'test' };
      }
    `;
    await writeFile(join(agentsDir, 'verbose.ts'), agent);

    const specs = await loadAllAgentSpecs(testDir, { verbose: true });

    expect(specs).toHaveLength(1);
  });

  it('should handle mix of valid and invalid files', async () => {
    const agentsDir = join(testDir, '.opencode', 'agent');
    await mkdir(agentsDir, { recursive: true });

    const validAgent = `
      export default class ValidAgent {
        name = 'valid';
        config = { description: 'Valid', model: 'test' };
      }
    `;
    const notAnAgent = `
      export const someConstant = 'not an agent class';
      export function someFunction() { return 'hello'; }
    `;

    await writeFile(join(agentsDir, 'valid.ts'), validAgent);
    await writeFile(join(agentsDir, 'not-agent.ts'), notAnAgent);

    const specs = await loadAllAgentSpecs(testDir);

    expect(specs).toHaveLength(1);
    expect(specs[0].name).toBe('valid');
  });

  it('should load both .ts and .js files', async () => {
    const agentsDir = join(testDir, '.opencode', 'agent');
    await mkdir(agentsDir, { recursive: true });

    const tsAgent = `
      export default class TsAgent {
        name = 'ts-agent';
        config = { description: 'TypeScript', model: 'test' };
      }
    `;
    const jsAgent = `
      export default class JsAgent {
        name = 'js-agent';
        config = { description: 'JavaScript', model: 'test' };
      }
    `;

    await writeFile(join(agentsDir, 'agent.ts'), tsAgent);
    await writeFile(join(agentsDir, 'agent.js'), jsAgent);

    const specs = await loadAllAgentSpecs(testDir);

    expect(specs).toHaveLength(2);
    expect(specs.map((s) => s.name)).toContain('ts-agent');
    expect(specs.map((s) => s.name)).toContain('js-agent');
  });
});
