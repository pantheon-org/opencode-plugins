# Bun Test Shim — Contributor Note

This repository uses Bun for runtime and tests. To provide type information for `bun:test` across the workspace we
maintain a single, canonical shim at `types/bun-test-shim.d.ts`.

Guidelines for adding tests in a package:

- If your package uses `import { describe } from 'bun:test'` or references Bun test globals in `.spec.ts` / `.test.ts`
  files, make sure the package's test tsconfig includes the repo shim.

  Example in `package/tsconfig.test.json`:

  { "compilerOptions": { "typeRoots": ["./types", "../../types"], "files": ["../../types/bun-test-shim.d.ts"] } }

- Do NOT add additional `declare module 'bun:test'` files in multiple packages — this will cause duplicate declaration
  errors. Prefer adding the repo-level shim or referencing it via `typeRoots` / `files`.

- For package builds (`tsc -p tsconfig.json`), exclude test files from the production build to avoid test-only type
  dependencies causing build failures. Add the following to your `tsconfig.json` if needed:

  "exclude": ["src/**/*.spec.ts", "src/**/*.test.ts"]

- If you need Node built-ins in tools, prefer installing `@types/node` at the workspace root and referencing
  `types: ["node"]` in your package tsconfig rather than adding local type augmentations.

If you run into duplicate type declaration issues, ask maintainers to reconcile `tools/*/types` shims — we prefer having
minimal stubs there and rely on workspace `@types/node` and the canonical `types/bun-test-shim.d.ts`.
