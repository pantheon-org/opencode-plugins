# Testing Guide - OpenCode Augmented Plugin

This guide explains how to test the `opencode-agent-loader-plugin` both locally and in a real OpenCode environment.

## Local Testing

### 1. Build the Plugin

```bash
cd packages/opencode-agent-loader-plugin
bun install
bun run build
```

This creates the distributable files in `dist/`:

- `dist/index.js` - Main entry point
- `dist/index.d.ts` - TypeScript declarations
- `dist/*.js` - Supporting modules

### 2. Link for Local Development

```bash
# In the plugin directory
bun link

# In your test project
cd /path/to/test/project
bun link @pantheon-org/opencode-agent-loader-plugin
```

## Integration Testing

### Test Case 1: Basic Agent Loading

**Setup:**

1. Create test directory structure:

   ```bash
   mkdir -p test-project/.opencode/agents
   cd test-project
   ```

2. Initialize OpenCode config:

   ```json
   // opencode.json
   {
     "$schema": "https://opencode.ai/config.json",
     "plugin": ["@pantheon-org/opencode-agent-loader-plugin"]
   }
   ```

3. Create a simple agent spec:

   ```typescript
   // .opencode/agents/test-agent.ts
   import type { AgentSpec } from '@pantheon-org/opencode-agent-loader-plugin';
   import type { AgentConfig } from '@opencode-ai/sdk';

   export class TestAgent implements AgentSpec {
     name = 'test-agent';

     config: AgentConfig = {
       description: 'Simple test agent',
       prompt: 'You are a test agent',
       tools: {
         read: true,
       },
     };
   }
   ```

**Expected Result:**

When you start OpenCode, you should see:

```
[opencode-agent-loader-plugin] Initializing plugin
[opencode-agent-loader-plugin] Worktree: /path/to/test-project
[opencode-agent-loader-plugin] Loaded 1 agent spec(s): test-agent
```

**Verification:**

```bash
# Use the agent
opencode --agent test-agent "Hello, test agent!"
```

### Test Case 2: Multiple Agents

**Setup:**

Create multiple agent specs:

```typescript
// .opencode/agents/code-reviewer.ts
export class CodeReviewAgent implements AgentSpec {
  name = 'code-reviewer';
  config: AgentConfig = {
    /* ... */
  };
}
```

```typescript
// .opencode/agents/devops.ts
export class DevOpsAgent implements AgentSpec {
  name = 'devops-expert';
  config: AgentConfig = {
    /* ... */
  };
}
```

**Expected Result:**

```
[opencode-agent-loader-plugin] Loaded 2 agent spec(s): code-reviewer, devops-expert
```

### Test Case 3: Subdirectories

**Setup:**

```bash
mkdir -p .opencode/agents/specialized
```

```typescript
// .opencode/agents/specialized/security.ts
export class SecurityAgent implements AgentSpec {
  name = 'security-expert';
  config: AgentConfig = {
    /* ... */
  };
}
```

**Expected Result:**

Agents in subdirectories should be discovered automatically.

### Test Case 4: Error Handling

#### Invalid Agent Name

```typescript
// .opencode/agents/invalid.ts
export class InvalidAgent implements AgentSpec {
  name = 'Invalid-Agent'; // Capital letters not allowed
  config: AgentConfig = {};
}
```

**Expected Result:**

```
[opencode-agent-loader-plugin] Failed to load .opencode/agents/invalid.ts: Invalid agent name "Invalid-Agent": must be kebab-case
[opencode-agent-loader-plugin] Failed to load 1 agent spec(s)
```

#### Missing Directory

If `.opencode/agents/` doesn't exist:

**Expected Result:**

```
[opencode-agent-loader-plugin] No agent specs found
[opencode-agent-loader-plugin] Create agent specs in: /path/to/project/.opencode/agents
```

### Test Case 5: Verbose Mode

```bash
export OPENCODE_VERBOSE=true
opencode
```

**Expected Result:**

```
[opencode-agent-loader-plugin] Scanning for agent specs in: /path/to/project/.opencode/agents
[opencode-agent-loader-plugin] Found 2 agent spec file(s)
[opencode-agent-loader-plugin] Loading agent spec: /path/to/project/.opencode/agents/test.ts
[opencode-agent-loader-plugin] Loaded agent: test-agent
[opencode-agent-loader-plugin] Registering agents with OpenCode config
[opencode-agent-loader-plugin] Registered agent: test-agent
[opencode-agent-loader-plugin] Agent registration complete
```

## Unit Testing

### Test the Loader Directly

```typescript
import { test, expect } from 'bun:test';
import { discoverAgentSpecs, loadAgentSpec } from '../src/loader';
import { join } from 'path';

test('discovers agent specs in directory', async () => {
  const worktree = '/path/to/test/project';
  const files = await discoverAgentSpecs(worktree);

  expect(files.length).toBeGreaterThan(0);
});

test('loads valid agent spec', async () => {
  const result = await loadAgentSpec('/path/to/valid-agent.ts');

  expect(result.spec).toBeDefined();
  expect(result.spec?.name).toBe('test-agent');
  expect(result.error).toBeUndefined();
});

test('handles invalid agent spec', async () => {
  const result = await loadAgentSpec('/path/to/invalid-agent.ts');

  expect(result.spec).toBeUndefined();
  expect(result.error).toBeDefined();
});
```

## Manual Testing Checklist

- [ ] Plugin loads without errors
- [ ] Agents are discovered from `.opencode/agents/`
- [ ] Agents in subdirectories are discovered
- [ ] Agent names are validated (kebab-case only)
- [ ] Invalid agents are skipped with clear error messages
- [ ] Multiple agents can coexist
- [ ] Agent configuration is properly registered
- [ ] Agents are usable via `--agent` flag
- [ ] Verbose logging works correctly
- [ ] Missing agents directory is handled gracefully

## Debugging

### Enable Verbose Logging

```bash
export OPENCODE_VERBOSE=true
```

### Check Agent Registration

After OpenCode starts, check if agents are registered:

```bash
# List available agents
opencode --help
# Look for your custom agents in the list
```

### Inspect Plugin Loading

OpenCode should log plugin initialization:

```bash
opencode 2>&1 | grep "opencode-agent-loader-plugin"
```

### Common Issues

1. **Agent not found**: Check file location and export
2. **Type errors**: Ensure `@opencode-ai/sdk` is installed
3. **Permission denied**: Check file permissions on `.opencode/agents/`
4. **Agent name conflict**: Ensure agent names are unique

## Performance Testing

### Load Time

Test with multiple agents:

```bash
# Time plugin initialization
time opencode --version
```

Expected: < 100ms overhead per agent

### Memory Usage

```bash
# Monitor memory usage
opencode &
PID=$!
ps -o rss,vsz -p $PID
```

## Next Steps

After testing:

1. Fix any issues found
2. Update documentation with findings
3. Add unit tests for edge cases
4. Consider adding integration test suite
5. Publish to npm

## Test Environment Setup

### Minimal Test Project

```bash
# Create test project
mkdir opencode-test-project
cd opencode-test-project

# Initialize
bun init -y
bun add @pantheon-org/opencode-agent-loader-plugin @opencode-ai/sdk

# Create structure
mkdir -p .opencode/agents

# Add config
cat > opencode.json << 'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["@pantheon-org/opencode-agent-loader-plugin"]
}
EOF

# Add test agent
cat > .opencode/agents/test.ts << 'EOF'
import type { AgentSpec } from '@pantheon-org/opencode-agent-loader-plugin';
import type { AgentConfig } from '@opencode-ai/sdk';

export class TestAgent implements AgentSpec {
  name = 'test-agent';
  config: AgentConfig = {
    description: 'Test agent',
    prompt: 'You are a helpful assistant',
  };
}
EOF

# Test
opencode "Hello"
```

## Success Criteria

The plugin is working correctly if:

1. ✅ Builds without errors
2. ✅ Discovers agent specs correctly
3. ✅ Loads valid agent specs
4. ✅ Validates agent names
5. ✅ Handles errors gracefully
6. ✅ Registers agents with OpenCode
7. ✅ Agents are usable in OpenCode
8. ✅ Documentation is complete
