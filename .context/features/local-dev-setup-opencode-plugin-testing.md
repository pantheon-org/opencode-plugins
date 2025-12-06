# Local Development Setup for OpenCode Plugin Testing

## Goal

Create a streamlined local development workflow that enables developers to test OpenCode plugins in real-time during development without requiring manual builds or npm publishing. The solution should integrate with the existing NX monorepo structure and automate the symlinking of plugin code to `.opencode/plugin` for immediate testing with the OpenCode CLI.

## Context

- This is an NX monorepo using Bun + TypeScript for multiple OpenCode plugins under `packages/`
- The project already has NX executors (e.g., `build`, `pack`, `test`) defined in `project.json` files for each plugin
- OpenCode plugins are loaded via `opencode.json` configuration using the `plugin` array (supports `file://` paths and npm packages)
- According to OpenCode plugin development guide, plugins can be loaded locally using `file:///absolute/path/to/plugin/dist/index.js` in `opencode.json`
- The monorepo currently builds plugins using `tsup` to create `dist/` output (ESM + CJS + type declarations)
- Developers need a way to test plugin changes immediately without manual intervention (rebuilding, relinking, restarting)

## Inputs

- Current NX workspace configuration (`nx.json`, `workspace.json`)
- Example plugin `project.json` structure (from `opencode-warcraft-notifications-plugin`)
- Existing NX generator patterns in `tools/generators/plugin/`
- OpenCode configuration format (from `opencode.jsonc`)
- Knowledge base documents: `bun-typescript-development.md`, `creating-nx-generators.md`, `extending-nx-plugins.md`, `opencode-development-plugin-guide.md`
- Build tooling: Bun, tsup, NX executors

## Deliverables

Provide a comprehensive technical recommendation document that includes:

1. **Architecture Decision**: Evaluation of implementation approaches with pros/cons:
   - Custom NX executor (e.g., `dev-test` or `serve` target)
   - NX generator to scaffold test configuration
   - Combination approach
   - Alternative solutions (if applicable)

2. **Recommended Solution**: Specific approach with justification including:
   - Which NX mechanism to use (executor, generator, or both)
   - Directory structure (e.g., `.opencode/plugin` location relative to workspace root vs. plugin package)
   - Symlinking strategy (create symlink to `dist/` or watch+rebuild)
   - Integration with existing build pipeline

3. **Implementation Plan**: Step-by-step technical specification:
   - File(s) to create with exact paths (e.g., `tools/executors/dev-test/executor.ts`)
   - Configuration changes needed (updates to `nx.json`, `project.json` templates, generator files)
   - Commands/scripts to add
   - Dependencies to install (if any)

4. **Usage Workflow**: Clear developer experience description:
   - Command to start local dev testing (e.g., `bunx nx dev-test my-plugin`)
   - What happens automatically (build, symlink creation, watch mode, etc.)
   - How to point OpenCode CLI at the local plugin
   - How to stop/clean up

5. **Example Configuration Snippets**: Concrete code examples showing:
   - NX executor or generator configuration (JSON schema)
   - `project.json` target definition
   - `opencode.json` configuration pointing to local plugin
   - Any shell scripts or TypeScript code needed

## Constraints & Limitations

- Must use Bun (not Node.js, npm, yarn, or pnpm) for all commands and scripts
- Must use TypeScript exclusively (no JavaScript except NX generator files if required by NX)
- Must integrate with existing NX workspace structure without disrupting current build/test/lint targets
- Should follow established patterns from existing NX generator (`tools/generators/plugin/`)
- Must not require global installations or system-level changes
- Solution should work across different operating systems (macOS, Linux, Windows with WSL)
- Should respect the monorepo's "one function per module" and barrel module patterns
- Must preserve existing `build`, `pack`, and `test` executors without modification

## Quality Standards & Acceptance Criteria

- **Correctness**: Solution must enable plugin code changes to be testable within 5 seconds of file save
- **Reproducibility**: Any developer can run a single command to start local dev testing
- **Clean State**: Running the dev workflow should not leave orphaned symlinks or corrupt the build output
- **Documentation**: Recommendation includes all necessary commands and configuration examples
- **Best Practices**: Solution follows NX conventions and patterns documented in knowledge base
- **Error Handling**: Recommendation addresses potential failure modes (symlink conflicts, missing dist/, concurrent builds)
- **Minimal Overhead**: Introduces no more than 2 new files/executors/generators
- **Testability**: Developer can verify the setup works by making a trivial plugin code change and seeing it reflected immediately in OpenCode CLI execution

## Style & Tone

- Technical, precise, and actionable for senior TypeScript/NX developers
- Use concrete examples and exact file paths
- Avoid vague phrases like "configure as needed" or "set up appropriately"
- Prioritize clarity over brevity—explain the "why" behind each recommendation
- Use markdown formatting with clear headings, code blocks, and bullet lists
- Assume reader is familiar with NX, TypeScript, and Bun but may be new to OpenCode plugin development

## Clarifying Questions

If any of the following are unclear, ask the user before proceeding:

1. **Symlink Location**: Should `.opencode/plugin` be at the workspace root (shared across all plugins) or within each plugin's package directory (isolated per plugin)?

2. **Watch Mode Preference**: Should the executor use `tsup --watch` for automatic rebuilds, or should it build once and rely on the developer to manually rebuild when needed?

3. **OpenCode Config Management**: Should the solution automatically update `opencode.json` to point at the local plugin, or should developers manually configure this file once?

## Example Output

Here's a snippet of what the final recommendation should look like:

```markdown
### Recommended Solution: Custom NX Executor with Watch Mode

**Approach**: Create a `dev-test` NX executor that:
- Builds the plugin using `tsup --watch` 
- Creates a symlink from `<workspace-root>/.opencode/plugin/<plugin-name>` → `packages/<plugin-name>/dist`
- Provides instructions for updating `opencode.json`

**Justification**: This approach provides the fastest feedback loop while integrating cleanly with the existing NX task graph...

### Implementation Plan

#### Step 1: Create Custom Executor

Create file: `tools/executors/dev-test/executor.ts`

\`\`\`typescript
import { ExecutorContext } from '@nx/devkit';
// ... (complete implementation)
\`\`\`

#### Step 2: Register Executor

Update `tools/executors/executors.json`:

\`\`\`json
{
  "executors": {
    "dev-test": {
      "implementation": "./dev-test/executor",
      "schema": "./dev-test/schema.json",
      "description": "Run plugin in local dev mode with watch and symlink"
    }
  }
}
\`\`\`

#### Step 3: Add Target to Plugin Generator

Update `tools/generators/plugin/files/project.json__template__` to include:

\`\`\`json
"dev-test": {
  "executor": "@pantheon-org/tools:dev-test",
  "options": {
    "outputPath": "dist"
  }
}
\`\`\`

### Usage Workflow

\`\`\`bash
# Start local dev testing
bunx nx dev-test opencode-warcraft-notifications-plugin

# In another terminal, configure OpenCode to use local plugin
echo '{ "plugin": ["file://<workspace-root>/.opencode/plugin/opencode-warcraft-notifications-plugin/index.js"] }' > opencode.json

# Run OpenCode CLI - changes to plugin code rebuild automatically
opencode "test my plugin"
\`\`\`
```

## "Do Not Do" List

1. **Do not propose solutions requiring npm, yarn, pnpm, or Node.js** — this project uses Bun exclusively
2. **Do not suggest modifications to existing build/test/lint executors** — only add new targets/executors
3. **Do not invent facts about OpenCode plugin loading behavior** — reference the knowledge base documents or ask for clarification if unsure
