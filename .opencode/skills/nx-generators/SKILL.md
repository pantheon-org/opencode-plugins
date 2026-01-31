---
name: nx-generators
description: Create Nx generators to automate code scaffolding and enforce best practices in Nx workspaces. Covers the Tree API, schema validation, composing generators, template files, and testing with TypeScript.
license: MIT
compatibility: opencode
metadata:
  category: nx-development
  audience: nx-developers
---

# Creating Nx Generators

Automate code scaffolding and enforce best practices in Nx workspaces using custom generators.

## Quick Start

### 1. Create Local Plugin

```bash
nx add @nx/plugin
nx g @nx/plugin:plugin plugins/<namespace>
```

### 2. Generate Generator Scaffold

```bash
nx generate @nx/plugin:generator plugins/<namespace>/src/generators/my-generator
```

**Generated Structure:**

```
plugins/
└── <namespace>/
    └── src/
        └── generators/
            └── my-generator/
                ├── generator.ts      # Main logic
                ├── generator.spec.ts # Unit tests
                ├── schema.d.ts       # TypeScript types
                └── schema.json       # Configuration
```

## Generator Implementation

### Basic Generator

```typescript
// generator.ts
import { Tree, formatFiles, installPackagesTask } from "@nx/devkit"
import { libraryGenerator } from "@nx/js"

export default async function (tree: Tree, schema: MyGeneratorSchema) {
  // Generate base library
  await libraryGenerator(tree, { name: schema.name })
  
  // Format all modified files
  await formatFiles(tree)
  
  // Return callback for post-generation tasks
  return () => {
    installPackagesTask(tree)
  }
}
```

### Schema Definition

```typescript
// schema.d.ts
export interface MyGeneratorSchema {
  name: string
  directory?: string
  style?: "css" | "scss" | "less"
  tags?: string
}
```

```json
// schema.json
{
  "cli": "nx",
  "id": "my-generator",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Library name",
      "$default": { "$source": "argv", "index": 0 }
    },
    "directory": {
      "type": "string",
      "description": "Directory where library is created"
    },
    "style": {
      "type": "string",
      "description": "Style format",
      "enum": ["css", "scss", "less"],
      "default": "css"
    }
  },
  "required": ["name"]
}
```

## The Tree API

The `Tree` represents an in-memory file system:

- All changes are staged until generator completes
- Changes are batched for performance
- Supports read/write without touching actual files until commit

### File Operations

```typescript
import {
  generateFiles,
  readProjectConfiguration,
  updateProjectConfiguration,
  joinPathFragments,
  readJson,
  updateJson
} from "@nx/devkit"

export default async function (tree: Tree, schema: MyGeneratorSchema) {
  // Generate files from templates
  generateFiles(
    tree,
    joinPathFragments(__dirname, "./files"),
    `./libs/${schema.name}`,
    { name: schema.name, tmpl: "" }
  )
  
  // Read project config
  const config = readProjectConfiguration(tree, schema.name)
  
  // Update project config
  updateProjectConfiguration(tree, schema.name, {
    ...config,
    tags: ["scope:shared", "type:util"]
  })
  
  // Read JSON file
  const packageJson = readJson(tree, "package.json")
  
  // Update JSON file
  updateJson(tree, "nx.json", (json) => ({
    ...json,
    targetDefaults: {
      ...json.targetDefaults,
      "custom-target": { cache: true }
    }
  }))
}
```

## Composing Generators

Call other generators from your generator:

```typescript
import { libraryGenerator } from "@nx/js"
import { componentGenerator } from "@nx/react"

export default async function (tree: Tree, schema: MyGeneratorSchema) {
  // Create base library
  await libraryGenerator(tree, {
    name: schema.name,
    directory: "libs"
  })
  
  // Add component to library
  await componentGenerator(tree, {
    name: "MyComponent",
    project: schema.name
  })
  
  await formatFiles(tree)
}
```

## Template Files

Use EJS syntax for variable injection:

```markdown
<!-- files/README.md.template -->
# <%= name %>

Generated on <%= new Date().toISOString() %>

## Description

<%= description || "No description" %>
```

**Template Variables:**

- `<%= name %>` - Inject option values
- `<% if (condition) { %>` - Conditional logic
- `<% for (item of items) { %>` - Iteration

**File Naming:**

- `.template` suffix removed during generation
- `__name__` replaced with actual values

```typescript
generateFiles(
  tree,
  joinPathFragments(__dirname, "./files"),
  `./libs/${schema.name}`,
  {
    name: schema.name,
    description: schema.description || "No description",
    tmpl: "" // Removes .template extension
  }
)
```

## Running Generators

```bash
# Basic usage
nx generate @myorg/my-plugin:my-generator mylib

# With options
nx g @myorg/my-plugin:my-generator mylib --directory=shared --style=scss

# Dry run (test without creating files)
nx g @myorg/my-plugin:my-generator mylib --dry-run
```

**Important:** Use `name` from `package.json`, not folder name.

## Utility Functions

### String Manipulation

```typescript
import { names } from "@nx/devkit"

const options = names("my-awesome-lib")
// Output:
// {
//   name: "my-awesome-lib",
//   className: "MyAwesomeLib",
//   propertyName: "myAwesomeLib",
//   constantName: "MY_AWESOME_LIB",
//   fileName: "my-awesome-lib"
// }
```

### Logging

```typescript
import { logger } from "@nx/devkit"

logger.info("Starting generator...")
logger.warn("This might take a while")
logger.error("Something went wrong!")
```

### Dependencies

```typescript
import { addDependenciesToPackageJson } from "@nx/devkit"

export default async function (tree: Tree, schema: MyGeneratorSchema) {
  addDependenciesToPackageJson(
    tree,
    { "lodash": "^4.17.21" },     // dependencies
    { "@types/lodash": "^4.14.0" } // devDependencies
  )
  
  return () => {
    installPackagesTask(tree)
  }
}
```

## Advanced Patterns

### Conditional Logic

```typescript
export default async function (tree: Tree, schema: MyGeneratorSchema) {
  // Check if project exists
  const projects = getProjects(tree)
  if (projects.has(schema.name)) {
    throw new Error(`Project ${schema.name} already exists`)
  }
  
  // Conditional file generation
  if (schema.includeTests) {
    generateFiles(tree, "./test-files", "./tests", schema)
  }
}
```

### Interactive Prompts

```typescript
import { prompt } from "enquirer"

export default async function (tree: Tree, schema: MyGeneratorSchema) {
  if (!schema.style) {
    const response = await prompt<{ style: string }>({
      type: "select",
      name: "style",
      message: "Which style format?",
      choices: ["css", "scss", "less"]
    })
    schema.style = response.style
  }
}
```

### Component Generator Example

```typescript
export default async function (tree: Tree, schema: ComponentSchema) {
  const project = readProjectConfiguration(tree, schema.project)
  const componentDir = `${project.sourceRoot}/components/${schema.name}`
  
  generateFiles(
    tree,
    joinPathFragments(__dirname, "./files"),
    componentDir,
    {
      ...schema,
      fileName: names(schema.name).fileName,
      className: names(schema.name).className,
      tmpl: ""
    }
  )
  
  await formatFiles(tree)
}
```

## Testing Generators

```typescript
// generator.spec.ts
import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing"
import myGenerator from "./generator"

describe("my-generator", () => {
  it("should generate a library", async () => {
    const tree = createTreeWithEmptyWorkspace()
    
    await myGenerator(tree, { name: "test-lib" })
    
    expect(tree.exists("libs/test-lib/src/index.ts")).toBeTruthy()
  })
})
```

## Debugging

### VS Code

1. Open Command Palette → `Debug: Create JavaScript Debug Terminal`
2. Set breakpoints in generator code
3. Run generator: `nx g my-generator`
4. Execution pauses at breakpoints

### Console Logging

```typescript
export default async function (tree: Tree, schema: MyGeneratorSchema) {
  console.log("Schema:", schema)
  console.log("Tree files:", tree.listChanges())
  // Generator logic
}
```

## Best Practices

1. **Validate Input Early**
   ```typescript
   if (!schema.name.match(/^[a-z][a-z0-9-]*$/)) {
     throw new Error("Name must be kebab-case")
   }
   ```

2. **Use TypeScript for Schema**
   - Define proper types in `schema.d.ts`
   - Import into generator for type safety

3. **Always Format Files**
   ```typescript
   await formatFiles(tree)
   ```

4. **Write Tests**
   - Test file generation
   - Test config updates
   - Test error cases

5. **Document Your Generator**
   ```json
   {
     "cli": "nx",
     "id": "my-generator",
     "description": "Generate a new library",
     "examples": [{
       "command": "nx g @myorg/my-plugin:my-generator mylib",
       "description": "Generate library named 'mylib'"
     }]
   }
   ```

## Troubleshooting

### TsConfig Issues

- Ensure `tsconfig.base.json` has correct paths
- Follow Node 16+ recommendations

### Package Name Mismatch

Use `name` from `package.json`, not folder name:

```bash
# Correct
nx g @myorg/my-plugin:my-generator

# Incorrect
nx g my-plugin:my-generator
```

### Generator Not Found

1. Check `tsconfig.base.json` paths
2. Rebuild plugin: `nx build my-plugin`
3. Verify `package.json` exports

## Complete Example

```typescript
// generator.ts
import {
  Tree,
  formatFiles,
  generateFiles,
  joinPathFragments,
  addProjectConfiguration,
  names
} from "@nx/devkit"

export interface MyGeneratorSchema {
  name: string
  directory?: string
  tags?: string
}

export default async function (tree: Tree, schema: MyGeneratorSchema) {
  // Validate
  if (!schema.name.match(/^[a-z][a-z0-9-]*$/)) {
    throw new Error("Name must be kebab-case")
  }
  
  const projectRoot = `libs/${schema.name}`
  
  // Add project config
  addProjectConfiguration(tree, schema.name, {
    root: projectRoot,
    projectType: "library",
    sourceRoot: `${projectRoot}/src`,
    targets: {}
  })
  
  // Generate files from templates
  generateFiles(
    tree,
    joinPathFragments(__dirname, "./files"),
    projectRoot,
    {
      ...schema,
      ...names(schema.name),
      tmpl: ""
    }
  )
  
  // Format files
  await formatFiles(tree)
}
```

## Resources

- [Nx Devkit API](https://nx.dev/reference/devkit)
- [Generator Examples](https://github.com/nrwl/nx/tree/master/packages)
- [Plugin Development](https://nx.dev/extending-nx/intro)
- [Community Plugins](https://nx.dev/plugin-registry)
