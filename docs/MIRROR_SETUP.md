# Mirror Repository Setup Guide

This guide covers setting up read-only mirror repositories for OpenCode plugins. Each plugin in the
monorepo is mirrored to a dedicated GitHub repository for distribution via npm and GitHub Pages.

## Overview

**Mirror repos purpose:**

- Distribution channel for npm packages
- Host plugin-specific GitHub Pages documentation
- Allow plugin-specific stars, releases, and discoverability
- Read-only: all development happens in the monorepo

**Mirror repos are:**

- Automatically synced from monorepo on tag pushes
- Force-pushed (no manual changes persist)
- Configured to redirect contributors back to monorepo

---

## Workflow Templates

These workflows should be added to each mirror repo (e.g.,
`pantheon-org/opencode-warcraft-notification`).

### File: `.github/workflows/release.yml`

Add this to the mirror repo to publish to npm on tag pushes:

```yaml
name: 'Publish to npm'

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Build
        run: bun run build

      - name: Publish to npm
        run: bunx npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### File: `.github/workflows/gh-pages.yml`

Add this to the mirror repo to deploy documentation to GitHub Pages:

```yaml
name: 'Deploy documentation'

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Build docs
        run: |
          mkdir -p out
          cp -R docs/* out/ 2>/dev/null || echo "No docs directory found"
          cp README.md out/ 2>/dev/null || echo "No README found"

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

---

## Setup Instructions

Follow these steps **for each plugin** you want to mirror.

### 1. Create Mirror Repository

```bash
# On GitHub, create new repo: pantheon-org/<plugin-name>
# Or via gh CLI:
gh repo create pantheon-org/<plugin-name> --public --description "Read-only mirror. Contribute at pantheon-org/opencode-plugins"
```

### 2. Add Workflows to Mirror Repo

Create both workflow files in the mirror repo:

- `.github/workflows/release.yml` (from template above)
- `.github/workflows/gh-pages.yml` (from template above)

You can add these in the initial commit or push them separately.

### 3. Configure GitHub Pages

In the mirror repo:

1. Go to **Settings** → **Pages**
2. Set **Source** to: `gh-pages` branch
3. Set **Folder** to: `/ (root)`
4. Save

### 4. Add npm Secret

In the mirror repo:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `NPM_TOKEN`
4. Value: Your npm access token with publish permissions for `@pantheon-org` scope
5. Click **Add secret**

### 5. Configure Mirror Sync (Monorepo)

In the **monorepo** (not mirror):

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add secret: `MIRROR_REPO_TOKEN`
3. Value: GitHub Personal Access Token with `repo` and `workflow` scopes
4. This token is **shared across all plugin mirrors** (add once)

### 6. Add Read-Only Banner to Mirror README

Edit the mirror repo's `README.md` and add this banner at the **top** of the file:

```markdown
> **Note**: This is a read-only mirror. For issues, PRs, and contributions, visit
> [pantheon-org/opencode-plugins](https://github.com/pantheon-org/opencode-plugins).
```

**Example:**

```markdown
> **Note**: This is a read-only mirror. For issues, PRs, and contributions, visit
> [pantheon-org/opencode-plugins](https://github.com/pantheon-org/opencode-plugins).

# @pantheon-org/opencode-warcraft-notification

Warcraft II notifications plugin for OpenCode...
```

### 7. Configure Repository Settings

In the mirror repo settings:

#### a) Update Repository Description

- **Description**: `Read-only mirror. Contribute at pantheon-org/opencode-plugins`
- **Website**: `https://pantheon-org.github.io/<plugin-name>/`

#### b) Disable Issues and Discussions

- Uncheck **Issues**
- Uncheck **Discussions** (if enabled)

This prevents users from filing issues in the mirror.

#### c) Add Repository Topics

Add these topics for discoverability:

- `opencode`
- `opencode-plugin`
- `read-only-mirror`
- `monorepo-mirror`
- `typescript`
- `bun`

### 8. Configure Branch Protection

Protect the `main` branch to prevent accidental manual changes:

1. Go to **Settings** → **Branches** → **Add rule**
2. **Branch name pattern**: `main`
3. Check: **Restrict who can push to matching branches**
4. Allow only GitHub Actions to push (using `MIRROR_REPO_TOKEN`)
5. Save

### 9. Add Issue Template (Optional but Recommended)

Create `.github/ISSUE_TEMPLATE.md` in the mirror repo:

```markdown
# This is a read-only mirror

Please file issues and PRs at the main repository:

https://github.com/pantheon-org/opencode-plugins

Thank you!
```

This redirects anyone who finds the "Issues" tab before you disable it.

---

## Testing the Setup

### Test Mirror Sync

From the monorepo:

```bash
# Tag a plugin release
git tag <plugin-name>@v0.1.0
git push origin <plugin-name>@v0.1.0
```

Check:

1. **Monorepo workflow** (`.github/workflows/mirror-<plugin>.yml`) runs successfully
2. **Mirror repo** receives the push to `main` branch and tag `v0.1.0`

### Test npm Publish

Check the mirror repo workflows:

1. **Release workflow** should trigger on the `v0.1.0` tag
2. Package should be published to npm as `@pantheon-org/<plugin-name>`

Verify:

```bash
npm view @pantheon-org/<plugin-name>
```

### Test GitHub Pages Deploy

Check the mirror repo workflows:

1. **gh-pages workflow** should trigger on push to `main`
2. Documentation should be deployed to `https://pantheon-org.github.io/<plugin-name>/`

Visit the URL to verify.

---

## Troubleshooting

### Mirror sync fails

**Check:**

- `MIRROR_REPO_TOKEN` secret exists in **monorepo** settings
- Token has `repo` and `workflow` scopes
- Mirror repo exists at `pantheon-org/<plugin-name>`
- Mirror workflow exists: `.github/workflows/mirror-<plugin-name>.yml` in monorepo

**Error: "remote: Permission denied"**

- Regenerate `MIRROR_REPO_TOKEN` with correct scopes
- Ensure token hasn't expired

### npm publish fails

**Check:**

- `NPM_TOKEN` secret exists in **mirror repo** settings
- Token has publish permissions for `@pantheon-org` scope
- Package version in `package.json` is not already published
- Package name follows convention: `@pantheon-org/<plugin-name>`

**Error: "You do not have permission to publish"**

- Verify npm token has access to `@pantheon-org` scope
- Check package.json has correct scoped name

### GitHub Pages not deploying

**Check:**

- GitHub Pages is enabled in mirror repo settings
- Source is set to `gh-pages` branch
- `gh-pages` workflow ran successfully
- `docs/` directory exists in package or README.md is present

**Error: "404 on gh-pages URL"**

- Wait a few minutes for GitHub Pages to build
- Check Actions tab for deployment status
- Verify `gh-pages` branch exists

---

## Quick Reference Checklist

Use this checklist when setting up a new mirror:

- [ ] Create mirror repo: `pantheon-org/<plugin-name>`
- [ ] Add `.github/workflows/release.yml` to mirror
- [ ] Add `.github/workflows/gh-pages.yml` to mirror
- [ ] Configure GitHub Pages (source: `gh-pages` branch)
- [ ] Add `NPM_TOKEN` secret to mirror repo
- [ ] Add `MIRROR_REPO_TOKEN` to monorepo (once, shared)
- [ ] Add read-only banner to mirror README
- [ ] Update repo description
- [ ] Disable Issues and Discussions
- [ ] Add repository topics
- [ ] Configure branch protection on `main`
- [ ] Add issue template (optional)
- [ ] Test mirror sync with a tag push
- [ ] Test npm publish
- [ ] Test gh-pages deployment

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [npm Publishing Guide](https://docs.npmjs.com/cli/v8/commands/npm-publish)
- [Bun Documentation](https://bun.sh/docs)
