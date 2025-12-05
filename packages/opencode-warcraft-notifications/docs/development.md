# Development Guide

This guide covers how to develop and contribute to the WarcraftNotifications plugin.

## Setup

\`\`\`bash

# Clone the repository

git clone https://github.com/pantheon-org/opencode-warcraft-notifications.git cd
opencode-warcraft-notifications

# Install dependencies

bun install

# Run tests

bun test

# Build the plugin

bun run build \`\`\`

## Project Structure

\`\`\` opencode-warcraft-notifications/ ├── src/ # Plugin source code ├── docs/ # Documentation
source ├── pages/ # Documentation site builder └── dist/ # Build output \`\`\`

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

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create a git tag
4. Push to GitHub
5. GitHub Actions will handle the rest
