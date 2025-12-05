# Set up an NX monorepo with Bun + TypeScript and migrate opencode plugins

## Goal

Migrate opencode-related plugins from the parent directory into a new NX workspace in this repository using Bun +
TypeScript, placing all child projects under `./packages` with a scoped npm package namespace, and create GitHub Actions
pipelines for npm package releases and GitHub Pages deployment for each plugin. The result should allow a developer to
build, test (if present), perform a dry-run publish, and deploy plugin documentation via GitHub Actions.

## Context

- Original Prompt: we are going to setup an NX project here where we will transfer the logic of opencode related plugins
  (from the parent directory) - those will all need to have a npm package release pipelines and a gh-page associated
  with them.
- We will use Bun as the runtime and package manager and TypeScript as the language for new and migrated projects.
- All child plugin packages will live in `./packages` and use a scoped npm name (e.g., `@pantheon-org/<plugin-name>`).
- Hosting is GitHub; CI/CD will use GitHub Actions. Plugin selection for migration will be decided later.

## Assumptions

- The parent directory with current plugins is accessible to the user; the migration preserves source but not
  necessarily git history.
- Users will provide `NPM_TOKEN` and any other secrets as GitHub repository secrets when enabling publish workflows.

## Inputs

- Path to parent directory containing plugin source (to be provided when migration begins).
- Preferred package scope (e.g., `@pantheon-org`).
- Confirmation whether to preserve git history for migrated projects (default: no).
- Any existing build/test scripts in plugin projects (if present).

## Deliverables

- Migration plan: `MIGRATION_PLAN.md` with step-by-step checklist.
- NX workspace skeleton and config files: `nx.json`, `package.json` (root), and either `workspace.json` or
  `project.json` entries for each package.
- Directory layout: `packages/<plugin-name>/` for each migrated plugin with its own `package.json` and `tsconfig.json`.
- GitHub Actions workflows:
  - `/.github/workflows/release-<plugin>.yml` that builds with Bun and publishes to npm on tagged releases (supports
    dry-run).
  - `/.github/workflows/gh-pages-<plugin>.yml` to build docs/static assets and deploy to `gh-pages` branch.
- README: `PLUGINS_MIGRATION.md` with `bun` commands to build, test, lint, dry-run publish, and deploy.

## Constraints & Limitations

- Use Bun + TypeScript for builds and scripts.
- Package layout must be `./packages/<plugin-name>` and package names must be scoped (e.g.,
  `@pantheon-org/<plugin-name>`).
- Use GitHub Actions for CI/CD; do not assume access to external services or secrets.
- Do not publish packages automatically or push secrets; workflows should require `NPM_TOKEN` in GitHub secrets.

## Quality Standards & Acceptance Criteria

- `bun build` or `bunx tsup` (documented option) runs successfully for each migrated package or a documented fallback
  exists.
- `npm pack` (via `bunx npm pack` if necessary) produces a tarball locally for each package without errors.
- GitHub Actions workflows exist that will publish to npm when `NPM_TOKEN` exists and trigger on tag pushes.
- GH Pages workflow deploys built static files to `gh-pages` branch when triggered.
- Documentation includes reproducible commands for local build, dry-run publish, and deploy.

## Style & Tone

- Concise technical instructions targeted to a senior engineer; include exact file names and example CLI/YAML snippets
  where relevant.

## Clarifying Questions

1. Confirm the npm package scope to use (example: `@pantheon-org`).
2. Should we preserve Git history for migrated plugins or create fresh packages in the monorepo?
3. Any preferences for how docs are built (e.g., Storybook, simple static site, or README-only)?

## Example Output

- `MIGRATION_PLAN.md` entries:
  1. Initialize NX workspace: `npx create-nx-workspace@latest --preset=empty`.
  2. Add `packages/<plugin>` and copy source; add Bun-based `package.json` scripts.
  3. Add `/.github/workflows/release-<plugin>.yml` to publish on tag.
- Example GitHub Actions job snippet:

```yaml
- name: Publish to npm
  uses: actions/setup-node@v4
  with:
    node-version: "20"
    registry-url: "https://registry.npmjs.org"
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Do not do

- Do not hard-code or commit any secrets (tokens) into the repository.
- Do not change plugin implementation logic; migrate structure only.
- Do not publish packages automatically without `NPM_TOKEN` configured.

---

Saved-note: This file is the enhanced prompt generated from: "we are going to setup an NX project here where we will
transfer the logic of opencode related plugins (from the parent directory) - those will all need to have a npm package
release pipelines and a gh-page associated with them."
