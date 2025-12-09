# Module System Strategy

> **Decision Date**: December 9, 2025  
> **Status**: Active  
> **Related**: [Session Notes](../.context/sessions/require-to-esm-session-2025-12-07.md)

## Overview

This document defines the module system strategy for the opencode-plugins monorepo and explains the rationale for
maintaining a mixed CommonJS/ESM approach.

## Strategy

This monorepo uses a **mixed module system** approach where different parts of the codebase use the most appropriate
module system for their context:

| Component           | Module System | Rationale                                        |
| ------------------- | ------------- | ------------------------------------------------ |
| **Root workspace**  | CommonJS      | Nx and Jest require CommonJS at root             |
| **Apps & Packages** | ESM           | Modern tooling, tree-shaking, better performance |
| **Nx Executors**    | CommonJS      | Nx convention and requirement                    |
| **Nx Generators**   | CommonJS      | Nx convention and requirement                    |
| **Jest Config**     | CommonJS      | Jest ecosystem is CommonJS-first                 |
| **Root Scripts**    | CommonJS      | Root package.json is CommonJS                    |
| **Test Files**      | Mixed         | Jest uses CommonJS, Bun uses ESM                 |

## ESM Packages

### Identification

Packages with `"type": "module"` in their `package.json`:

- `apps/docs-builder/`
- `apps/opencode-font/`
- `packages/opencode-warcraft-notifications-plugin/`
- `packages/opencode-warcraft-notifications-plugin/pages/`

### Rules

In ESM packages:

- ✅ **DO** use `import`/`export` syntax
- ✅ **DO** use `.js` extension for JavaScript files
- ✅ **DO** use dynamic imports for conditional loading: `await import()`
- ❌ **DON'T** use `require()` in `.js` files
- ⚠️ **EXCEPTION** `.cjs` files may use `require()` (CommonJS by extension)

### Enforcement

A CI check (`bun run check:esm`) enforces ESM compliance:

```bash
# Local check
bun run check:esm

# CI check
# Runs automatically on every PR via .github/workflows/validate-pr.yml
```

The check:

- Scans all ESM packages
- Reports `require()` usage in `.js` files
- Excludes intentional CommonJS files (executors, generators, tests, `.cjs`)
- Blocks PRs if violations are found

## CommonJS Components

### Permanent CommonJS

These components will **remain CommonJS indefinitely**:

#### 1. Nx Executors (`tools/executors/`)

**Why CommonJS:**

- Nx convention and requirement
- Nx loads executors via CommonJS resolution
- Migration would require changes to Nx config and runtime

**Files:**

- `tools/executors/typecheck/executor.ts`
- `tools/executors/dev-proxy/executor.ts`
- `tools/executors/dev-proxy/executor.test.ts`

#### 2. Nx Generators (`tools/generators/`)

**Why CommonJS:**

- Nx convention and requirement
- Generators use `require()` for dynamic loading
- Template system expects CommonJS

**Files:**

- `tools/generators/plugin/index.js` (and all generator entry points)

#### 3. Jest Configuration

**Why CommonJS:**

- Jest ecosystem is CommonJS-first
- Jest v30 still has limited ESM support
- Migration is complex with minimal benefit

**Files:**

- `jest.preset.js`
- `jest.config.ts` (may use `require()` for Jest config)

#### 4. Root Scripts

**Why CommonJS:**

- Root `package.json` has no `"type": "module"`
- Nx requires CommonJS at root for workspace resolution
- Scripts in `scripts/` directory

**Files:**

- `scripts/typecheck-tests.js`
- Any other root-level scripts

## Migration Path

### When to Convert to ESM

Convert to ESM when:

- ✅ Creating new packages or apps
- ✅ File is inside an ESM package (has `"type": "module"`)
- ✅ No Nx executor/generator functionality required
- ✅ No Jest-specific patterns

### When to Keep CommonJS

Keep CommonJS when:

- ✅ File is an Nx executor or generator
- ✅ File is Jest configuration
- ✅ File is a root-level script
- ✅ Converting would break existing Nx/Jest functionality

### Conversion Examples

#### Before (CommonJS in ESM package)

```javascript
// ❌ BAD: Using require() in ESM package
const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.toUpperCase();
}

module.exports = { processFile };
```

#### After (ESM)

```javascript
// ✅ GOOD: Using import/export in ESM package
import { readFileSync } from 'fs';
import { join } from 'path';

export function processFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  return content.toUpperCase();
}
```

#### Dynamic Imports

```javascript
// ✅ GOOD: Dynamic import for conditional loading
export async function loadPlugin(name) {
  const plugin = await import(`./plugins/${name}.js`);
  return plugin.default;
}
```

## Troubleshooting

### Error: "require is not defined in ES module scope"

**Cause:** Using `require()` in a file inside an ESM package.

**Solution:**

1. Convert to `import` statement:

   ```javascript
   // Before
   const fs = require('fs');

   // After
   import fs from 'fs';
   ```

2. Or use dynamic import:

   ```javascript
   const fs = await import('fs');
   ```

3. Or rename file to `.cjs`:
   ```bash
   mv file.js file.cjs
   ```

### Error: "Cannot use import statement outside a module"

**Cause:** Using `import` in a CommonJS file (no `"type": "module"`).

**Solution:**

1. Use `require()` instead:

   ```javascript
   const fs = require('fs');
   ```

2. Or add `"type": "module"` to package.json (if appropriate)

### CI Check Failing

**Cause:** `require()` found in ESM package `.js` file.

**Solution:**

1. Check which files are failing:

   ```bash
   bun run check:esm
   ```

2. Convert to ESM syntax (see examples above)

3. If file should be CommonJS, rename to `.cjs` or move to appropriate location

## References

- [Node.js ESM Documentation](https://nodejs.org/api/esm.html)
- [Nx Documentation](https://nx.dev)
- [Jest ESM Support](https://jestjs.io/docs/ecmascript-modules)
- [Session Notes](../.context/sessions/require-to-esm-session-2025-12-07.md) - Full conversion history

## Appendix: File Inventory

### ESM Packages (Current)

```
apps/docs-builder/                          # ESM
├── transform-docs.js                       # ✅ ESM
└── package.json                            # "type": "module"

apps/opencode-font/                         # ESM
├── scripts/                                # ✅ All ESM
└── package.json                            # "type": "module"

packages/opencode-warcraft-notifications-plugin/   # ESM
├── src/                                    # ✅ All ESM
└── package.json                            # "type": "module"

packages/opencode-warcraft-notifications-plugin/pages/  # ESM
├── transform-docs.js                       # ✅ ESM
└── package.json                            # "type": "module"
```

### CommonJS Components (Permanent)

```
tools/
├── executors/
│   ├── typecheck/executor.ts               # ⚠️ CommonJS (Nx)
│   └── dev-proxy/
│       ├── executor.ts                     # ⚠️ CommonJS (Nx)
│       └── executor.test.ts                # ⚠️ CommonJS (Jest)
└── generators/
    └── plugin/index.js                     # ⚠️ CommonJS (Nx)

scripts/
└── typecheck-tests.js                      # ⚠️ CommonJS (root)

jest.preset.js                              # ⚠️ CommonJS (Jest)
```

### Validation Status

Last checked: December 9, 2025

```bash
$ bun run check:esm
🔍 Checking for require() usage in ESM packages...

Found 4 ESM package(s):
  - packages/opencode-warcraft-notifications-plugin
  - packages/opencode-warcraft-notifications-plugin/pages
  - apps/docs-builder
  - apps/opencode-font

✅ No require() violations found in ESM packages!
```

---

**Maintainer Notes:**

This strategy is not about purity or ideology. It's about using the right tool for the right job:

- ESM in apps/packages = better performance, modern tooling
- CommonJS in infrastructure = stability, compatibility, less risk

Mixed module systems are normal and accepted in modern Node.js projects. Don't force conversions unless there's a clear,
measurable benefit.
