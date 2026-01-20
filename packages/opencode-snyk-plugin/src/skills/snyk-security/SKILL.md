---
name: snyk-security
description: Perform security analysis using Snyk to find vulnerabilities, analyze dependencies, and generate SBOMs
license: MIT
compatibility: opencode
metadata:
  audience: developers, security-engineers, devops
  workflow: security-scanning
---

## What I do

I help you analyze project security using Snyk's tools to find vulnerabilities, analyze dependencies, and generate
Software Bill of Materials (SBOMs).

## When to use me

Use this skill when the user asks to:

- Scan for security vulnerabilities or CVEs
- Check dependencies for security issues
- Generate a Software Bill of Materials (SBOM)
- Audit project security posture
- Find critical or high-severity issues
- Create compliance documentation

## Workflow Overview

### Standard Security Scan

1. **Get organization**: Use `snyk_list_organizations` to find the org ID
2. **Find project**: Use `snyk_list_projects` with the org ID to locate the target project
3. **Query issues**: Use `snyk_query_issues` to find vulnerabilities
   - Filter by severity (critical, high) for focused results
   - Filter by issueType (vuln, license, config, code) as needed
4. **Present findings**: Summarize vulnerabilities by severity with actionable insights

### Dependency Analysis

When the user needs detailed dependency information:

1. Complete steps 1-2 from standard scan
2. Use `snyk_analyze_dependencies` to get Package URLs (PURLs) and dependency paths
3. Group results by package and severity
4. Suggest upgrade paths for vulnerable dependencies

### SBOM Generation

When the user needs compliance documentation:

1. Complete steps 1-2 from standard scan
2. Use `snyk_generate_sbom` with appropriate format:
   - Default: `cyclonedx1.6+json` (most compatible, modern)
   - Compliance: `spdx2.3+json` (for regulatory requirements)
   - Use XML formats only if required by downstream tools
3. For large projects, use `snyk_sbom_test` with async operations (start → status → results)

## Tool Selection Guide

- **Quick vulnerability check**: `snyk_query_issues` with severity filters
- **Understand dependency tree**: `snyk_analyze_dependencies` with minSeverity
- **Compliance/documentation**: `snyk_generate_sbom` (CycloneDX or SPDX)
- **Large projects**: `snyk_sbom_test` for async SBOM generation
- **Organization overview**: `snyk_query_issues` without projectId for org-wide results

## Conversation Patterns

### User: "Scan my project for vulnerabilities"

→ List orgs → List projects → Query issues (critical + high) → Summarize with counts and top issues

### User: "Which dependencies are vulnerable?"

→ List orgs → List projects → Analyze dependencies (minSeverity: high) → Group by package and severity

### User: "Generate an SBOM"

→ List orgs → List projects → Generate SBOM (cyclonedx1.6+json)

### User: "Are there any critical security issues?"

→ List orgs → List projects → Query issues (severity: critical only) → Report findings with details

### User: "Check all my projects for high-severity issues"

→ List orgs → Query issues org-wide (severity: high, omit projectId) → Summarize by project

## Best Practices

1. **Always start with discovery**: Don't assume org/project IDs exist - use the list tools first
2. **Filter early**: Start with high/critical severity to avoid overwhelming results
3. **Follow the flow**: Organizations → Projects → Analysis (this sequence is required)
4. **Be specific**: Ask clarifying questions if the user's intent is unclear
5. **Summarize findings**: Present actionable insights, not raw data dumps
6. **Handle empty results**: Project may have no issues - this is good news, communicate it clearly
7. **Use reasonable limits**: Default to 50-100 results, adjust based on context

## Tool Quick Reference

| Tool                        | Purpose              | Required Args             | Common Filters                 |
| --------------------------- | -------------------- | ------------------------- | ------------------------------ |
| `snyk_list_organizations`   | Find org IDs         | None                      | limit                          |
| `snyk_list_projects`        | Find project IDs     | organizationId            | limit                          |
| `snyk_query_issues`         | Find vulnerabilities | organizationId            | severity, issueType, projectId |
| `snyk_analyze_dependencies` | Dependency analysis  | organizationId, projectId | minSeverity                    |
| `snyk_generate_sbom`        | Create SBOM          | organizationId, projectId | format                         |
| `snyk_sbom_test`            | Async SBOM ops       | operation, organizationId | jobId                          |

## Key Filters

**Severity levels** (use with `snyk_query_issues`):

- `critical` - Must fix immediately
- `high` - Fix soon
- `medium` - Plan to fix
- `low` - Nice to fix
- `info` - Informational

**Issue types** (use with `snyk_query_issues`):

- `vuln` - Security vulnerabilities (most common)
- `license` - License compliance issues
- `config` - Configuration issues
- `code` - Code quality issues

**SBOM formats** (use with `snyk_generate_sbom`):

- `cyclonedx1.6+json` - **Recommended default**
- `spdx2.3+json` - Use for compliance requirements
- XML variants - Only if downstream tools require XML

## Authentication

The tools require the `SNYK_TOKEN` environment variable. If authentication fails, instruct the user to:

1. Get their API token from https://app.snyk.io/account
2. Set the environment variable: `export SNYK_TOKEN="your-token"`

## Common Error Handling

- **401 Unauthorized**: Token missing or invalid - direct user to get token
- **403 Forbidden**: User lacks access to org/project - verify IDs and permissions
- **404 Not Found**: Invalid org/project ID - re-run discovery tools
- **Empty results**: Project may have no issues (good!), or filters too restrictive

## When to Combine Tools

- **Comprehensive audit**: query_issues + analyze_dependencies + generate_sbom
- **Quick check**: Just query_issues with severity filters
- **Compliance report**: list_projects + generate_sbom for multiple projects
- **Upgrade planning**: analyze_dependencies with minSeverity to prioritize fixes

## Important Notes

- Always query organizations first unless IDs are already known
- Use projectId to focus on specific project, omit for org-wide view
- Start with restrictive filters (high/critical) then broaden if needed
- Present findings in user-friendly format with severity counts and top issues
- For large result sets, suggest filtering rather than returning everything
