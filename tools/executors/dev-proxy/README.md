# Dev Proxy Executor

Purpose

Run a local development proxy that watches plugin build outputs and creates symlinks for local testing. This executor is
used to streamline local plugin development by keeping the build running and making the built package available to a
runtime via filesystem symlinks.

Options (from `schema.json`)

- `plugins` (array<string>) — list of plugin project names to watch (default: the project invoked from)
- `symlinkRoot` (string) — path under which to create symlinks (default: `.opencode/plugin`)
- `apply` (boolean) — whether to apply symlink changes (default: `true`)

Example NX invocation

# Run the executor for the current project

`nx run <projectName>:dev-proxy`

# Run and override options

`nx run <projectName>:dev-proxy --plugins=opencode-foo-plugin --symlinkRoot=.opencode/plugin --apply=true`

CLI-like usage (via workspace)

# From workspace root (project target configured in project.json)

`bunx nx run opencode-my-plugin:dev-proxy -- --plugins=opencode-my-plugin`

Inputs & Outputs

- Input: options object (see `schema.json`). When run from a project context, `projectName` is used if `--plugins` is
  not provided.
- Output: returns `{ success: boolean }` when executor completes or the runtime returns. Side-effects: starts background
  build watchers and a runtime process, creates symlinks.

Tests

# Run executor unit tests

`bun test tools/executors/dev-proxy/executor.test.ts`

Recommended schema improvements

- Add per-property `description` entries to `schema.json` and provide a small example JSON block in this README.
  Example:

```json
{
  "plugins": ["opencode-my-plugin"],
  "symlinkRoot": ".opencode/plugin",
  "apply": true
}
```

Notes

- This executor prefers using `@nx/devkit.runExecutor` when available (returns async iterables) and falls back to
  spawning a CLI watcher (e.g., `bunx nx run <proj>:build --watch`) if necessary.
- Signal handling: `SIGINT` triggers cleanup of watchers and child processes.

For implementation details, see `tools/executors/dev-proxy/executor.ts` and `tools/executors/dev-proxy/schema.json`.
