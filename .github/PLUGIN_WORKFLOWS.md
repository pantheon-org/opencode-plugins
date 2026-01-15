# Plugin Development Workflows: Standalone vs Mirrored

This document explains the two different workflows for developing OpenCode plugins in this monorepo.

## Overview

There are two types of plugin development workflows:

1. **Monorepo Plugins (Mirrored)** - Developed in the monorepo, mirrored to read-only repos
2. **Standalone Plugins** - Independent plugins that could be developed outside the monorepo

Both types end up published to npm and deployed to GitHub Pages, but they use different CI/CD approaches.

## Comparison

| Feature                  | Monorepo (Mirrored)                   | Standalone                        |
| ------------------------ | ------------------------------------- | --------------------------------- |
| **Development Location** | `packages/<plugin-name>/` in monorepo | Separate repository               |
| **Version Management**   | Tags in monorepo (`plugin@v1.0.0`)    | Tags in plugin repo (`v1.0.0`)    |
| **Release Automation**   | Manual tagging                        | Release Please                    |
| **Mirror Repository**    | Yes (read-only)                       | N/A                               |
| **CI/CD Workflows**      | Simple tag-based                      | Full Release Please pipeline      |
| **Workflow Templates**   | `.github/mirror-templates/`           | `.github/workflows/` in generator |
| **Composite Actions**    | Yes (from mirror-templates)           | Yes (from generator)              |

## Monorepo Plugins (Current Approach)

### Workflow

```
Developer Works in Monorepo
         ↓
    Tags Release
         ↓
mirror-packages.yml triggers
         ↓
  Extracts Package
         ↓
 Adds CI/CD Workflows
         ↓
 Pushes to Mirror Repo
         ↓
Mirror Repo Publishes to npm
         ↓
Mirror Repo Deploys Docs
```

### Characteristics

**Pros:**

- ✅ Single source of truth (monorepo)
- ✅ Shared tooling and dependencies
- ✅ Easy cross-plugin refactoring
- ✅ Atomic changes across plugins
- ✅ Simple tag-based releases

**Cons:**

- ❌ Mirror repos are read-only
- ❌ More complex CI/CD setup
- ❌ Manual version management

### Workflows Used

From `.github/mirror-templates/`:

- `publish-npm.yml` - Simple tag-triggered npm publishing
- `deploy-docs.yml` - GitHub Pages deployment
- `actions/setup-bun/action.yml` - Bun setup with caching
- `actions/setup-node-npm/action.yml` - Node.js + npm setup

### Release Process

```bash
# In monorepo
git tag opencode-my-plugin@v1.0.0
git push origin opencode-my-plugin@v1.0.0

# Automatically:
# 1. Mirror workflow extracts plugin
# 2. Adds workflows to mirror repo
# 3. Mirror repo publishes to npm
# 4. Mirror repo deploys docs
```

## Standalone Plugins (Generator Template)

### Workflow

```
Developer Works in Plugin Repo
         ↓
   Commits to Main
         ↓
Release Please Creates PR
         ↓
  Merge Release PR
         ↓
Release Please Creates Tag
         ↓
  Publishes to npm
         ↓
   Deploys Docs
```

### Characteristics

**Pros:**

- ✅ Fully automated releases (Release Please)
- ✅ Semantic versioning automatic
- ✅ Conventional commits
- ✅ No manual version management

**Cons:**

- ❌ No monorepo benefits
- ❌ Harder to maintain shared code
- ❌ Each plugin has duplicate tooling

### Workflows Used

From `tools/generators/plugin/files/.github/workflows/`:

- `release-and-publish.yml` - Release Please automation
- `publish-on-tag.yml` - Manual tag publishing
- `deploy-docs.yml` - Docs deployment
- `reusable/reusable-npm-publish.yml` - Reusable npm publishing
- `reusable/reusable-deploy-docs.yml` - Reusable docs deployment

Plus composite actions:

- `actions/setup-bun/action.yml`
- `actions/setup-node-npm/action.yml`

### Release Process

```bash
# Developer commits with conventional commits
git commit -m "feat: add new feature"
git push origin main

# Automatically:
# 1. Release Please opens/updates PR
# 2. Merge PR
# 3. Release Please creates tag
# 4. Workflows publish to npm
# 5. Workflows deploy docs
```

## Why Two Different Approaches?

### Mirror Templates Are Simpler

Mirror repos receive **already-versioned** code from the monorepo, so they only need:

- Tag-based npm publishing (no version bumping needed)
- Simple docs deployment (no release automation)
- Composite actions for consistency

### Generator Templates Are Full-Featured

Standalone repos need **complete development lifecycle**, so they include:

- Release Please for automated versioning
- Conventional commit enforcement
- Full CI/CD pipeline
- Reusable workflows for composition

## Which Should You Use?

### Use Monorepo (Mirrored) When:

- ✅ You're developing multiple related plugins
- ✅ You want shared tooling and dependencies
- ✅ You need easy cross-plugin refactoring
- ✅ You want atomic changes across plugins
- ✅ You're okay with manual version tagging

### Use Standalone When:

- ✅ You're developing a single plugin
- ✅ You want fully automated releases
- ✅ You want independent version history
- ✅ You don't need monorepo benefits

## Converting Between Approaches

### Monorepo → Standalone

If you want to convert a mirrored plugin to standalone:

1. Clone the mirror repository
2. Copy generator workflows: `tools/generators/plugin/files/.github/`
3. Add Release Please configuration
4. Remove from monorepo (optional)

### Standalone → Monorepo

If you want to add a standalone plugin to the monorepo:

1. Copy plugin to `packages/<plugin-name>/`
2. Add to Nx workspace configuration
3. Update `package.json` repository URL
4. Create mirror repository
5. Tag release: `<plugin-name>@v1.0.0`

## Future Considerations

### Potential Unification

In the future, we could:

- Add Release Please to monorepo for automated versioning
- Keep mirroring but automate version tags
- Best of both worlds: monorepo benefits + automated releases

### Current Decision

We're using **monorepo with mirroring** because:

- Multiple plugins are being developed
- Shared tooling reduces maintenance
- Easy to refactor across plugins
- Simple tag-based releases are sufficient for now

## File Locations

### Monorepo (Mirror) Templates

```
.github/mirror-templates/
├── actions/
│   ├── setup-bun/action.yml
│   └── setup-node-npm/action.yml
├── publish-npm.yml
├── deploy-docs.yml
└── README.md
```

### Standalone (Generator) Templates

```
tools/generators/plugin/files/.github/
├── actions/
│   ├── setup-bun/action.yml__template__
│   └── setup-node-npm/action.yml__template__
├── workflows/
│   ├── reusable/
│   │   ├── reusable-npm-publish.yml__template__
│   │   └── reusable-deploy-docs.yml__template__
│   ├── release-and-publish.yml__template__
│   ├── publish-on-tag.yml__template__
│   └── deploy-docs.yml__template__
├── release-please-config.json__template__
└── .release-please-manifest.json__template__
```

## Summary

- **Mirror templates** = Simple, tag-triggered workflows for mirrored repos
- **Generator templates** = Full-featured, Release Please workflows for standalone repos
- Both use composite actions for consistency
- Both publish to npm and deploy docs
- Different versioning strategies for different needs
