# Plugin Generator Enhancement: File Preservation

## Summary

Enhanced the Nx plugin generator to **preserve `src/` and `docs/` directories** when regenerating
existing plugins, while updating all configuration files, GitHub workflows, and the documentation
site structure.

## Problem Statement

When updating generator templates (e.g., adding new GitHub workflows, fixing build configurations,
or adopting new best practices), there was no safe way to apply these changes to existing plugins
without manually copying files or risking loss of work.

## Solution

Implemented **selective file regeneration** in the plugin generator:

1. **Automatic detection** - Generator detects if plugin already exists
2. **Preserve critical directories** - `src/` and `docs/` content is saved before generation
3. **Regenerate infrastructure** - All config files, workflows, and site structure are updated
4. **Restore preserved files** - Original source code and docs are written back

## Changes Made

### 1. Modified `tools/generators/plugin/add-files.ts`

**Added:**

- `collectFilesFromTree()` - Recursively collects files from a directory in the Nx Tree
- Preservation logic - Saves `src/` and `docs/` content before generation
- Restoration logic - Writes preserved files back after generation
- User feedback - Console messages about what's being preserved

**Before:**

```typescript
export const addFiles = (tree: Tree, options: NormalizedOptions): void => {
  generateFiles(tree, templatePath, options.projectRoot, templateOptions);
};
```

**After:**

```typescript
export const addFiles = (tree: Tree, options: NormalizedOptions): void => {
  const srcExists = tree.exists(srcPath);
  const docsExists = tree.exists(docsPath);

  if (srcExists || docsExists) {
    // Preserve existing content
    const existingContent: Map<string, Buffer> = new Map();
    collectFilesFromTree(tree, srcPath, existingContent);
    collectFilesFromTree(tree, docsPath, existingContent);

    // Generate all files
    generateFiles(tree, templatePath, options.projectRoot, templateOptions);

    // Restore preserved files
    existingContent.forEach((content, filePath) => {
      tree.write(filePath, content);
    });
  } else {
    // New plugin - generate everything
    generateFiles(tree, templatePath, options.projectRoot, templateOptions);
  }
};
```

### 2. Updated `tools/generators/plugin/index.ts`

**Added:**

- Detection of existing plugins
- Different success messages for new vs. updated plugins
- Clear indication of what was preserved and what was updated

**Before:**

```typescript
return () => {
  console.log(`✨ Successfully created plugin: ${normalizedOptions.projectName}`);
};
```

**After:**

```typescript
return () => {
  if (isUpdate) {
    console.log(`
✅ Successfully updated plugin: ${normalizedOptions.projectName}

Updated files:
  • Configuration files (package.json, tsconfig.json, etc.)
  • GitHub workflows (.github/workflows/*)
  • Documentation site (pages/*)

Preserved directories:
  • src/ - Your plugin source code
  • docs/ - Your documentation files
`);
  } else {
    console.log(`✨ Successfully created plugin: ${normalizedOptions.projectName}`);
  }
};
```

### 3. Updated `tools/generators/plugin/schema.json`

- Already had `regenerate` option (set to `false` by default)
- Defaults for `addTests` and `addLint` were changed to `true`

### 4. Updated `tools/generators/plugin/README.md`

**Added:**

- New section: "Regenerating Existing Plugins"
- Documentation of what gets regenerated vs. preserved
- Example workflow for updating plugins
- Updated options table with current defaults

### 5. Created `.opencode/knowledge-base/plugin-generator-regeneration.md`

Comprehensive documentation covering:

- How the preservation feature works
- What gets regenerated vs. preserved
- Usage examples and use cases
- Implementation details
- Best practices
- Troubleshooting guide
- Future enhancement ideas

## What Gets Regenerated

✅ **Always regenerated:**

- Configuration files: `package.json`, `tsconfig.json`, `eslint.config.mjs`, etc.
- GitHub workflows: `.github/workflows/*`
- Documentation site: `pages/*` (Astro build setup)
- Root files: `README.md`, `LICENSE`, `index.ts`

## What Is Preserved

🔒 **Never overwritten:**

- `src/` - All plugin source code and tests
- `docs/` - All documentation markdown files

## Testing

Verified the feature works by:

1. Generated test plugin: `nx g ./tools/generators:plugin test-preserve`
2. Modified source: `echo "// CUSTOM SOURCE CODE" > src/index.ts`
3. Modified docs: `echo "# CUSTOM DOCS" > docs/README.md`
4. Regenerated plugin: `nx g ./tools/generators:plugin test-preserve`
5. Verified preservation: Custom content remained intact
6. Verified regeneration: `package.json` and other configs were updated

## Benefits

### For Plugin Developers

- **Safe updates** - Can regenerate config without losing work
- **Easy adoption** - Apply new best practices from templates
- **Confidence** - No fear of accidentally overwriting source code

### For Maintenance

- **Consistency** - All plugins can adopt new standards
- **Evolution** - Templates can improve over time
- **Distribution** - Changes propagate to all plugins easily

## Usage Examples

### Update Single Plugin

```bash
nx workspace-generator plugin my-plugin
git diff packages/opencode-my-plugin
```

### Update All Plugins

```bash
# For each plugin in packages/
for plugin in packages/opencode-*; do
  name=$(basename $plugin | sed 's/opencode-//' | sed 's/-plugin//')
  nx workspace-generator plugin $name
done
```

### Preview Changes

```bash
nx workspace-generator plugin my-plugin --dry-run
```

## Implementation Notes

### Why Not Git?

Alternative: Use git to preserve files by committing before generation.

**Rejected because:**

- Requires clean working directory
- Adds git commits to user's history
- More complex rollback on errors
- Doesn't work well with `--dry-run`

### Why In-Memory Preservation?

The Nx Tree is an in-memory virtual file system. By:

1. Reading existing files into a Map
2. Letting generation proceed normally
3. Restoring from the Map

We ensure atomic operations that work with Nx's commit/rollback system.

### Edge Cases Handled

- **Empty directories** - Handled gracefully
- **Missing src/ or docs/** - Only preserves what exists
- **Nested files** - Recursive collection handles deep hierarchies
- **Binary files** - Preserved as Buffer objects
- **Read errors** - Try/catch prevents crashes

## Future Improvements

Potential enhancements:

1. **Selective preservation CLI flags**

   ```bash
   nx g plugin my-plugin --preserve src --preserve docs --preserve pages
   ```

2. **Backup before regeneration**

   ```bash
   nx g plugin my-plugin --backup
   # Creates packages/opencode-my-plugin.backup/
   ```

3. **Interactive mode**

   ```bash
   nx g plugin my-plugin --interactive
   # Prompts for each file: [r]egenerate, [p]reserve, [d]iff
   ```

4. **Merge strategies**

   ```bash
   nx g plugin my-plugin --merge package.json
   # Smart merge of specific files
   ```

5. **Diff preview**
   ```bash
   nx g plugin my-plugin --preview
   # Shows diff without applying changes
   ```

## Documentation Updates Needed

- [x] Updated `tools/generators/plugin/README.md`
- [x] Created `.opencode/knowledge-base/plugin-generator-regeneration.md`
- [ ] Update main `README.md` with regeneration example
- [ ] Add to `docs/GENERATOR_SETUP.md` if applicable

## Related Files

- `tools/generators/plugin/index.ts` - Main generator
- `tools/generators/plugin/add-files.ts` - File generation with preservation
- `tools/generators/plugin/schema.json` - Generator options
- `tools/generators/plugin/README.md` - Generator documentation
- `.opencode/knowledge-base/plugin-generator-regeneration.md` - Feature documentation

## Conclusion

The plugin generator now safely supports regeneration of existing plugins, enabling:

- ✅ Template improvements to propagate to all plugins
- ✅ Configuration fixes without manual file copying
- ✅ Consistent infrastructure across the monorepo
- ✅ Developer confidence when updating plugins

**Core principle**: Your code (`src/`) and documentation (`docs/`) are sacred. Everything else is
infrastructure that can be regenerated.
