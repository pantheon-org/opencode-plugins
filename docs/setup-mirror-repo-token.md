# Setting Up MIRROR_REPO_TOKEN

> **Last Updated**: December 2024  
> **Status**: Configuration Guide  
> **Required For**: Mirror workflows to function

## Table of Contents

- [Overview](#overview)
- [What is MIRROR_REPO_TOKEN?](#what-is-mirror_repo_token)
- [Prerequisites](#prerequisites)
- [Step-by-Step Setup](#step-by-step-setup)
- [Token Scopes and Permissions](#token-scopes-and-permissions)
- [Security Best Practices](#security-best-practices)
- [Testing the Token](#testing-the-token)
- [Troubleshooting](#troubleshooting)
- [Token Rotation](#token-rotation)
- [FAQ](#faq)

---

## Overview

The `MIRROR_REPO_TOKEN` is a GitHub Personal Access Token (PAT) that enables the mirror workflows in this monorepo to
push code and tags to the separate mirror repositories. Without this token, the mirror workflows will fail with
permission errors.

**What it enables:**

- Automated mirroring of plugin code from monorepo to standalone repositories
- Automated creation of version tags in mirror repositories
- Force-pushing updates to mirror repository `main` branches

**Workflows that use it:**

- `.github/workflows/mirror-packages.yml` - Mirrors plugins from `packages/`
- `.github/workflows/mirror-docs-builder.yml` - Mirrors docs builder from `apps/docs-builder`
- `.github/workflows/mirror-opencode-font.yml` - Mirrors font package from `apps/opencode-font`

---

## What is MIRROR_REPO_TOKEN?

### Purpose

The token is used by GitHub Actions workflows to authenticate when pushing code to mirror repositories. Specifically,
it's used in commands like:

```bash
# Convert repository URL to authenticated URL
GIT_URL=$(echo "$MIRROR_URL" | sed "s|https://|https://x-access-token:${MIRROR_REPO_TOKEN}@|")

# Push to mirror repository
git push mirror temp-branch:main --force
git push mirror temp-branch:refs/tags/${VERSION} --force
```

### Why Not Use GITHUB_TOKEN?

The default `GITHUB_TOKEN` provided by GitHub Actions has limited permissions and cannot push to other repositories.
It's scoped only to the repository where the workflow is running.

### Token Type Options

You have two choices:

1. **Classic Personal Access Token** (Recommended for simplicity)
   - Easier to set up
   - Works across all repositories in the organization
   - Requires `repo` scope

2. **Fine-grained Personal Access Token** (More secure)
   - More granular permissions
   - Can be scoped to specific repositories
   - More complex to configure

---

## Prerequisites

Before creating the token, ensure you have:

- [ ] **GitHub Account** with appropriate permissions
- [ ] **Organization Access** - Member of `pantheon-org` organization
- [ ] **Repository Access** - Admin or write access to:
  - Source monorepo: `pantheon-org/opencode-plugins`
  - Mirror repositories (existing and future)
- [ ] **Two-Factor Authentication** (2FA) enabled (required for PATs)

### Required Permissions

Your GitHub account needs:

- **Write access** to all mirror repositories
- **Admin access** to `opencode-plugins` repository (to add secrets)

If you don't have these permissions, ask an organization admin.

---

## Step-by-Step Setup

### Option 1: Classic Personal Access Token (Recommended)

#### Step 1: Navigate to GitHub Settings

1. Click your **profile picture** (top-right corner)
2. Select **Settings**
3. Scroll down to **Developer settings** (left sidebar, near bottom)
4. Click **Personal access tokens**
5. Select **Tokens (classic)**

Or use direct URL: https://github.com/settings/tokens

#### Step 2: Generate New Token

1. Click **Generate new token** button
2. Select **Generate new token (classic)**
3. You may be prompted to confirm your password or 2FA

#### Step 3: Configure Token

Fill in the following fields:

**Note**: `MIRROR_REPO_TOKEN for opencode-plugins`

- Make it descriptive so you remember what it's for

**Expiration**: Choose based on your security policy

- `90 days` (Recommended - requires rotation every 3 months)
- `No expiration` (Convenient but less secure)
- `Custom` (Set your own expiration date)

**Scopes**: Select the following:

```
✅ repo (Full control of private repositories)
   ├── ✅ repo:status
   ├── ✅ repo_deployment
   ├── ✅ public_repo
   └── ✅ security_events
```

**Important**: Only select `repo` scope. Do NOT select:

- ❌ `workflow` (not needed)
- ❌ `write:packages` (not needed)
- ❌ `delete:packages` (not needed)
- ❌ `admin:org` (not needed)
- ❌ `admin:repo_hook` (not needed)

#### Step 4: Generate and Copy Token

1. Scroll down and click **Generate token**
2. **IMPORTANT**: Copy the token immediately
   - Format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - You will NOT be able to see it again
3. Store it temporarily in a secure location (password manager)

### Option 2: Fine-grained Personal Access Token (Advanced)

#### Step 1: Navigate to Fine-grained Tokens

1. Go to **Settings** → **Developer settings** → **Personal access tokens**
2. Select **Fine-grained tokens**
3. Click **Generate new token**

#### Step 2: Configure Token

**Token name**: `MIRROR_REPO_TOKEN for opencode-plugins`

**Expiration**: Choose expiration period

**Resource owner**: Select `pantheon-org`

**Repository access**: Choose one of:

- **All repositories** (Simpler, works with future mirror repos)
- **Only select repositories** (More secure, but need to update when adding new plugins)

If selecting specific repositories, include:

- `opencode-plugins` (source monorepo)
- `opencode-warcraft-notifications-plugin`
- `opencode-docs-builder`
- `opencode-font`
- Any other current or planned mirror repositories

#### Step 3: Set Permissions

Under **Repository permissions**, configure:

| Permission      | Access Level       | Required For                               | Classic Token Equivalent |
| --------------- | ------------------ | ------------------------------------------ | ------------------------ |
| **Contents**    | **Read and write** | Push code, create/update branches and tags | `public_repo`, `repo`    |
| **Metadata**    | **Read-only**      | Access repository info (automatic)         | Always included          |
| Commit statuses | **Read and write** | Update commit status (optional)            | `repo:status`            |
| Deployments     | **Read and write** | Manage deployments (optional)              | `repo_deployment`        |

**Note**: Fine-grained tokens do NOT have direct equivalents for:

- `repo:invite` - Use **Administration** permission (read/write) if needed
- `security_events` - Use **Security events** permission (read/write) if needed

**Minimum required for mirror workflows:**

- ✅ **Contents: Read and write** (mandatory)
- ✅ **Metadata: Read-only** (automatic)

#### Step 4: Generate and Copy

1. Review your settings
2. Click **Generate token**
3. Copy the token immediately (starts with `github_pat_`)
4. Store securely

---

## Adding Token to Repository

### Step 1: Navigate to Repository Secrets

#### Using GitHub CLI (Recommended)

```bash
# Navigate to monorepo
cd /path/to/opencode-plugins

# Set the secret
gh secret set MIRROR_REPO_TOKEN

# Paste the token when prompted
# Press Enter
```

#### Using GitHub Web Interface

1. Go to `https://github.com/pantheon-org/opencode-plugins`
2. Click **Settings** tab
3. In left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Step 2: Configure Secret

**Name**: `MIRROR_REPO_TOKEN` (must be exactly this)

- Case-sensitive
- No spaces or special characters
- Must match what's in workflow files

**Secret**: Paste the token you copied

- Should start with `ghp_` (classic) or `github_pat_` (fine-grained)

**Important**: Do NOT include:

- Quote marks
- Spaces before or after
- Line breaks
- The prefix `Bearer` or `token`

### Step 3: Save

Click **Add secret** button

### Step 4: Verify

You should now see:

- Secret name: `MIRROR_REPO_TOKEN`
- Last updated: Just now
- Value: `********` (hidden)

---

## Token Scopes and Permissions

### Classic vs Fine-Grained Token Comparison

The Classic Token `repo` scope maps to these Fine-grained Token permissions:

| Classic Token Scope | Fine-Grained Token Permission    | Access Level   | Purpose                                |
| ------------------- | -------------------------------- | -------------- | -------------------------------------- |
| `repo`              | **Contents**                     | Read and write | Clone, push, pull code and tags        |
| `repo`              | **Metadata**                     | Read-only      | Access repository metadata (automatic) |
| `repo:status`       | **Commit statuses**              | Read and write | Create/update commit status checks     |
| `repo_deployment`   | **Deployments**                  | Read and write | Manage deployment statuses             |
| `public_repo`       | **Contents** (public repos only) | Read and write | Access public repositories             |
| `repo:invite`       | **Administration**               | Read and write | Manage repository invitations          |
| `security_events`   | **Security events**              | Read and write | View/manage security alerts            |

**For mirror workflows, you only need:**

- ✅ **Contents: Read and write** (push code and tags)
- ✅ **Metadata: Read-only** (automatic, always included)

**Optional for advanced use cases:**

- Commit statuses (if you want to update status checks)
- Deployments (if mirror repos trigger deployments)

### What Can This Token Do?

With the `repo` scope (Classic) or **Contents: Read and write** (Fine-grained), the token can:

✅ **Allowed Operations:**

- Clone/pull from public and private repositories
- Push commits to repositories
- Create, update, and delete branches
- Create, update, and delete tags
- Force-push to branches (overwrite history)
- Read repository metadata and settings

❌ **NOT Allowed:**

- Trigger workflows (requires `workflow` scope)
- Manage repository settings (requires `admin:repo` scope)
- Manage organization settings
- Delete repositories
- Manage team memberships
- Publish npm packages (handled by separate token in mirror repos)

### Why Force Push is Needed

The mirror workflows use `--force` flag because:

1. **Subtree extraction creates different commit history** - The extracted package has its own commit graph
2. **Mirror repos may have Release Please commits** - Mirror repos have their own CHANGELOG and version commits
3. **Clean sync required** - We want mirror repo `main` to exactly match the monorepo package state

### Security Implications

**Risk**: The token has write access to repositories **Mitigation**:

- Token is stored as an encrypted GitHub secret
- Only accessible to GitHub Actions workflows
- Workflows only run on trusted events (tag pushes)
- All actions are logged in GitHub audit log

---

## Testing the Token

### Test 1: Check Secret Exists

```bash
gh secret list

# Expected output should include:
# MIRROR_REPO_TOKEN  Updated YYYY-MM-DD
```

### Test 2: Trigger a Mirror Workflow

Create a test tag to verify the workflow works:

```bash
# Create a test mirror repository first (if not exists)
gh repo create pantheon-org/opencode-test-plugin --public

# Add repository URL to a test plugin's package.json
# Then create and push a tag

git tag opencode-test-plugin@v0.1.0
git push origin opencode-test-plugin@v0.1.0
```

### Test 3: Monitor Workflow

```bash
# Watch the workflow execution
gh run list --limit 1
gh run watch

# Or view in browser
open https://github.com/pantheon-org/opencode-plugins/actions
```

**Expected Results:**

- ✅ `detect-package` job succeeds
- ✅ `mirror-to-repo` job succeeds
- ✅ Code appears in mirror repository
- ✅ Tag is created in mirror repository

### Test 4: Verify Mirror Repository

```bash
# Check mirror repo was updated
gh repo view pantheon-org/opencode-test-plugin

# Check tag exists
gh release list --repo pantheon-org/opencode-test-plugin
```

---

## Security Best Practices

### 1. Token Expiration

**Recommendation**: Set expiration to 90 days

**Why**: Limits damage if token is compromised

**Maintenance**: Set calendar reminder to rotate token before expiration

### 2. Principle of Least Privilege

**Do**: Only grant `repo` scope **Don't**: Grant additional unnecessary scopes like `admin:org`, `delete_repo`, etc.

### 3. Token Storage

**Never**:

- ❌ Commit token to git repository
- ❌ Share token in chat/email
- ❌ Store in plaintext files
- ❌ Use token in CI logs (GitHub automatically redacts, but still avoid)

**Always**:

- ✅ Use GitHub Secrets for storage
- ✅ Store backup copy in password manager
- ✅ Delete token from clipboard after adding to secrets

### 4. Access Monitoring

**Regular audits**:

```bash
# List when secret was last updated
gh secret list

# Check recent workflow runs
gh run list --workflow=mirror-packages.yml --limit 10
```

**Review access logs**:

1. Go to Settings → Security → Audit log
2. Filter for `MIRROR_REPO_TOKEN` usage

### 5. Incident Response

**If token is compromised:**

1. **Immediate action** - Revoke token:

   ```bash
   # Via web: https://github.com/settings/tokens
   # Delete the compromised token
   ```

2. **Generate new token** - Follow setup steps again

3. **Update secret**:

   ```bash
   gh secret set MIRROR_REPO_TOKEN
   # Paste new token
   ```

4. **Review activity** - Check audit logs for unauthorized actions

5. **Notify team** - Alert organization admins

---

## Troubleshooting

### Issue: "Secret not found"

**Symptoms**: Workflow fails with empty `MIRROR_REPO_TOKEN` value

**Causes**:

- Secret name typo (must be exactly `MIRROR_REPO_TOKEN`)
- Secret not set in the correct repository
- Secret visibility not set correctly

**Solution**:

```bash
# Verify secret exists
gh secret list

# If not found, set it
gh secret set MIRROR_REPO_TOKEN
```

### Issue: "Permission denied" when pushing

**Symptoms**:

```
remote: Permission to pantheon-org/opencode-plugin.git denied
fatal: unable to access: The requested URL returned error: 403
```

**Causes**:

- Token doesn't have `repo` scope
- Token expired
- Token revoked
- Mirror repository doesn't exist
- Token owner doesn't have write access to mirror repo

**Solution**:

1. **Verify token scopes**:
   - Go to https://github.com/settings/tokens
   - Find your token
   - Verify `repo` scope is checked

2. **Check expiration**:
   - Check if token expired
   - If yes, create new token

3. **Verify repository access**:

   ```bash
   # Check if repository exists
   gh repo view pantheon-org/opencode-plugin

   # If not, create it
   gh repo create pantheon-org/opencode-plugin --public
   ```

4. **Verify permissions**:
   - Ensure token owner has write access to target repository
   - Check organization membership and permissions

### Issue: "Repository not found"

**Symptoms**:

```
fatal: repository 'https://github.com/pantheon-org/opencode-plugin/' not found
```

**Cause**: Mirror repository doesn't exist yet

**Solution**:

```bash
# Create the mirror repository
gh repo create pantheon-org/opencode-plugin \
  --public \
  --description "OpenCode plugin (mirrored from opencode-plugins monorepo)"
```

### Issue: "Token has expired"

**Symptoms**: Workflow suddenly fails after working previously

**Cause**: Token reached expiration date

**Solution**:

1. Generate new token (follow setup steps)
2. Update secret:
   ```bash
   gh secret set MIRROR_REPO_TOKEN
   # Paste new token
   ```

### Issue: "Rate limit exceeded"

**Symptoms**:

```
API rate limit exceeded for user
```

**Cause**: Too many API calls (unlikely with this workflow)

**Solution**: Wait for rate limit to reset (1 hour) or use token with higher rate limit

---

## Token Rotation

### When to Rotate

Rotate the token when:

- ✅ Token is approaching expiration
- ✅ Suspected compromise or security incident
- ✅ Team member with token access leaves organization
- ✅ Regular security policy (e.g., every 90 days)
- ✅ Permissions need to change (e.g., new repositories added)

### Rotation Process

#### Step 1: Generate New Token

Follow the [Step-by-Step Setup](#step-by-step-setup) to create a new token with same permissions.

**Tip**: Keep old token active until new one is verified working.

#### Step 2: Update Secret

```bash
# Update the secret with new token
gh secret set MIRROR_REPO_TOKEN
# Paste new token
```

#### Step 3: Test New Token

```bash
# Trigger a test workflow
git tag opencode-test-plugin@v0.1.1
git push origin opencode-test-plugin@v0.1.1

# Watch workflow
gh run watch
```

#### Step 4: Verify Success

- ✅ Workflow completes successfully
- ✅ Mirror repository updated
- ✅ No permission errors in logs

#### Step 5: Revoke Old Token

1. Go to https://github.com/settings/tokens
2. Find old token
3. Click **Delete** or **Revoke**
4. Confirm deletion

#### Step 6: Document Rotation

Update internal documentation:

```markdown
Token rotated on: YYYY-MM-DD Next rotation due: YYYY-MM-DD (90 days) Rotated by: @username
```

---

## FAQ

### Q: Can we use a GitHub App instead of PAT?

**A:** Yes, GitHub Apps are more secure and recommended for production. However, setup is more complex:

**Pros:**

- Fine-grained permissions
- Can be installed at organization level
- Better audit trails
- Token rotation handled automatically

**Cons:**

- More complex setup
- Requires organization admin privileges to install
- Need to configure app manifest and permissions

**To use GitHub App:**

1. Create GitHub App in organization settings
2. Grant repository permissions (Contents: Read and write)
3. Install app on repositories
4. Generate app installation token in workflow
5. Use token for git operations

If interested, see:
[GitHub Apps authentication](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/about-authentication-with-a-github-app)

### Q: Can multiple people create tokens?

**A:** Yes, but only ONE token should be added as the `MIRROR_REPO_TOKEN` secret.

**Recommendation**: Create token from a dedicated "bot" account or service account if possible, rather than personal
account.

**Why**: If token is tied to personal account and that person leaves, workflows will break.

### Q: What happens if token expires while workflows are running?

**A:**

- In-flight workflows may complete successfully
- New workflow runs will fail
- No data is lost - just need to update token and re-run

### Q: Does the token owner need to be an organization admin?

**A:** No, but they need:

- Write access to all mirror repositories
- Organization membership

**For fine-grained tokens**: Token owner must explicitly grant access to each repository.

### Q: Can we scope token to only specific repositories?

**A:**

- **Classic tokens**: No, `repo` scope applies to all accessible repositories
- **Fine-grained tokens**: Yes, can select specific repositories

**Recommendation**: Use fine-grained tokens if you want repository-level scoping.

### Q: How do we handle multiple monorepos?

**A:** Each monorepo should have its own `MIRROR_REPO_TOKEN` secret:

- Tokens can be the same or different
- Recommendation: Use different tokens per monorepo for better security
- If using same token, one compromise affects all monorepos

### Q: What if we need to change token permissions?

**A:**

1. Create new token with updated permissions
2. Update `MIRROR_REPO_TOKEN` secret
3. Test workflows
4. Revoke old token

**Note**: Cannot edit existing token permissions; must create new token.

---

## Related Documentation

- [Release Process](./release-process.md) - How mirroring integrates with releases
- [Repository README](../README.md) - Overview of monorepo structure
- [Mirror Packages Workflow](../.github/workflows/mirror-packages.yml) - Workflow implementation
- [GitHub PAT Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)

---

## Maintenance Checklist

Use this checklist when managing the token:

### Initial Setup

- [ ] Token created with correct scopes
- [ ] Token added as `MIRROR_REPO_TOKEN` secret
- [ ] Test workflow executed successfully
- [ ] Token expiration date documented
- [ ] Calendar reminder set for rotation
- [ ] Team notified of setup completion

### Regular Rotation (Every 90 Days)

- [ ] New token generated
- [ ] Secret updated
- [ ] Test workflow executed
- [ ] Old token revoked
- [ ] Rotation documented
- [ ] Next rotation reminder set

### Incident Response

- [ ] Compromised token revoked immediately
- [ ] New token generated
- [ ] Secret updated
- [ ] Audit logs reviewed
- [ ] Team notified
- [ ] Incident documented
- [ ] Security measures reviewed

---

## Support

If you encounter issues not covered in this guide:

1. **Check workflow logs**:

   ```bash
   gh run view --log-failed
   ```

2. **Review GitHub Actions documentation**: https://docs.github.com/en/actions

3. **Contact organization admins**: For permission issues

4. **Open an issue**: In the `opencode-plugins` repository

---

**Last Reviewed**: December 2024
