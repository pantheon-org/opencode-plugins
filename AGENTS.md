# AGENTS.md

This document contains important rules and guidelines for AI agents working on this codebase.

## Arrow Functions Only

**Use arrow functions exclusively. Never use named function declarations or classes.**

### Good

```typescript
// Single function per module - arrow function
export const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// Async arrow function
export const fetchData = async (id: string): Promise<Data> => {
  const response = await api.get(`/data/${id}`);
  return response.data;
};
```

### Bad

```typescript
// NEVER use named function declarations
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// NEVER use classes
class DataFetcher {
  async fetch(id: string): Promise<Data> {
    return api.get(`/data/${id}`);
  }
}
```

### Rationale

- Arrow functions have lexical `this` binding (no binding issues)
- Consistent syntax for both sync and async functions
- Better type inference in TypeScript
- No function hoisting surprises
- Uniform codebase style

## Code Organization Rules

### 1. One Function Per Module Maximum

- Each `.ts` file MUST export at most ONE function or class
- Each module should have a single, well-defined responsibility
- This promotes modularity, testability, and code reuse

**BAD**:

```typescript
// math-utils.ts
export function add(a: number, b: number): number { ... }
export function subtract(a: number, b: number): number { ... }
export function multiply(a: number, b: number): number { ... }
```

**GOOD**:

```typescript
// add.ts
export function add(a: number, b: number): number { ... }

// subtract.ts
export function subtract(a: number, b: number): number { ... }

// index.ts (barrel)
export { add } from './add';
export { subtract } from './subtract';
```

### Exceptions

Private helper functions that are only used by the main exported function may be defined in the same file, but they must
not be exported:

```typescript
// validators/is-valid-email.ts

// Private helper - not exported
const hasValidDomain = (email: string): boolean => {
  return email.includes("@") && email.split("@")[1].includes(".");
};

// Single exported function
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && hasValidDomain(email);
};
```

### File Naming

- Use kebab-case for file names: `calculate-total.ts`, `format-currency.ts`
- Match the file name to the exported function name

### Rationale

- Maximum code discoverability
- Easy to locate specific functions
- Clear module boundaries
- Simplifies code review (one concern per file)
- Better tree-shaking for bundlers
- Easier testing (isolated units)

### 2. Barrel Module Pattern

- Use barrel exports (`index.ts`) to expose public API of a directory
- Each subdirectory should have an `index.ts` that re-exports its children
- Consumers should import from the barrel, not individual files

**BAD**:

```typescript
// Importing from specific files
import { add } from "./utils/math/add";
import { subtract } from "./utils/math/subtract";
```

**GOOD**:

```typescript
// foo/index.ts
export { add } from "./add";
export { subtract } from "./subtract";
export { multiply } from "./multiply";

// consumer.ts
import { add, subtract } from "./foo"; // Not './foo/add'
```

### Import Conventions

- Always import from barrel exports when available
- Only import from specific files when the item is not exported from the barrel
- Avoid deep relative imports (e.g., `../../../foo/bar/baz`)

### Structure

```
src/
├── utils/
│   ├── calculate-total.ts
│   ├── format-currency.ts
│   ├── retry.ts
│   └── index.ts          # Barrel: re-exports all utils
```

### Barrel File Pattern

```typescript
// utils/index.ts
export { calculateTotal } from "./calculate-total";
export { formatCurrency } from "./format-currency";
export { withRetry } from "./retry";

// Re-export types separately
export type { Item, Currency } from "./types";
```

### Multiple Barrel Levels

For nested structures, create barrels at each level:

```
src/
├── scripts/
│   ├── mirror-package/
│   │   ├── parse-tag.ts
│   │   ├── validate-mirror-url.ts
│   │   └── index.ts        # Level 2 barrel
│   ├── check-repo-settings/
│   │   ├── checks.ts
│   │   └── index.ts        # Level 2 barrel
│   └── index.ts            # Level 1 barrel
```

```typescript
// scripts/mirror-package/index.ts
export { detectChanges } from "./detect-changes";
export { parseTag } from "./parse-tag";
export { validateMirrorUrl } from "./validate-mirror-url";
export type { PackageInfo, MirrorUrl } from "./types";
```

```typescript
// scripts/index.ts
export { detectChanges, parseTag, validateMirrorUrl } from "./mirror-package";
export { checkRepoSettings } from "./check-repo-settings";
```

### Rationale

- Clean import statements throughout the codebase
- Encapsulation of internal module structure
- Easy to refactor (change internal organization without affecting imports)
- Clear public API surface for each directory
- Reduces import complexity

### 3. Test Collocation

**Tests must be collocated with source files. Never use a separate `tests/` directory.**

- Test files MUST be collocated with the source files they test
- Each source file `foo.ts` should have its own `foo.test.ts` next to it
- NEVER create consolidated test files for an entire directory

**BAD**:

```
foo/
  baa-0.ts
  baa-1.ts
  foo.test.ts     <-- WRONG: consolidated test file
```

**GOOD**:

```
foo/
  baa-0.ts
  baa-0.test.ts   <-- CORRECT: test next to source
  baa-1.ts
  baa-1.test.ts   <-- CORRECT: test next to source
```

### Naming Convention

- Source file: `{module-name}.ts`
- Test file: `{module-name}.test.ts`

### Example

```typescript
// utils/retry.ts
export const withRetry = async <T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> => {
  // implementation
};
```

```typescript
// utils/retry.test.ts
import { withRetry } from "./retry";

describe("withRetry", () => {
  it("should retry on failure", async () => {
    // test implementation
  });
});
```

### Rationale

- Tests are always adjacent to the code they test
- Easy to find and maintain tests
- Refactoring is safer (tests move with source)
- No complex import path management
- Encourages testing discipline

## Test-Driven Development (TDD)

**Write tests BEFORE implementing the functionality. Follow the Red-Green-Refactor cycle.**

### The TDD Cycle

```
1. RED    → Write a failing test (describe behavior, assert expectations)
2. GREEN  → Write minimal code to make the test pass
3. REFACTOR → Clean up the code while keeping tests green
```

Repeat this cycle for every new behavior or edge case.

### Example Workflow

**Step 1: Write the failing test first**

```typescript
// utils/calculate-discount.test.ts
import { calculateDiscount } from "./calculate-discount";

describe("calculateDiscount", () => {
  it("should apply 10% discount to amounts over $100", () => {
    // Arrange
    const amount = 150;
    const discountRate = 0.1;

    // Act
    const result = calculateDiscount(amount, discountRate);

    // Assert
    expect(result).toBe(15);
  });

  it("should return 0 discount for amounts at or below $100", () => {
    expect(calculateDiscount(100, 0.1)).toBe(0);
    expect(calculateDiscount(50, 0.1)).toBe(0);
  });
});
```

Run tests: `bun test calculate-discount.test.ts` Expected: Tests FAIL (function doesn't exist yet) → RED

**Step 2: Implement minimal code to pass**

```typescript
// utils/calculate-discount.ts
export const calculateDiscount = (amount: number, rate: number): number => {
  if (amount <= 100) return 0;
  return amount * rate;
};
```

Run tests: `bun test calculate-discount.test.ts` Expected: Tests PASS → GREEN

**Step 3: Refactor (if needed)**

No refactoring needed for this simple function. Move to next test case or feature.

### Iterative Development

Continue adding test cases one at a time:

```typescript
// Additional test case (RED)
it("should handle zero discount rate", () => {
  expect(calculateDiscount(200, 0)).toBe(0);
});

// Update implementation (GREEN)
export const calculateDiscount = (amount: number, rate: number): number => {
  if (amount <= 100 || rate <= 0) return 0;
  return amount * rate;
};

// Add edge case test (RED)
it("should handle negative amounts gracefully", () => {
  expect(calculateDiscount(-50, 0.1)).toBe(0);
});

// Update implementation (GREEN)
export const calculateDiscount = (amount: number, rate: number): number => {
  if (amount <= 100 || rate <= 0 || amount < 0) return 0;
  return amount * rate;
};

// Refactor: Simplify the logic
export const calculateDiscount = (amount: number, rate: number): number => {
  if (amount <= 100 || rate <= 0) return 0;
  return amount * rate;
};
```

### Rules

1. **Never write production code without a failing test first**
2. **Write only enough test code to fail** (start with the assertion you want)
3. **Write only enough production code to pass** (no speculative features)
4. **Tests must fail for the right reason** (not compilation errors)
5. **Keep tests fast** (< 100ms per test ideally)
6. **One test per behavior** (edge cases, happy path, error cases)

### Test Structure (AAA Pattern)

```typescript
it("should validate email format", () => {
  // Arrange: Set up inputs
  const invalidEmail = "not-an-email";

  // Act: Execute the function
  const result = isValidEmail(invalidEmail);

  // Assert: Verify the outcome
  expect(result).toBe(false);
});
```

### Benefits of TDD

- **Design pressure**: Forces you to think about API design before coding
- **Confidence**: Every line of production code is covered by a test
- **Documentation**: Tests serve as executable documentation
- **Refactoring safety**: Change implementation with confidence
- **Debugging time**: Catch issues immediately, not in production
- **Scope control**: Prevents over-engineering and gold-plating

### Anti-Patterns

```typescript
// BAD: Writing implementation before tests
export const complexLogic = () => {
  /* 50 lines of code */
};
// Now try to figure out how to test this...

// BAD: Writing tests after the fact
// Tests become "happy path" verification rather than design tool

// BAD: Testing implementation details instead of behavior
it("should call the database", () => {
  const spy = jest.spyOn(db, "query");
  getUsers();
  expect(spy).toHaveBeenCalled(); // Testing HOW, not WHAT
});

// GOOD: Testing behavior
it("should return all active users", async () => {
  const users = await getUsers({ status: "active" });
  expect(users).toHaveLength(3);
  expect(users.every((u) => u.status === "active")).toBe(true);
});
```

## Testing Requirements

- Every public function must have corresponding test coverage
- Test files must follow the naming convention: `{source-file}.test.ts`
- Use descriptive test names that explain the behavior being tested
- Test both success and error cases

## Directory Structure Example

```
libs/
  workflows/
    src/
      utils/
        index.ts
        string-utils.ts
        string-utils.test.ts
        math-utils.ts
        math-utils.test.ts
        date-utils.ts
        date-utils.test.ts
```

## Quick Reference

| Convention         | Rule                                                  |
| ------------------ | ----------------------------------------------------- |
| Functions          | Arrow functions only (`const fn = () => {}`)          |
| Classes            | Never use classes                                     |
| Named functions    | Never use `function` keyword                          |
| Tests              | Collocated: `{module}.test.ts` next to `{module}.ts`  |
| TDD                | Write tests BEFORE code. Red → Green → Refactor cycle |
| Functions per file | Maximum 1 exported function per module                |
| Exports            | Use barrel files (`index.ts`) for clean imports       |
| File naming        | Kebab-case matching function name                     |
