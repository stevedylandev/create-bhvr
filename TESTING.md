# Testing Guide

This project uses [Bun Test](https://bun.sh/docs/cli/test) for focused, high-value testing of core business logic.

## Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode (for development)
bun test --watch

# Run tests with coverage report
bun test --coverage
```

## Test Philosophy

This project follows a **focused testing approach** that prioritizes:

1. **High Value**: Test core business logic and data validation
2. **Fast Execution**: No slow I/O operations or complex mocking
3. **Maintainability**: Simple, reliable tests that won't break with dependencies
4. **Clarity**: Each test has a clear purpose and validates real behavior

## What We Test ✅

### **Core Utilities** (100% Coverage)
- `src/utils/try-catch.test.ts` - Error handling wrapper functionality
- `src/utils/templates.test.ts` - Template configuration and Hono code generation
- `src/utils/constants.test.ts` - Application constants validation
- `src/types.test.ts` - TypeScript type definitions and interfaces

## What We DON'T Test ❌

**CLI Functions with External Dependencies:**
- File system operations (degit, fs-extra)
- Interactive prompts (consola)
- System commands (git, bun install)
- Process management (process.exit)

**Why:** These functions are integration points with the OS and external tools. Testing them would require complex mocking that provides little value and high maintenance overhead.

## Test Configuration

### `bunfig.toml`
```toml
[test]
coverage = true
timeout = 5000

[test.env]
NODE_ENV = "test"
```

### Package Scripts
- `bun test` - Run all tests
- `bun test --watch` - Watch mode for development
- `bun test --coverage` - Generate coverage reports
