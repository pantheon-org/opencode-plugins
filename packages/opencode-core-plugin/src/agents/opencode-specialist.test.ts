import { describe, it, expect } from 'bun:test';

import { OpencodeSpecialistAgent } from './opencode-specialist';

describe('OpencodeSpecialistAgent', () => {
  it('has correct agent name', () => {
    const agent = new OpencodeSpecialistAgent();
    expect(agent.name).toBe('opencode');
  });

  it('has agent configuration', () => {
    const agent = new OpencodeSpecialistAgent();
    expect(agent.config).toBeDefined();
    expect(typeof agent.config).toBe('object');
  });

  it('has description', () => {
    const agent = new OpencodeSpecialistAgent();
    expect(agent.config.description).toBeDefined();
    expect(typeof agent.config.description).toBe('string');
    expect(agent.config.description).toContain('OpenCode');
  });

  it('is configured as a subagent', () => {
    const agent = new OpencodeSpecialistAgent();
    expect(agent.config.mode).toBe('subagent');
  });

  it('has reasonable temperature setting', () => {
    const agent = new OpencodeSpecialistAgent();
    expect(agent.config.temperature).toBeDefined();
    expect(typeof agent.config.temperature).toBe('number');
    expect(agent.config.temperature).toBeGreaterThanOrEqual(0);
    expect(agent.config.temperature).toBeLessThanOrEqual(1);
  });

  it('has maxSteps configured', () => {
    const agent = new OpencodeSpecialistAgent();
    expect(agent.config.maxSteps).toBeDefined();
    expect(typeof agent.config.maxSteps).toBe('number');
    expect(agent.config.maxSteps).toBeGreaterThan(0);
  });

  it('has a comprehensive prompt', () => {
    const agent = new OpencodeSpecialistAgent();
    expect(agent.config.prompt).toBeDefined();
    expect(typeof agent.config.prompt).toBe('string');
    expect(agent.config.prompt?.length).toBeGreaterThan(100);
    expect(agent.config.prompt).toContain('OpenCode');
    expect(agent.config.prompt).toContain('configuration');
  });

  it('has tools configured', () => {
    const agent = new OpencodeSpecialistAgent();
    expect(agent.config.tools).toBeDefined();
    expect(typeof agent.config.tools).toBe('object');
  });

  it('enables essential tools for documentation access', () => {
    const agent = new OpencodeSpecialistAgent();
    expect(agent.config.tools?.read).toBe(true);
    expect(agent.config.tools?.webfetch).toBe(true);
  });

  it('has permission configuration', () => {
    const agent = new OpencodeSpecialistAgent();
    expect(agent.config.permission).toBeDefined();
    expect(typeof agent.config.permission).toBe('object');
  });

  it('allows webfetch permission for documentation', () => {
    const agent = new OpencodeSpecialistAgent();
    expect(agent.config.permission?.webfetch).toBe('allow');
  });

  it('has a color configured', () => {
    const agent = new OpencodeSpecialistAgent();
    expect(agent.config.color).toBeDefined();
    expect(typeof agent.config.color).toBe('string');
    expect(agent.config.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('references OpenCode documentation URL', () => {
    const agent = new OpencodeSpecialistAgent();
    expect(agent.config.prompt).toBeDefined();
    expect(agent.config.prompt).toContain('https://opencode.ai/docs');
  });

  it('has expertise areas defined in prompt', () => {
    const agent = new OpencodeSpecialistAgent();

    expect(agent.config.prompt).toBeDefined();
    expect(typeof agent.config.prompt).toBe('string');
    expect(agent.config.prompt).toContain('configuration');
    expect(agent.config.prompt).toContain('plugin');
    expect(agent.config.prompt).toContain('agent');
  });
});
