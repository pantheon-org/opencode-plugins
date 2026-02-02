/**
 * Example skills for demonstration and testing
 */

import { defineSkill } from './index';
import type { Skill } from './types';

/**
 * TypeScript TDD Development Skill
 *
 * Based on the Bun and TypeScript development standards used in this project.
 * Promotes test-driven development, single-function modules, and barrel exports.
 */
export const typescriptTddSkill: Skill = defineSkill({
  name: 'typescript-tdd',
  description: 'TypeScript development with TDD, single-function modules, and barrel exports',
  keywords: ['tdd', 'test-driven', 'testing', 'bun', 'typescript', 'ts'],
  license: 'MIT',
  compatibility: 'opencode',
  metadata: {
    category: 'development',
  },
  whatIDo:
    'I help you write TypeScript code using test-driven development practices, with single-function modules and proper barrel exports',
  whenToUseMe:
    'Use when writing TypeScript code with Bun, following TDD practices, or need guidance on module organization and testing patterns',
  instructions: `## Core Principles

1. **One Function Per Module** - Each file exports a single primary function
2. **Test Collocation** - Place tests next to implementation with \`.test.ts\` suffix
3. **Barrel Modules** - Use \`index.ts\` for clean public APIs
4. **Type Safety** - Use strict mode, avoid \`any\`, explicit return types

## File Structure

\`\`\`
src/
├── index.ts           # Barrel module
├── utils/
│   ├── index.ts       # Utils barrel
│   ├── validate.ts    # Single function
│   └── validate.test.ts # Test collocated
\`\`\`

## TDD Workflow

1. Write a failing test
2. Implement minimal code to pass
3. Refactor with confidence

## Testing with Bun

\`\`\`typescript
import { describe, it, expect } from 'bun:test';
import { myFunction } from './my-function';

describe('myFunction', () => {
  it('should handle basic case', () => {
    expect(myFunction('input')).toBe('expected');
  });
});
\`\`\`

## TypeScript Standards

- Use \`strict: true\` mode
- Explicit return types for functions
- Prefer \`type\` for unions, \`interface\` for objects
- No \`any\` type - use \`unknown\` instead

## Module Patterns

**Single Function Export:**
\`\`\`typescript
// utils/validate.ts
export const validate = (input: string): boolean => {
  return /^[a-z]+$/.test(input);
};
\`\`\`

**Barrel Module:**
\`\`\`typescript
// utils/index.ts
export { validate } from './validate';
export { format } from './format';
\`\`\``,
  checklist: [
    'Write tests before implementation',
    'Use single-function modules',
    'Place tests collocated with implementation',
    'Use barrel modules for clean exports',
    'Enable strict TypeScript mode',
  ],
});

/**
 * Plain English Communication Skill
 *
 * Guidelines for writing technical content in plain English for non-technical stakeholders.
 */
export const plainEnglishSkill: Skill = defineSkill({
  name: 'plain-english',
  description: 'Write technical content in plain English for non-technical stakeholders',
  keywords: ['plain-english', 'communication', 'documentation', 'stakeholders', 'business'],
  license: 'MIT',
  compatibility: 'opencode',
  metadata: {
    category: 'communication',
  },
  whatIDo:
    'I help you write technical content that non-technical stakeholders can understand, using clear language and simple structure',
  whenToUseMe:
    'Use when communicating technical information to executives, business managers, or non-technical team members',
  instructions: `## Core Principles

1. **Use Simple Words** - Prefer "use" over "utilize", "help" over "facilitate"
2. **Short Sentences** - Keep sentences under 25 words when possible
3. **Active Voice** - "We updated the system" not "The system was updated"
4. **Define Jargon** - If you must use technical terms, explain them

## Structure

### Executive Summary
Start with the key takeaway in 2-3 sentences. What decision needs to be made?

### Problem Statement
What problem are we solving? Why does it matter to the business?

### Solution Overview
High-level approach without technical details.

### Impact
- **Benefits**: What improves?
- **Risks**: What could go wrong?
- **Timeline**: When will this happen?
- **Resources**: What do we need?

## Writing Tips

**Avoid:**
    - Technical jargon without explanation
    - Passive voice
    - Long, complex sentences
    - Acronyms without definitions

    **Use:**
    - Clear, direct language
    - Concrete examples
    - Bullet points for lists
    - Visual aids (diagrams, charts)

## Example Transformation

**Before (Technical):**
> The implementation of the new caching layer will leverage Redis to optimize database query performance, reducing latency by approximately 40% in the 95th percentile.

**After (Plain English):**
> We're adding a new system that remembers frequently-used data. This will make the app faster for most users—pages will load 40% quicker.

## Audience-Specific Guidelines

**For Executives:**
- Focus on business impact and ROI
- Use numbers and metrics
- Keep it brief (1-2 pages max)

**For Business Managers:**
- Explain process changes
- Include timelines and dependencies
- Address operational impacts

**For Compliance/Legal:**
- Be precise about security and privacy
- Document controls and safeguards
- Use clear, unambiguous language`,
  checklist: [
    'Start with an executive summary',
    'Use simple words and short sentences',
    'Write in active voice',
    'Define technical jargon',
    'Include specific metrics and timelines',
  ],
});

/**
 * React Component Patterns Skill
 */
export const reactPatternsSkill: Skill = defineSkill({
  name: 'react-patterns',
  description: 'Modern React component patterns and best practices',
  keywords: ['react', 'components', 'hooks', 'jsx', 'tsx'],
  license: 'MIT',
  compatibility: 'opencode',
  metadata: {
    category: 'development',
  },
  whatIDo: 'I help you write modern React components using best practices, hooks, and proven design patterns',
  whenToUseMe: 'Use when building React applications, creating new components, or refactoring existing React code',
  instructions: `## Component Structure

\`\`\`typescript
// Prefer arrow function components with hooks
export const MyComponent = ({ name, onAction }: Props) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  return (
    <div>
      {/* JSX */}
    </div>
  );
};
\`\`\`

## Patterns

### 1. Container/Presenter Pattern
Separate logic from presentation:

\`\`\`typescript
// Container (logic)
function UserProfileContainer() {
  const { data, loading } = useUser();
  return <UserProfile data={data} loading={loading} />;
}

// Presenter (UI)
function UserProfile({ data, loading }: Props) {
  if (loading) return <Spinner />;
  return <div>{data.name}</div>;
}
\`\`\`

### 2. Custom Hooks
Extract reusable logic:

\`\`\`typescript
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}
\`\`\`

### 3. Compound Components
Components that work together:

\`\`\`typescript
function Tabs({ children }) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

Tabs.List = function TabsList({ children }) {
  return <div role="tablist">{children}</div>;
};

Tabs.Tab = function Tab({ index, children }) {
  const { activeTab, setActiveTab } = useTabsContext();
  return (
    <button onClick={() => setActiveTab(index)}>
      {children}
    </button>
  );
};
\`\`\`

## Best Practices

1. **Use TypeScript** - Type your props and state
2. **Keep Components Small** - Single responsibility
3. **Avoid Prop Drilling** - Use Context or state management
4. **Memoize Expensive Calculations** - useMemo, useCallback
5. **Test Components** - Unit and integration tests`,
  checklist: [
    'Use TypeScript for type safety',
    'Keep components small and focused',
    'Use custom hooks for reusable logic',
    'Avoid prop drilling with Context',
    'Memoize expensive calculations',
    'Write unit and integration tests',
  ],
});

/**
 * Example skill registry for demonstration
 */
export const exampleSkills: Record<string, Skill> = {
  'typescript-tdd': typescriptTddSkill,
  'plain-english': plainEnglishSkill,
  'react-patterns': reactPatternsSkill,
};
