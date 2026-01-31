---
name: nx-executors
description: Create and use custom Nx executors in TypeScript monorepos. Covers executor structure, package references (@scope:executor), schema definitions, ExecutorContext API, and best practices for reusable build tasks.
license: MIT
compatibility: opencode
metadata:
  category: nx-development
  audience: nx-developers
---

# Custom Nx Executors

Create reusable build, test, and development tasks for Nx workspaces.

## Quick Start

### 1. Create Executor Structure

```
tools/executors/
├── my-executor/
│   ├── executor.ts      # Implementation
│   ├── schema.json      # JSON Schema
│   └── schema.d.ts      # TypeScript types
├── executors.json       # Registry
└── package.json         # Package definition
```

### 2. Define Schema

**`tools/executors/my-executor/schema.json`:**

```json
{
  "$schema": "http://json-schema.org/schema",
  "cli": "nx",
  "title": "My Executor",
  "description": "What this executor does",
  "type": "object",
  "properties": {
    "option1": {
      "type": "string",
      "description": "Description of option1"
    },
    "option2": {
      "type": "number",
      "description": "Description of option2",
      "default": 42
    }
  },
  "required": ["option1"]
}
```

**`tools/executors/my-executor/schema.d.ts`:**

```typescript
export interface MyExecutorSchema {
  option1: string;
  option2?: number;
}
```

### 3. Implement Executor

**`tools/executors/my-executor/executor.ts`:**

```typescript
import { ExecutorContext } from '@nx/devkit';
import { MyExecutorSchema } from './schema';

export default async function myExecutor(
  options: MyExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  console.log('Executing my-executor');
  console.log('Project:', context.projectName);

  try {
    // Executor logic
    return { success: true };
  } catch (error) {
    console.error('Executor failed:', error);
    return { success: false };
  }
}
```

### 4. Register in Registry

**`tools/executors/executors.json`:**

```json
{
  "executors": {
    "my-executor": {
      "implementation": "./my-executor/executor",
      "schema": "./my-executor/schema.json",
      "description": "What this executor does"
    }
  }
}
```

### 5. Configure Package

**`tools/executors/package.json`:**

```json
{
  "name": "@scope/tools",
  "version": "0.1.0",
  "main": "../src/index.ts",
  "executors": "./executors.json"
}
```

### 6. Enable Package References

**Root `package.json`:**

```json
{
  "workspaces": [
    "packages/*",
    "tools/executors"
  ]
}
```

**`tsconfig.base.json`:**

```json
{
  "compilerOptions": {
    "paths": {
      "@scope/tools": ["tools/src/index.ts"]
    }
  }
}
```

**Create entry point `tools/src/index.ts`:**

```typescript
/**
 * @scope/tools package entry point
 * Allows Nx to resolve package before accessing executors
 */
```

### 7. Use in Project

**`project.json`:**

```json
{
  "targets": {
    "my-task": {
      "executor": "@scope/tools:my-executor",
      "options": {
        "option1": "value",
        "option2": 123
      }
    }
  }
}
```

### 8. Run

```bash
# Show help
bunx nx run my-project:my-task --help

# Execute
bunx nx run my-project:my-task
```

## ExecutorContext API

Access project and workspace information:

```typescript
export default async function myExecutor(
  options: MyExecutorSchema,
  context: ExecutorContext
) {
  const projectName = context.projectName;
  const projectRoot = context.projectGraph.nodes[projectName].data.root;
  const projectConfig = context.projectGraph.nodes[projectName].data;
  
  // Use project information
}
```

## Package References

### Recommended: Package Reference

```json
{
  "executor": "@scope/tools:dev-proxy"
}
```

**Benefits:**

- Clean, semantic reference
- Refactoring-safe
- Self-documenting

### Avoid: Relative Path Reference

```json
{
  "executor": "../../tools/executors:dev-proxy"
}
```

**Problems:**

- Breaks if structure changes
- Unclear ownership
- Harder to maintain

## Testing Executors

### Show Help

```bash
bunx nx run <project>:<target> --help
```

Verifies:

- Executor can be resolved
- Schema is valid
- Options are correctly defined

### Execute

```bash
bunx nx run <project>:<target>
```

### Dry Run

```bash
bunx nx run <project>:<target> --dry-run
```

## Debugging

### Enable Verbose Output

```bash
bunx nx run <project>:<target> --verbose
```

### Check Executor Resolution

```bash
bunx nx show project <project> --web
```

### Verify Package Structure

```bash
# Verify workspace inclusion
bun pm ls | grep @scope/tools

# Verify path mapping
cat tsconfig.base.json | grep -A2 "@scope/tools"

# Verify package import
node -e "require.resolve('@scope/tools')"
```

## Best Practices

### 1. Always Use Package Reference

```json
// Good
"executor": "@scope/tools:dev-proxy"

// Bad
"executor": "../../tools/executors:dev-proxy"
```

### 2. Provide Clear Schema Documentation

```json
{
  "properties": {
    "port": {
      "type": "number",
      "description": "Port for development server",
      "default": 3000
    }
  }
}
```

### 3. Handle Errors Gracefully

```typescript
try {
  // Logic
  return { success: true };
} catch (error) {
  console.error('Error:', error.message);
  return { success: false };
}
```

### 4. Use ExecutorContext

```typescript
export default async function myExecutor(
  options: MyExecutorSchema,
  context: ExecutorContext
) {
  const projectName = context.projectName;
  const projectRoot = context.projectGraph.nodes[projectName].data.root;
  // Use context
}
```

### 5. Support Standard Options

- `--verbose` for detailed output
- `--dry-run` for preview mode
- `--skip-nx-cache` to bypass cache

## Troubleshooting

### "Unable to resolve @scope/tools:executor-name"

**Verify all three requirements:**

1. ✅ `tools/executors` in workspace (`package.json`)
2. ✅ Path mapping in `tsconfig.base.json`
3. ✅ Entry point exists (`tools/src/index.ts`)
4. ✅ `main` field in `tools/executors/package.json`

### Executor not found in executors.json

**Solution:** Add to `tools/executors/executors.json`:

```json
{
  "executors": {
    "your-executor": {
      "implementation": "./your-executor/executor",
      "schema": "./your-executor/schema.json",
      "description": "Your executor description"
    }
  }
}
```

### Schema validation errors

**Check required fields and types:**

```bash
bunx nx run project:target --help
```

## Migration: Relative Paths to Package References

**Before:**

```json
{
  "targets": {
    "dev": {
      "executor": "../../tools/executors:dev-proxy"
    }
  }
}
```

**After:**

```json
{
  "targets": {
    "dev": {
      "executor": "@scope/tools:dev-proxy"
    }
  }
}
```

**Steps:**

1. Complete workspace configuration
2. Update all `project.json` files
3. Test: `bunx nx run <project>:<target> --help`
4. Commit changes

## Resources

- [Nx Executors](https://nx.dev/concepts/executors-and-configurations)
- [Creating Custom Executors](https://nx.dev/extending-nx/recipes/local-executors)
- [Nx Devkit API](https://nx.dev/reference/devkit)
