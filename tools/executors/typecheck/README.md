Typecheck executor

This executor runs the TypeScript compiler for the workspace.

Usage examples:

- Run a single check:

  nx run tools:typecheck

- Run with a custom tsconfig:

  nx run tools:typecheck --tsconfig=tsconfig.json

- Run in watch mode:

  nx run tools:typecheck --watch
