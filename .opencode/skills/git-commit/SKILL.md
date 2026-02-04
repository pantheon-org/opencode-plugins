---
name: git-commit
description: Safely commit changes with automatic syncing, rebasing, and git hook enforcement
version: 1.0.0
author: GitHub Copilot
tags: [git, version-control, commit, rebase, hooks]
---

# Git Commit Skill

This skill ensures safe git commits by:

1. Fetching the latest changes from remote
2. Rebasing from the appropriate branch (same-name remote branch or main)
3. Running all git hooks without bypassing them

## Prerequisites

- Git repository initialized
- Remote origin configured
- Git hooks configured (if any)

## Usage

This skill should be invoked before committing changes to ensure your branch is up-to-date and properly rebased.

## Steps

### 1. Fetch Latest Changes

Fetch all remote branches to ensure we have the latest information:

```bash
git fetch origin
```

### 2. Determine Current and Target Branch

Get the current branch name:

```bash
CURRENT_BRANCH=$(git branch --show-current)
```

Check if a remote branch with the same name exists:

```bash
git ls-remote --heads origin "$CURRENT_BRANCH" | grep -q "$CURRENT_BRANCH"
REMOTE_BRANCH_EXISTS=$?
```

### 3. Rebase from Appropriate Branch

If the same-name remote branch exists, rebase from it. Otherwise, rebase from origin/main:

```bash
if [ $REMOTE_BRANCH_EXISTS -eq 0 ]; then
  echo "Rebasing from origin/$CURRENT_BRANCH"
  git rebase "origin/$CURRENT_BRANCH"
else
  echo "Rebasing from origin/main"
  git rebase origin/main
fi
```

### 4. Commit with Hooks Enabled

Stage your changes and commit. Git hooks will run automatically:

```bash
git add .
git commit
```

**NEVER** use `--no-verify` or `-n` flags, as this bypasses git hooks.

## Error Handling

- **Rebase Conflicts**: If conflicts occur during rebase, resolve them manually:

  ```bash
  # Fix conflicts in files
  git add <resolved-files>
  git rebase --continue
  ```

- **Failed Hooks**: If pre-commit or commit-msg hooks fail, fix the issues they report and try again. Do not bypass
  hooks.

## Example Workflow

```bash
# 1. Fetch latest
git fetch origin

# 2. Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# 3. Check for remote branch
if git ls-remote --heads origin "$CURRENT_BRANCH" | grep -q "$CURRENT_BRANCH"; then
  git rebase "origin/$CURRENT_BRANCH"
else
  git rebase origin/main
fi

# 4. Commit (hooks will run)
git add .
git commit -m "Your commit message"
```

## Notes

- Always resolve rebase conflicts before proceeding
- Git hooks are mandatory and must pass
- If you need to amend a commit, use `git commit --amend` (hooks still run)
- Push with `git push origin $CURRENT_BRANCH` after successful commit

## Safety Guarantees

✅ Always fetches latest remote changes  
✅ Rebases from appropriate branch  
✅ Never bypasses git hooks  
✅ Prevents diverged branch issues  
✅ Enforces pre-commit validations
