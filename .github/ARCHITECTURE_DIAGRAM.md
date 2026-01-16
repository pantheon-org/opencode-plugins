# Complete Mirror Repository Architecture

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MONOREPO (opencode-plugins)                          │
│                                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                         │
│  │   Package   │  │   Package   │  │   Package   │                         │
│  │  plugin-a/  │  │  plugin-b/  │  │  plugin-c/  │                         │
│  │   - src/    │  │   - src/    │  │   - src/    │                         │
│  │   - docs/   │  │   - docs/   │  │   - docs/   │                         │
│  └─────────────┘  └─────────────┘  └─────────────┘                         │
│                                                                               │
│  ┌──────────────────────────────────────────────────┐                       │
│  │        apps/docs-builder/                        │                       │
│  │  Shared Astro + Starlight documentation builder  │                       │
│  └──────────────────────────────────────────────────┘                       │
│                                                                               │
│  ┌──────────────────────────────────────────────────┐                       │
│  │     .github/mirror-templates/                    │                       │
│  │  - publish-npm.yml (npm publishing workflow)     │                       │
│  │  - deploy-docs.yml (GitHub Pages deployment)     │                       │
│  └──────────────────────────────────────────────────┘                       │
└───────────────────────────────────┬───────────────────────────────────────┘
                                    │
                    ╔═══════════════╧═══════════════╗
                    ║   Developer tags release:     ║
                    ║   git tag plugin-a@v1.0.0     ║
                    ║   git push origin plugin-a@v  ║
                    ╚═══════════════╤═══════════════╝
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────┐
        │  GitHub Actions: mirror-packages.yml              │
        │  1. Parse tag → detect package name               │
        │  2. Validate package.json has repository URL      │
        │  3. Check for changes since last tag              │
        │  4. Extract subtree: git subtree split            │
        │  5. Add CI/CD workflows from mirror-templates/    │
        │  6. Push to mirror repository                     │
        └───────────────────┬───────────────────────────────┘
                            │
            ┌───────────────┴──────────────┐
            │                               │
            ▼                               ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│  Mirror Repo: plugin-a    │   │  Mirror Repo: plugin-b    │
│  (Read-only distribution) │   │  (Read-only distribution) │
│                           │   │                           │
│  ├── .github/workflows/   │   │  ├── .github/workflows/   │
│  │   ├── publish-npm.yml  │   │  │   ├── publish-npm.yml  │
│  │   └── deploy-docs.yml  │   │  │   └── deploy-docs.yml  │
│  ├── src/                 │   │  ├── src/                 │
│  ├── docs/                │   │  ├── docs/                │
│  ├── dist/ (generated)    │   │  ├── dist/ (generated)    │
│  └── package.json         │   │  └── package.json         │
└───────────────────────────┘   └───────────────────────────┘
            │                               │
    ┌───────┴───────┐               ┌───────┴───────┐
    │               │               │               │
    ▼               ▼               ▼               ▼
┌─────────┐   ┌──────────┐    ┌─────────┐   ┌──────────┐
│   npm   │   │  GitHub  │    │   npm   │   │  GitHub  │
│ Registry│   │  Pages   │    │ Registry│   │  Pages   │
│         │   │          │    │         │   │          │
│@pantheon│   │pantheon- │    │@pantheon│   │pantheon- │
│-org/    │   │org.github│    │-org/    │   │org.github│
│plugin-a │   │.io/      │    │plugin-b │   │.io/      │
│         │   │plugin-a/ │    │         │   │plugin-b/ │
└─────────┘   └──────────┘    └─────────┘   └──────────┘
```

## Workflow Automation Details

### publish-npm.yml (in mirror repos)

```yaml
Triggers:
  - push to main (dry-run)
  - push of v* tags (actual publish)

Steps:
  1. Checkout code 2. Setup Bun + Node.js 3. Install dependencies 4. Run tests & type-check 5. Build package 6. Verify
  package 7. npm publish (with provenance)

Requirements:
  - NPM_TOKEN secret
```

### deploy-docs.yml (in mirror repos)

```yaml
Triggers:
  - push to main
  - push of v* tags
  - manual dispatch

Steps:
  1. Checkout plugin repo 2. Clone opencode-docs-builder 3. Copy plugin docs/ + README 4. Generate Astro config 5. Build
  docs site 6. Deploy to GitHub Pages

Requirements:
  - GitHub Pages enabled (Settings > Pages > GitHub Actions)
```

## Data Flow

```
┌──────────────┐
│   Monorepo   │  Single source of truth
│  Development │  - All code changes
└──────┬───────┘  - Shared tooling
       │          - Atomic changes
       │
       ▼ Tag push
┌──────────────┐
│   Subtree    │  Extract package
│    Split     │  - Clean history
└──────┬───────┘  - Only package files
       │
       ▼ Push
┌──────────────┐
│ Mirror Repo  │  Read-only distribution
│ (+ workflows)│  - Standalone repo
└──────┬───────┘  - Self-contained
       │
       ├─────────────┐
       │             │
       ▼ Build       ▼ Build
┌──────────────┐  ┌──────────────┐
│ npm Package  │  │ GitHub Pages │
│  (provenance)│  │    (docs)    │
└──────────────┘  └──────────────┘
```

## Key Benefits

### For Developers

- ✅ Single workspace for all plugins
- ✅ Shared tooling and dependencies
- ✅ Easy cross-plugin refactoring
- ✅ One tag push = complete release
- ✅ No manual publishing steps

### For Users

- ✅ Clean, focused plugin repositories
- ✅ Each plugin has its own docs site
- ✅ npm packages with provenance badges
- ✅ Can fork and contribute to individual plugins
- ✅ Clear separation of concerns

### For Maintenance

- ✅ Read-only mirrors prevent divergence
- ✅ All changes flow from monorepo
- ✅ Automated testing before publish
- ✅ Consistent release process
- ✅ Easy to add new plugins

## Comparison with Alternatives

### Option 1: Mirroring (CHOSEN ✓)

```
Monorepo → Mirror Repos → npm + GitHub Pages
```

**Pros:**

- Independent plugin repos
- Independent docs sites
- Monorepo benefits
- Automated releases

**Cons:**

- More complex setup
- GitHub Actions minutes

### Option 2: Direct from Monorepo

```
Monorepo → npm + GitHub Pages (single site)
```

**Pros:**

- Simpler setup
- Single workflow

**Cons:**

- ❌ Can't have multiple GitHub Pages
- ❌ Users see monorepo complexity
- ❌ npm repo URL points to monorepo

### Option 3: Git Submodules

```
Separate Repos ↔ Monorepo (submodules)
```

**Pros:**

- True bidirectional sync

**Cons:**

- ❌ Submodule hell
- ❌ Breaks monorepo benefits
- ❌ Complex for contributors
