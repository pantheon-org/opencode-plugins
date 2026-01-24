# @pantheon-org/opencode-skills

TypeScript-based skill injection plugin for OpenCode with smart pattern matching and auto-injection capabilities.

> **Note**: This plugin is part of the `pantheon-org/opencode-plugins` monorepo. All development and contributions
> should be made in the main repository at: **https://github.com/pantheon-org/opencode-plugins**
>
> If you're viewing this as a mirror repository, it is read-only. Submit issues, PRs, and contributions to the main
> monorepo.

<!-- START doctoc -->
<!-- END doctoc -->

## Overview

This plugin provides a seamless way to inject reusable knowledge and guidance (skills) into OpenCode chat sessions.
Skills are automatically detected and injected based on user intent using smart pattern matching.

**Key Features:**

- **Type-safe skill definitions** - Skills defined in TypeScript with full type safety
- **Smart pattern matching** - Intent detection, negation handling, and keyword matching
- **Auto-injection** - Skills seamlessly injected via `chat.message` hook
- **Zero file system side effects** - No SKILL.md files, everything in TypeScript
- **Highly configurable** - Customize pattern matching behavior per your needs
- **Comprehensive testing** - Full test coverage for pattern matching logic

## Installation

```bash
bun add @pantheon-org/opencode-skills
```

## Quick Start

### 1. Define Your Skills

```typescript
import { defineSkill, createSkillsPlugin } from '@pantheon-org/opencode-skills';

// Define a skill
const mySkill = defineSkill({
  name: 'typescript-tdd',
  description: 'TypeScript development with TDD',
  keywords: ['tdd', 'test-driven', 'testing'],
  content: `
# TypeScript TDD Development

Follow these guidelines...
  `,
});

// Create skill registry
const skills = {
  'typescript-tdd': mySkill,
};

// Create plugin
export const MySkillsPlugin = createSkillsPlugin(skills);
```

### 2. Add to OpenCode Configuration

In your `opencode.json`:

```json
{
  "plugin": ["file:///path/to/your/plugin.ts"]
}
```

### 3. Use Skills Naturally

Simply mention the skill in your message:

```
User: "Let's use typescript-tdd for this component"
```

The plugin automatically detects intent and injects the skill content into the chat context.

## How It Works

### Pattern Matching

The plugin uses three strategies to detect when a skill should be injected:

#### 1. Word Boundary Matching

Exact skill name with word boundaries:

```typescript
'use typescript-tdd approach'; // ✅ Matches
'typescript-tdd-extended'; // ❌ Won't match (different skill)
```

#### 2. Intent Detection

Intent keywords that signal user wants to use the skill:

- `use`, `apply`, `follow`, `implement`, `load`, `get`, `show`, `with`

```typescript
'apply typescript-tdd principles'; // ✅ Matches
'follow the typescript-tdd guide'; // ✅ Matches
'typescript-tdd approach'; // ✅ Matches
```

#### 3. Negation Detection

Prevents injection when user explicitly avoids a skill:

- `don't`, `do not`, `avoid`, `skip`, `ignore`, `without`, `except`, `excluding`

```typescript
"don't use typescript-tdd"; // ❌ Won't inject
'implement without typescript-tdd'; // ❌ Won't inject
'avoid typescript-tdd patterns'; // ❌ Won't inject
```

### Keyword Enhancement

Add optional keywords to improve detection:

```typescript
const mySkill = defineSkill({
  name: 'typescript-tdd',
  description: 'TypeScript TDD',
  keywords: ['TDD', 'test-driven', 'bun'], // Additional matching keywords
  content: '...',
});
```

Now these also trigger injection:

```typescript
'write tests using TDD'; // ✅ Matches via keyword
'use test-driven development'; // ✅ Matches via keyword
```

## API Reference

### `createSkillsPlugin(skills, config?)`

Creates an OpenCode plugin with the provided skills.

**Parameters:**

- `skills` - Record of skill name to Skill object
- `config` (optional) - Plugin configuration options

**Returns:** Plugin function for OpenCode

**Example:**

```typescript
import { createSkillsPlugin } from '@pantheon-org/opencode-skills';

export const MyPlugin = createSkillsPlugin(
  {
    'my-skill': mySkill,
  },
  {
    debug: true,
    autoInject: true,
  },
);
```

### `defineSkill(skill)`

Creates a skill object with defaults.

**Parameters:**

- `skill.name` (required) - Unique skill identifier (kebab-case)
- `skill.description` (required) - Brief description
- `skill.content` (required) - Full skill content (markdown)
- `skill.keywords` (optional) - Additional keywords for pattern matching
- `skill.version` (optional) - Skill version (default: '1.0.0')
- `skill.category` (optional) - Skill category for organization
- `skill.dependencies` (optional) - Other skill names this depends on

**Returns:** Complete Skill object

**Example:**

```typescript
import { defineSkill } from '@pantheon-org/opencode-skills';

const skill = defineSkill({
  name: 'react-patterns',
  description: 'Modern React patterns',
  keywords: ['react', 'hooks', 'components'],
  category: 'development',
  content: `
# React Patterns

Best practices for React development...
  `,
});
```

### Configuration Options

```typescript
interface SkillsPluginConfig {
  // Enable/disable auto-injection (default: true)
  autoInject?: boolean;

  // Enable debug logging (default: false)
  debug?: boolean;

  // Pattern matching configuration
  patternMatching?: {
    // Word boundary matching (default: true)
    wordBoundary?: boolean;

    // Intent detection (default: true)
    intentDetection?: boolean;

    // Negation detection (default: true)
    negationDetection?: boolean;

    // Custom intent keywords (adds to defaults)
    customIntentKeywords?: string[];

    // Custom negation keywords (adds to defaults)
    customNegationKeywords?: string[];
  };
}
```

**Example with custom configuration:**

```typescript
export const MyPlugin = createSkillsPlugin(skills, {
  debug: true,
  autoInject: true,
  patternMatching: {
    customIntentKeywords: ['leverage', 'adopt'],
    customNegationKeywords: ['exclude'],
  },
});
```

## Example Skills

The package includes example skills for reference:

```typescript
import { exampleSkills } from '@pantheon-org/opencode-skills/examples';

// Available examples:
// - typescript-tdd: TypeScript development with TDD
// - plain-english: Writing for non-technical stakeholders
// - react-patterns: Modern React component patterns

export const MyPlugin = createSkillsPlugin(exampleSkills);
```

## Advanced Usage

### Custom Pattern Matching

Disable certain pattern matching features:

```typescript
export const MyPlugin = createSkillsPlugin(skills, {
  patternMatching: {
    wordBoundary: true,
    intentDetection: true,
    negationDetection: false, // Allow injection even with negation
  },
});
```

### Debug Mode

Enable debug logging to see when skills are injected:

```typescript
export const MyPlugin = createSkillsPlugin(skills, {
  debug: true,
});
```

Console output:

```
[opencode-skills] Plugin loaded with 3 skills
[opencode-skills] Skills: typescript-tdd, plain-english, react-patterns
[opencode-skills] Auto-injected skill "typescript-tdd" in session abc123
[opencode-skills] Matched pattern: intent-before:use
```

### Manual Skill Detection

Use the pattern matching utilities directly:

```typescript
import { hasIntentToUse, findMatchingSkills } from '@pantheon-org/opencode-skills';

// Check if content matches a skill
const result = hasIntentToUse('use typescript-tdd approach', 'typescript-tdd');
console.log(result.matches); // true
console.log(result.matchedPattern); // 'intent-before:use'
console.log(result.hasNegation); // false

// Find all matching skills
const matches = findMatchingSkills('use typescript-tdd and plain-english', [
  'typescript-tdd',
  'plain-english',
  'react-patterns',
]);
console.log(matches); // ['typescript-tdd', 'plain-english']
```

## Best Practices

### 1. Skill Naming

Use kebab-case for skill names:

```typescript
✅ 'typescript-tdd'
✅ 'plain-english'
✅ 'react-patterns'

❌ 'TypeScript_TDD'
❌ 'Plain English'
```

### 2. Skill Content

Structure skill content with clear headings and examples:

```typescript
const skill = defineSkill({
  name: 'my-skill',
  description: 'Brief one-liner',
  content: `
# Main Title

## Overview
Brief introduction

## Guidelines
1. First guideline
2. Second guideline

## Examples
\`\`\`typescript
// Code example
\`\`\`

## Best Practices
- Practice 1
- Practice 2
  `,
});
```

### 3. Keywords

Add keywords that users naturally use:

```typescript
const skill = defineSkill({
  name: 'typescript-tdd',
  description: 'TypeScript TDD',
  keywords: [
    'tdd', // Abbreviation
    'test-driven', // Alternative phrasing
    'testing', // Related concept
    'bun', // Related tool
  ],
  content: '...',
});
```

### 4. Avoid Over-Injection

Be specific with skill names to avoid unwanted matches:

```typescript
// Too generic - might match too often
❌ 'typescript'
❌ 'development'

// Specific enough to avoid false positives
✅ 'typescript-tdd'
✅ 'typescript-strict-mode'
```

## Comparison with Other Approaches

### vs File-Based Skills (SKILL.md)

| Feature             | opencode-skills      | File-Based        |
| ------------------- | -------------------- | ----------------- |
| **Type Safety**     | ✅ Full TypeScript   | ❌ No types       |
| **No File I/O**     | ✅ TypeScript only   | ❌ Read files     |
| **Version Control** | ✅ Git-friendly      | ⚠️ Separate files |
| **IDE Support**     | ✅ Full autocomplete | ❌ Limited        |
| **Testing**         | ✅ Easy to test      | ⚠️ Harder         |
| **Auto-Injection**  | ✅ Built-in          | ⚠️ Manual tool    |

### vs Custom Tool Approach

| Feature              | opencode-skills    | Custom Tool          |
| -------------------- | ------------------ | -------------------- |
| **User Experience**  | ✅ Automatic       | ❌ Manual invocation |
| **Intent Detection** | ✅ Smart matching  | ❌ Exact match       |
| **Configuration**    | ✅ Highly flexible | ⚠️ Limited           |
| **Setup Complexity** | ✅ Simple API      | ⚠️ More boilerplate  |

## Troubleshooting

### Skills Not Injecting

1. **Check skill name matches** - Ensure you're using the exact skill name
2. **Enable debug mode** - See what patterns are matching
3. **Check negation** - Make sure you're not using negation keywords
4. **Verify configuration** - Ensure `autoInject: true` (default)

```typescript
// Debug
export const MyPlugin = createSkillsPlugin(skills, { debug: true });
```

### False Positives

If skills inject too often:

1. **Use more specific names** - Avoid generic terms
2. **Disable word boundary** - Require intent keywords
3. **Add negation detection** - Already enabled by default

```typescript
export const MyPlugin = createSkillsPlugin(skills, {
  patternMatching: {
    wordBoundary: false, // Require intent keywords
  },
});
```

## Development

### Running Tests

```bash
bun test
```

### Type Checking

```bash
bun run type-check
```

### Linting

```bash
bun run lint
```

## License

MIT

## Contributing

Contributions welcome! Please read our [Contributing Guide](./docs/development.md) for details.

## Related

- [OpenCode Documentation](https://opencode.ai/docs)
- [OpenCode Plugin Development Guide](https://opencode.ai/docs/plugins)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
