# Migration Plan: opencode plugins → NX monorepo (Bun + TypeScript) with Read-Only Mirrors

Goal: Create an NX monorepo for developing OpenCode plugins under `packages/`, then mirror each plugin to a dedicated
read-only GitHub repo for distribution (npm publish + gh-pages).

## Architecture

This project uses a **monorepo + read-only mirror architecture**. For detailed architecture overview, see [PLUGINS_MIGRATION.md - Architecture Overview](PLUGINS_MIGRATION.md#architecture-overview).

**Summary:**

- **Monorepo** (pantheon-org/opencode-plugins): Single source of truth for development
- **Mirror repos** (pantheon-org/<plugin-name>): Read-only distribution for npm + gh-pages

## Checklist

1. ✅ Confirm inputs (scope, preserve-history, docs preference, mirror strategy)

   - npm scope: `@pantheon-org`
   - preserve git history: no
   - docs: reuse static site from source repos + README
   - mirrors: read-only, auto-synced on tag push

2. ✅ Scaffold NX workspace (root files)

   - Created `package.json` (workspaces), `nx.json`, `tsconfig.base.json`, `workspace.json`

3. ✅ Add example plugin skeleton

   - Created `packages/opencode-warcraft-notification/` as **reference template**
   - Includes `package.json`, `tsconfig.json`, `src/`, `README.md`, example mirror workflow
   - Use this structure as template for all future plugin migrations

4. ✅ Refactor for read-only mirror approach

   - Updated workflows: monorepo mirrors `packages/<plugin>` → mirror repo on tag
   - Created template workflows for mirror repos (npm publish + gh-pages)
   - Created comprehensive `MIRROR_SETUP.md` guide with all mirror repo configuration

5. ⏳ Migrate OpenCode plugins from parent directory

   - See [PLUGIN_INVENTORY.md](PLUGIN_INVENTORY.md) for complete list of plugins to migrate
   - For each plugin, following the `opencode-warcraft-notification` example:
     - Create `packages/<plugin-name>/` directory structure
     - Migrate source code (no git history)
     - Copy docs/static site to `packages/<plugin-name>/docs/`
     - Add NX project entry to `workspace.json`
     - Create mirror workflow: `.github/workflows/mirror-<plugin-name>.yml`

6. ⏳ Add build/test/publish scripts per plugin

   - Ensure `bunx tsup` builds work for each plugin
   - Add `pack` script for local dry-run validation
   - Configure plugin-specific dependencies in each `package.json`

7. ⏳ Set up mirror repos (per plugin)

   - Create mirror repo: `pantheon-org/<plugin-name>`
   - Add publish + gh-pages workflows to each mirror repo (using templates from `docs/MIRROR_SETUP.md`)
   - Configure `NPM_TOKEN` secret in each mirror repo
   - Configure `MIRROR_REPO_TOKEN` secret in monorepo (once, shared across all plugins)

8. ✅ Documentation

   - Wrote `docs/PLUGINS_MIGRATION.md` with commands for local dev
   - Wrote `docs/MIRROR_SETUP.md` - comprehensive guide for creating and configuring mirror repos

9. ⏳ Validate (per plugin)

   - Run `bun install`, `bunx nx run <plugin>:build` in monorepo
   - Test mirror sync locally with `git subtree split`
   - Verify npm publish and gh-pages deploy work in each mirror repo

## Notes

- Monorepo is the **only** place for development
- Mirror repos are **force-pushed** from monorepo (no dual maintenance)
- Each plugin gets independent versioning via tags: `<plugin-name>@v1.0.0`
- Do not commit secrets; use GitHub secrets for `NPM_TOKEN` and `MIRROR_REPO_TOKEN`

---

Generated as part of the NX + Bun migration setup with read-only mirror strategy.
