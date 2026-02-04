/**
 * OpenCode Custom Tools Development Skill
 *
 * Comprehensive guide for creating custom tools in OpenCode.
 */

import type { Skill } from '@pantheon-org/opencode-skills';
import { defineSkill } from '@pantheon-org/opencode-skills';

/**
 * OpenCode Custom Tools Development Skill
 *
 * This skill provides guidance on creating custom tools that extend
 * OpenCode's capabilities beyond built-in tools.
 */
export const opencodeCustomToolsSkill: Skill = defineSkill({
  name: 'opencode-custom-tools',
  description:
    'Complete guide for creating custom tools in OpenCode using TypeScript, JavaScript, and external scripts',
  license: 'MIT',
  compatibility: 'opencode',
  metadata: {
    category: 'development',
  },
  keywords: [
    'custom-tool',
    'custom-tools',
    'tool-definition',
    'create-tool',
    'tool-helper',
    'tool-schema',
    'zod-schema',
    'tool-args',
    'tool-context',
    'execute-tool',
  ],

  whatIDo: `
I provide comprehensive guidance for creating custom tools in OpenCode:

- Tool definition with the tool() helper and type-safety
- Argument validation using Zod schemas
- Tool context (sessionID, agent, abort signal)
- Integration with external scripts (Python, Shell, Go)
- File system operations and API integrations
- Error handling and resource management
- Security best practices and input validation
  `.trim(),

  whenToUseMe: `
Use this skill when you need to:

- Create custom tools for the AI to use
- Integrate external APIs or services
- Add database query capabilities
- Execute scripts in other languages (Python, Go, Shell)
- Perform file system operations
- Extend OpenCode with project-specific functionality
- Understand tool arguments, schemas, and context
  `.trim(),

  instructions: `
# OpenCode Custom Tools Development

Complete guide for creating custom tools that extend OpenCode's functionality.

## Overview

Custom tools are functions you create that the LLM can call during conversations. They enable:
- Integration with external systems and APIs
- Database queries and operations
- Custom business logic
- Scripts in any programming language
- File system operations
- Network requests and webhooks

Custom tools work alongside OpenCode's built-in tools (read, write, bash, edit, etc.).

## Creating a Tool

### Location

Tools can be defined in two locations:

**Project-specific:**
\`\`\`.opencode/tools/
\`\`\`

**Global (all projects):**
\`\`\`~/.config/opencode/tools/
\`\`\`

Tools are defined as **TypeScript** or **JavaScript** files. The filename becomes the tool name.

### Basic Structure

Use the \`tool()\` helper for type-safety and validation:

\`\`\`typescript
import { tool } from "@opencode-ai/plugin";

export default tool({
  description: "Tool description that LLM sees",
  args: {
    query: tool.schema.string().describe("SQL query to execute"),
  },
  async execute(args) {
    // Your tool logic here
    return \`Executed query: \${args.query}\`;
  },
});
\`\`\`

**Key points:**
- **Filename** = **Tool name** (e.g., \`database.ts\` → \`database\` tool)
- **description** - What the tool does (shown to LLM)
- **args** - Tool parameters with Zod schemas
- **execute** - Async function containing tool logic

### Multiple Tools Per File

Export multiple tools from a single file. Each export becomes a separate tool:

\`\`\`typescript
import { tool } from "@opencode-ai/plugin";

export const add = tool({
  description: "Add two numbers",
  args: {
    a: tool.schema.number().describe("First number"),
    b: tool.schema.number().describe("Second number"),
  },
  async execute(args) {
    return args.a + args.b;
  },
});

export const multiply = tool({
  description: "Multiply two numbers",
  args: {
    a: tool.schema.number().describe("First number"),
    b: tool.schema.number().describe("Second number"),
  },
  async execute(args) {
    return args.a * args.b;
  },
});
\`\`\`

**Tool names:** \`<filename>_<exportname>\`
- File: \`math.ts\`
- Tools created: \`math_add\`, \`math_multiply\`

## Arguments

### Using tool.schema (Recommended)

\`tool.schema\` is Zod under the hood, providing type safety:

\`\`\`typescript
import { tool } from "@opencode-ai/plugin";

export default tool({
  description: "Create a user account",
  args: {
    // String
    username: tool.schema.string().describe("Username for the account"),
    
    // Number
    age: tool.schema.number().min(18).describe("User age (minimum 18)"),
    
    // Boolean
    premium: tool.schema.boolean().describe("Premium account status"),
    
    // Optional
    email: tool.schema.string().email().optional().describe("Email address"),
    
    // Enum
    role: tool.schema.enum(["admin", "user", "guest"]).describe("User role"),
    
    // Array
    tags: tool.schema.array(tool.schema.string()).describe("User tags"),
    
    // Object
    metadata: tool.schema.object({
      createdBy: tool.schema.string(),
      timestamp: tool.schema.number(),
    }).describe("Metadata object"),
    
    // Default values
    status: tool.schema.string().default("active").describe("Account status"),
  },
  async execute(args) {
    // args are fully typed
    return \`Created user \${args.username}\`;
  },
});
\`\`\`

**Always use \`.describe()\`** - Helps the LLM understand parameter purpose.

### Using Zod Directly

You can import Zod directly for advanced schemas:

\`\`\`typescript
import { z } from "zod";

export default {
  description: "Advanced validation example",
  args: {
    param: z
      .string()
      .min(5)
      .max(50)
      .regex(/^[a-z0-9-]+$/)
      .describe("Parameter with custom validation"),
  },
  async execute(args, context) {
    return "result";
  },
};
\`\`\`

## Tool Context

The \`execute\` function receives context about the current session:

\`\`\`typescript
import { tool } from "@opencode-ai/plugin";

export default tool({
  description: "Get session information",
  args: {},
  async execute(args, context) {
    // Available context properties
    const { 
      agent,      // Current agent name
      sessionID,  // Session identifier
      messageID,  // Message identifier
      callID,     // Tool call identifier
      abort       // AbortSignal for cancellation
    } = context;
    
    return \`Agent: \${agent}, Session: \${sessionID}\`;
  },
});
\`\`\`

**Context properties:**
- \`agent\` - Name of the agent invoking the tool
- \`sessionID\` - Unique session identifier
- \`messageID\` - Current message identifier
- \`callID\` - Unique tool call identifier
- \`abort\` - AbortSignal for handling cancellation

## Examples

### Database Query Tool

\`\`\`typescript
import { tool } from "@opencode-ai/plugin";
import Database from "better-sqlite3";

export default tool({
  description: "Query the project SQLite database",
  args: {
    query: tool.schema.string().describe("SQL SELECT query to execute"),
    params: tool.schema.array(tool.schema.any()).optional().describe("Query parameters"),
  },
  async execute(args) {
    const db = new Database(".opencode/data.db");
    
    try {
      const stmt = db.prepare(args.query);
      const results = stmt.all(...(args.params || []));
      return JSON.stringify(results, null, 2);
    } catch (error) {
      return \`Error: \${error.message}\`;
    } finally {
      db.close();
    }
  },
});
\`\`\`

### API Integration Tool

\`\`\`typescript
import { tool } from "@opencode-ai/plugin";

export default tool({
  description: "Fetch data from external API",
  args: {
    endpoint: tool.schema.string().url().describe("API endpoint URL"),
    method: tool.schema.enum(["GET", "POST", "PUT", "DELETE"]).default("GET"),
    body: tool.schema.record(tool.schema.any()).optional().describe("Request body"),
  },
  async execute(args) {
    try {
      const response = await fetch(args.endpoint, {
        method: args.method,
        headers: { "Content-Type": "application/json" },
        body: args.body ? JSON.stringify(args.body) : undefined,
      });
      
      const data = await response.json();
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return \`API Error: \${error.message}\`;
    }
  },
});
\`\`\`

### File System Tool

\`\`\`typescript
import { tool } from "@opencode-ai/plugin";
import { readdir, stat } from "fs/promises";
import { join } from "path";

export default tool({
  description: "List files in directory with detailed information",
  args: {
    path: tool.schema.string().describe("Directory path to list"),
    recursive: tool.schema.boolean().default(false).describe("Recursive listing"),
  },
  async execute(args) {
    try {
      const entries = await readdir(args.path);
      const details = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = join(args.path, entry);
          const stats = await stat(fullPath);
          return {
            name: entry,
            size: stats.size,
            isDirectory: stats.isDirectory(),
            modified: stats.mtime,
          };
        })
      );
      
      return JSON.stringify(details, null, 2);
    } catch (error) {
      return \`Error: \${error.message}\`;
    }
  },
});
\`\`\`

### Environment Variables Tool

\`\`\`typescript
import { tool } from "@opencode-ai/plugin";

export default tool({
  description: "Get environment variable value (non-sensitive only)",
  args: {
    name: tool.schema.string().describe("Environment variable name"),
  },
  async execute(args) {
    // Only allow non-sensitive variables
    const allowed = ["NODE_ENV", "STAGE", "REGION"];
    
    if (!allowed.includes(args.name)) {
      return \`Error: Variable \${args.name} not allowed\`;
    }
    
    const value = process.env[args.name];
    return value || \`Variable \${args.name} not set\`;
  },
});
\`\`\`

## Tools in Other Languages

### Python Tool

**1. Create Python script:**

\`.opencode/tools/add.py\`

\`\`\`python
import sys

a = int(sys.argv[1])
b = int(sys.argv[2])
print(a + b)
\`\`\`

**2. Create tool definition:**

\`.opencode/tools/python-add.ts\`

\`\`\`typescript
import { tool } from "@opencode-ai/plugin";

export default tool({
  description: "Add two numbers using Python",
  args: {
    a: tool.schema.number().describe("First number"),
    b: tool.schema.number().describe("Second number"),
  },
  async execute(args) {
    const result = await Bun.$\`python3 .opencode/tools/add.py \${args.a} \${args.b}\`.text();
    return result.trim();
  },
});
\`\`\`

**Note:** Uses [Bun.$](https://bun.sh/docs/runtime/shell) shell utility.

### Shell Script Tool

**1. Create shell script:**

\`.opencode/tools/git-info.sh\`

\`\`\`bash
#!/bin/bash
git log --oneline --decorate --graph -n 10
\`\`\`

**2. Create tool definition:**

\`.opencode/tools/git-info.ts\`

\`\`\`typescript
import { tool } from "@opencode-ai/plugin";

export default tool({
  description: "Get recent git commit history with graph",
  args: {},
  async execute() {
    const result = await Bun.$\`bash .opencode/tools/git-info.sh\`.text();
    return result;
  },
});
\`\`\`

### Go Tool

**1. Create Go script:**

\`.opencode/tools/fibonacci.go\`

\`\`\`go
package main

import (
    "fmt"
    "os"
    "strconv"
)

func main() {
    n, _ := strconv.Atoi(os.Args[1])
    fmt.Println(fibonacci(n))
}

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}
\`\`\`

**2. Create tool definition:**

\`.opencode/tools/fibonacci.ts\`

\`\`\`typescript
import { tool } from "@opencode-ai/plugin";

export default tool({
  description: "Calculate fibonacci number using Go",
  args: {
    n: tool.schema.number().min(0).max(30).describe("Position in fibonacci sequence"),
  },
  async execute(args) {
    const result = await Bun.$\`go run .opencode/tools/fibonacci.go \${args.n}\`.text();
    return result.trim();
  },
});
\`\`\`

## Advanced Patterns

### Tool with Cancellation Support

\`\`\`typescript
import { tool } from "@opencode-ai/plugin";

export default tool({
  description: "Long-running operation with cancellation support",
  args: {
    duration: tool.schema.number().describe("Duration in seconds"),
  },
  async execute(args, context) {
    const { abort } = context;
    
    return new Promise((resolve, reject) => {
      // Listen for abort signal
      abort.addEventListener("abort", () => {
        reject(new Error("Operation cancelled"));
      });
      
      // Simulate long operation
      setTimeout(() => {
        if (!abort.aborted) {
          resolve(\`Completed after \${args.duration}s\`);
        }
      }, args.duration * 1000);
    });
  },
});
\`\`\`

### Tool with Error Handling

\`\`\`typescript
import { tool } from "@opencode-ai/plugin";

export default tool({
  description: "Tool with comprehensive error handling",
  args: {
    input: tool.schema.string().describe("Input to process"),
  },
  async execute(args) {
    try {
      // Validate input
      if (!args.input.trim()) {
        return "Error: Input cannot be empty";
      }
      
      // Process input
      const result = await processInput(args.input);
      
      return \`Success: \${result}\`;
    } catch (error) {
      // Log error for debugging
      console.error("Tool error:", error);
      
      // Return user-friendly message
      if (error instanceof ValidationError) {
        return \`Validation Error: \${error.message}\`;
      }
      
      return \`Error: \${error.message}\`;
    }
  },
});
\`\`\`

### Tool with Session Context

\`\`\`typescript
import { tool } from "@opencode-ai/plugin";

// Store session state (in-memory)
const sessionState = new Map<string, any>();

export default tool({
  description: "Store and retrieve session-specific data",
  args: {
    action: tool.schema.enum(["get", "set", "clear"]).describe("Action to perform"),
    key: tool.schema.string().describe("Data key"),
    value: tool.schema.string().optional().describe("Value to set (for 'set' action)"),
  },
  async execute(args, context) {
    const stateKey = \`\${context.sessionID}:\${args.key}\`;
    
    switch (args.action) {
      case "set":
        if (!args.value) return "Error: Value required for set action";
        sessionState.set(stateKey, args.value);
        return \`Set \${args.key} = \${args.value}\`;
        
      case "get":
        const value = sessionState.get(stateKey);
        return value || \`No value for \${args.key}\`;
        
      case "clear":
        sessionState.delete(stateKey);
        return \`Cleared \${args.key}\`;
    }
  },
});
\`\`\`

### Tool with External Dependencies

\`\`\`typescript
import { tool } from "@opencode-ai/plugin";
import axios from "axios";
import { parseMarkdown } from "some-parser-lib";

export default tool({
  description: "Fetch and parse markdown from URL",
  args: {
    url: tool.schema.string().url().describe("Markdown file URL"),
  },
  async execute(args) {
    try {
      const response = await axios.get(args.url);
      const parsed = parseMarkdown(response.data);
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      return \`Error: \${error.message}\`;
    }
  },
});
\`\`\`

**Note:** Dependencies must be installed in \`.opencode/package.json\` or \`~/.config/opencode/package.json\`.

## Best Practices

### 1. Clear Descriptions

Make descriptions specific to help the LLM choose the right tool:

\`\`\`typescript
// ✅ Good: Specific and actionable
description: "Query the SQLite database and return results as JSON"

// ❌ Bad: Too vague
description: "Database tool"
\`\`\`

### 2. Validate Arguments

Always validate and sanitize inputs:

\`\`\`typescript
export default tool({
  description: "Execute SQL query",
  args: {
    query: tool.schema.string().describe("SQL query"),
  },
  async execute(args) {
    // Validate query type
    if (!args.query.trim().toLowerCase().startsWith("select")) {
      return "Error: Only SELECT queries allowed";
    }
    
    // Sanitize and execute
    // ...
  },
});
\`\`\`

### 3. Handle Errors Gracefully

Return user-friendly error messages:

\`\`\`typescript
async execute(args) {
  try {
    return await riskyOperation(args);
  } catch (error) {
    // Log for debugging
    console.error("Tool error:", error);
    
    // Return helpful message
    return \`Error: \${error.message}. Please check your input.\`;
  }
}
\`\`\`

### 4. Use TypeScript Types

Leverage full type safety:

\`\`\`typescript
interface DatabaseRow {
  id: number;
  name: string;
  createdAt: Date;
}

export default tool({
  description: "Get database records",
  args: {},
  async execute(): Promise<string> {
    const rows: DatabaseRow[] = await db.query("SELECT * FROM users");
    return JSON.stringify(rows, null, 2);
  },
});
\`\`\`

### 5. Limit Resource Usage

Prevent abuse by limiting resources:

\`\`\`typescript
export default tool({
  description: "Fetch URL content",
  args: {
    url: tool.schema.string().url().describe("URL to fetch"),
  },
  async execute(args) {
    // Timeout after 5 seconds
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    try {
      const response = await fetch(args.url, { 
        signal: controller.signal 
      });
      
      // Limit response size
      const text = await response.text();
      if (text.length > 100000) {
        return "Error: Response too large (max 100KB)";
      }
      
      return text;
    } catch (error) {
      return \`Error: \${error.message}\`;
    } finally {
      clearTimeout(timeout);
    }
  },
});
\`\`\`

### 6. Document Return Format

Specify what the tool returns:

\`\`\`typescript
export default tool({
  description: "Get user data as JSON array with fields: id, name, email",
  args: {
    limit: tool.schema.number().default(10).describe("Maximum users to return"),
  },
  async execute(args) {
    const users = await getUsers(args.limit);
    // Return consistent format
    return JSON.stringify(users, null, 2);
  },
});
\`\`\`

### 7. Keep Tools Focused

One tool = one clear purpose:

\`\`\`typescript
// ✅ Good: Focused tools
// .opencode/tools/user-create.ts
// .opencode/tools/user-update.ts
// .opencode/tools/user-delete.ts

// ❌ Bad: Kitchen-sink tool
// .opencode/tools/user.ts with create/update/delete/list all in one
\`\`\`

## Testing Custom Tools

### Interactive Testing

Test tools directly in OpenCode:

\`\`\`
User: "Use the database tool to query SELECT * FROM users LIMIT 5"
\`\`\`

The LLM will invoke your custom tool and show results.

### Programmatic Testing

Create test files alongside tools:

\`.opencode/tools/database.test.ts\`

\`\`\`typescript
import { describe, it, expect } from "bun:test";
import databaseTool from "./database";

describe("database tool", () => {
  it("should execute SELECT query", async () => {
    const result = await databaseTool.execute(
      { query: "SELECT * FROM users LIMIT 1" },
      { 
        agent: "test", 
        sessionID: "test", 
        messageID: "test",
        callID: "test",
        abort: new AbortController().signal,
      }
    );
    
    expect(result).toContain("id");
  });
});
\`\`\`

Run tests:

\`\`\`bash
bun test .opencode/tools/
\`\`\`

## Security Considerations

### 1. Sanitize Inputs

Always validate and sanitize user inputs:

\`\`\`typescript
export default tool({
  description: "Execute shell command",
  args: {
    command: tool.schema.string().describe("Command to execute"),
  },
  async execute(args) {
    // Whitelist allowed commands
    const allowed = ["ls", "pwd", "date"];
    const cmd = args.command.split(" ")[0];
    
    if (!allowed.includes(cmd)) {
      return \`Error: Command '\${cmd}' not allowed\`;
    }
    
    // Execute safely
    const result = await Bun.$\`\${args.command}\`.text();
    return result;
  },
});
\`\`\`

### 2. Limit File Access

Restrict file operations to specific directories:

\`\`\`typescript
import { join, normalize } from "path";

export default tool({
  description: "Read project file",
  args: {
    path: tool.schema.string().describe("File path"),
  },
  async execute(args) {
    // Ensure path is within project
    const safePath = normalize(join(process.cwd(), args.path));
    
    if (!safePath.startsWith(process.cwd())) {
      return "Error: Access denied";
    }
    
    const content = await Bun.file(safePath).text();
    return content;
  },
});
\`\`\`

### 3. Protect Sensitive Data

Never expose secrets or credentials:

\`\`\`typescript
export default tool({
  description: "Get configuration value",
  args: {
    key: tool.schema.string().describe("Config key"),
  },
  async execute(args) {
    // Blacklist sensitive keys
    const sensitive = ["API_KEY", "SECRET", "PASSWORD", "TOKEN"];
    
    if (sensitive.some(s => args.key.toUpperCase().includes(s))) {
      return "Error: Cannot access sensitive configuration";
    }
    
    return config.get(args.key);
  },
});
\`\`\`

## Resources

- [OpenCode Documentation](https://opencode.ai/docs/custom-tools)
- [Zod Documentation](https://zod.dev)
- [Bun Shell API](https://bun.sh/docs/runtime/shell)
- [OpenCode Built-in Tools](https://opencode.ai/docs/tools)
- [Tool Permissions](https://opencode.ai/docs/permissions)
  `,

  checklist: [
    'Created tool file in .opencode/tools/ or ~/.config/opencode/tools/',
    'Used tool() helper with proper description and args schema',
    'Added .describe() to all arguments for LLM clarity',
    'Implemented error handling with try-catch blocks',
    'Validated and sanitized all user inputs',
    'Limited resource usage (timeouts, response size)',
    'Tested tool execution in OpenCode session',
    'Documented return format and expected behavior',
  ],
});
