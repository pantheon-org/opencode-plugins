---
name: gitlab-integration
description: Interact with GitLab to manage repositories, merge requests, and TODO items
license: MIT
compatibility: opencode
metadata:
  audience: developers, devops, team-leads
  workflow: gitlab-integration
---

## What I do

I help you interact with GitLab by managing repositories, merge requests, and TODO items through the GitLab API.

## When to use me

Use this skill when the user asks to:

- List GitLab repositories (projects)
- Find and filter merge requests
- View and manage TODO items
- Check merge request status
- Mark TODOs as done
- Get repository information

## Workflow Overview

### Repository Discovery

1. **List repositories**: Use `gitlab-list-repos` to discover available repositories
   - Filter by ownership (`owned: true`)
   - Filter by membership (`membership: true`)
   - Search by name or description
2. **Review results**: Get repository metadata including name, path, visibility, and activity

### Merge Request Management

When the user needs to work with merge requests:

1. Use `gitlab-list-merge-requests` with appropriate filters:
   - `projectId`: Filter to specific project (optional, omit for all accessible MRs)
   - `state`: Filter by state (opened, closed, merged, locked, all)
   - `author`: Filter by author username
   - `assignee`: Filter by assignee username
   - `targetBranch`: Filter by target branch
   - `sourceBranch`: Filter by source branch
   - `labels`: Comma-separated labels filter
2. Present results with key information: title, state, author, branches, dates

### TODO Management

When the user needs to manage their TODO list:

1. **List TODOs**: Use `gitlab-list-todos` to get all TODO items
   - Filter by `state`: pending or done
   - Filter by `action`: assigned, mentioned, build_failed, marked, approval_required, unmergeable, directly_addressed
   - Filter by `targetType`: Issue, MergeRequest, Commit, Pipeline
   - Filter by `projectId` or `authorId`
2. **Get specific TODO**: Use `gitlab-get-todo` with TODO ID for detailed information
3. **Mark as done**: Use `gitlab-mark-todo-done` with TODO ID to complete a specific item
4. **Complete all**: Use `gitlab-mark-all-todos-done` to mark all pending TODOs as complete

## Tool Selection Guide

- **Discover repositories**: `gitlab-list-repos` with search/filters
- **Find merge requests**: `gitlab-list-merge-requests` with state/author/project filters
- **View all TODOs**: `gitlab-list-todos` with optional state/action filters
- **Get TODO details**: `gitlab-get-todo` when you need full information about a specific TODO
- **Complete a TODO**: `gitlab-mark-todo-done` for a specific TODO ID
- **Batch complete TODOs**: `gitlab-mark-all-todos-done` to clear all pending items

## Conversation Patterns

### User: "Show me my GitLab repositories"

→ Use `gitlab-list-repos` with `owned: true` → Present repositories with key details

### User: "What merge requests are assigned to me?"

→ Use `gitlab-list-merge-requests` with `assignee: <username>` and `state: opened` → Summarize open MRs

### User: "Show my pending TODOs"

→ Use `gitlab-list-todos` with `state: pending` → List TODOs grouped by action type

### User: "What open MRs are in project X?"

→ Use `gitlab-list-merge-requests` with `projectId: X` and `state: opened` → Present MRs with details

### User: "Mark TODO 123 as done"

→ Use `gitlab-mark-todo-done` with `todoId: 123` → Confirm completion

### User: "Clear all my TODOs"

→ Use `gitlab-mark-all-todos-done` → Confirm all pending TODOs marked as done

### User: "Find all MRs waiting for approval"

→ Use `gitlab-list-todos` with `action: approval_required` and `targetType: MergeRequest` → List MRs needing approval

## Best Practices

1. **Start broad, then filter**: Begin with wider queries and narrow based on results
2. **Use projectId wisely**: Omit `projectId` from `gitlab-list-merge-requests` to see all accessible MRs
3. **Check TODO actions**: Different action types require different responses (approval vs. mention)
4. **Provide context**: When listing MRs or TODOs, include relevant metadata (dates, authors, states)
5. **Handle empty results**: Communicate clearly when no results match the filters
6. **Use pagination**: For large result sets, use `page` and `perPage` parameters
7. **Respect rate limits**: Be mindful of API rate limits when making multiple calls

## Tool Quick Reference

| Tool                         | Purpose                    | Required Args | Common Filters                                            |
| ---------------------------- | -------------------------- | ------------- | --------------------------------------------------------- |
| `gitlab-list-repos`          | List repositories          | None          | owned, membership, search, perPage, page                  |
| `gitlab-list-merge-requests` | List merge requests        | None          | projectId, state, author, assignee, labels, perPage, page |
| `gitlab-list-todos`          | List TODO items            | None          | state, action, targetType, projectId, authorId, perPage   |
| `gitlab-get-todo`            | Get specific TODO          | todoId        | None                                                      |
| `gitlab-mark-todo-done`      | Mark TODO as complete      | todoId        | None                                                      |
| `gitlab-mark-all-todos-done` | Complete all pending TODOs | None          | None                                                      |

## Key Filters

**Repository filters** (use with `gitlab-list-repos`):

- `owned`: Only repositories owned by authenticated user
- `membership`: Only repositories where user is a member
- `search`: Search by name or description

**Merge request states** (use with `gitlab-list-merge-requests`):

- `opened` - Active merge requests
- `closed` - Closed without merging
- `merged` - Successfully merged
- `locked` - Locked from changes
- `all` - All states (default)

**TODO states** (use with `gitlab-list-todos`):

- `pending` - Items requiring action
- `done` - Completed items

**TODO actions** (use with `gitlab-list-todos`):

- `assigned` - Assigned to you
- `mentioned` - You were mentioned
- `build_failed` - Build failure notification
- `marked` - Explicitly marked as TODO
- `approval_required` - Approval needed
- `unmergeable` - Merge conflict notification
- `directly_addressed` - Directly addressed with @username

**TODO target types** (use with `gitlab-list-todos`):

- `Issue` - Related to an issue
- `MergeRequest` - Related to a merge request
- `Commit` - Related to a commit
- `Pipeline` - Related to a pipeline

## Authentication

All tools require GitLab authentication via one of:

1. **Environment variable**: `GITLAB_TOKEN` (recommended)
2. **Tool parameter**: Pass `token` directly to each tool

To get a GitLab token:

1. Go to GitLab → User Settings → Access Tokens
2. Create a token with appropriate scopes: `api`, `read_api`, `read_repository`
3. Set the environment variable: `export GITLAB_TOKEN="your-token"`

Optionally set custom API URL:

- **Environment variable**: `GITLAB_API_URL` (defaults to `https://gitlab.com/api/v4`)
- **Tool parameter**: Pass `baseUrl` to each tool

## Common Error Handling

- **401 Unauthorized**: Token missing or invalid - guide user to create token
- **403 Forbidden**: Insufficient permissions - check token scopes
- **404 Not Found**: Invalid project ID or TODO ID - verify IDs
- **Empty results**: No items match filters - suggest broadening search criteria
- **Rate limiting**: Too many requests - suggest waiting or batching operations

## When to Combine Tools

- **Repository exploration**: `gitlab-list-repos` → `gitlab-list-merge-requests` (with projectId)
- **TODO triage**: `gitlab-list-todos` → `gitlab-get-todo` → `gitlab-mark-todo-done`
- **MR review workflow**: `gitlab-list-todos` (action: approval_required) → `gitlab-list-merge-requests`
- **Bulk cleanup**: `gitlab-list-todos` → `gitlab-mark-all-todos-done`

## Response Handling

All tools return structured responses with:

- **Success indicator**: `success: true/false`
- **Data**: Relevant results (repositories, MRs, TODOs)
- **Metadata**: Duration, pagination info
- **Error details**: Code and context when failed

Present results in user-friendly format:

- Group by relevant categories (state, action, project)
- Highlight key information (title, author, dates)
- Provide actionable next steps
- Include relevant URLs for direct access

## Pagination

For large result sets, use pagination parameters:

- `page`: Page number (default: 1)
- `perPage`: Results per page (default: 20, max: 100)

Example: Get next page of merge requests:

```
gitlab-list-merge-requests { projectId: "123", state: "opened", page: 2, perPage: 50 }
```

## Important Notes

- Always handle authentication errors gracefully with clear instructions
- Provide context when filtering (explain what filters are applied)
- Format dates in user-friendly way (ISO format from API)
- Include links to GitLab web UI for detailed views
- Respect user's GitLab instance (custom baseUrl)
- Consider API rate limits when performing batch operations
- Summarize results rather than dumping raw data

## Project ID Discovery

When a tool requires `projectId` but the user provides a project name:

1. First use `gitlab-list-repos` with `search: "<project-name>"`
2. Extract the `id` field from the matching repository
3. Use that ID in subsequent calls to `gitlab-list-merge-requests`

Example workflow:

- User: "Show me open MRs in my-awesome-project"
- Agent: Search repos → Find project ID → List MRs with that project ID

## Username Discovery

When filtering by username (author/assignee) but only user's display name is known:

1. The tools expect GitLab username (not display name)
2. If uncertain, list without username filter first
3. Extract username from results
4. Refine query with correct username

## Multi-Project Workflows

When working across multiple projects:

1. List all accessible repositories first
2. Filter by criteria (search, ownership, membership)
3. Iterate through relevant projects for detailed operations
4. Aggregate results and present summary

Example: "Show all my pending MRs across all projects"

- Use `gitlab-list-merge-requests` without `projectId`
- Filter by `assignee` and `state: opened`
- Group results by project
