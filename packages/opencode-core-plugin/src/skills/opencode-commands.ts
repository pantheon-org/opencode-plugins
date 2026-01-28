import { defineSkill } from '@pantheon-org/opencode-skills';
import type { Skill } from '@pantheon-org/opencode-skills';

/**
 * OpenCode Commands Skill
 *
 * Comprehensive guide for creating custom slash commands in OpenCode.
 * Covers command configuration, markdown files, prompt templates, and advanced features.
 *
 * Source: https://opencode.ai/docs/commands/
 */
export const opencodeCommandsSkill: Skill = defineSkill({
  name: 'opencode-commands',
  description: 'Complete guide for creating custom slash commands in OpenCode with templates and configuration',
  license: 'MIT',
  compatibility: 'opencode',
  metadata: {
    category: 'configuration',
  },
  keywords: [
    'command',
    'commands',
    'slash-command',
    'custom-command',
    '/command',
    'command-template',
    'command-config',
    '$ARGUMENTS',
  ],

  whatIDo: `
I provide comprehensive guidance for creating custom slash commands in OpenCode:

- Two configuration methods (JSON and Markdown files)
- Dynamic template prompts with variable substitution
- Argument handling with $ARGUMENTS and positional parameters
- Shell output injection with \`!\`command\`\` syntax
- File references with @filename syntax
- Agent and model control per command
- Built-in command overrides and customization
  `.trim(),

  whenToUseMe: `
Use this skill when you need to:

- Create custom slash commands for repetitive tasks
- Automate common workflows with predefined prompts
- Inject dynamic content (shell output, files) into prompts
- Configure command templates with arguments
- Control which agent or model executes a command
- Learn about built-in commands and how to override them
  `.trim(),

  instructions: `# OpenCode Commands Guide

## Overview

Custom commands in OpenCode let you create reusable slash commands (e.g., \`/test\`, \`/review\`) that execute predefined prompts. Commands can accept arguments, include shell output, reference files, and use specific agents or models.

**Key Concepts:**
- **Slash commands** - Type \`/command-name\` in TUI to execute
- **Template prompts** - Predefined prompts with variable substitution
- **Arguments** - Pass parameters using \`$ARGUMENTS\` or \`$1\`, \`$2\`, etc.
- **Shell output** - Inject command output with \`!\`command\`\`
- **File references** - Include files with \`@filename\`
- **Agent/model control** - Specify which agent and model to use

**Official Documentation:** https://opencode.ai/docs/commands/

---

## Creating Commands

There are **two ways** to create custom commands:

1. **JSON Configuration** - Define in \`opencode.json\`
2. **Markdown Files** - Create \`.md\` files in \`commands/\` directory

Both methods produce the same result; choose based on your preference.

---

## Method 1: JSON Configuration

Define commands in your \`opencode.json\` config file:

\`\`\`jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "command": {
    // Command name becomes the slash command
    "test": {
      // Prompt sent to LLM when command runs
      "template": "Run the full test suite with coverage report and show any failures.\\nFocus on the failing tests and suggest fixes.",
      
      // Description shown in TUI
      "description": "Run tests with coverage",
      
      // Optional: Specify agent
      "agent": "build",
      
      // Optional: Override model
      "model": "anthropic/claude-3-5-sonnet-20241022"
    }
  }
}
\`\`\`

**Usage in TUI:**

\`\`\`
/test
\`\`\`

**Configuration Options:**
- \`template\` (required) - Prompt sent to LLM
- \`description\` (optional) - Description shown in TUI
- \`agent\` (optional) - Which agent executes the command
- \`model\` (optional) - Override default model
- \`subtask\` (optional) - Force subagent invocation

---

## Method 2: Markdown Files

Create markdown files in the \`commands/\` directory. The filename becomes the command name.

**Location Options:**
- **Global**: \`~/.config/opencode/commands/\`
- **Per-Project**: \`.opencode/commands/\`

**Example: \`.opencode/commands/test.md\`**

\`\`\`markdown
---
description: Run tests with coverage
agent: build
model: anthropic/claude-3-5-sonnet-20241022
---

Run the full test suite with coverage report and show any failures.
Focus on the failing tests and suggest fixes.
\`\`\`

**File Structure:**
- **Frontmatter** (YAML) - Command configuration (description, agent, model, etc.)
- **Content** - Command template (prompt sent to LLM)

**Usage:**

\`\`\`
/test
\`\`\`

**Benefits of Markdown:**
- Easier to write multi-line prompts
- Better version control
- More maintainable for complex commands
- Can be shared across projects

---

## Prompt Templates

Command prompts support several special features for dynamic content:

### Arguments

Use \`$ARGUMENTS\` to capture all arguments or \`$1\`, \`$2\`, etc. for individual arguments.

**Example: Component Generator**

\`.opencode/commands/component.md\`

\`\`\`markdown
---
description: Create a new component
---

Create a new React component named $ARGUMENTS with TypeScript support.
Include proper typing and basic structure.
\`\`\`

**Usage:**

\`\`\`
/component Button
\`\`\`

**Result:** \`$ARGUMENTS\` is replaced with \`Button\`

**Positional Arguments:**

\`.opencode/commands/create-file.md\`

\`\`\`markdown
---
description: Create a new file with content
---

Create a file named $1 in the directory $2
with the following content: $3
\`\`\`

**Usage:**

\`\`\`
/create-file config.json src "{ \\"key\\": \\"value\\" }"
\`\`\`

**Replacements:**
- \`$1\` → \`config.json\`
- \`$2\` → \`src\`
- \`$3\` → \`{ "key": "value" }\`

### Shell Output

Inject shell command output into prompts using \`!\`command\`\` syntax.

**Example: Analyze Test Coverage**

\`.opencode/commands/analyze-coverage.md\`

\`\`\`markdown
---
description: Analyze test coverage
---

Here are the current test results:

!\`npm test\`

Based on these results, suggest improvements to increase coverage.
\`\`\`

**Example: Review Recent Changes**

\`.opencode/commands/review-changes.md\`

\`\`\`markdown
---
description: Review recent changes
---

Recent git commits:

!\`git log --oneline -10\`

Review these changes and suggest any improvements.
\`\`\`

**Execution:**
- Commands run in your project's root directory
- Output is captured and included in the prompt
- Happens before prompt is sent to LLM

**Use Cases:**
- Include test results
- Show git status/logs
- Display environment info
- Inject build output
- Include linter results

### File References

Include file contents using \`@filename\` syntax.

**Example: Component Review**

\`.opencode/commands/review-component.md\`

\`\`\`markdown
---
description: Review component
---

Review the component in @src/components/Button.tsx.
Check for performance issues and suggest improvements.
\`\`\`

**Behavior:**
- File content is automatically included in the prompt
- Path is relative to project root
- Works with any file type

**Use Cases:**
- Review specific files
- Analyze configuration
- Check documentation
- Examine test files

---

## Configuration Options

### template (Required)

The prompt sent to the LLM when the command executes.

**JSON Example:**

\`\`\`json
{
  "command": {
    "test": {
      "template": "Run the full test suite with coverage report and show any failures.\\nFocus on the failing tests and suggest fixes."
    }
  }
}
\`\`\`

**Markdown Example:**

\`\`\`markdown
---
description: Run tests
---

Run the full test suite with coverage report and show any failures.
Focus on the failing tests and suggest fixes.
\`\`\`

**Notes:**
- Required field
- In JSON, use \`\\n\` for newlines
- In markdown, content below frontmatter becomes template
- Supports variable substitution

### description (Optional)

Brief description shown in TUI when typing commands.

**JSON Example:**

\`\`\`json
{
  "command": {
    "test": {
      "description": "Run tests with coverage"
    }
  }
}
\`\`\`

**Markdown Example:**

\`\`\`markdown
---
description: Run tests with coverage
---
\`\`\`

**Benefits:**
- Helps users understand command purpose
- Appears in autocomplete/help
- Good documentation practice

### agent (Optional)

Specify which agent executes the command.

**JSON Example:**

\`\`\`json
{
  "command": {
    "review": {
      "agent": "plan"
    }
  }
}
\`\`\`

**Markdown Example:**

\`\`\`markdown
---
agent: plan
---
\`\`\`

**Behavior:**
- If agent is a **subagent**, triggers subagent invocation by default
- If not specified, uses current agent
- Can be overridden with \`subtask\` option

**Use Cases:**
- Use \`plan\` agent for planning tasks
- Use \`build\` agent for implementation
- Use custom agents for specialized tasks

### subtask (Optional)

Force command to trigger a subagent invocation.

**JSON Example:**

\`\`\`json
{
  "command": {
    "analyze": {
      "subtask": true
    }
  }
}
\`\`\`

**Markdown Example:**

\`\`\`markdown
---
subtask: true
---
\`\`\`

**Behavior:**
- Forces agent to act as subagent
- Works even if \`mode: "primary"\` on agent config
- Prevents polluting primary context
- Result is returned to primary agent

**Use Cases:**
- Keep main conversation focused
- Isolate analysis tasks
- Preserve context for main thread
- Run independent subtasks

### model (Optional)

Override default model for this command.

**JSON Example:**

\`\`\`json
{
  "command": {
    "analyze": {
      "model": "anthropic/claude-3-5-sonnet-20241022"
    }
  }
}
\`\`\`

**Markdown Example:**

\`\`\`markdown
---
model: anthropic/claude-3-5-sonnet-20241022
---
\`\`\`

**Use Cases:**
- Use cheaper model for simple tasks
- Use more powerful model for complex analysis
- Test different models for specific commands

---

## Built-in Commands

OpenCode includes several built-in slash commands:

**Built-in Commands:**
- \`/init\` - Initialize new conversation
- \`/undo\` - Undo last action
- \`/redo\` - Redo last undone action
- \`/share\` - Share conversation
- \`/help\` - Show help information

**Overriding Built-in Commands:**

Custom commands can override built-in commands by using the same name:

\`\`\`json
{
  "command": {
    "help": {
      "template": "Show custom help information specific to our project."
    }
  }
}
\`\`\`

**Warning:** Use caution when overriding built-in commands as it may confuse users expecting default behavior.

---

## Common Command Patterns

### Code Review Command

\`.opencode/commands/review.md\`

\`\`\`markdown
---
description: Review recent changes
agent: plan
---

Review the following changes:

!\`git diff\`

Check for:
- Code quality issues
- Security vulnerabilities
- Performance problems
- Best practice violations
\`\`\`

### Test Command

\`.opencode/commands/test.md\`

\`\`\`markdown
---
description: Run tests and analyze failures
agent: build
model: anthropic/claude-3-5-sonnet-20241022
---

Run the full test suite:

!\`npm test\`

For any failures:
1. Identify the root cause
2. Suggest fixes
3. Update tests if needed
\`\`\`

### Documentation Command

\`.opencode/commands/docs.md\`

\`\`\`markdown
---
description: Generate documentation for a file
---

Generate comprehensive documentation for @$1

Include:
- Purpose and overview
- API documentation
- Usage examples
- Edge cases and limitations
\`\`\`

**Usage:** \`/docs src/utils/parser.ts\`

### Refactor Command

\`.opencode/commands/refactor.md\`

\`\`\`markdown
---
description: Refactor code with specific focus
agent: build
---

Refactor @$1 to improve $ARGUMENTS

Maintain:
- Existing functionality
- Test coverage
- API compatibility
\`\`\`

**Usage:** \`/refactor src/api.ts performance and readability\`

### Commit Message Command

\`.opencode/commands/commit.md\`

\`\`\`markdown
---
description: Generate commit message
subtask: true
---

Generate a commit message for these changes:

!\`git diff --staged\`

Follow conventional commits format:
- type(scope): description
- Include breaking changes if applicable
\`\`\`

### Deploy Checklist Command

\`.opencode/commands/deploy-check.md\`

\`\`\`markdown
---
description: Pre-deployment checklist
agent: plan
---

Run pre-deployment checklist:

1. Test results: !\`npm test\`
2. Build status: !\`npm run build\`
3. Lint results: !\`npm run lint\`

Review results and confirm deployment readiness.
\`\`\`

---

## Best Practices

### Command Naming

**Good Names:**
- \`/test\` - Short, clear action
- \`/review\` - Common workflow task
- \`/deploy-check\` - Descriptive compound name
- \`/docs\` - Abbreviation for common task

**Avoid:**
- \`/t\` - Too short, unclear
- \`/do-the-thing-i-always-do\` - Too long
- \`/x\` - Non-descriptive

### Template Design

**Be Specific:**

\`\`\`markdown
❌ Bad: "Check the code"

✅ Good: "Review @$1 for:
- Security vulnerabilities
- Performance issues
- Code quality
- Test coverage"
\`\`\`

**Use Clear Instructions:**

\`\`\`markdown
❌ Bad: "Fix tests"

✅ Good: "Run tests, identify failures, and:
1. Explain root cause
2. Suggest fixes
3. Update test descriptions if unclear"
\`\`\`

### Organization

**Global vs Project:**

**Global Commands** (\`~/.config/opencode/commands/\`):
- Personal workflow commands
- Commands used across all projects
- General-purpose utilities

**Project Commands** (\`.opencode/commands/\`):
- Project-specific workflows
- Team-shared commands
- Commands referencing project structure

**Version Control:**

\`\`\`bash
# Commit project commands for team
git add .opencode/commands/
git commit -m "Add project commands"

# Add global commands to .gitignore
echo ".opencode/commands/*" >> .gitignore
\`\`\`

### Performance

**Avoid Expensive Shell Commands:**

\`\`\`markdown
❌ Slow: !\`npm install && npm test\`

✅ Better: !\`npm test\` (assume dependencies installed)
\`\`\`

**Cache Heavy Operations:**

\`\`\`markdown
# Run expensive analysis once, save output
!\`npm run analyze > .cache/analysis.txt\`

# Later commands can reference cached file
@.cache/analysis.txt
\`\`\`

### Security

**Avoid Secrets in Commands:**

\`\`\`markdown
❌ Bad: 
!\`curl https://api.example.com -H "Authorization: Bearer sk-12345"\`

✅ Good:
!\`curl https://api.example.com -H "Authorization: Bearer $API_KEY"\`
\`\`\`

**Sanitize User Input:**

\`\`\`markdown
# Be careful with $ARGUMENTS in shell commands
# Prefer using arguments in prompts, not shell execution
\`\`\`

---

## Troubleshooting

### Command Not Found

**Issue:** Typing \`/my-command\` shows "command not found"

**Solutions:**

1. **Check file location:**
   \`\`\`bash
   ls .opencode/commands/my-command.md
   # or
   ls ~/.config/opencode/commands/my-command.md
   \`\`\`

2. **Check JSON config:**
   \`\`\`bash
   # Verify command is in opencode.json
   cat opencode.json | grep -A5 '"command"'
   \`\`\`

3. **Verify filename matches command name:**
   - File: \`test.md\` → Command: \`/test\`
   - File: \`my-command.md\` → Command: \`/my-command\`

4. **Restart OpenCode:**
   \`\`\`bash
   # Config changes require restart
   \`\`\`

### Arguments Not Substituting

**Issue:** \`$ARGUMENTS\` appears literally in prompt

**Solutions:**

1. **Check syntax:**
   \`\`\`markdown
   ✅ Correct: $ARGUMENTS
   ❌ Wrong: \${ARGUMENTS}
   ❌ Wrong: $ARGS
   \`\`\`

2. **Pass arguments when running:**
   \`\`\`
   /component Button  # $ARGUMENTS = Button
   /component         # $ARGUMENTS = (empty)
   \`\`\`

### Shell Commands Failing

**Issue:** \`!\`command\`\` doesn't produce output

**Solutions:**

1. **Test command separately:**
   \`\`\`bash
   # Run in terminal first
   npm test
   \`\`\`

2. **Check working directory:**
   - Commands run from project root
   - Use relative paths

3. **Verify command exits successfully:**
   \`\`\`bash
   npm test && echo "Success"
   \`\`\`

4. **Check command output:**
   - Some commands write to stderr
   - Use \`2>&1\` to capture: \`!\`npm test 2>&1\`\`

### File References Not Working

**Issue:** \`@filename\` doesn't include file content

**Solutions:**

1. **Check file path:**
   \`\`\`markdown
   ✅ Correct: @src/utils/parser.ts
   ❌ Wrong: @./src/utils/parser.ts
   ❌ Wrong: @~/project/src/utils/parser.ts
   \`\`\`

2. **Verify file exists:**
   \`\`\`bash
   ls src/utils/parser.ts
   \`\`\`

3. **Use project-relative paths:**
   - Always relative to project root
   - Don't use \`./\` or \`~/\` prefixes

---

## Advanced Patterns

### Conditional Logic with Shell

\`\`\`markdown
---
description: Smart test runner
---

Check test status:

!\`if npm test; then echo "All tests passing"; else echo "Tests failing:"; npm test 2>&1 | grep -A5 FAIL; fi\`

Based on the results above, $ARGUMENTS
\`\`\`

### Multi-Step Workflows

\`\`\`markdown
---
description: Release workflow
agent: build
---

Execute release workflow:

1. Version bump: !\`npm version $1\`
2. Changelog: @CHANGELOG.md
3. Build status: !\`npm run build\`
4. Test status: !\`npm test\`

Review all steps and confirm release is ready.
\`\`\`

**Usage:** \`/release patch\`

### Context-Aware Commands

\`\`\`markdown
---
description: Smart fixer
---

Current git status:
!\`git status --short\`

Modified files context:
!\`git diff --name-only | head -5 | xargs -I {} echo "@{}"\`

Fix issues in these files based on $ARGUMENTS
\`\`\`

### Agent Chaining

\`\`\`markdown
---
description: Plan and build
agent: plan
---

First, create implementation plan for: $ARGUMENTS

Then switch to build agent to implement.
\`\`\`

---

## Related Documentation

- **OpenCode Configuration:** https://opencode.ai/docs/config/
- **Agents Configuration:** https://opencode.ai/docs/agents/
- **TUI Usage:** https://opencode.ai/docs/tui/
- **Tools Configuration:** https://opencode.ai/docs/tools/
- **Rules Configuration:** https://opencode.ai/docs/rules/

---

## Summary

OpenCode commands provide powerful automation for repetitive tasks:

- **Two configuration methods** - JSON or Markdown files
- **Dynamic templates** - Arguments, shell output, file references
- **Agent control** - Specify agent, model, subtask behavior
- **Built-in commands** - Can be overridden with custom implementations
- **Flexible organization** - Global or project-specific

**Key Takeaways:**

1. **Use markdown for complex commands** - Better readability and maintainability
2. **Leverage shell output** - Include dynamic runtime information
3. **Organize by scope** - Global for personal, project for team
4. **Be specific in templates** - Clear instructions produce better results
5. **Test shell commands** - Verify they work before including in templates

**Official Documentation:** https://opencode.ai/docs/commands/
  `,

  checklist: [
    'Created command using either JSON config or Markdown file approach',
    'Added clear description for the command',
    'Used variable substitution ($ARGUMENTS, $1, $2) if command accepts parameters',
    'Tested shell output injection if using `!\\`command\\`\\` syntax',
    'Verified file references work correctly with @filename syntax',
    'Specified agent and/or model if command needs specific execution context',
    'Tested command in OpenCode to ensure it works as expected',
    'Documented command for team members if project-specific',
  ],
});
