# JIRA Plugin for OpenCode

OpenCode plugin that integrates with Atlassian JIRA to search issues, manage projects, and retrieve detailed information
directly from your OpenCode AI assistant.

> **Note**: This plugin is part of the `pantheon-org/opencode-plugins` monorepo. All development and contributions
> should be made in the main repository at: **https://github.com/pantheon-org/opencode-plugins**
>
> If you're viewing this as a mirror repository, it is read-only. Submit issues, PRs, and contributions to the main
> monorepo.

<!-- START doctoc -->
<!-- END doctoc -->

## Features

- **Search Issues**: Query JIRA issues using JQL filters (project, status, assignee, etc.)
- **Get Issue Details**: Retrieve comprehensive information about specific issues
- **List Projects**: Browse all accessible JIRA projects
- **Get Project Details**: View detailed project information
- **Authentication**: Secure API token-based authentication
- **Toast Notifications**: Real-time feedback on operations
- **Event Logging**: Track JIRA issue references in messages

## Installation

Add the plugin to your OpenCode configuration:

```json
{
  "plugin": ["@pantheon-org/opencode-jira-plugin"]
}
```

## Configuration

Set the following environment variables:

```bash
JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
```

Or configure via OpenCode authentication:

```bash
opencode auth add jira
```

## Usage

The plugin provides four main tools that your AI assistant can use:

### Search Issues

```
Search for JIRA issues in project "PROJ" with status "In Progress"
```

### Get Issue Details

```
Get details for JIRA issue PROJ-123
```

### List Projects

```
List all JIRA projects
```

### Get Project Details

```
Get details for JIRA project "PROJ"
```

## Building

```bash
# Build the plugin
nx build opencode-jira-plugin

# Run tests
nx test opencode-jira-plugin

# Pack for distribution
nx pack opencode-jira-plugin
```

## Documentation

For detailed documentation, see:

- [User Guide](./docs/user-guide.md)
- [API Reference](./docs/api.md)
- [Development Guide](./docs/development.md)
- [Troubleshooting](./docs/troubleshooting.md)

## License

MIT
