# Custom Nx Executors

> **Project Documentation** - Internal workspace patterns  
> **Last Updated**: January 2026  
> **Nx Version**: 22

## Overview

Custom Nx executors allow you to define reusable build, test, and development tasks that can be shared across multiple projects in your workspace. This guide documents the pattern for creating and referencing custom executors in the `opencode-plugins` monorepo.

## Executor Package Structure

Custom executors in this workspace live under `tools/executors/` and are published as the `@pantheon-org/tools` package.

```
tools/
├── executors/
│   ├── check-mirror-exists/      # Executor implementation
│   │   ├── executor.ts
│   │   ├── schema.json
│   │   └── schema.d.ts
│   ├── dev-proxy/                # Another executor
│   │   ├── executor.ts
│   │   ├── schema.json
│   │   └── schema.d.ts
│   ├── typecheck/                # Another executor
│   │   ├── executor.ts
│   │   ├── schema.json
│   │   └── schema.d.ts
│   ├── executors.json            # Executor registry
│   └── package.json              # Package definition
└── src/
    └── index.ts                  # Package entry point (required)
```

## Referencing Executors

### ✅ Recommended: Package Reference

Use the package name to reference executors:

```json
{
  "name": "my-plugin",
  "targets": {
    "dev": {
      "executor": "@pantheon-org/tools:dev-proxy",
      "options": {
        "port": 3000
      }
    },
    "check-mirror": {
      "executor": "@pantheon-org/tools:check-mirror-exists"
    }
  }
}
```

**Benefits:**

- ✅ Clean, semantic reference
- ✅ Consistent with external package patterns
- ✅ Refactoring-safe (directory structure can change)
- ✅ Self-documenting (shows it's from our tools package)

### ❌ Avoid: Relative Path Reference

```json
{
  "targets": {
    "dev": {
      "executor": "../../tools/executors:dev-proxy"  // Fragile
    }
  }
}
```

**Problems:**

- ❌ Breaks if directory structure changes
- ❌ Unclear ownership
- ❌ Inconsistent with external packages
- ❌ Harder to maintain

## Enabling Package References

To enable `@pantheon-org/tools:executor-name` syntax, three configurations are required:

### 1. Workspace Inclusion (Bun)

Add the executors package to the workspace in root `package.json`:

```json
{
  "workspaces": [
    "packages/*",
    "apps/*",
    "tools/executors"
  ]
}
```

This allows Bun to recognize `@pantheon-org/tools` as a workspace package.

### 2. TypeScript Path Mapping

Add path mapping to `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@pantheon-org/tools": ["tools/src/index.ts"]
    }
  }
}
```

This allows TypeScript and Node.js to resolve the import path.

### 3. Package Entry Point

**a) Create package entry point at `tools/src/index.ts`:**

```typescript
/**
 * @pantheon-org/tools package entry point
 * 
 * This file exists to allow Nx to resolve the @pantheon-org/tools package
 * before accessing executors defined in tools/executors/executors.json.
 * 
 * The actual executors are defined in:
 * - tools/executors/executors.json (executor registry)
 * - tools/executors/<executor-name>/executor.ts (implementation)
 * 
 * See tools/executors/package.json for the executor definitions.
 */
```

**b) Reference it in `tools/executors/package.json`:**

```json
{
  "name": "@pantheon-org/tools",
  "version": "0.1.0",
  "main": "../src/index.ts",
  "executors": "./executors.json"
}
```

## Why All Three Are Required

Nx resolves executor references in this order:

1. **Import the package** → Requires workspace inclusion + path mapping + entry point
2. **Read `executors.json`** → Defined in `package.json` via `"executors"` field
3. **Load executor implementation** → Nx reads from `executors.json`

If the package can't be imported (step 1), Nx fails with:

```
Unable to resolve @pantheon-org/tools:dev-proxy
```

## Creating a New Executor

### 1. Create Executor Directory

```bash
mkdir tools/executors/my-executor
```

### 2. Create Schema Definition

**`tools/executors/my-executor/schema.json`:**

```json
{
  "$schema": "http://json-schema.org/schema",
  "cli": "nx",
  "title": "My Executor",
  "description": "Description of what this executor does",
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

### 3. Create TypeScript Schema

**`tools/executors/my-executor/schema.d.ts`:**

```typescript
export interface MyExecutorSchema {
  option1: string;
  option2?: number;
}
```

### 4. Implement Executor

**`tools/executors/my-executor/executor.ts`:**

```typescript
import { ExecutorContext } from '@nx/devkit';
import { MyExecutorSchema } from './schema';

export default async function myExecutor(
  options: MyExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  console.log('Executing my-executor');
  console.log('Options:', options);
  console.log('Project:', context.projectName);

  try {
    // Executor logic here
    
    return { success: true };
  } catch (error) {
    console.error('Executor failed:', error);
    return { success: false };
  }
}
```

### 5. Register Executor

Add to **`tools/executors/executors.json`:**

```json
{
  "executors": {
    "my-executor": {
      "implementation": "./my-executor/executor",
      "schema": "./my-executor/schema.json",
      "description": "Description of what this executor does"
    }
  }
}
```

### 6. Use in Project

Add to your project's `project.json`:

```json
{
  "targets": {
    "my-task": {
      "executor": "@pantheon-org/tools:my-executor",
      "options": {
        "option1": "value"
      }
    }
  }
}
```

### 7. Run Executor

```bash
# Show help
bunx nx run my-project:my-task --help

# Execute
bunx nx run my-project:my-task
```

## Existing Executors

### dev-proxy

Development proxy for hot-reload testing of plugins.

**Usage:**

```json
{
  "targets": {
    "dev": {
      "executor": "@pantheon-org/tools:dev-proxy",
      "options": {
        "port": 3000,
        "outputPath": "dist"
      }
    }
  }
}
```

**Location:** `tools/executors/dev-proxy/`

### check-mirror-exists

Validates that a GitHub mirror repository exists for the plugin.

**Usage:**

```json
{
  "targets": {
    "check-mirror": {
      "executor": "@pantheon-org/tools:check-mirror-exists"
    }
  }
}
```

**Location:** `tools/executors/check-mirror-exists/`

### typecheck

TypeScript type checking executor.

**Usage:**

```json
{
  "targets": {
    "typecheck": {
      "executor": "@pantheon-org/tools:typecheck"
    }
  }
}
```

**Location:** `tools/executors/typecheck/`

## Testing Executors

### Test Executor Help

```bash
bunx nx run <project>:<target> --help
```

This verifies:

- Executor can be resolved
- Schema is valid
- Options are correctly defined

### Test Executor Execution

```bash
bunx nx run <project>:<target>
```

### Test with Dry Run

Some executors support `--dry-run`:

```bash
bunx nx run <project>:<target> --dry-run
```

## Debugging Executors

### Enable Verbose Output

```bash
bunx nx run <project>:<target> --verbose
```

### Check Executor Resolution

```bash
bunx nx show project <project> --web
```

This opens a web UI showing all targets and their executors.

### Verify Package Structure

```bash
# Verify workspace inclusion
bun pm ls | grep @pantheon-org/tools

# Verify path mapping
cat tsconfig.base.json | grep -A2 "@pantheon-org/tools"

# Verify package can be imported
node -e "require.resolve('@pantheon-org/tools')"
```

## Best Practices

### 1. Always Use Package Reference

```json
// ✅ Good
"executor": "@pantheon-org/tools:dev-proxy"

// ❌ Bad
"executor": "../../tools/executors:dev-proxy"
```

### 2. Provide Clear Schema Documentation

Include descriptions for all options:

```json
{
  "properties": {
    "port": {
      "type": "number",
      "description": "Port number for the development server",
      "default": 3000
    }
  }
}
```

### 3. Handle Errors Gracefully

Always return success/failure status:

```typescript
try {
  // Executor logic
  return { success: true };
} catch (error) {
  console.error('Error:', error.message);
  return { success: false };
}
```

### 4. Use ExecutorContext

Leverage context for project information:

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

### 5. Support Standard Options

Support common Nx options where applicable:

- `--verbose` for detailed output
- `--dry-run` for preview mode
- `--skip-nx-cache` to bypass cache

## Troubleshooting

### "Unable to resolve @pantheon-org/tools:executor-name"

**Cause:** Package reference not properly configured.

**Solution:** Verify all three requirements:

1. ✅ `tools/executors` in workspace (`package.json`)
2. ✅ Path mapping in `tsconfig.base.json`
3. ✅ Entry point exists (`tools/src/index.ts`)
4. ✅ `main` field in `tools/executors/package.json`

### Executor not found in executors.json

**Cause:** Executor not registered.

**Solution:** Add executor to `tools/executors/executors.json`:

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

**Cause:** Options don't match schema.

**Solution:** Check `schema.json` matches your usage:

```bash
bunx nx run project:target --help
```

Compare required fields and types.

## Migration Guide

### From Relative Paths to Package References

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
      "executor": "@pantheon-org/tools:dev-proxy"
    }
  }
}
```

**Steps:**

1. Ensure workspace configuration is complete (see "Enabling Package References")
2. Update all `project.json` files
3. Test each project: `bunx nx run <project>:<target> --help`
4. Commit changes

## Related Documentation

- [Extending Nx Plugins](./extending-nx-plugins.md)
- [Creating Nx Generators](./creating-nx-generators.md)
- [Bun and TypeScript Development](./bun-typescript-development.md)

## Reference

- [Nx Executors Documentation](https://nx.dev/concepts/executors-and-configurations)
- [Creating Custom Executors](https://nx.dev/extending-nx/recipes/local-executors)
- [Nx Devkit API](https://nx.dev/reference/devkit)

## Summary

Custom executors in this workspace follow the `@pantheon-org/tools:executor-name` pattern:

1. **Create** executor in `tools/executors/<name>/`
2. **Register** in `tools/executors/executors.json`
3. **Reference** as `@pantheon-org/tools:<name>` in `project.json`
4. **Run** with `bunx nx run <project>:<target>`

This pattern provides clean, maintainable references that are consistent with external Nx packages.
