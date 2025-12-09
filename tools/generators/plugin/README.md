# OpenCode Plugin Generator

An Nx workspace generator for scaffolding new OpenCode plugin packages.

## Usage

Generate a new OpenCode plugin using the Nx generator:

```bash
# Using Nx directly
nx workspace-generator plugin <plugin-name>

# Or using the workspace generator command
nx g @nrwl/workspace:workspace-generator plugin <plugin-name>

# With options
nx workspace-generator plugin my-plugin --description "My awesome plugin" --addTests --addLint
```

## Options

| Option        | Type      | Default      | Description                                         |
| ------------- | --------- | ------------ | --------------------------------------------------- |
| `name`        | `string`  | (required)   | The name of the plugin (without 'opencode-' prefix) |
| `description` | `string`  | `""`         | A brief description of what the plugin does         |
| `directory`   | `string`  | `"packages"` | A directory where the plugin is placed              |
| `addTests`    | `boolean` | `true`       | Add test configuration                              |
| `addLint`     | `boolean` | `true`       | Add lint configuration                              |
| `regenerate`  | `boolean` | `false`      | Regenerate plugin files (preserves src/ and docs/)  |

## Examples

### Basic plugin generation

```bash
nx workspace-generator plugin notification
```

This creates:

- `packages/opencode-notification/` - Plugin directory
- `packages/opencode-notification/src/index.ts` - Main entry point
- `packages/opencode-notification/package.json` - Package configuration
- `packages/opencode-notification/tsconfig.json` - TypeScript configuration
- `packages/opencode-notification/README.md` - Plugin documentation

### With description and test support

```bash
nx workspace-generator plugin analytics --description "Analytics tracking plugin" --addTests
```

## Generated Structure

```
packages/opencode-<name>/
├── .github/
│   ├── workflows/
│   │   ├── 1-validate.yml           # PR validation (lint, test, build, security)
│   │   ├── 2-publish.yml            # Release publishing (npm + docs + GitHub release)
│   │   ├── release-please.yml       # Automated version bumping
│   │   ├── chores-pages.yml         # Documentation site maintenance
│   │   └── deploy-docs.yml          # Documentation deployment
│   ├── release-please-config.json   # Release Please configuration
│   ├── .release-please-manifest.json # Version tracking
│   └── dependabot.yml               # Automated dependency updates
├── docs/
│   ├── README.md                    # Main documentation
│   ├── api.md                       # API reference
│   ├── development.md               # Development guide
│   ├── troubleshooting.md           # Troubleshooting guide
│   └── user-guide.md                # User guide
├── pages/                           # Astro-based documentation site
│   ├── src/
│   │   ├── assets/                  # Site assets (logos, etc.)
│   │   ├── components/              # Astro components
│   │   ├── content/                 # Content configuration
│   │   └── styles/                  # Custom styles
│   ├── astro.config.mjs             # Astro configuration
│   ├── package.json                 # Documentation site dependencies
│   └── transform-docs.js            # Documentation transformation script
├── src/
│   └── index.ts                     # Main plugin entry point
├── package.json                     # Package configuration
├── tsconfig.json                    # TypeScript configuration
├── eslint.config.mjs                # ESLint configuration
├── .prettierrc.json                 # Prettier configuration
├── LICENSE                          # MIT License
└── README.md                        # Plugin documentation
```

## After Generation

1. Navigate to your new plugin:

   ```bash
   cd packages/opencode-<name>-plugin
   ```

2. Build the plugin:

   ```bash
   nx build opencode-<name>-plugin
   ```

3. Pack the plugin for distribution:

   ```bash
   nx pack opencode-<name>-plugin
   ```

## Release & Publishing Workflow

Each generated plugin is **self-contained** with complete build, release, and publishing capabilities.

### Automated Release Process

The generator creates a complete CI/CD pipeline with three core workflows:

#### 1. **PR Validation** (`1-validate.yml`)

Automatically runs on every pull request:

- ✅ Code formatting check
- ✅ Markdown linting
- ✅ ESLint validation
- ✅ Type checking
- ✅ Test suite with coverage
- ✅ Build verification
- ✅ Security scanning (Trivy)
- ✅ PR size analysis

#### 2. **Release Automation** (`release-please.yml`)

Automatically manages versions and changelogs:

- Runs on every push to `main` branch
- Analyzes commit messages (follows [Conventional Commits](https://www.conventionalcommits.org/))
- Creates/updates a release PR with:
  - Version bump (semantic versioning)
  - Updated CHANGELOG.md
  - Updated package.json version
- When release PR is merged:
  - Creates a GitHub release with tag
  - Triggers the publish workflow

#### 3. **Publishing** (`2-publish.yml`)

Automatically publishes on tag push:

- 📦 Publishes to npm with provenance
- 📚 Deploys documentation to GitHub Pages
- 🏷️ Creates GitHub release with changelog
- ✅ Full validation before publish

### Release Workflow Example

```bash
# 1. Make changes and commit using conventional commits
git commit -m "feat: add awesome new feature"
git commit -m "fix: resolve issue with X"
git push

# 2. Release Please automatically creates a release PR

# 3. Review and merge the release PR

# 4. On merge, Release Please:
#    - Creates a tag (e.g., v1.2.0)
#    - Pushes the tag to GitHub

# 5. The publish workflow automatically:
#    - Publishes to npm
#    - Deploys documentation
#    - Creates GitHub release

# No manual intervention needed! 🎉
```

### Conventional Commit Messages

Use these commit prefixes to trigger appropriate version bumps:

| Prefix      | Version Bump | Description                                |
| ----------- | ------------ | ------------------------------------------ |
| `feat:`     | Minor        | New feature                                |
| `fix:`      | Patch        | Bug fix                                    |
| `perf:`     | Patch        | Performance improvement                    |
| `docs:`     | None\*       | Documentation only changes                 |
| `refactor:` | Patch        | Code refactoring                           |
| `BREAKING:` | Major        | Breaking change (can be combined with any) |
| `feat!:`    | Major        | Breaking feature (alternative syntax)      |
| `chore:`    | None\*       | Maintenance tasks (deps, config)           |
| `test:`     | None\*       | Test additions/changes                     |
| `ci:`       | None\*       | CI/CD changes                              |

\*_Included in changelog but doesn't trigger a release_

**Examples:**

```bash
# Patch release (1.0.0 → 1.0.1)
git commit -m "fix: resolve memory leak in cache"

# Minor release (1.0.1 → 1.1.0)
git commit -m "feat: add new notification sound"

# Major release (1.1.0 → 2.0.0)
git commit -m "feat!: redesign API interface"
# or
git commit -m "feat: redesign API interface

BREAKING CHANGE: API endpoints have been restructured"
```

### Manual Publishing (Emergency)

If you need to publish manually:

```bash
# 1. Update version in package.json
npm version patch  # or minor, or major

# 2. Build and test
bun run build
bun test

# 3. Verify package contents
bun run verify:package

# 4. Create and push tag
git push && git push --tags

# This triggers the automated publish workflow
```

### Required Secrets

Each plugin repository needs these GitHub secrets configured:

| Secret          | Purpose                              | Required |
| --------------- | ------------------------------------ | -------- |
| `NPM_TOKEN`     | Publishing to npm                    | ✅ Yes   |
| `CODECOV_TOKEN` | Code coverage reporting              | Optional |
| `WORKFLOW_PAT`  | Enhanced Release Please capabilities | Optional |

**Setting up NPM_TOKEN:**

1. Create an npm access token at https://www.npmjs.com/settings/tokens
2. Choose "Automation" token type
3. Add token to GitHub repository secrets
4. Token needs publish permissions for `@pantheon-org` scope

### Dependency Management

Dependabot is pre-configured to:

- Update GitHub Actions weekly (Mondays)
- Update npm dependencies weekly (Tuesdays)
- Update documentation site dependencies
- Auto-label PRs by dependency type
- Limit open PRs to prevent overwhelming
- Ignore major version updates (requires manual review)

### Documentation Deployment

Documentation is automatically deployed on every release:

- Built with Astro from `pages/` directory
- Markdown files from `docs/` are transformed
- Deployed to `docs` branch
- Available at `https://<username>.github.io/<plugin-name>/`

**Local documentation development:**

```bash
cd pages
bun install
bun run dev     # Start dev server
bun run build   # Build for production
```

## Regenerating Existing Plugins

⚠️ **Protection Against Accidental Regeneration**

If you try to run the generator on an existing plugin without the `--regenerate` flag, you'll get an error:

```bash
nx workspace-generator plugin my-existing-plugin

# Error: Plugin already exists at: packages/opencode-my-existing-plugin
#
# To regenerate this plugin and update configuration files (while preserving src/ and docs/), run:
#   nx g ./tools/generators:plugin my-existing-plugin --regenerate
#
# Or use the shorthand:
#   nx g ./tools/generators:plugin my-existing-plugin -r
```

### To Regenerate a Plugin

Use the `--regenerate` (or `-r`) flag to explicitly allow regeneration:

```bash
# Full flag
nx workspace-generator plugin my-existing-plugin --regenerate

# Shorthand
nx workspace-generator plugin my-existing-plugin -r
```

**What gets regenerated:**

- ✅ Configuration files (`package.json`, `tsconfig.json`, `eslint.config.mjs`, etc.)
- ✅ GitHub workflows (`.github/workflows/*`)
- ✅ Documentation site (`pages/*`)
- ✅ Root-level files (`README.md`, `LICENSE`, etc.)

**What is preserved:**

- 🔒 `src/` - Your plugin source code
- 🔒 `docs/` - Your documentation markdown files

This allows you to:

- Update generator templates and apply changes to existing plugins
- Fix configuration issues without losing your work
- Adopt new best practices from updated templates
- Regenerate build configurations after template improvements

**Example workflow:**

```bash
# 1. Update the generator templates (in tools/generators/plugin/files/)
# 2. Regenerate your plugin
nx workspace-generator plugin my-plugin

# 3. Review changes
git diff packages/opencode-my-plugin

# 4. Commit the updated configuration
git add packages/opencode-my-plugin
git commit -m "chore: regenerate plugin configuration"
```

## Development Workflow

1. **Create a new plugin**

   ```bash
   nx workspace-generator plugin my-feature
   ```

2. **Implement your plugin logic** in `src/index.ts`

3. **Build the plugin**

   ```bash
   nx build opencode-my-feature
   ```

4. **Test locally** (if tests are configured)

   ```bash
   nx test opencode-my-feature
   ```

5. **Pack for distribution**
   ```bash
   nx pack opencode-my-feature
   ```

## Generator Structure

```
tools/generators/plugin/
├── index.ts                    # Generator implementation
├── schema.json                 # Generator schema definition
└── files/                      # Template files
    ├── package.json__template__
    ├── tsconfig.json__template__
    ├── README.md__template__
    └── src/
        └── index.ts__template__
```

## Template Variables

Below are the most commonly available template variables injected into files in `tools/generators/plugin/files/`. Add
these to your templates using EJS-style placeholders (e.g., `<%= name %>`).

- `projectName` — final project folder name (e.g. `opencode-my-plugin`)
- `projectRoot` — path to generated project (e.g. `packages/opencode-my-plugin`)
- `name` — raw name passed to generator (e.g. `my-plugin`)
- `className` — PascalCase project name used in templates (e.g. `MyPlugin`)
- `npmScope` — npm organization scope (e.g. `pantheon-org`)
- `description` — description option value
- `addTests` — boolean used by templates to include test config
- `addLint` — boolean used by templates to include lint config
- `regenerate` — boolean flag indicating regeneration mode
- `offsetFromRoot` — relative path string used in project.json template

Tip: Update `tools/generators/plugin/files/` to add inline comments in complex templates explaining how a variable is
used.

## Tests

Unit tests for the generator should live next to the implementation (e.g., `tools/generators/plugin/__tests__/`). If
tests are not present, add a minimal dry-run test that verifies files would be created without writing to disk.

Example (Bun test) to add at `tools/generators/plugin/index.test.ts`:

```ts
import { describe, it, expect } from 'bun:test';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import generator from './index';

describe('plugin generator', () => {
  it('creates files (dry run)', async () => {
    const tree = createTreeWithEmptyWorkspace();
    await generator(tree, { name: 'test-plugin', directory: 'packages', addTests: false });
    expect(tree.exists('packages/opencode-test-plugin/package.json')).toBeTruthy();
  });
});
```

If you already have tests, add a short section here describing how to run them:

```bash
# Run only generator tests
bun test tools/generators/plugin
```

## Modifying the Generator

> **Note**: All modifications to this generator should be made in the main monorepo at:  
> **Repository**: `pantheon-org/opencode-plugins`  
> **Path**: `tools/generators/plugin/`
>
> Generated plugins are read-only mirrors. Submit any changes, improvements, or bug fixes to the generator itself in the
> main repository.

To customize the generator:

1. Edit `tools/generators/plugin/index.ts` for generator logic
2. Update `tools/generators/plugin/schema.json` to add/modify options
3. Modify template files in `tools/generators/plugin/files/` to change generated structure

### Contributing Generator Improvements

If you find issues or want to improve the generator:

1. Fork the main repository: `https://github.com/pantheon-org/opencode-plugins`
2. Make your changes in `tools/generators/plugin/`
3. Test the generator with: `bun run generate:plugin test-plugin --dry-run`
4. Submit a pull request to the main repository

This ensures all future generated plugins benefit from your improvements.

## Troubleshooting

### Generator not found

If you get an error that the generator is not found, try:

```bash
# Clear Nx cache
nx reset

# Reinstall dependencies
bun install
```

### Generator errors

The generator uses Nx's built-in utilities. Make sure:

- Nx is installed (already in devDependencies)
- You're running the command from the workspace root

## Related Commands

- `nx build <plugin-name>` - Build a plugin
- `nx pack <plugin-name>` - Pack a plugin for distribution
- `nx run-many --target=build --all` - Build all plugins
- `nx affected:build` - Build only affected plugins
