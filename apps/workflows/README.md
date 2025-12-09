# Workflows App

GitHub Actions workflow scripts with full NX integration and quality checks.

## Overview

This NX application houses all GitHub Actions workflow scripts, subjecting them to the same quality standards as other
apps and packages in the monorepo:

- ✅ Linting with ESLint
- ✅ Formatting validation with Prettier
- ✅ Type checking with TypeScript strict mode
- ✅ Unit testing with **Bun test** (native test runner)
- ✅ Build validation with esbuild

**Tech Stack:**

- **Runtime**: Bun (not Node.js)
- **Build**: esbuild via @nx/esbuild
- **Tests**: Bun's native test runner
- **Language**: TypeScript with strict mode

## Structure

```
apps/workflows/
├── src/
│   ├── scripts/
│   │   └── check-repo-settings/  # Repository settings checker
│   │       ├── index.ts           # CLI entry point
│   │       ├── checks.ts          # Pure business logic
│   │       ├── github-api.ts      # GitHub API wrapper
│   │       ├── issue-manager.ts   # Issue CRUD operations
│   │       ├── types.ts           # Type definitions
│   │       └── *.test.ts          # Unit tests
│   └── utils/
│       ├── retry.ts               # Retry logic with backoff
│       ├── github-summary.ts      # GitHub Actions summary utilities
│       └── *.test.ts              # Unit tests
└── project.json                   # NX targets configuration
```

## Development

### Running Scripts Locally

```bash
# Run directly with TypeScript
bun run apps/workflows/src/scripts/check-repo-settings/index.ts

# Or build and run compiled version
bunx nx build workflows
node dist/apps/workflows/scripts/check-repo-settings/index.js
```

### Running Tests

Tests use **Bun's native test runner** (not Jest):

```bash
# Run all tests
bunx nx test workflows

# Or directly with Bun
cd apps/workflows
bun test

# Watch mode
bun test --watch

# Specific file
bun test src/scripts/check-repo-settings/checks.test.ts
```

### Linting and Type Checking

```bash
# Lint
bunx nx lint workflows

# Type check
bunx nx type-check workflows
```

### Building

```bash
# Build for production
bunx nx build workflows

# Output: dist/apps/workflows/
```

## Adding New Workflow Scripts

1. **Create script directory** under `src/scripts/your-script/`
2. **Separate concerns**:
   - `index.ts` - CLI entry point
   - `*.ts` - Business logic modules (pure functions)
   - `types.ts` - Type definitions
3. **Write tests** alongside implementation (`.test.ts`)
4. **Extract reusable code** to `src/utils/`
5. **Update GitHub workflow** to build and run script

### Example Script Structure

```typescript
// src/scripts/your-script/index.ts
#!/usr/bin/env node
import { runYourScript } from './your-script';

runYourScript().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

## Scripts

### check-repo-settings

Validates repository settings to ensure compliance with organizational standards:

- Default branch is 'main'
- Branch protection is enabled
- Automatic branch deletion is enabled

**Usage in GitHub Actions**:

```yaml
- name: Build workflows app
  run: bunx nx build workflows

- name: Run repository settings check
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    REPO_OWNER: ${{ github.repository_owner }}
    REPO_NAME: ${{ github.event.repository.name }}
  run: node dist/apps/workflows/scripts/check-repo-settings/index.js
```

**Local Testing**:

```bash
export GITHUB_TOKEN=your_token
export REPO_OWNER=pantheon-org
export REPO_NAME=opencode-plugins

bun run apps/workflows/src/scripts/check-repo-settings/index.ts
```

## Architecture Decisions

### Why NX App?

- **Quality Checks**: Automated linting, formatting, type-checking
- **Testing**: Unit tests with coverage requirements
- **Build Validation**: Catch errors before deployment
- **NX Integration**: Affected commands, caching, parallel execution
- **Consistency**: Same standards as other workspace projects

### Why Refactor from .github/scripts/?

- **No Quality Checks**: Original scripts had no automated validation
- **No Testing**: Business logic couldn't be unit tested
- **Technical Debt**: Scripts accumulated inconsistencies
- **Poor DX**: No IDE integration, hard to refactor

### Module Organization

- **Pure Functions**: Easy to test, no side effects
- **Separation of Concerns**: CLI, logic, API layers
- **Reusable Utilities**: Shared code in `utils/`
- **Type Safety**: Explicit types, strict mode

## Best Practices

### 1. Write Pure Functions

```typescript
// ✅ Good: Pure function, easy to test
export function checkDefaultBranch(branch: string): CheckResult {
  return {
    passed: branch === 'main',
    current: branch,
    expected: 'main',
  };
}

// ❌ Bad: Side effects, hard to test
export function checkDefaultBranch(octokit: Octokit) {
  const repo = octokit.repos.get();
  if (repo.default_branch !== 'main') {
    console.log('Failed');
  }
}
```

### 2. Separate API Calls

```typescript
// ✅ Good: API wrapper, mockable
export async function fetchRepoData(octokit: Octokit, owner: string, repo: string) {
  const response = await octokit.repos.get({ owner, repo });
  return response.data;
}

// Then use in pure functions
const repoData = await fetchRepoData(octokit, owner, repo);
const result = checkDefaultBranch(repoData.default_branch);
```

### 3. Write Comprehensive Tests

Use Bun's test API (compatible with Jest syntax):

```typescript
// checks.test.ts
import { describe, it, expect } from 'bun:test';

describe('checkDefaultBranch', () => {
  it('should pass when default branch is main', () => {
    const result = checkDefaultBranch('main');
    expect(result.passed).toBe(true);
  });

  it('should fail when default branch is not main', () => {
    const result = checkDefaultBranch('master');
    expect(result.passed).toBe(false);
  });
});
```

### 4. Use TypeScript Strictly

```typescript
// ✅ Good: Explicit types
export interface CheckResult {
  name: string;
  passed: boolean;
  current: string;
  expected: string;
}

// ❌ Bad: Using any
function check(data: any): any {
  // ...
}
```

## Troubleshooting

### Build Fails

```bash
# Clean and rebuild
bunx nx reset
bunx nx build workflows
```

### Tests Fail

```bash
# Run with verbose output
bunx nx test workflows --verbose

# Debug specific test
bunx nx test workflows --testNamePattern="checkDefaultBranch"
```

### Type Errors

```bash
# Check types
bunx nx type-check workflows
```

## Related Documentation

- [Workflows App Architecture](.context/features/workflows-app-architecture.md)
- [Bun and TypeScript Development](../.opencode/knowledge-base/bun-typescript-development.md)
- [NX Documentation](https://nx.dev)
