# Generator vs Mirror Templates: Consistency Analysis

## Summary

This document analyzes the differences between generator templates (for standalone plugins) and mirror templates (for
mirrored plugins) to determine if they need to be unified or kept separate.

## Current State

### Generator Templates

**Location:** `tools/generators/plugin/files/.github/`

**Features:**

- EJS template syntax with variables (`<%= actions.setupBun %>`)
- Centralized action version management with SHA pinning
- Full Release Please automation
- Reusable workflows for composition
- Template suffix (`__template__`) for Nx generator

**Action Versions:**

```typescript
// From getFlattenedActions()
{
  setupBun: "oven-sh/setup-bun@a3539a2ab78a9af0cd00c4acfcce7c39f771115c # v2.0.2",
  setupNode: "actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af # v4.1.0",
  cache: "actions/cache@6849a6489940f00c2f30c0fb92c6274307ccb58a # v4.1.2",
  // ... with SHA pinning for security
}
```

**Use Case:**

- Standalone plugin development
- Long-term maintenance needed
- Security-focused with SHA pinning
- Conventional commits + Release Please

### Mirror Templates

**Location:** `.github/mirror-templates/`

**Features:**

- Direct YAML (no template processing)
- Hardcoded action versions
- Simple tag-triggered workflows
- No Release Please (version comes from monorepo tag)
- No template suffix (ready-to-use YAML)

**Action Versions:**

```yaml
# Hardcoded in YAML
uses: oven-sh/setup-bun@v2
uses: actions/setup-node@v4
uses: actions/cache@v4
# Using version tags, not SHAs
```

**Use Case:**

- Mirrored plugin distribution
- Automatic regeneration on each release
- Simpler version management
- Tag-based publishing

## Key Differences

| Aspect               | Generator                 | Mirror              |
| -------------------- | ------------------------- | ------------------- |
| **Template Format**  | EJS with variables        | Direct YAML         |
| **Action Versions**  | SHA-pinned                | Tag-based           |
| **Version Source**   | Centralized TypeScript    | Hardcoded           |
| **Processing**       | Nx generator              | Git subtree + copy  |
| **Update Frequency** | On plugin creation/update | On each mirror push |
| **Security**         | SHA pinning               | Tag following       |

## Security Considerations

### SHA Pinning (Generator Approach)

**Pros:**

- ✅ Immune to tag manipulation
- ✅ Exact version control
- ✅ Best security practice
- ✅ Required for supply chain security compliance

**Cons:**

- ❌ More complex to maintain
- ❌ Requires manual SHA updates
- ❌ Can't benefit from patch updates automatically

### Tag Following (Mirror Approach)

**Pros:**

- ✅ Simple to maintain
- ✅ Automatically gets patch fixes
- ✅ Easy to read and understand
- ✅ Standard practice for many projects

**Cons:**

- ❌ Vulnerable to tag manipulation (rare but possible)
- ❌ Less control over exact versions
- ❌ May break on unexpected updates

## Analysis Questions

### 1. Should mirror templates use centralized version management?

**Option A: Keep hardcoded versions**

- ✅ Simple and maintainable
- ✅ Works for current workflow
- ✅ Mirror repos are regenerated frequently
- ✅ No template processing needed

**Option B: Use centralized versions**

- ❌ Requires template processing during mirror
- ❌ Adds complexity to mirror workflow
- ❌ EJS processing during git operations
- ✅ Consistency with generator
- ✅ Better security with SHA pinning

**Recommendation:** **Keep hardcoded versions** (Option A)

**Reasoning:**

- Mirror templates are regenerated on every release
- Adding EJS processing to mirror workflow adds complexity
- Tag-based versions are acceptable for frequently-regenerated files
- Security benefit is minimal since files are under our control

### 2. Should action versions be updated in mirror templates?

**Current Versions:**

- Generator: `setup-bun@v2.0.2` (SHA: a3539a2...)
- Mirror: `setup-bun@v2`

**Recommendation:** **Pin to specific minor versions**

Update mirror templates to use minor version tags for better stability:

```yaml
# Current (too broad)
uses: oven-sh/setup-bun@v2

# Recommended (specific minor)
uses: oven-sh/setup-bun@v2.0
```

This provides:

- ✅ Automatic patch updates
- ✅ Protection from breaking major updates
- ✅ Reasonable security vs simplicity tradeoff

### 3. Should composite actions be identical?

**Current State:**

- Generator: Simpler, EJS variables
- Mirror: More features (npm auth, better caching)

**Recommendation:** **Keep them different**

**Reasoning:**

- Mirror version has npm authentication setup that generator doesn't need
- Generator version uses EJS for flexibility
- Different use cases justify different implementations
- Both accomplish the same goal in their contexts

### 4. Should we create shared composite actions?

**Option A: Keep separate implementations**

- ✅ Optimized for each use case
- ✅ No tight coupling
- ✅ Easier to maintain independently
- ❌ Potential drift over time

**Option B: Create shared npm package**

- ✅ Single source of truth
- ✅ Consistent behavior
- ❌ Adds dependency
- ❌ Overkill for current scale

**Recommendation:** **Keep separate** (Option A)

**Reasoning:**

- Current scale doesn't justify shared package
- Different contexts need different features
- Easy to sync manually when needed
- Can reconsider if we have 10+ plugins

## Recommendations

### 1. Update Mirror Template Action Versions

Update mirror templates to use minor version pinning:

```yaml
# .github/mirror-templates/actions/setup-bun/action.yml
- uses: oven-sh/setup-bun@v2.0 # Instead of @v2
- uses: actions/cache@v4.1 # Instead of @v4

# .github/mirror-templates/actions/setup-node-npm/action.yml
- uses: actions/setup-node@v4.1 # Instead of @v4
```

### 2. Document Version Update Process

Add to `.github/mirror-templates/README.md`:

```markdown
## Action Version Management

Mirror templates use minor version pinning for action versions:

- Format: `action@vX.Y` (e.g., `setup-bun@v2.0`)
- Allows automatic patch updates
- Protects from breaking major changes

To update versions:

1. Check latest versions in generator: `tools/generators/plugin/src/github-action-versions/`
2. Update mirror templates to matching minor versions
3. Test with a plugin release
```

### 3. Keep Templates Separate

**Do NOT:**

- Try to unify generator and mirror templates
- Add EJS processing to mirror workflow
- Create shared composite action packages (yet)

**DO:**

- Keep templates optimized for their use cases
- Manually sync action versions periodically
- Document the differences clearly

### 4. Regular Version Sync

Create a quarterly reminder to:

1. Check generator action versions
2. Update mirror template versions to match
3. Test with a plugin release
4. Document any issues

## Conclusion

**The generator and mirror templates should remain separate** with these characteristics:

### Generator Templates

- ✅ EJS template processing
- ✅ SHA-pinned action versions
- ✅ Full automation (Release Please)
- ✅ For standalone plugin development

### Mirror Templates

- ✅ Direct YAML files
- ✅ Minor-version-pinned actions
- ✅ Simple tag-triggered workflows
- ✅ For monorepo plugin distribution

### Sync Strategy

- Manual quarterly version updates
- Document differences clearly
- Test thoroughly after updates
- Keep templates context-appropriate

## Action Items

- [x] Document differences (this file)
- [ ] Update mirror template action versions to minor pins
- [ ] Add version management section to mirror templates README
- [ ] Create quarterly calendar reminder for version sync
- [ ] Update PLUGIN_WORKFLOWS.md with version strategy

## Related Files

- `.github/PLUGIN_WORKFLOWS.md` - Workflow comparison
- `tools/generators/plugin/src/github-action-versions/` - Version management
- `.github/mirror-templates/README.md` - Mirror template docs
