# Mirror Implementation Completion - Option 1

## Summary

This implementation completes the mirroring architecture by adding automated npm publishing and GitHub Pages deployment
to mirror repositories.

## What Was Changed

### 1. Created Mirror Templates Directory

**Location:** `.github/mirror-templates/`

Contains workflow templates that are automatically added to mirror repositories:

- **`publish-npm.yml`** - Publishes plugins to npm with provenance
- **`deploy-docs.yml`** - Deploys documentation to GitHub Pages using shared docs-builder
- **`README.md`** - Documentation for the templates and troubleshooting

### 2. Updated Mirror Workflows

**File:** `.github/workflows/mirror-packages.yml`

Added new step that:

- Checks out the temporary branch after subtree split
- Copies workflow templates from `.github/mirror-templates/`
- Commits workflows to the temp branch
- Pushes to mirror repository

**File:** `.github/workflows/mirror-docs-builder.yml`

Updated to use `--force-with-lease` for safer pushes

### 3. Updated Documentation

**File:** `README.md`

Enhanced with:

- Complete workflow automation description
- Mirror repository automation details
- Requirements for mirror repositories
- Mirror repository structure documentation

## How It Works

### Plugin Release Flow

```
1. Developer tags release in monorepo
   └─> git tag opencode-my-plugin@v1.0.0
   └─> git push origin opencode-my-plugin@v1.0.0

2. mirror-packages.yml workflow triggers
   ├─> Validates package.json has repository URL
   ├─> Detects changes since last tag
   ├─> Extracts plugin directory (git subtree split)
   ├─> Adds CI/CD workflows from templates
   ├─> Pushes to mirror repository
   └─> Enables GitHub Pages with workflow build type (via API)

3. Mirror repository receives code + workflows
   ├─> publish-npm.yml triggers on tag push
   │   ├─> Runs tests and type checking
   │   ├─> Builds package
   │   └─> Publishes to npm
   │
   └─> deploy-docs.yml triggers on tag push
       ├─> Clones opencode-docs-builder
       ├─> Copies plugin docs + README
       ├─> Generates Astro config
       ├─> Builds documentation site
       └─> Deploys to GitHub Pages
```

## Benefits

### ✅ Achieved Goals

1. **Independent npm packages** - Each plugin published from its own repo
2. **Independent GitHub Pages** - Each plugin has its own docs site at `https://pantheon-org.github.io/<plugin-name>/`
3. **Automated releases** - Tag once in monorepo, everything else is automatic
4. **Read-only mirrors** - All development stays in monorepo
5. **Self-contained repos** - Mirror repos are fully standalone and distributable

### ✅ Improved Safety

- Uses `--force-with-lease` instead of `--force` for safer pushes
- Prevents accidental overwrites of concurrent changes

### ✅ Better Developer Experience

- Single tag push triggers complete release pipeline
- No manual steps needed
- Clear documentation for troubleshooting

## Requirements for First-Time Setup

For existing mirror repositories, you only need to:

1. **Add npm token secret:**

   ```
   Go to mirror repo Settings > Secrets and variables > Actions
   Add secret: NPM_TOKEN (npm automation token with publish access)
   ```

2. **Trigger a new release** to get the workflows and enable GitHub Pages:
   ```bash
   git tag opencode-my-plugin@v1.0.1
   git push origin opencode-my-plugin@v1.0.1
   ```

**Note:** GitHub Pages is now automatically enabled via API during the mirror workflow. No manual configuration needed!

## Testing Plan

### Before Merging

1. **Verify workflow syntax:**

   ```bash
   # GitHub Actions workflow syntax validation
   gh workflow view publish-npm.yml
   gh workflow view deploy-docs.yml
   ```

2. **Test locally (dry-run):**
   ```bash
   # In a plugin directory
   npm publish --dry-run
   ```

### After Merging

1. **Test with a non-production plugin** (create a test plugin if needed)
2. **Tag and push:**
   ```bash
   git tag opencode-test-plugin@v0.0.1
   git push origin opencode-test-plugin@v0.0.1
   ```
3. **Verify:**
   - [ ] Mirror repo receives workflows in `.github/workflows/`
   - [ ] npm publish workflow runs and succeeds
   - [ ] Documentation deploys to GitHub Pages
   - [ ] Package appears on npm with provenance badge

## Rollback Plan

If issues occur:

1. **Revert this branch:**

   ```bash
   git revert <commit-hash>
   ```

2. **Or manually remove workflows from mirror repos:**
   ```bash
   # In mirror repo
   rm -rf .github/workflows/publish-npm.yml
   rm -rf .github/workflows/deploy-docs.yml
   git commit -am "Remove auto-generated workflows"
   git push
   ```

## Next Steps

After this PR is merged:

1. **Update existing mirror repositories** with one-time manual setup:
   - Add `NPM_TOKEN` secret
   - Enable GitHub Pages
   - Trigger new release to get workflows

2. **Test with each plugin** to ensure smooth deployments

3. **Monitor initial releases** for any issues

4. **Update plugin documentation** to reflect the automated release process

## Questions Addressed

**Q: Is mirroring the best approach?**  
**A:** Yes, for these requirements:

- Independent plugin repositories (clean, focused repos for users)
- Independent GitHub Pages (each plugin has its own docs site)
- Independent npm packages (published from dedicated repos)
- Monorepo benefits (shared tooling, easy refactoring, atomic changes)
- Read-only mirrors (prevents divergence, all dev in monorepo)

**Q: What was missing?**  
**A:** Mirror repos lacked automation:

- No npm publishing on tag push
- No docs deployment to GitHub Pages
- Manual steps required for releases

**Q: What's different now?**  
**A:** Fully automated pipeline:

- Tag once in monorepo
- Mirror repo automatically publishes to npm
- Mirror repo automatically deploys docs
- Zero manual steps
