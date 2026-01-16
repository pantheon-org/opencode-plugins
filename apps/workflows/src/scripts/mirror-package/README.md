# Mirror Package Scripts

TypeScript utilities for the `mirror-packages.yml` GitHub Actions workflow.

## Overview

These scripts replace bash inline scripts with maintainable, testable TypeScript code for the mirror package workflow.

## Scripts

### `parse-tag.ts`

Parses a git tag to extract package information.

**Format**: `<package-name>@v<version>`  
**Example**: `opencode-my-plugin@v1.0.0`

**Usage:**

```bash
bun run parse-tag.ts <tag>
# or via environment variable
GITHUB_REF=refs/tags/opencode-my-plugin@v1.0.0 bun run parse-tag.ts
```

**Outputs:**

- `package`: Package name (e.g., `opencode-my-plugin`)
- `dir`: Package directory (e.g., `packages/opencode-my-plugin`)
- `version`: Version tag (e.g., `v1.0.0`)

### `validate-mirror-url.ts`

Extracts and validates the mirror repository URL from package.json.

**Usage:**

```bash
bun run validate-mirror-url.ts <path-to-package.json>
```

**Outputs:**

- `url`: Clean GitHub repository URL (e.g., `https://github.com/org/repo`)
- `owner`: Repository owner
- `repo`: Repository name

**Validation:**

- Checks if package.json exists
- Verifies repository field is present
- Converts git URLs to HTTPS format
- Extracts owner and repo from GitHub URL

### `detect-changes.ts`

Detects changes in a package directory since the last version tag.

**Usage:**

```bash
bun run detect-changes.ts <package-name> <package-dir>
```

**Outputs:**

- `has-changes`: `true` or `false`

**Logic:**

- Finds previous version tag for the package
- Compares current HEAD with previous tag
- Lists changed files (up to 20)
- Returns `true` for first release (no previous tag)

### `enable-github-pages.ts`

Enables or updates GitHub Pages configuration via the GitHub API using Octokit.

**Usage:**

```bash
bun run enable-github-pages.ts <owner> <repo> [token]
# or via environment variable
MIRROR_REPO_TOKEN=ghp_xxx bun run enable-github-pages.ts <owner> <repo>
```

**Configuration:**

- `build_type`: `workflow` (GitHub Actions deployment)
- `source.branch`: `main`
- `source.path`: `/`

**Implementation:**

- Uses `@octokit/rest` for type-safe GitHub API calls
- Leverages `withRetry` utility for resilient API calls
- Creates Pages site with `octokit.rest.repos.createPagesSite()`
- Updates configuration with `octokit.rest.repos.updateInformationAboutPagesSite()`

**Behavior:**

- Creates Pages site if it doesn't exist (201)
- Updates configuration if it already exists (409 → 204)
- Non-blocking: warns on failure but exits with code 0

### `disable-repo-features.ts`

Disables repository features (Issues, Projects, Wiki, Downloads) via the GitHub API.

**Usage:**

```bash
bun run disable-repo-features.ts <owner> <repo> [token]
# or via environment variable
MIRROR_REPO_TOKEN=ghp_xxx bun run disable-repo-features.ts <owner> <repo>
```

**Configuration:**

- `has_issues`: `false` (disables Issues)
- `has_projects`: `false` (disables Projects)
- `has_wiki`: `false` (disables Wiki)
- `has_downloads`: `false` (disables Downloads)

**Implementation:**

- Uses `@octokit/rest` for type-safe GitHub API calls
- Leverages `withRetry` utility for resilient API calls
- Updates repository settings with `octokit.rest.repos.update()`

**Behavior:**

- Disables all interactive features in one API call
- Returns list of disabled features in result
- Non-blocking: warns on failure but exits with code 0

**Why This Matters:**

Mirror repositories should only serve as distribution channels. Disabling Issues, Projects, and Wiki prevents users from
creating content in the mirror repo. All development, issue tracking, and project management happens in the monorepo.

### `set-branch-readonly.ts`

Sets branch protection to make a repository branch read-only via the GitHub API.

**Usage:**

```bash
bun run set-branch-readonly.ts <owner> <repo> [branch] [token]
# branch defaults to "main"
# or via environment variable
MIRROR_REPO_TOKEN=ghp_xxx bun run set-branch-readonly.ts <owner> <repo>
```

**Configuration:**

- `lock_branch`: `true` (makes branch read-only)
- `allow_force_pushes`: `true` (allows monorepo workflow to push)
- `required_status_checks`: `null` (disabled)
- `enforce_admins`: `false` (disabled)
- `required_pull_request_reviews`: `null` (disabled)
- `restrictions`: `null` (disabled)

**Implementation:**

- Uses `@octokit/rest` for type-safe GitHub API calls
- Leverages `withRetry` utility for resilient API calls
- Updates branch protection with `octokit.rest.repos.updateBranchProtection()`

**Behavior:**

- Sets minimal branch protection with `lock_branch: true`
- Prevents direct pushes from users (read-only)
- Allows force pushes from authorized token (monorepo workflow)
- Non-blocking: warns on failure but exits with code 0

**Why This Matters:**

Making mirror repositories read-only prevents accidental direct commits. All changes must come from the monorepo via the
mirror workflow, ensuring single source of truth.

## Types

All types are defined in `types.ts`:

- `PackageInfo`: Package name, version, directory
- `MirrorUrl`: Repository URL, owner, repo
- `ChangeDetection`: Has changes, previous tag, list of changes
- `EnablePagesResult`: Success status, message, HTTP code for GitHub Pages operations
- `BranchProtectionResult`: Success status, message, HTTP code for branch protection operations
- `DisableFeaturesResult`: Success status, message, list of disabled features, HTTP code for feature disabling
- `GitHubPagesConfig`: GitHub Pages API configuration

## Testing

Run tests with:

```bash
bun test src/scripts/mirror-package/
```

## Workflow Integration

These scripts are used by `.github/workflows/mirror-packages.yml`:

```yaml
- name: Parse tag to get package name
  id: parse
  run: bun run apps/workflows/src/scripts/mirror-package/parse-tag.ts

- name: Validate mirror repository URL
  id: validate
  run:
    bun run apps/workflows/src/scripts/mirror-package/validate-mirror-url.ts "packages/${{ steps.parse.outputs.package
    }}/package.json"

- name: Detect changes in package
  id: changes
  run:
    bun run apps/workflows/src/scripts/mirror-package/detect-changes.ts "${{ steps.parse.outputs.package }}" "${{
    steps.parse.outputs.dir }}"

- name: Enable GitHub Pages
  env:
    MIRROR_REPO_TOKEN: ${{ secrets.MIRROR_REPO_TOKEN }}
  run: |
    OWNER=$(echo "${{ needs.detect-package.outputs.mirror-url }}" | sed -n 's|https://github.com/\([^/]*\)/.*|\1|p')
    REPO=$(echo "${{ needs.detect-package.outputs.mirror-url }}" | sed -n 's|https://github.com/[^/]*/\(.*\)|\1|p')
    bun run apps/workflows/src/scripts/mirror-package/enable-github-pages.ts "$OWNER" "$REPO"

- name: Disable repository features
  env:
    MIRROR_REPO_TOKEN: ${{ secrets.MIRROR_REPO_TOKEN }}
  run: |
    OWNER=$(echo "${{ needs.detect-package.outputs.mirror-url }}" | sed -n 's|https://github.com/\([^/]*\)/.*|\1|p')
    REPO=$(echo "${{ needs.detect-package.outputs.mirror-url }}" | sed -n 's|https://github.com/[^/]*/\(.*\)|\1|p')
    bun run apps/workflows/src/scripts/mirror-package/disable-repo-features.ts "$OWNER" "$REPO"

- name: Set branch to read-only
  env:
    MIRROR_REPO_TOKEN: ${{ secrets.MIRROR_REPO_TOKEN }}
  run: |
    OWNER=$(echo "${{ needs.detect-package.outputs.mirror-url }}" | sed -n 's|https://github.com/\([^/]*\)/.*|\1|p')
    REPO=$(echo "${{ needs.detect-package.outputs.mirror-url }}" | sed -n 's|https://github.com/[^/]*/\(.*\)|\1|p')
    bun run apps/workflows/src/scripts/mirror-package/set-branch-readonly.ts "$OWNER" "$REPO" "main"
```

## Benefits

1. **Type Safety**: Full TypeScript type checking
2. **Testable**: Unit tests for all logic
3. **Maintainable**: Clear separation of concerns
4. **Reusable**: Can be used outside GitHub Actions
5. **Error Handling**: Better error messages and handling
6. **Documentation**: JSDoc comments and type definitions

## Development

Follow the project's TypeScript standards:

- Use strict mode
- One function per module principle
- Export functions for testability
- Include JSDoc comments
- Write tests for all logic

See [Bun and TypeScript Development Standards](../../../../../.opencode/knowledge-base/bun-typescript-development.md)
for details.
