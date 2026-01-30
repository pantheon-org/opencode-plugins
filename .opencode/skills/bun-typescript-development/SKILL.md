---
name: bun-typescript-development
description: TypeScript development with Bun using TDD, single-function modules, barrel exports, and collocated tests
license: MIT
compatibility: opencode
metadata:
  category: development
  runtime: bun
  language: typescript
---

# Bun and TypeScript Development Standards

This skill guides TypeScript development using Bun as the exclusive runtime and package manager.

## Core Principles

**Use Bun exclusively** - No Node.js, npm, yarn, or pnpm
**TypeScript only** - No JavaScript (except Nx generators)  
**Strict mode enabled** - All code compiles with `strict: true`
**One function per module** - Each module exports a single primary function
**Barrel modules** - Use `index.ts` for public API re-exports
**Test collocation** - Tests next to implementation as `.test.ts`
**Explicit types** - No `any`, explicit return types required

## Module System Strategy

- **Root workspace**: CommonJS (no `"type": "module"` in root package.json)
- **Apps & Packages**: ESM (`"type": "module"` in package.json)
- **Nx Executors/Generators**: CommonJS (Nx convention in `tools/`)
- **Test Files**: Bun tests use ESM, Jest uses CommonJS

## Bun Commands

```bash
# Package management
bun install
bun add <package>
bun add -D <dev-package>
bun remove <package>

# Running TypeScript
bun run src/index.ts
bun --watch src/index.ts
bun test

# Building with Nx
bun run build
bunx nx build <package>
bunx nx build <package> --watch
```

## TypeScript Configuration

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
    "resolveJsonModule": true
  }
}
```

## Code Organization

### One Function Per Module

```typescript
// ✅ Good: Single responsibility
export function validateName(name: string): boolean {
  return /^[a-z][a-z0-9-]*$/.test(name);
}

// ❌ Bad: Multiple unrelated functions in one file
```

### Barrel Modules

```typescript
// src/utils/index.ts
export { validateName } from "./validate-name";
export { formatError } from "./format-error";

// Consumers use clean imports
import { validateName } from "./utils";
```

### Test Collocation

```typescript
// src/utils/validate-name.ts - Implementation
// src/utils/validate-name.test.ts - Test (same directory)

import { describe, it, expect } from "bun:test";
import { validateName } from "./validate-name";

describe("validateName", () => {
  it("should validate names", () => {
    expect(validateName("my-plugin")).toBe(true);
  });
});
```

## Linting with Biome

```bash
# Lint and format
bun run lint
bun run lint:affected
bun run format
bun run format:check
bun run validate:tsdoc

# Manual Biome usage
biome check --write .
biome format --write .
biome check src/utils/validate.ts
biome explain noUnusedVariables
biome rage
```

Biome configuration in `biome.json`:

- Line width: 120
- Indent width: 2
- Complexity rules enabled
- TSDoc validation integrated

## Bun Features

### Shell

```typescript
import { $ } from "bun";
const output = await $`ls -la`.text();
```

### File I/O

```typescript
const file = Bun.file("package.json");
const json = await file.json();
await Bun.write("output.txt", "content");
```

## Build Setup

```json
{
  "name": "@scope/package",
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

## Troubleshooting

```bash
# Bun issues
bun upgrade
rm -rf ~/.bun/install/cache
rm -rf node_modules bun.lockb && bun install

# TypeScript issues
bunx tsc --showConfig
bunx tsc --noEmit
rm -rf dist && bun run build

# Nx cache issues
bunx nx reset
bunx nx reset && rm -rf node_modules bun.lockb && bun install
```

## File Naming

```typescript
// ✅ Correct
src/index.ts
src/utils/validate-name.ts
src/utils/validate-name.test.ts

// ❌ Incorrect
src/index.js // No JavaScript
src/Plugin.ts // Use kebab-case
src/utils/helpers.ts // Too generic
```

## Type Patterns

```typescript
// Prefer types for functions and unions
export type Validator = (value: unknown) => boolean;
export type Status = "pending" | "success" | "error";

// Use interfaces for object shapes
export interface Config {
  name: string;
  version: string;
}
```
