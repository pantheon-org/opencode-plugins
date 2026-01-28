# Bun and TypeScript Development Standards

> **Project Standard**: This project uses **Bun** as the JavaScript runtime and package manager, and **TypeScript**
> exclusively for all code.  
> **Last Updated**: December 2024  
> **Bun Version**: 1.3.3+  
> **TypeScript Version**: 5.0+

## Overview

This monorepo is built exclusively on **Bun** and **TypeScript**. We do not use Node.js, Yarn, pnpm, Deno, or plain
JavaScript.

**Key Technologies:**

- **Runtime**: Bun (not Node.js, Deno)
- **Package Manager**: Bun (not npm, Yarn, pnpm)
- **Language**: TypeScript only (no JavaScript)
- **Monorepo Tool**: Nx
- **Build Tool**: tsup (powered by esbuild)

## Module System Strategy

This monorepo uses a **mixed module system** approach:

- **Root workspace**: CommonJS (no `"type": "module"` in root `package.json`)
  - Provides compatibility with Nx executors and Jest
  - Root scripts remain CommonJS by design
- **Apps & Packages**: ESM (`"type": "module"` in their `package.json`)
  - Modern ESM syntax with `import`/`export`
  - Better tree-shaking and compatibility with modern tools
- **Nx Executors & Generators**: CommonJS (Nx convention)
  - Located in `tools/executors/` and `tools/generators/`
  - Use `require()` for Nx compatibility
- **Test Files**: Mixed
  - Jest tests use CommonJS
  - Bun tests use ESM

### ESM Compliance

A CI check (`bun run check:esm`) enforces that `.js` files in ESM packages (with `"type": "module"`) do not use
`require()`. This prevents runtime errors from mixing CommonJS and ESM.

**Guidelines:**

- ✅ Use `import`/`export` in all app and package `.js`/`.ts` files
- ✅ Keep Nx executors/generators as CommonJS
- ✅ Keep Jest config and root scripts as CommonJS
- ❌ Don't use `require()` in ESM packages

See [Session Notes](../../.context/sessions/require-to-esm-session-2025-12-07.md) for the full conversion history.

## Why Bun and TypeScript Only?

### Bun Advantages

1. **Speed**: Significantly faster package installation, script execution, and module resolution
2. **Built-in Tools**: Native TypeScript execution, testing, bundling, and watch mode
3. **Simplified Stack**: Single runtime eliminates multiple tools

### TypeScript-Only Advantages

1. **Type Safety**: Catch errors at compile time
2. **Better IDE Support**: Full IntelliSense and autocomplete
3. **Refactoring**: Safer code changes
4. **Maintainability**: Types serve as inline documentation

## TypeScript Configuration

### Base Configuration (tsconfig.base.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "declaration": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "baseUrl": "."
  }
}
```

**Key Settings:**

- `strict: true` - Maximum type checking (required)
- `declaration: true` - Generate .d.ts files for libraries
- `target: "ES2022"` - Modern JavaScript features

## Bun Commands

### Package Management

```bash
# Install dependencies
bun install

# Add packages
bun add <package-name>
bun add -D <package-name>

# Remove packages
bun remove <package-name>
```

**DO NOT USE**: `npm`, `yarn`, `pnpm` commands

### Running TypeScript

```bash
# Run TypeScript directly (no transpilation needed)
bun run src/index.ts

# Watch mode
bun --watch src/index.ts

# Run tests
bun test
```

### Building with Nx

```bash
# Build all packages
bun run build

# Build specific package
bunx nx build opencode-my-plugin

# Watch mode
bunx nx build opencode-my-plugin --watch
```

**DO NOT USE**: `npx`, `yarn nx`, `pnpm nx`

## Code Organization Standards

### 1. One Function Per Module

**Rule**: Each module should export a single primary function or class.

**Why**: Improves testability, reduces coupling, makes dependencies explicit.

```typescript
// ✅ Good: Single responsibility
// src/utils/validate-name.ts
export function validateName(name: string): boolean {
  return /^[a-z][a-z0-9-]*$/.test(name);
}

// src/utils/format-error.ts
export function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// ❌ Bad: Multiple unrelated functions
// src/utils/helpers.ts
export function validateName(name: string): boolean {
  /* ... */
}
export function formatError(error: unknown): string {
  /* ... */
}
export function parseConfig(data: unknown): Config {
  /* ... */
}
```

**Exceptions**:

- Related helper functions (e.g., `createUser` and `updateUser`)
- Type definitions with their validators
- Constants that belong together

### 2. Barrel Modules (Index Files)

**Rule**: Use `index.ts` files to create public APIs and re-export related modules.

**Why**: Simplifies imports, controls public API surface, enables easier refactoring.

```typescript
// ✅ Good: Barrel module pattern
// src/utils/index.ts
export { validateName } from "./validate-name";
export { formatError } from "./format-error";
export { parseConfig } from "./parse-config";

// Consumers use clean imports
import { validateName, formatError } from "./utils";

// ❌ Bad: Deep imports
import { validateName } from "./utils/validate-name";
import { formatError } from "./utils/format-error";
```

**Structure Example**:

```
src/
├── index.ts           # Main entry point (barrel)
├── utils/
│   ├── index.ts       # Utils barrel
│   ├── validate-name.ts
│   ├── format-error.ts
│   └── parse-config.ts
├── types/
│   ├── index.ts       # Types barrel
│   ├── config.ts
│   └── errors.ts
└── core/
    ├── index.ts       # Core barrel
    ├── plugin.ts
    └── registry.ts
```

**Barrel Best Practices**:

```typescript
// src/index.ts - Main entry point
export { pluginName } from "./core/plugin";
export { registerPlugin } from "./core/registry";
export type { PluginConfig } from "./types/config";

// Export categories separately
export * from "./utils";
export * from "./types";

// ❌ Avoid: Don't barrel everything blindly
export * from "./core"; // May expose internal APIs
```

### 3. Test Collocation

**Rule**: Place test files next to the code they test with `.test.ts` suffix.

**Why**: Makes tests easier to find, encourages testing, keeps related code together.

```typescript
// ✅ Good: Tests next to implementation
src/
├── utils/
│   ├── index.ts
│   ├── validate-name.ts
│   ├── validate-name.test.ts  ← Test collocated
│   ├── format-error.ts
│   └── format-error.test.ts   ← Test collocated

// ❌ Bad: Separate test directory
src/
├── utils/
│   ├── validate-name.ts
│   └── format-error.ts
└── __tests__/
    ├── validate-name.test.ts  ← Far from implementation
    └── format-error.test.ts
```

**Test File Naming**:

```typescript
// Implementation
src / utils / validate - name.ts;

// Test (same directory)
src / utils / validate - name.test.ts;
```

**Test Structure**:

```typescript
// validate-name.test.ts
import { describe, it, expect } from "bun:test";
import { validateName } from "./validate-name";

describe("validateName", () => {
  it("should accept valid kebab-case names", () => {
    expect(validateName("my-plugin")).toBe(true);
  });

  it("should reject names starting with numbers", () => {
    expect(validateName("123-plugin")).toBe(false);
  });

  it("should reject names with uppercase letters", () => {
    expect(validateName("MyPlugin")).toBe(false);
  });
});
```

## TypeScript Standards

### Strict Mode Required

All code must compile with `strict: true`:

```typescript
// ✅ Good: Null checks
function getName(user: User | null): string {
  if (!user) return "Unknown";
  return user.name;
}

// ❌ Bad: Assuming non-null
function getName(user: User | null): string {
  return user.name; // Error: Object is possibly 'null'
}
```

### Avoid `any` Type

```typescript
// ✅ Good: Proper typing
function parseData<T>(data: unknown): T | null {
  if (typeof data === "object" && data !== null) {
    return data as T;
  }
  return null;
}

// ❌ Bad: Using any
function parseData(data: any): any {
  return data;
}
```

### Explicit Return Types

```typescript
// ✅ Good: Explicit return type
export async function fetchData(url: string): Promise<Data> {
  const response = await fetch(url);
  return response.json();
}

// ❌ Bad: Inferred return type
export async function fetchData(url: string) {
  const response = await fetch(url);
  return response.json();
}
```

### Type vs Interface

```typescript
// ✅ Prefer types for function signatures and unions
export type Validator = (value: unknown) => boolean;
export type Status = "pending" | "success" | "error";

// ✅ Use interfaces for object shapes
export interface PluginConfig {
  name: string;
  version: string;
  options?: Record<string, unknown>;
}

// ✅ Interfaces can extend
export interface ExtendedConfig extends PluginConfig {
  advanced: boolean;
}
```

## File Naming Conventions

```typescript
// ✅ Correct
src / index.ts;
src / plugin.ts;
src / utils / validate - name.ts;
src / utils / validate - name.test.ts;
src / types / config.ts;

// ❌ Incorrect
src / index.js; // No JavaScript
src / Plugin.ts; // Use kebab-case
src / utils / helpers.ts; // Too generic, violates 1 function per module
```

## Module Export Patterns

### Named Exports (Preferred)

```typescript
// ✅ Good: Named exports for utilities
export function validateName(name: string): boolean {
  return /^[a-z][a-z0-9-]*$/.test(name);
}

export const PLUGIN_PREFIX = "opencode-";

export interface PluginOptions {
  enabled: boolean;
}
```

### Default Exports (Entry Points Only)

```typescript
// ✅ Good: Default export for main entry
// src/index.ts
export default function createPlugin(config: Config): Plugin {
  return {
    /* ... */
  };
}

// Also provide named exports
export { validateConfig } from "./utils";
export type { Config, Plugin } from "./types";
```

### Re-exports (Barrel Pattern)

```typescript
// ✅ Good: Barrel module
// src/utils/index.ts
export { validateName } from "./validate-name";
export { formatError } from "./format-error";

// ✅ Good: Type re-exports
// src/types/index.ts
export type { Config } from "./config";
export type { Plugin } from "./plugin";
```

## Linting and Formatting with Biome

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

### Why Biome?

1. **Performance**: 10-30x faster than ESLint + Prettier
2. **Single Tool**: Combines linting and formatting in one tool
3. **Modern**: Native TypeScript support, better error messages
4. **Simple**: One configuration file (`biome.json`)

### Commands

```bash
# Lint and format all packages
bun run lint

# Lint only affected packages (fast, uses batch mode)
bun run lint:affected

# Format all files
bun run format

# Check formatting without changes
bun run format:check

# Validate TSDoc comments
bun run validate:tsdoc

# Manual usage: lint and format with auto-fix
biome check --write .

# Manual usage: format only
biome format --write .
```

### CI Integration

CI uses `biome ci --reporter=github` which:
- Runs lint and format checks without modifications
- Reports diagnostics as GitHub annotations
- Automatically uses `--changed` with VCS integration

### TSDoc Validation

TSDoc syntax is validated separately using a custom NX executor:
- Uses `@microsoft/tsdoc` parser
- Runs on all TypeScript files (except tests and declarations)
- Configurable to fail on warnings
- Integrated in CI and git hooks

### Architecture Principle: One Function Per Module

To manage complexity and improve maintainability:
- Each module should export a single primary function or class
- Barrel modules (`index.ts`) are used for public API re-exports
- Biome's `complexity.noExcessiveCognitiveComplexity` (max: 15) supports this approach
- Replaces previous `import/max-dependencies: 10` rule

**Why this matters:**
- Smaller modules are easier to understand and test
- Explicit dependencies make architecture clearer
- Biome's complexity rules prevent overly complex functions
- Code review can focus on module responsibilities

### Configuration

Biome is configured in `biome.json` at the workspace root. Key settings:

```json
{
  "formatter": {
    "enabled": true,
    "lineWidth": 120,
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noExcessiveCognitiveComplexity": "warn"
      },
      "style": {
        "useImportType": "error",
        "useNodejsImportProtocol": "error"
      }
    }
  }
}
```

### Debugging Linting Issues

```bash
# Check all files
biome check .

# Check specific file
biome check src/utils/validate.ts

# Fix issues automatically
biome check --write .

# Explain specific rule
biome explain noUnusedVariables

# Show configuration
biome rage
```

### Git Hooks

Git hooks automatically run Biome on affected files:
- **pre-commit**: Lint and format changed files with `--write`
- **pre-push**: Run full validation suite

If hooks fail, fix the issues and commit again. Use `--no-verify` only when absolutely necessary.

## Bun-Specific Features

### Bun Shell

```typescript
import { $ } from "bun";

// Execute commands
const output = await $`ls -la`.text();

// Error handling
try {
  await $`some-command`;
} catch (error) {
  console.error("Command failed:", error);
}
```

### Bun Testing

```typescript
// validate-name.test.ts
import { describe, it, expect } from "bun:test";
import { validateName } from "./validate-name";

describe("validateName", () => {
  it("should validate plugin names", () => {
    expect(validateName("my-plugin")).toBe(true);
  });
});
```

**Run tests**:

```bash
bun test                    # All tests
bun test --watch            # Watch mode
bun test validate-name.test.ts  # Specific file
```

### Bun File I/O

```typescript
// Read files
const file = Bun.file("package.json");
const text = await file.text();
const json = await file.json();

// Write files
await Bun.write("output.txt", "content");
await Bun.write("data.json", JSON.stringify(data));
```

## Build Configuration

### Package Structure

```json
{
  "name": "@pantheon-org/opencode-my-plugin",
  "version": "0.1.0",
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "bunx tsup src/index.ts --format esm,cjs --dts --out-dir dist",
    "test": "bun test",
    "dev": "bunx tsup src/index.ts --format esm,cjs --dts --out-dir dist --watch"
  }
}
```

### tsup Output

```bash
dist/
├── index.js      # ESM output
├── index.cjs     # CommonJS output
├── index.d.ts    # Type declarations
└── *.map         # Source maps
```

## Common Patterns

### Plugin Entry Point

```typescript
// src/index.ts
export function pluginName(): string {
  return "opencode-my-plugin";
}

export async function initialize(config: PluginConfig): Promise<void> {
  // Plugin initialization
}

export interface PluginConfig {
  enabled: boolean;
  options?: Record<string, unknown>;
}

// Re-export utilities
export { validateConfig } from "./utils";
```

### Error Handling

```typescript
// src/errors/plugin-error.ts
export class PluginError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "PluginError";
  }
}

// src/errors/index.ts (barrel)
export { PluginError } from "./plugin-error";
```

### Utility Module

```typescript
// src/utils/retry.ts
export async function retry<T>(fn: () => Promise<T>, attempts: number = 3, delay: number = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retry(fn, attempts - 1, delay);
  }
}

// src/utils/retry.test.ts
import { describe, it, expect } from "bun:test";
import { retry } from "./retry";

describe("retry", () => {
  it("should retry failed operations", async () => {
    let attempts = 0;
    const fn = async () => {
      attempts++;
      if (attempts < 3) throw new Error("fail");
      return "success";
    };

    const result = await retry(fn);
    expect(result).toBe("success");
    expect(attempts).toBe(3);
  });
});
```

## Troubleshooting

### Bun Issues

```bash
# Update Bun
bun upgrade

# Clear cache
rm -rf ~/.bun/install/cache

# Reinstall dependencies
rm -rf node_modules bun.lockb
bun install
```

### TypeScript Issues

```bash
# Check configuration
bunx tsc --showConfig

# Type check without emit
bunx tsc --noEmit

# Clean and rebuild
rm -rf dist && bun run build
```

### Nx Cache Issues

```bash
# Clear Nx cache
bunx nx reset

# Full reset
bunx nx reset && rm -rf node_modules bun.lockb && bun install
```

## Rules Summary

### Required Standards

1. ✅ **Use Bun exclusively** - No Node.js, npm, yarn, pnpm
2. ✅ **TypeScript only** - No JavaScript files (except Nx generators)
3. ✅ **Strict mode enabled** - All code must compile with `strict: true`
4. ✅ **One function per module** - Single responsibility principle
5. ✅ **Barrel modules** - Use index.ts for clean APIs
6. ✅ **Test collocation** - Tests next to implementation
7. ✅ **Explicit types** - No `any`, explicit return types

### Formatting and Linting

These are handled by ESLint and Prettier (see their respective configs):

- Code formatting
- Import ordering
- Semicolons, quotes, etc.
- Line length
- Indentation

## Exception

The only exception to TypeScript-only rule:

- **Nx Generators** (`tools/generators/**/index.js`) - JavaScript for Nx compatibility

## Resources

- [Bun Documentation](https://bun.sh/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Nx Documentation](https://nx.dev/docs)

## Related Documentation

- [Creating Nx Generators](./creating-nx-generators.md)
- [Extending Nx Plugins](./extending-nx-plugins.md)
- [OpenCode Plugin Development](./opencode-development-plugin-guide.md)
