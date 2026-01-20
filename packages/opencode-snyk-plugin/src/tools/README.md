# Snyk OpenCode Tools

OpenCode tools for interacting with the Snyk API to manage security vulnerabilities and projects.

## Authentication

All tools require the `SNYK_TOKEN` environment variable to be set. You can obtain your API token from
[Snyk Account Settings](https://app.snyk.io/account).

```bash
export SNYK_TOKEN="your-snyk-api-token"
```

Optional environment variables:

- `SNYK_API_URL`: Custom Snyk API URL (default: `https://api.snyk.io`)

## Available Tools

### snyk-list-organizations

Lists all Snyk organizations accessible to the authenticated user.

**Arguments:**

- `limit` (optional): Maximum number of organizations to return

**Example:**

```typescript
const result = await snykListOrganizations({ limit: 10 });
console.log(result.organizations);
// [
//   { id: "org-123", name: "My Organization", slug: "my-org" },
//   { id: "org-456", name: "Another Org", slug: "another-org" }
// ]
```

### snyk-list-projects

Lists all projects within a specified Snyk organization.

**Arguments:**

- `organizationId` (required): The organization ID to list projects for
- `limit` (optional): Maximum number of projects to return

**Example:**

```typescript
const result = await snykListProjects({
  organizationId: 'org-123',
  limit: 50,
});
console.log(result.projects);
// [
//   {
//     id: "proj-123",
//     name: "my-app",
//     type: "npm",
//     created: "2024-01-01T00:00:00Z",
//     environment: ["production"],
//     tags: [{ key: "team", value: "backend" }]
//   }
// ]
```

### snyk-query-issues

Queries Snyk issues/vulnerabilities with advanced filtering options.

**Arguments:**

- `organizationId` (required): The organization ID to query issues for
- `projectId` (optional): Filter by specific project ID
- `severity` (optional): Filter by severity levels (e.g., `["high", "critical"]`)
- `issueType` (optional): Filter by issue types (e.g., `["vuln", "license"]`)
- `isIgnored` (optional): Filter for ignored issues
- `isPatched` (optional): Filter for patched issues
- `fromDate` (optional): Filter issues from this date (ISO format)
- `toDate` (optional): Filter issues to this date (ISO format)
- `limit` (optional): Maximum number of issues to return

**Example:**

```typescript
const result = await snykQueryIssues({
  organizationId: 'org-123',
  severity: ['high', 'critical'],
  issueType: ['vuln'],
  isIgnored: false,
  limit: 100,
});
console.log(result.summary);
// {
//   total: 15,
//   bySeverity: { critical: 5, high: 10, medium: 0, low: 0, info: 0 },
//   byType: { vuln: 15, license: 0, config: 0, code: 0 }
// }
```

## Types

### SnykOrganization

```typescript
interface SnykOrganization {
  id: string;
  name: string;
  slug: string;
}
```

### SnykProject

```typescript
interface SnykProject {
  id: string;
  name: string;
  type: string;
  created: string;
  environment: readonly string[];
  tags: ReadonlyArray<{ key: string; value: string }>;
}
```

### SnykIssue

```typescript
interface SnykIssue {
  id: string;
  title: string;
  type: IssueType; // "vuln" | "license" | "config" | "code"
  severity: SeverityLevel; // "info" | "low" | "medium" | "high" | "critical"
  url: string;
  description: string;
  introduced_date: string;
  package_name?: string;
  package_manager?: string;
  cvss_score?: number;
  is_patchable?: boolean;
  is_upgradeable?: boolean;
  identifiers?: {
    CVE?: string[];
    CWE?: string[];
  };
}
```

## Error Handling

All tools will throw errors in the following cases:

- Missing or invalid `SNYK_TOKEN` environment variable
- Invalid organization or project IDs
- Network or API errors
- Rate limiting

Example error handling:

```typescript
try {
  const result = await snykListProjects({ organizationId: 'invalid-id' });
} catch (error) {
  console.error('Error:', error.message);
  // Error: Organization not found: invalid-id
}
```

## API Version

These tools use the Snyk REST API v3 with API version `2023-06-22`. The API version can be customized by setting the
`SNYK_API_URL` environment variable to include version parameters.

## Limitations

- The `snyk-query-issues` tool currently provides the structure and filtering interface but requires additional Snyk API
  endpoints to be fully implemented for issue querying.
- Rate limits are determined by your Snyk account tier.
- Pagination is handled automatically up to the specified limit.

## References

- [Snyk API Documentation](https://apidocs.snyk.io/)
- [Snyk REST API](https://apidocs.snyk.io/?version=2023-06-22)
- [Get your Snyk API Token](https://app.snyk.io/account)
