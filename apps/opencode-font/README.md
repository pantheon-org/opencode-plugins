# @pantheon-ai/opencode-font

OpenCode-style font package with text-to-SVG conversion and web fonts for pixel-art style text rendering.

**📖 [View Interactive Documentation](https://pantheon-ai.github.io/opencode-font/)**

## Overview

This package provides:

- **Grid-based pixel art font** (OpenCodeLogo) with 32 glyphs (A-Z + 6 symbols: `-|'"?!`)
- **Web fonts** in multiple formats (WOFF2, WOFF, TTF) optimized for modern browsers
- **JavaScript API** for programmatic SVG text generation (two approaches)
  - Simple font-based SVG generation (`convertTextToSVG`)
  - Advanced blocky pixel-art rendering (`blockyTextToSVG`)
- **CSS helper** for easy font integration

## Installation

### From npm (Standalone Usage)

```bash
npm install @pantheon-org/opencode-font
```

### In opencode-plugins Monorepo

The package is available via workspace protocol in other apps/packages:

```json
{
  "dependencies": {
    "@pantheon-org/opencode-font": "workspace:*"
  }
}
```

## Quick Start

### Option 1A: Blocky Pixel-Art SVG (Recommended for Logos)

Generate pixel-perfect SVG with blocky rendering and theme support:

```js
import { blockyTextToSVG } from '@pantheon-ai/opencode-font';

const svg = blockyTextToSVG('OPENCODE', {
  theme: 'dark', // or 'light'
  blockSize: 6,
  charSpacing: 1,
  optimize: true, // Reduces file size by 30-40%
});

// Inject into your page
document.getElementById('logo').innerHTML = svg;
```

### Option 1B: Simple Font-Based SVG

Generate SVG text using the OpenCodeLogo font:

```js
import { convertTextToSVG } from '@pantheon-ai/opencode-font';

const svg = convertTextToSVG('OPENCODE', {
  fontSize: 48,
  color: '#00ff00',
});

// Inject into your page
document.getElementById('logo').innerHTML = svg;
```

### Option 2: CSS Font Integration

Use the font directly in your CSS:

```html
<!-- In your HTML -->
<link rel="stylesheet" href="node_modules/@pantheon-ai/opencode-font/css/opencode-font.css" />

<style>
  .pixel-text {
    font-family: 'OpenCodeLogo', monospace;
    font-size: 48px;
    color: #00ff00;
  }
</style>

<h1 class="pixel-text">OPENCODE</h1>
```

### Option 3: Custom @font-face

For more control, define your own `@font-face`:

```css
@font-face {
  font-family: 'OpenCodeLogo';
  src:
    url('node_modules/@pantheon-ai/opencode-font/fonts/OpenCodeLogo.woff2') format('woff2'),
    url('node_modules/@pantheon-ai/opencode-font/fonts/OpenCodeLogo.woff') format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap; /* Recommended for web performance */
}

.my-text {
  font-family: 'OpenCodeLogo', monospace;
  text-transform: uppercase; /* Font only includes uppercase */
}
```

## API Reference

### Blocky Pixel-Art API

#### `blockyTextToSVG(text, options)`

Converts text to blocky pixel-art SVG with optimized paths and theme support.

**Parameters:**

- `text` (string) — Text to convert (A-Z, `-|'"?!` supported)
- `options` (object) — Configuration options:
  - `theme` ('light' | 'dark') — Color theme (default: `'light'`)
  - `blockSize` (number) — Size of each pixel block in pixels (default: `6`)
  - `charSpacing` (number) — Space between characters in blocks (default: `1`)
  - `optimize` (boolean) — Enable SVG path optimization (default: `true`)

**Returns:** SVG string with pixel-perfect rendering

**Example:**

```js
const svg = blockyTextToSVG('HELLO', {
  theme: 'dark',
  blockSize: 6,
  charSpacing: 1,
  optimize: true,
});
```

**Features:**

- **Pixel-perfect rendering** - No font rendering inconsistencies across browsers
- **Theme support** - Built-in light/dark modes using OpenCode.ai colors
- **Variable-width characters** - 1-5 columns depending on character
- **SVG optimization** - Merges adjacent blocks for 30-40% size reduction
- **Consistent output** - Identical across all browsers and platforms

**When to use:**

- Logos and headers
- Pixel-art style graphics
- When you need exact pixel control
- When consistency across browsers is critical

---

### Simple Font-Based API

#### `convertTextToSVG(text, options)`

Converts text to an SVG string using the OpenCodeLogo font.

**Parameters:**

- `text` (string) — Text to convert (A-Z, `-|'"?!` supported)
- `options` (object) — Configuration options:
  - `fontSize` (number) — Font size in pixels (default: `48`)
  - `color` (string) — Text color (default: `#000`)
  - `fontFamily` (string) — Font family name (default: `OpenCodeLogo`)
  - `width` (number) — SVG width (optional, auto-calculated)
  - `height` (number) — SVG height (optional, auto-calculated)
  - `role` (string) — ARIA role attribute (default: `img`)
  - `ariaLabel` (string) — ARIA label for accessibility (default: text content)

**Returns:** SVG string

**Example:**

```js
const svg = convertTextToSVG('HELLO', {
  fontSize: 64,
  color: '#ff0000',
  role: 'img',
  ariaLabel: 'Hello message in pixel art style',
});
```

**When to use:**

- Text-heavy content where file size matters
- When you want browser-native font rendering
- Dynamic text that changes frequently

---

### API Comparison

| Feature             | `convertTextToSVG()`      | `blockyTextToSVG()`            |
| ------------------- | ------------------------- | ------------------------------ |
| Rendering           | Font-based `<text>`       | Pixel-perfect paths            |
| Browser consistency | Depends on font rendering | Identical everywhere           |
| Theme support       | No                        | Yes (light/dark)               |
| Variable width      | Font-dependent            | Yes (1-5 columns)              |
| Optimization        | No                        | Yes (30-40% size reduction)    |
| Customization       | Limited                   | Full control (blocks, spacing) |
| **Recommended for** | Text-heavy content        | Logos, headers, pixel-art      |

For complete blocky text API documentation, see [`src/alphabet/README.md`](src/alphabet/README.md).

## Font Specifications

- **Character Set**: ASCII uppercase (A-Z) + 6 symbols (`-|'"?!`)
- **Total Glyphs**: 32
- **Design**: 7×4 grid-based pixel art
- **File Sizes**:
  - WOFF2: ~1.3 KB (recommended)
  - WOFF: ~1.8 KB
  - TTF: ~6.4 KB
- **Total Package Size**: ~9.5 KB (all formats)

## Browser Support

Modern browsers with WOFF2 support are recommended:

- Chrome/Edge 36+
- Firefox 39+
- Safari 10+
- Opera 23+

Fallback to WOFF for older browsers.

## Development

### Prerequisites

- [Bun](https://bun.sh) v1.3.2+ or Node.js 20+

### Setup

```bash
# Install dependencies
bun install

# Generate fonts
bun run generate:fonts

# Validate generated fonts
bun run validate:fonts

# Run tests
bun test

# Type check
bun run typecheck

# Build
bun run build
```

### Font Generation

Fonts are automatically generated in CI pipelines and are **not** committed to version control. To generate fonts
locally:

```bash
bun run generate:fonts
```

This creates:

- `fonts/OpenCodeLogo.woff2` (1.3 KB)
- `fonts/OpenCodeLogo.woff` (1.8 KB)
- `fonts/OpenCodeLogo.ttf` (6.4 KB)

Generation time: ~0.15s

### Testing Changes

```bash
# Run all checks (format, lint, typecheck, tests)
bun run format:check
bun run lint
bun run typecheck
bun test

# Build to verify distribution
bun run build
```

### Demo

Open `demo/index.html` in a browser to see an interactive demo of the font and SVG generation API.

## Troubleshooting

### Font not displaying correctly

**Issue**: Text appears in a fallback font instead of OpenCodeLogo

**Solutions**:

1. Ensure fonts are generated: `bun run generate:fonts`
2. Check font file paths in your CSS
3. Verify fonts are included in your build output
4. Check browser console for font loading errors
5. Use `font-display: swap` to see fallback text while loading

### Text shows as empty/blank

**Issue**: No text visible when using the font

**Possible causes**:

- Font only supports **uppercase A-Z** and symbols `-|'"?!`
- Lowercase letters are not included
- Numbers are not included

**Solution**: Use `text-transform: uppercase` in CSS or convert text to uppercase in JavaScript:

```js
const svg = convertTextToSVG(text.toUpperCase(), options);
```

### Font files missing after npm install

**Issue**: `fonts/` directory is empty

**Cause**: Fonts are generated during the publish process and included in the npm package

**Solution**:

- If using from npm: Fonts should be present in `node_modules/@pantheon-ai/opencode-font/fonts/`
- If using from source: Run `bun run generate:fonts` to generate fonts locally

### Build/CI issues with font generation

**Issue**: Font generation fails in CI

**Debugging steps**:

1. Check Node.js/Bun version compatibility (requires Node 20+ or Bun 1.3+)
2. Ensure all dependencies are installed
3. Check logs for specific error messages
4. Verify `scripts/generate-fonts.ts` is present
5. Run `bun run validate:fonts` to diagnose issues

### Performance issues

**Issue**: Font loading impacts page performance

**Solutions**:

1. Use WOFF2 format exclusively (smallest at 1.3 KB)
2. Preload fonts for critical text:
   ```html
   <link rel="preload" href="fonts/OpenCodeLogo.woff2" as="font" type="font/woff2" crossorigin />
   ```
3. Use `font-display: swap` to avoid FOIT (Flash of Invisible Text)
4. Consider subsetting if you only need specific characters

## Contributing

### Font Generation Workflow

Fonts are automatically generated in CI and **should not** be committed to version control.

**Development workflow**:

1. Make changes to `scripts/generate-fonts.ts` if modifying glyphs
2. Run `bun run generate:fonts` to test locally
3. Run `bun run validate:fonts` to verify output
4. Commit changes (excluding `fonts/*.ttf`, `fonts/*.woff`, `fonts/*.woff2`)
5. CI will generate fonts during validation and publishing

**Font generation details**:

- **Source**: Grid-based glyph definitions in `scripts/generate-fonts.ts`
- **Pipeline**: SVG glyphs → SVG font → TTF → WOFF/WOFF2
- **Tools**: `svgicons2svgfont`, `svg2ttf`, `ttf2woff`, `ttf2woff2`
- **Time**: ~0.15s locally, ~0.14s in CI

## Mirroring to Standalone Repository

This app is automatically mirrored from the monorepo to its own repository for distribution:

### How it Works

1. **Tag in monorepo**: Create a tag with format `opencode-font@v1.0.0`
2. **Automatic mirroring**: GitHub workflow extracts `apps/opencode-font/` subdirectory
3. **Push to mirror**: Content is pushed to `pantheon-org/opencode-font` repository
4. **Independent CI/CD**: The mirror repo runs its own publishing workflow

### Creating a Release

```bash
# From opencode-plugins monorepo root
git tag opencode-font@v1.0.0
git push origin opencode-font@v1.0.0
```

This triggers `.github/workflows/mirror-opencode-font.yml` which mirrors the app to the standalone repository.

## CI/CD Pipeline (Standalone Repository)

The mirrored repository uses a fully automated CI/CD pipeline for testing, versioning, and publishing:

### Workflow Overview

1. **Pull Request Validation** (`.github/workflows/1-validate.yml`)
   - Runs on every PR to `main`
   - **Generates fonts** before validation
   - Executes: linting, type checking, tests with coverage, and build
   - Analyzes PR size and warns if too large

2. **Version Bumping** (`.github/workflows/2-version-update.yml`)
   - Triggers after merge to `main`
   - Analyzes commits using conventional commit patterns
   - Automatically creates version bump PR based on changes:
     - `feat:` → minor version bump
     - `fix:` → patch version bump
     - `BREAKING CHANGE` or `!:` → major version bump

3. **Auto-Merge** (`.github/workflows/3-auto-merge.yml`)
   - Automatically merges version bump PRs once checks pass
   - Validates PR format and author
   - Retries if checks are still pending

4. **Tag Creation** (`.github/workflows/4-create-tag.yml`)
   - Creates git tag after version bump is merged
   - Tag format: `v{major}.{minor}.{patch}`
   - Triggers publishing workflow

5. **Publishing** (`.github/workflows/5-publish.yml`)
   - **Generates fonts** for distribution
   - Publishes to npm with provenance (includes fonts in package)
   - Deploys demo to GitHub Pages (includes fonts)
   - Creates GitHub Release with changelog

### Conventional Commits

Use conventional commit messages to control version bumping:

```bash
feat: add new feature          # minor bump (0.1.0 → 0.2.0)
fix: resolve bug               # patch bump (0.1.0 → 0.1.1)
feat!: breaking change         # major bump (0.1.0 → 1.0.0)
docs: update documentation     # patch bump (0.1.0 → 0.1.1)
chore: update dependencies     # patch bump (0.1.0 → 0.1.1)
```

### Required Secrets

Add these secrets to your GitHub repository settings:

- `NPM_TOKEN` - npm authentication token for publishing
- `WORKFLOW_PAT` (optional) - Personal Access Token with repo and workflow permissions for auto-merge

### Manual Version Bump

To manually trigger a version bump:

1. Go to Actions → "2. Version Update (Create PR)"
2. Click "Run workflow"
3. Select version type: auto, major, minor, or patch

## License

MIT
