# Development Guide

This guide covers how to develop and contribute to the Augmented plugin.

## Setup

\`\`\`bash

# Clone the repository

git clone https://github.com/pantheon-org/opencode-agent-loader-plugin.git cd opencode-agent-loader-plugin

# Install dependencies

bun install

# Run tests

bun test

# Build the plugin

bun run build \`\`\`

## Project Structure

\`\`\` opencode-agent-loader-plugin/ ├── src/ # Plugin source code ├── docs/ # Documentation source ├── pages/ #
Documentation site builder └── dist/ # Build output \`\`\`

## Testing

\`\`\`bash

# Run all tests

bun test

# Run tests in watch mode

bun test --watch

# Run tests with coverage

bun test --coverage \`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## Release Process

This plugin uses **Release Please** for automated releases based on
[Conventional Commits](https://www.conventionalcommits.org/).

### Automated Releases

Release Please automatically:

- Creates/updates release PRs when conventional commits are pushed to `main`
- Bumps version numbers based on commit types
- Generates CHANGELOG.md from commit messages
- Publishes to npm when release PR is merged
- Deploys documentation to GitHub Pages

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

\`\`\`bash

# New features (bumps minor version)

feat: add new notification sound

# Bug fixes (bumps patch version)

fix: resolve connection timeout issue

# Breaking changes (bumps major version)

feat!: redesign plugin API

# or

feat: redesign plugin API

BREAKING CHANGE: The plugin now requires initialization before use

# Documentation

docs: update installation instructions

# Other types (no version bump)

chore: update dependencies style: fix code formatting refactor: simplify notification logic test: add unit tests for
parser ci: update GitHub Actions workflow \`\`\`

## Release Workflow

1. **Make changes** using conventional commits: \`\`\`bash git add . git commit -m "feat: add support for custom themes"
   git push origin feature-branch \`\`\`

2. **Create PR** and merge to `main`:
   - Release Please detects conventional commits
   - Creates/updates a release PR automatically
   - PR includes version bump and CHANGELOG updates

3. **Review and merge release PR**:
   - Release Please PR is created as `chore(main): release X.Y.Z`
   - Review the version bump and changelog
   - Merge the PR to trigger the release

4. **Automated release**:
   - `release-please.yml` workflow triggers
   - Runs full validation (lint, type-check, tests, build)
   - Publishes package to npm
   - Deploys documentation to GitHub Pages
   - Creates GitHub release with changelog

### Manual Release (Fallback)

If you need to manually trigger a release:

\`\`\`bash

# Create a version tag

git tag v1.0.0 git push origin v1.0.0 \`\`\`

The `2-publish.yml` workflow will handle npm publishing and docs deployment.

## GitHub Workflows

The plugin includes several automated workflows:

- **1-validate.yml**: Validates PRs (lint, test, build, security)
- **release-please.yml**: Automated release management (primary)
- **2-publish.yml**: Manual tag-based releases (fallback)
- **deploy-docs.yml**: Standalone documentation deployment
- **chores-pages.yml**: Daily GitHub Pages health check

### Version Bumping Rules

Release Please follows semantic versioning:

| Commit Type                    | Version Bump  | Example       |
| ------------------------------ | ------------- | ------------- |
| `feat:`                        | Minor (0.X.0) | 1.2.0 → 1.3.0 |
| `fix:`                         | Patch (0.0.X) | 1.2.0 → 1.2.1 |
| `feat!:` or `BREAKING CHANGE:` | Major (X.0.0) | 1.2.0 → 2.0.0 |
| `docs:`, `chore:`, etc.        | None          | No release    |

### Configuration Files

Release Please configuration:

- `.github/release-please-config.json`: Release Please settings
- `.github/.release-please-manifest.json`: Current version tracking

### Troubleshooting Releases

**Release PR not created:**

- Ensure commits follow conventional commit format
- Check `.github/release-please-config.json` for correct configuration
- Verify `release-please.yml` workflow is enabled

**npm publish failed:**

- Verify `NPM_TOKEN` secret is configured in repository settings
- Token must have "Read and write" permissions for the package
- Check package name is available on npm

**Documentation not deploying:**

- Ensure `pages/` directory has valid Astro configuration
- Check GitHub Pages is enabled in repository settings
- Verify docs build succeeds locally: `cd pages && bun run build`
