---
name: jira-integration
description: Interact with Atlassian JIRA to search issues, manage projects, and retrieve detailed information
license: MIT
compatibility: opencode
metadata:
  audience: developers, project-managers, product-managers, team-leads
  workflow: issue-tracking, project-management
---

## What I do

I help you interact with Atlassian JIRA to search for issues, retrieve issue details, list projects, and get project
information using JQL (JIRA Query Language) and REST API.

## When to use me

Use this skill when the user asks to:

- Search for JIRA issues by project, status, assignee, or custom criteria
- Get details about a specific JIRA issue
- List all accessible JIRA projects
- Get information about a specific project
- Find issues assigned to someone
- Track sprint or release issues
- Check issue status or progress

## Workflow Overview

### Search for Issues

1. **Use JQL query**: Construct appropriate JQL query based on user requirements
2. **Call tool**: Use `jira_search_issues` with the JQL query
3. **Present results**: Show issue keys, summaries, statuses, and assignees
4. **Offer details**: Ask if user wants more details about specific issues

### Get Issue Details

When the user needs detailed information about a specific issue:

1. **Identify issue**: Get the issue key (e.g., PROJ-123) from user or search
2. **Fetch details**: Use `jira_get_issue` with the issue key
3. **Present comprehensive info**: Show description, comments, attachments, status history
4. **Suggest actions**: Offer related operations (view related issues, check project)

### Project Management

When working with projects:

1. **List projects**: Use `jira_list_projects` to show all accessible projects
2. **Get project details**: Use `jira_get_project` with project key for specific info
3. **Show context**: Display project lead, issue types, components

## Tool Selection Guide

- **Find issues by criteria**: `jira_search_issues` with JQL filters
- **Get full issue details**: `jira_get_issue` with issue key
- **Discover available projects**: `jira_list_projects`
- **Project information**: `jira_get_project` with project key

## JQL Query Patterns

### Common JQL Filters

```jql
# By project
project = PROJ

# By status
status = "In Progress"
status IN ("Open", "In Progress", "Reopened")

# By assignee
assignee = currentUser()
assignee = "john.doe@example.com"
assignee IS EMPTY

# By priority
priority = High
priority IN (Critical, High)

# By created/updated date
created >= -7d
updated > "2024-01-01"

# Combining filters
project = PROJ AND status = "In Progress" AND assignee = currentUser()
```

### Issue Type Filters

```jql
issuetype = Bug
issuetype IN (Bug, Task, Story)
```

### Sprint and Release Filters

```jql
sprint = "Sprint 1"
fixVersion = "Release 1.0"
```

### Text Search

```jql
summary ~ "authentication"
description ~ "security"
text ~ "login issue"
```

## Conversation Patterns

### User: "Show me all open issues in PROJECT"

→ Search issues with JQL: `project = PROJECT AND status = Open` → List results with keys and summaries

### User: "What's the status of PROJ-123?"

→ Get issue PROJ-123 → Show status, assignee, priority, last updated

### User: "Find bugs assigned to me"

→ Search with JQL: `assignee = currentUser() AND issuetype = Bug` → Present bug list

### User: "What projects do I have access to?"

→ List projects → Show project keys, names, and leads

### User: "Show high priority issues in PROJECT"

→ Search with JQL: `project = PROJECT AND priority = High` → List high-priority issues

### User: "Get details about PROJ-456"

→ Get issue PROJ-456 → Show full description, comments, attachments, history

## Best Practices

1. **Start with search**: Use JQL queries to find issues before fetching details
2. **Be specific with JQL**: Add relevant filters to reduce noise
3. **Limit results**: Default to reasonable limits (50-100 issues)
4. **Explain JQL**: If query is complex, explain what it does
5. **Show issue keys**: Always include issue keys in responses for easy reference
6. **Group results**: Organize by status, priority, or assignee for clarity
7. **Handle empty results**: Clearly communicate when no issues match the criteria
8. **Offer next steps**: Suggest related queries or actions

## Tool Quick Reference

| Tool                 | Purpose              | Required Args  | Optional Args               |
| -------------------- | -------------------- | -------------- | --------------------------- |
| `jira_search_issues` | Find issues with JQL | jql            | maxResults, startAt, fields |
| `jira_get_issue`     | Get issue details    | issueIdOrKey   | fields, expand              |
| `jira_list_projects` | List all projects    | None           | maxResults, startAt         |
| `jira_get_project`   | Get project details  | projectIdOrKey | None                        |

## Authentication

The tools require JIRA credentials configured via environment variables or OpenCode auth:

- `JIRA_URL`: Your JIRA instance URL (e.g., https://your-domain.atlassian.net)
- `JIRA_EMAIL`: Your JIRA account email
- `JIRA_API_TOKEN`: API token from https://id.atlassian.com/manage/api-tokens

Or use OpenCode auth configuration in your config file.

## Common Error Handling

- **401 Unauthorized**: Invalid credentials - verify JIRA_EMAIL and JIRA_API_TOKEN
- **403 Forbidden**: No permission for project/issue - check user access rights
- **404 Not Found**: Invalid issue key or project - verify the identifier
- **JQL Syntax Error**: Invalid query syntax - review JQL documentation
- **Rate Limiting**: Too many requests - slow down query frequency

## Response Formatting

### Issue Search Results

Present results with:

- Issue key (e.g., PROJ-123)
- Summary/title
- Status
- Assignee
- Priority
- Created/Updated dates
- Issue count and total

### Issue Details

Include:

- Key and summary
- Description
- Status and priority
- Assignee and reporter
- Created and updated timestamps
- Comments (latest few)
- Attachments
- Links to related issues

### Project Lists

Show:

- Project key
- Project name
- Project lead
- Description (if available)
- Total projects count

## Advanced JQL Patterns

### Date Ranges

```jql
created >= "2024-01-01" AND created <= "2024-12-31"
updated >= -30d
```

### Complex Filters

```jql
project = PROJ AND
status != Closed AND
(priority = High OR priority = Critical) AND
assignee = currentUser()
```

### Sorting

```jql
project = PROJ ORDER BY priority DESC, created DESC
```

### Functions

```jql
assignee = currentUser()
reporter = currentUser()
createdDate >= startOfWeek()
```

## When to Combine Tools

- **Issue discovery → Details**: Search issues then get details for specific ones
- **Project overview**: List projects then get details for each
- **Sprint planning**: Search sprint issues, group by status/assignee
- **Status reports**: Search by date range, summarize by status

## Important Notes

- Always construct valid JQL queries - invalid syntax returns errors
- Use `maxResults` to limit large result sets
- Issue keys are case-sensitive (use exact format: PROJ-123)
- Some fields require `expand` parameter (comments, changelog, attachments)
- JQL operators are case-sensitive (AND, OR, IN, NOT)
- Use quotes for multi-word values: `status = "In Progress"`
- Date formats: YYYY-MM-DD or relative (e.g., -7d, startOfWeek())

## Quick JQL Reference

| Filter      | Syntax                            | Example                            |
| ----------- | --------------------------------- | ---------------------------------- |
| Project     | `project = KEY`                   | `project = PROJ`                   |
| Status      | `status = "VALUE"`                | `status = "In Progress"`           |
| Assignee    | `assignee = email/currentUser()`  | `assignee = currentUser()`         |
| Priority    | `priority = VALUE`                | `priority = High`                  |
| Issue Type  | `issuetype = TYPE`                | `issuetype = Bug`                  |
| Created     | `created >= DATE`                 | `created >= -7d`                   |
| Text Search | `text ~ "keyword"`                | `text ~ "login"`                   |
| Multiple    | `field1 = val1 AND field2 = val2` | `project = PROJ AND status = Open` |

## Example Workflows

### Daily Standup Prep

1. Search: `assignee = currentUser() AND status != Closed AND updated >= -1d`
2. Present: Issues worked on yesterday, group by status
3. Offer: Get details on any specific issue

### Bug Triage

1. Search: `project = PROJ AND issuetype = Bug AND status = Open`
2. Present: Open bugs sorted by priority
3. Suggest: Filter by severity or component

### Sprint Review

1. Search: `project = PROJ AND sprint = "Sprint 5" AND status = Done`
2. Present: Completed issues with summaries
3. Calculate: Total story points or issue count
