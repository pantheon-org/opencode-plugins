# Mirror Repository CI/CD Templates

This directory contains GitHub Actions workflow templates and composite actions that are automatically added to mirror
repositories when plugins are released.

## Directory Structure

```
.github/mirror-templates/
├── actions/
│   ├── setup-bun/
│   │   └── action.yml           # Composite action for Bun setup with caching
│   └── setup-node-npm/
│       └── action.yml           # Composite action for Node.js + npm setup
├── publish-npm.yml              # Workflow for npm publishing
├── deploy-docs.yml              # Workflow for GitHub Pages deployment
└── README.md                    # This file
```

## Composite Actions

### setup-bun

Composite action that sets up Bun with dependency caching for faster workflow runs.

**Inputs:**

- `bun-version` (optional, default: 'latest') - Bun version to install
- `frozen-lockfile` (optional, default: 'true') - Use frozen lockfile for installation

**Usage in workflows:**

```yaml
- name: Setup Bun with caching
  uses: ./.github/actions/setup-bun
  with:
    bun-version: 'latest'
    frozen-lockfile: 'true'
```

### setup-node-npm

Composite action that configures Node.js and npm authentication for publishing packages.

**Inputs:**

- `node-version` (optional, default: '20') - Node.js version to install
- `registry-url` (optional, default: 'https://registry.npmjs.org') - npm registry URL

**Usage in workflows:**

```yaml
- name: Setup Node.js for npm
  uses: ./.github/actions/setup-node-npm
  with:
    node-version: '20'
```

## Workflows

### publish-npm.yml

Automatically publishes the plugin to npm when version tags are pushed.

**Triggers:**

- On push to `main` branch (dry-run only)
- On push of `v*` tags (actual publish)

**Steps:**

1. Checkout code
2. Setup Bun and Node.js
3. Install dependencies
4. Run type checking (if available)
5. Run tests
6. Build package
7. Verify package contents
8. Publish to npm (with provenance)

**Required Secrets:**

- `NPM_TOKEN` - npm automation token with publish access

### deploy-docs.yml

Deploys plugin documentation to GitHub Pages using the shared docs-builder.

**Triggers:**

- On push to `main` branch
- On push of `v*` tags
- Manual workflow dispatch

**Steps:**

1. Checkout plugin repository
2. Checkout `opencode-docs-builder` repository
3. Copy plugin docs and README
4. Generate Astro config with plugin metadata
5. Build documentation site
6. Deploy to GitHub Pages

**Required Settings:**

- GitHub Pages must be enabled (Settings > Pages > Source: GitHub Actions)

## How It Works

When you tag a plugin release in the monorepo:

```bash
git tag opencode-my-plugin@v1.0.0
git push origin opencode-my-plugin@v1.0.0
```

The `mirror-packages.yml` workflow:

1. Extracts the plugin directory using `git subtree split`
2. Checks out the temporary branch
3. Copies these workflow files to `.github/workflows/`
4. Commits the workflows
5. Pushes to the mirror repository

The mirror repository then automatically:

- Publishes to npm when the tag is pushed
- Deploys docs to GitHub Pages

## Testing Locally

### Test npm Publishing

```bash
# In the mirror repository
npm publish --dry-run
```

### Test Docs Deployment

```bash
# Clone the docs-builder
git clone https://github.com/pantheon-org/opencode-docs-builder.git

# Copy your docs
cp -r docs/ opencode-docs-builder/src/content/docs/
cp README.md opencode-docs-builder/src/content/docs/index.md

# Build
cd opencode-docs-builder
bun install
bun run build
```

## Troubleshooting

### npm Publish Fails

1. Verify `NPM_TOKEN` secret is set in mirror repository
2. Check that the token has publish access
3. Verify package name is not already taken
4. Check that `package.json` has correct `name` and `version`

### Docs Deployment Fails

1. Verify GitHub Pages is enabled (Settings > Pages)
2. Check that `opencode-docs-builder` repository is accessible
3. Verify docs/ directory exists in plugin
4. Check Astro build logs for errors

### Workflows Not Running

1. Verify `.github/workflows/` directory exists in mirror repo
2. Check that workflows were committed to main branch
3. Verify repository has Actions enabled (Settings > Actions)
4. Check workflow run history for error messages

## Action Version Management

Mirror templates use **minor version pinning** for GitHub Actions:

- **Format:** `action@vX.Y` (e.g., `setup-bun@v2.0`, `checkout@v4.2`)
- **Why:** Allows automatic patch updates while protecting from breaking major changes
- **Security:** Balances stability and security for frequently-regenerated files

### Current Action Versions

| Action                          | Version | Notes                 |
| ------------------------------- | ------- | --------------------- |
| `oven-sh/setup-bun`             | `v2.0`  | Bun setup             |
| `actions/setup-node`            | `v4.1`  | Node.js setup         |
| `actions/cache`                 | `v4.1`  | Dependency caching    |
| `actions/checkout`              | `v4.2`  | Repository checkout   |
| `actions/upload-pages-artifact` | `v3.0`  | Pages artifact upload |
| `actions/deploy-pages`          | `v4.0`  | Pages deployment      |

### Updating Action Versions

To update action versions:

1. **Check generator versions** (source of truth):

   ```bash
   cat tools/generators/plugin/src/github-action-versions/index.ts
   ```

2. **Update mirror templates** to match minor versions:
   - `actions/setup-bun/action.yml`
   - `actions/setup-node-npm/action.yml`
   - `publish-npm.yml`
   - `deploy-docs.yml`

3. **Test with a plugin release:**

   ```bash
   git tag opencode-test-plugin@v0.0.X
   git push origin opencode-test-plugin@v0.0.X
   ```

4. **Verify** workflows run successfully in mirror repository

### Version Strategy Comparison

| Approach             | Generator Templates       | Mirror Templates    |
| -------------------- | ------------------------- | ------------------- |
| **Pinning Method**   | SHA-pinned                | Minor version       |
| **Example**          | `@sha123abc`              | `@v4.1`             |
| **Security**         | Highest                   | Good                |
| **Maintenance**      | Manual SHA updates        | Automatic patches   |
| **Update Frequency** | On plugin creation/update | On each mirror push |

**Why different?**

- Generator templates need maximum security for long-term standalone use
- Mirror templates are regenerated on each release, making manual updates acceptable
- Minor version pinning provides good balance of stability and maintenance

See `.github/GENERATOR_VS_MIRROR_ANALYSIS.md` for detailed comparison.

## Customization

If you need to customize these workflows for a specific plugin:

1. Edit the workflows in `.github/mirror-templates/` in the monorepo
2. Push a new tag to trigger the mirror sync
3. The updated workflows will be added to all future mirror syncs

**Note:** Existing mirror repositories will not automatically receive updates. You'll need to manually copy the updated
workflows or trigger a new release.
