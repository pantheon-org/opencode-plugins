import { mkdtemp, mkdir, writeFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

import { afterEach, beforeEach, describe, it, expect } from 'bun:test';

import { discoverAgentSpecs } from './discover-agent-specs';

describe('discoverAgentSpecs', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'discover-test-'));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('should discover agent spec files in default directory', async () => {
    const agentsDir = join(testDir, '.opencode', 'agent');
    await mkdir(agentsDir, { recursive: true });
    await writeFile(join(agentsDir, 'agent1.ts'), 'content');
    await writeFile(join(agentsDir, 'agent2.js'), 'content');

    const files = await discoverAgentSpecs(testDir);

    expect(files).toHaveLength(2);
    expect(files).toContain(join(agentsDir, 'agent1.ts'));
    expect(files).toContain(join(agentsDir, 'agent2.js'));
  });

  it('should discover agent specs in custom directory', async () => {
    const customDir = join(testDir, 'custom-agents');
    await mkdir(customDir, { recursive: true });
    await writeFile(join(customDir, 'agent.ts'), 'content');

    const files = await discoverAgentSpecs(testDir, { agentsDir: 'custom-agents' });

    expect(files).toHaveLength(1);
    expect(files).toContain(join(customDir, 'agent.ts'));
  });

  it('should discover agent specs recursively in subdirectories', async () => {
    const agentsDir = join(testDir, '.opencode', 'agent');
    await mkdir(join(agentsDir, 'category1'), { recursive: true });
    await mkdir(join(agentsDir, 'category2'), { recursive: true });

    await writeFile(join(agentsDir, 'root-agent.ts'), 'content');
    await writeFile(join(agentsDir, 'category1', 'agent1.ts'), 'content');
    await writeFile(join(agentsDir, 'category2', 'agent2.js'), 'content');

    const files = await discoverAgentSpecs(testDir);

    expect(files).toHaveLength(3);
  });

  it('should return empty array when agents directory does not exist', async () => {
    const files = await discoverAgentSpecs(testDir);

    expect(files).toHaveLength(0);
  });

  it('should return empty array when agents directory is empty', async () => {
    const agentsDir = join(testDir, '.opencode', 'agent');
    await mkdir(agentsDir, { recursive: true });

    const files = await discoverAgentSpecs(testDir);

    expect(files).toHaveLength(0);
  });

  it('should only find TypeScript and JavaScript files', async () => {
    const agentsDir = join(testDir, '.opencode', 'agent');
    await mkdir(agentsDir, { recursive: true });
    await writeFile(join(agentsDir, 'agent.ts'), 'content');
    await writeFile(join(agentsDir, 'agent.js'), 'content');
    await writeFile(join(agentsDir, 'README.md'), 'content');
    await writeFile(join(agentsDir, 'config.json'), 'content');
    await writeFile(join(agentsDir, 'types.d.ts'), 'content');

    const files = await discoverAgentSpecs(testDir);

    expect(files).toHaveLength(3); // .ts, .js, and .d.ts files
    expect(files.some((f) => f.endsWith('.md'))).toBe(false);
    expect(files.some((f) => f.endsWith('.json'))).toBe(false);
  });

  it('should return empty array when path is not a directory', async () => {
    const filePath = join(testDir, '.opencode', 'agent');
    await mkdir(join(testDir, '.opencode'), { recursive: true });
    await writeFile(filePath, 'this is a file, not a directory');

    const files = await discoverAgentSpecs(testDir);

    expect(files).toHaveLength(0);
  });

  it('should handle verbose mode without throwing', async () => {
    const agentsDir = join(testDir, '.opencode', 'agent');
    await mkdir(agentsDir, { recursive: true });
    await writeFile(join(agentsDir, 'agent.ts'), 'content');

    const files = await discoverAgentSpecs(testDir, { verbose: true });

    expect(files).toHaveLength(1);
  });
});
