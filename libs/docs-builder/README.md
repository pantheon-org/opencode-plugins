# OpenCode Documentation Builder

Shared Astro-based documentation builder for OpenCode plugins.

## Overview

This is a centralized documentation build system used by all OpenCode plugins in the Pantheon organization. Instead of
duplicating Astro configuration in each plugin, plugins reference this builder during deployment.

## Architecture

- **Monorepo**: Lives in `apps/docs-builder/` in the main monorepo
- **Mirror**: Mirrored to `pantheon-org/opencode-docs-builder` (read-only)
- **Usage**: Plugin repos clone this during GitHub Pages deployment

## Features

- 🎨 Astro + Starlight for beautiful documentation
- 📝 Markdown to static site transformation
- 🔗 Automatic link fixing and verification
- 🎭 Custom components (ASCII titles, headers)
- 🎨 Mermaid diagram support
- 🖼️ Automatic favicon generation

## Usage

### For Plugin Development (Monorepo)

```bash
# Install dependencies
cd apps/docs-builder
bun install

# Start development server
bun run dev

# Build documentation
bun run build

# Verify links
bun run verify
```

### For Plugin Deployment (Mirrored Repos)

Plugin repositories pull this builder during CI:

```yaml
- name: Clone docs-builder
  run: gh repo clone pantheon-org/opencode-docs-builder docs-builder

- name: Build docs
  working-directory: docs-builder
  run: |
    bun install
    # Copy plugin docs into builder
    cp -r ../docs/* src/content/docs/
    bun run build
```

## Structure

```
apps/docs-builder/
├── src/
│   ├── assets/          # Logo assets (overridable)
│   ├── components/      # Shared Astro components
│   ├── content/         # Content configuration
│   └── styles/          # Custom CSS
├── astro.config.mjs     # Astro configuration
├── transform-docs.js    # Markdown transformation
├── fix-links.js         # Link fixing for gh-pages
├── generate-favicon.mjs # Favicon generation
└── package.json         # Dependencies
```

## Scripts

- `transform` - Transform docs from markdown to Astro content
- `fix-links` - Fix internal links for gh-pages deployment
- `test-links` - Verify all internal links work
- `generate-favicon` - Generate favicon from ASCII art
- `dev` - Development server with hot reload
- `build` - Production build
- `preview` - Preview production build
- `verify` - Run link verification

## Customization

Plugins can override certain aspects:

1. **Logo**: Replace `src/assets/logo-*.svg`
2. **Styles**: Extend `src/styles/custom.css`
3. **Components**: Override specific components
4. **Config**: Modify `astro.config.mjs`

## Versioning

This builder is versioned independently from plugins:

```bash
# Tag a new version
git tag docs-builder@v1.0.0
git push origin docs-builder@v1.0.0
```

## Related

- [Main Monorepo](https://github.com/pantheon-org/opencode-plugins)
- [Plugin Generator](../../tools/generators/plugin/)
- [Example Plugin](../../packages/opencode-warcraft-notifications-plugin/)
