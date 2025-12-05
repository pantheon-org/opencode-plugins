# Release Process and Versioning

> **Last Updated**: December 2024  
> **Status**: Architecture Documentation

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [How Versioning Works](#how-versioning-works)
- [Release Workflows](#release-workflows)
- [Step-by-Step Release Guide](#step-by-step-release-guide)
- [Understanding Tag Formats](#understanding-tag-formats)
- [Adding New Plugins](#adding-new-plugins)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## Overview

This monorepo uses a **mirror-based release strategy** where:

1. **Source Code** lives in `packages/<plugin-name>/` (monorepo)
2. **Releases** are managed in separate mirror repositories (one per plugin)
3. **Versions** are tracked independently per plugin
4. **Publishing** happens automatically from mirror repositories

**Key Principle**: Each plugin has **independent versioning** managed by its own Release Please workflow in its mirror
repository.

---

## Architecture

### Monorepo Structure

```
opencode-plugins/                                    (Source monorepo)
├── packages/
│   ├── opencode-warcraft-notifications-plugin/     (Plugin source)
│   │   ├── .github/                                 (Workflow templates)
│   │   │   ├── .release-please-manifest.json       (Initial version)
│   │   │   ├── release-please-config.json          (Release config)
│   │   │   └── workflows/                          (CI/CD workflows)
│   │   ├── src/                                     (Plugin code)
│   │   └── package.json                            (Points to mirror repo)
│   └── <future-plugins>/
├── .github/workflows/
│   └── mirror-packages.yml                         (Mirror sync workflow)
└── tools/generators/plugin/                        (Plugin generator)
```

### Mirror Repository Structure

```
opencode-warcraft-notifications-plugin/              (Mirror repo - standalone)
├── .github/
│   ├── .release-please-manifest.json               (Tracks current version)
│   ├── release-please-config.json                  (Release configuration)
│   └── workflows/
│       ├── release-and-publish.yml                 (Main release workflow)
│       └── publish-on-tag.yml                      (Manual release)
├── src/                                             (Mirrored plugin code)
├── package.json                                     (Self-referencing)
└── README.md
```

---

## How Versioning Works

### The Mirror Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│ Monorepo: pantheon-org/opencode-plugins                        │
│                                                                 │
│ packages/opencode-warcraft-notifications-plugin/               │
│   version: 0.1.0 (in package.json - template only)            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Tag: opencode-warcraft-notifications-plugin@v1.0.0
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Mirror Workflow     │
                    │ (extracts package)  │
                    └─────────────────────┘
                              │
                              │ Push to mirror + tag v1.0.0
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Mirror Repo: pantheon-org/opencode-warcraft-notifications-plugin│
│                                                                 │
│ .github/.release-please-manifest.json                          │
│   { ".": "1.0.0" }  ← Tracks actual release version           │
│                                                                 │
│ Release Please workflow runs automatically                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Creates release + updates CHANGELOG
                              │
                              ▼
                    ┌─────────────────────┐
                    │ npm Publish         │
                    │ @pantheon-org/      │
                    │ opencode-warcraft-  │
                    │ notifications-      │
                    │ plugin@1.0.0        │
                    └─────────────────────┘
```

### Why This Works

1. **Monorepo stores source code only** - The version in `package.json` is just a template
2. **Mirror repos track release state** - Each has its own `.release-please-manifest.json`
3. **Release Please runs in mirror repos** - Manages versions independently
4. **No central version coordination needed** - Each plugin evolves independently

### Example: Multiple Plugins with Different Versions

```
Monorepo Tag: opencode-plugin-a@v2.5.0
  ↓
  Mirrors to: pantheon-org/opencode-plugin-a
  ↓
  Release Please manages: v2.5.0 → v2.5.1 → v2.6.0
  ↓
  npm: @pantheon-org/opencode-plugin-a@2.6.0

Monorepo Tag: opencode-plugin-b@v1.0.3
  ↓
  Mirrors to: pantheon-org/opencode-plugin-b
  ↓
  Release Please manages: v1.0.3 → v1.0.4
  ↓
  npm: @pantheon-org/opencode-plugin-b@1.0.4
```

**Result**: Plugin A at v2.6.0, Plugin B at v1.0.4 (completely independent)

---

## Release Workflows

### 1. Mirror Workflow (Monorepo)

**File**: `.github/workflows/mirror-packages.yml`

**Trigger**: Tag push matching `<package-name>@v*`

**Steps**:

1. Parse tag to extract package name and version
2. Validate package directory exists
3. Check `package.json` for mirror repository URL
4. Detect if changes exist since last tag
5. Extract package using `git subtree split`
6. Push to mirror repository's `main` branch
7. Create version tag in mirror repository

**Example**:

```bash
# You tag in monorepo
git tag opencode-warcraft-notifications-plugin@v1.0.0
git push origin opencode-warcraft-notifications-plugin@v1.0.0

# Workflow automatically:
# 1. Extracts packages/opencode-warcraft-notifications-plugin/
# 2. Pushes to pantheon-org/opencode-warcraft-notifications-plugin
# 3. Creates tag v1.0.0 in mirror repo
```

### 2. Release Please Workflow (Mirror Repo)

**File**: `.github/workflows/release-and-publish.yml` (in mirror repo)

**Trigger**: Push to `main` branch

**Steps**:

1. Analyze conventional commits since last release
2. Determine version bump (major/minor/patch)
3. Update `CHANGELOG.md`
4. Update version in `package.json`
5. Create release PR or directly create release
6. Trigger npm publish workflow
7. Deploy documentation

**Example Commit Messages** (in mirror repo):

```bash
feat: add new notification type          # Minor bump: 1.0.0 → 1.1.0
fix: correct sound playback              # Patch bump: 1.0.0 → 1.0.1
feat!: redesign plugin API               # Major bump: 1.0.0 → 2.0.0
```

### 3. Manual Release Workflow (Mirror Repo)

**File**: `.github/workflows/publish-on-tag.yml` (in mirror repo)

**Trigger**: Manual tag push matching `v*`

**Use Case**: When you need to force a release without Release Please

**Steps**:

1. Extract version from tag
2. Verify `package.json` version matches tag
3. Publish to npm
4. Deploy documentation
5. Create GitHub release

---

## Step-by-Step Release Guide

### Standard Release Process

#### Step 1: Make Changes in Monorepo

```bash
cd packages/opencode-warcraft-notifications-plugin

# Make your changes
vim src/index.ts

# Commit using conventional commits
git add .
git commit -m "feat: add sound notification support"
git push origin main
```

#### Step 2: Create and Push Tag

```bash
# Tag format: <package-name>@v<version>
git tag opencode-warcraft-notifications-plugin@v1.1.0
git push origin opencode-warcraft-notifications-plugin@v1.1.0
```

#### Step 3: Monitor Mirror Workflow

1. Go to **Actions** tab in monorepo
2. Find "Mirror Packages to Repositories" workflow
3. Verify:
   - ✅ Package detected correctly
   - ✅ Changes detected
   - ✅ Mirror sync completed

#### Step 4: Verify Mirror Repository

1. Go to mirror repository: `pantheon-org/opencode-warcraft-notifications-plugin`
2. Check that files are updated
3. Check that tag `v1.1.0` exists

#### Step 5: Release Please (Automatic)

Release Please in the mirror repo will:

1. Detect the new commits
2. Create or update a release PR
3. When merged, create a release
4. Trigger npm publish
5. Deploy documentation

#### Step 6: Verify Publication

Check:

- ✅ npm: `https://www.npmjs.com/package/@pantheon-org/opencode-warcraft-notifications-plugin`
- ✅ GitHub Release: Check releases in mirror repo
- ✅ Documentation: Check GitHub Pages

### Manual Release (Emergency)

If you need to bypass Release Please:

```bash
# In the mirror repository (not monorepo!)
git tag v1.1.1
git push origin v1.1.1

# This triggers publish-on-tag.yml workflow
```

---

## Understanding Tag Formats

### Monorepo Tags

**Format**: `<package-name>@v<version>`

**Examples**:

```bash
opencode-warcraft-notifications-plugin@v1.0.0
opencode-warcraft-notifications-plugin@v1.2.3
opencode-my-new-plugin@v0.1.0
```

**Purpose**: Identifies which package to mirror and what version to tag in mirror repo

**Rule**: Must exactly match the directory name in `packages/`

### Mirror Repository Tags

**Format**: `v<version>`

**Examples**:

```bash
v1.0.0
v1.2.3
v2.0.0
```

**Purpose**: Standard npm package version tags

**Created By**:

- Automatically by mirror workflow when mirroring
- Automatically by Release Please when creating releases
- Manually for emergency releases

### Conventional Commits (Mirror Repo)

Release Please uses conventional commits to determine version bumps:

| Commit Type                    | Example                      | Version Bump          |
| ------------------------------ | ---------------------------- | --------------------- |
| `feat:`                        | `feat: add new feature`      | Minor (1.0.0 → 1.1.0) |
| `fix:`                         | `fix: correct bug`           | Patch (1.0.0 → 1.0.1) |
| `feat!:` or `BREAKING CHANGE:` | `feat!: redesign API`        | Major (1.0.0 → 2.0.0) |
| `docs:`                        | `docs: update README`        | No release            |
| `chore:`                       | `chore: update dependencies` | No release            |

---

## Adding New Plugins

### Step 1: Create Mirror Repository

First, create the target repository on GitHub:

```bash
gh repo create pantheon-org/opencode-my-new-plugin \
  --public \
  --description "My OpenCode plugin" \
  --homepage "https://github.com/pantheon-org/opencode-my-new-plugin"
```

### Step 2: Generate Plugin in Monorepo

```bash
# In monorepo root
bun run generate:plugin my-new-plugin

# Or with options
nx workspace-generator plugin my-new-plugin \
  --description "My awesome plugin" \
  --addTests \
  --addLint
```

### Step 3: Verify Generated Files

Check that the plugin has:

```
packages/opencode-my-new-plugin/
├── .github/
│   ├── .release-please-manifest.json       # {"." : "0.1.0"}
│   ├── release-please-config.json
│   └── workflows/
│       ├── release-and-publish.yml
│       └── publish-on-tag.yml
├── src/
│   └── index.ts
└── package.json                            # Must have repository.url
```

### Step 4: Verify package.json

Ensure `package.json` has correct mirror repository URL:

```json
{
  "name": "@pantheon-org/opencode-my-new-plugin",
  "version": "0.1.0",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/pantheon-org/opencode-my-new-plugin.git"
  }
}
```

### Step 5: Initial Release

```bash
# Commit to monorepo
git add packages/opencode-my-new-plugin
git commit -m "feat: add my-new-plugin"
git push origin main

# Create first release tag
git tag opencode-my-new-plugin@v0.1.0
git push origin opencode-my-new-plugin@v0.1.0
```

The mirror workflow will:

1. Detect this is the first release (no previous tag)
2. Extract the package
3. Push to mirror repository
4. Release Please will create initial release

---

## Troubleshooting

### Mirror Workflow Fails

#### Issue: "Package directory does not exist"

**Cause**: Tag name doesn't match directory name

**Solution**:

```bash
# Tag must match directory name exactly
# packages/opencode-warcraft-notifications-plugin/
git tag opencode-warcraft-notifications-plugin@v1.0.0
```

#### Issue: "No repository URL found"

**Cause**: `package.json` missing repository field

**Solution**: Add repository field to `package.json`:

```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/pantheon-org/opencode-my-plugin.git"
  }
}
```

#### Issue: "No changes detected - mirror sync skipped"

**Cause**: No files changed in package since last tag

**Explanation**: This is intentional - saves CI resources

**Solution**: If you need to force mirror:

1. Make a trivial change (update README)
2. Commit and push
3. Create new tag with patch version bump

### Release Please Not Creating Releases

#### Issue: No release PR or release created

**Possible Causes**:

1. **No conventional commits** - Commits must follow format like `feat:`, `fix:`
2. **Release already exists** - Check if version already published
3. **Workflow permissions** - Check GitHub Actions permissions

**Solution**:

```bash
# In mirror repo, check recent commits
git log --oneline

# Ensure commits follow conventional format
# Good: feat: add feature
# Bad:  Added a new feature

# If needed, use manual release
git tag v1.0.1
git push origin v1.0.1
```

### Version Mismatch

#### Issue: "Version mismatch between package.json and tag"

**Cause**: Manual tag doesn't match `package.json` version

**Solution**:

```bash
# Either:
# 1. Update package.json to match tag
vim package.json  # Change version to match tag
git commit -am "chore: bump version"

# 2. Or delete and recreate tag
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
git tag v1.0.1  # Match package.json version
git push origin v1.0.1
```

### npm Publish Fails

#### Issue: "You cannot publish over the previously published versions"

**Cause**: Version already exists on npm

**Solution**:

1. Bump version in mirror repo
2. Create new release

```bash
# In mirror repo
vim package.json  # Increment version
git commit -am "chore: bump version to 1.0.2"
git tag v1.0.2
git push origin main v1.0.2
```

---

## FAQ

### Q: Do we need monorepo-wide version coordination?

**A: No.** Each plugin has independent versioning managed by its own mirror repository's Release Please workflow.

### Q: Why can't we just use Release Please in the monorepo?

**A:** Release Please is designed for single repositories. The mirror strategy allows:

- Independent release cycles per plugin
- Separate GitHub releases per plugin
- Cleaner npm package distribution
- Independent documentation per plugin

### Q: What if two plugins need to be in sync?

**A:** If two plugins must stay in sync, you have options:

1. **Use a shared library** - Create a core package both depend on
2. **Coordinate releases manually** - Tag both at the same time
3. **Consider merging** - If they're truly coupled, they might be one plugin

### Q: Can we use semantic-release instead of Release Please?

**A:** Yes, but it would require modifying the workflows in the mirror repositories. Release Please is recommended
because it:

- Maintains a CHANGELOG automatically
- Creates release PRs for review
- Follows conventional commits strictly
- Integrates well with GitHub

### Q: What happens if we delete a mirror repo?

**A:** The source code remains safe in the monorepo. To restore:

1. Recreate the mirror repository on GitHub
2. Push a new tag from monorepo: `git push origin <package>@v<version>`
3. Mirror workflow will sync everything

### Q: How do we roll back a bad release?

**In Mirror Repository**:

```bash
# 1. Create a new release with fix
git revert <bad-commit>
git commit -m "fix: revert bad change"
git push origin main

# 2. Release Please will create patch version
# Example: v1.2.3 → v1.2.4

# 3. Or manually deprecate on npm
npm deprecate @pantheon-org/my-plugin@1.2.3 "Bad release, use 1.2.4"
```

### Q: Can we test releases before publishing?

**A:** Yes, use dry-run in mirror repository:

```bash
# In mirror repo
npm pack  # Creates tarball
npm publish --dry-run

# Or test locally
npm link
cd /path/to/test/project
npm link @pantheon-org/my-plugin
```

### Q: What if we need to change package name?

**A:** This requires:

1. Create new mirror repository with new name
2. Update `package.json` in monorepo to point to new mirror repo
3. Publish as new package
4. Deprecate old package on npm

### Q: How do we handle pre-releases?

**In mirror repo**, use prerelease tags:

```bash
# Create prerelease
git tag v1.0.0-alpha.1
git push origin v1.0.0-alpha.1

# Publish with tag
npm publish --tag alpha
```

---

## Related Documentation

- [README.md](../README.md) - Repository overview
- [Bun and TypeScript Development](../.opencode/knowledge-base/bun-typescript-development.md) - Development standards
- [Creating Nx Generators](../.opencode/knowledge-base/creating-nx-generators.md) - Generator documentation

---

## Maintenance

This document should be updated when:

- Release workflow changes
- New mirror strategy introduced
- Breaking changes to plugin structure
- New automation added

**Last Reviewed**: December 2024
