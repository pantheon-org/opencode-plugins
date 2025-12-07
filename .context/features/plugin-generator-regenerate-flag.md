# Plugin Generator Enhancement: Regenerate Flag Protection

## Summary

Enhanced the plugin generator to require an explicit `--regenerate` (or `-r`) flag when attempting to regenerate an
existing plugin. This prevents accidental overwriting of configuration files and provides clear guidance to developers.

## Changes Made

### 1. Created `tools/generators/plugin/check-update.ts`

New module that encapsulates update detection and validation logic:

```typescript
export const checkUpdate = (
  tree: Tree,
  options: PluginGeneratorSchema,
  normalizedOptions: NormalizedOptions,
): boolean => {
  const isUpdate = tree.exists(normalizedOptions.projectRoot);

  if (isUpdate && !options.regenerate) {
    throw new Error(`
Plugin already exists at: ${normalizedOptions.projectRoot}

To regenerate this plugin and update configuration files (while preserving src/ and docs/), run:
  nx g ./tools/generators:plugin ${options.name} --regenerate

Or use the shorthand:
  nx g ./tools/generators:plugin ${options.name} -r

This will:
  ✓ Preserve src/ - Your plugin source code
  ✓ Preserve docs/ - Your documentation files
  ✗ Regenerate all configuration files (package.json, tsconfig.json, etc.)
  ✗ Regenerate GitHub workflows (.github/workflows/*)
  ✗ Regenerate documentation site (pages/*)
`);
  }

  return isUpdate;
};
```

**Benefits:**

- Separates concerns (update checking vs. file generation)
- Reusable logic
- Clear error messages with helpful instructions
- Single responsibility principle

### 2. Updated `tools/generators/plugin/index.ts`

Refactored to use the new `check-update` module:

**Before:**

```typescript
const isUpdate = tree.exists(normalizedOptions.projectRoot);

if (isUpdate && !options.regenerate) {
  throw new Error(...);
}
```

**After:**

```typescript
import { checkUpdate } from './check-update';

const isUpdate = checkUpdate(tree, options, normalizedOptions);
```

**Benefits:**

- Cleaner main generator code
- Logic moved to dedicated module
- Easier to test and maintain

### 3. Updated `tools/generators/plugin/schema.json`

Enhanced the `regenerate` option with proper alias and prompt:

**Before:**

```json
"regenerate": {
  "type": "boolean",
  "description": "Regenerate the plugin files",
  "flag": "-r, --regenerate",
  "default": false,
  "x-prompt": "Regenerate the plugin files, overwriting any existing files outside of src/ and docs/?"
}
```

**After:**

```json
"regenerate": {
  "type": "boolean",
  "description": "Regenerate the plugin files, preserving src/ and docs/ directories",
  "alias": "r",
  "default": false,
  "x-prompt": "Plugin exists. Regenerate configuration files? (src/ and docs/ will be preserved)"
}
```

**Changes:**

- Removed `flag` property (not valid in JSON Schema)
- Added `alias: "r"` for shorthand support
- Improved description clarity
- Better prompt wording
- Removed from `required` array

### 4. Updated `tools/generators/plugin/README.md`

Added comprehensive documentation about the regeneration protection:

**New Section: "Regenerating Existing Plugins"**

- Explains the protection mechanism
- Shows error message example
- Documents both `--regenerate` and `-r` flags
- Clear lists of what gets regenerated vs. preserved

### 5. Updated Prettier Configuration

Changed `printWidth` from 100 to 120 characters:

**Files updated:**

- `.prettierrc.json` - Root configuration
- `tools/generators/plugin/files/.prettierrc.json__template__` - Template for new plugins

**Before:**

```json
{
  "printWidth": 100,
  "overrides": [
    {
      "files": ["*.md"],
      "options": {
        "printWidth": 100
      }
    }
  ]
}
```

**After:**

```json
{
  "printWidth": 120,
  "overrides": [
    {
      "files": ["*.md"],
      "options": {
        "printWidth": 120
      }
    }
  ]
}
```

## Behavior

### Without Regenerate Flag

```bash
$ nx g ./tools/generators:plugin warcraft-notifications

NX

Plugin already exists at: packages/opencode-warcraft-notifications-plugin

To regenerate this plugin and update configuration files (while preserving src/ and docs/), run:
  nx g ./tools/generators:plugin warcraft-notifications --regenerate

Or use the shorthand:
  nx g ./tools/generators:plugin warcraft-notifications -r

This will:
  ✓ Preserve src/ - Your plugin source code
  ✓ Preserve docs/ - Your documentation files
  ✗ Regenerate all configuration files (package.json, tsconfig.json, etc.)
  ✗ Regenerate GitHub workflows (.github/workflows/*)
  ✗ Regenerate documentation site (pages/*)

error: script "generate:plugin" exited with code 1
```

### With Regenerate Flag (--regenerate or -r)

```bash
$ nx g ./tools/generators:plugin warcraft-notifications -r

NX  Generating ./tools/generators:plugin

⚠️  Existing plugin detected. Preserving src/ directories...
  ✓ Config files regenerated, src/ preserved

CREATE packages/opencode-warcraft-notifications-plugin/.prettierrc.json
CREATE packages/opencode-warcraft-notifications-plugin/docs/...
UPDATE packages/opencode-warcraft-notifications-plugin/project.json

✅ Successfully updated plugin: opencode-warcraft-notifications-plugin

Updated files:
  • Configuration files (package.json, tsconfig.json, etc.)
  • GitHub workflows (.github/workflows/*)
  • Documentation site (pages/*)

Preserved directories:
  • src/ - Your plugin source code
  • docs/ - Your documentation files
```

## Testing Performed

### Test 1: Error Without Flag

```bash
nx g ./tools/generators:plugin warcraft-notifications
# ✅ Shows error with helpful instructions
```

### Test 2: Regeneration With --regenerate

```bash
nx g ./tools/generators:plugin warcraft-notifications --regenerate
# ✅ Successfully regenerates config files
# ✅ Preserves src/ content
```

### Test 3: Regeneration With -r Shorthand

```bash
nx g ./tools/generators:plugin warcraft-notifications -r
# ✅ Successfully regenerates config files
# ✅ Preserves src/ content
```

### Test 4: Preservation Verification

```bash
# 1. Modified src/index.ts with custom code
echo "// CUSTOM CODE" > packages/.../src/index.ts

# 2. Ran regeneration
nx g ./tools/generators:plugin warcraft-notifications -r

# 3. Verified preservation
cat packages/.../src/index.ts
# ✅ Output: "// CUSTOM CODE" (preserved)
```

## Benefits

### For Developers

1. **Protection Against Accidents**
   - Can't accidentally regenerate by mistake
   - Must explicitly opt-in with flag

2. **Clear Communication**
   - Error message explains what will happen
   - Shows both long and short flag options
   - Lists exactly what's preserved vs. regenerated

3. **Confidence**
   - Know that src/ and docs/ are safe
   - Can update templates without fear

### For Maintenance

1. **Code Organization**
   - Separated concerns (check-update module)
   - Easier to test update logic
   - Single responsibility principle

2. **Consistency**
   - All plugins follow same regeneration rules
   - Template updates propagate uniformly

3. **Documentation**
   - Clear README instructions
   - Helpful error messages
   - Examples for both flags

## Use Cases

### 1. Template Updates

After improving generator templates:

```bash
# Update a single plugin
nx g ./tools/generators:plugin my-plugin -r

# Or update all plugins
for plugin in packages/opencode-*; do
  name=$(basename $plugin | sed 's/opencode-//' | sed 's/-plugin//')
  nx g ./tools/generators:plugin $name -r
done
```

### 2. Fix Broken Configuration

If a plugin has broken config:

```bash
nx g ./tools/generators:plugin broken-plugin -r
# Config files reset, source code preserved
```

### 3. Adopt New Workflows

When new GitHub workflows are added to templates:

```bash
nx g ./tools/generators:plugin my-plugin -r
# New workflows added, code untouched
```

## File Structure

```
tools/generators/plugin/
├── check-update.ts         # NEW - Update detection and validation
├── index.ts               # MODIFIED - Uses check-update module
├── schema.json            # MODIFIED - Updated regenerate option
├── README.md              # MODIFIED - Added regeneration docs
└── files/
    └── .prettierrc.json__template__  # MODIFIED - printWidth: 120
```

## Related Changes

- `.prettierrc.json` - Updated printWidth to 120
- Previous work: File preservation logic in `add-files.ts`
- Previous work: Detection in main generator

## Recap

The plugin generator now requires an explicit `--regenerate` or `-r` flag to update existing plugins, providing:

✅ Protection against accidental overwrites ✅ Clear error messages with instructions ✅ Shorthand flag support (-r) ✅
Better code organization (check-update module) ✅ Improved documentation ✅ Consistent 120 character print width

**Key principle**: Explicit regeneration prevents accidents while preserving src/ and docs/.
