import { describe, it, expect } from 'bun:test';

import type { AgentSpec } from '../types';

import { isAgentSpecConstructor } from './is-agent-spec-constructor';

describe('isAgentSpecConstructor', () => {
  it('should identify valid AgentSpec constructors', () => {
    class ValidAgent implements AgentSpec {
      name = 'test-agent';
      config = {
        description: 'Test agent',
        model: 'anthropic/claude-3-5-sonnet-20241022',
      };
    }
    expect(isAgentSpecConstructor(ValidAgent)).toBe(true);
  });

  it('should reject non-constructor values', () => {
    expect(isAgentSpecConstructor(null)).toBe(false);
    expect(isAgentSpecConstructor(undefined)).toBe(false);
    expect(isAgentSpecConstructor('string')).toBe(false);
    expect(isAgentSpecConstructor(123)).toBe(false);
    expect(isAgentSpecConstructor({})).toBe(false);
  });

  it('should reject classes without required properties', () => {
    class InvalidAgent {
      // Missing name and config
    }
    expect(isAgentSpecConstructor(InvalidAgent)).toBe(false);
  });
});
