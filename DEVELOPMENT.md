# Development Guide

## Available Scripts

### Development

```bash
npm run dev          # Start development server
npm run dev:clean    # Clean build artifacts then start dev server
```

### Production Build

```bash
npm run build        # Build for production
npm run build:clean  # Clean build artifacts then build for production
npm run start        # Start production server (after build)
```

### Cleaning

```bash
npm run clean        # Remove .next build artifacts
```

### Testing

```bash
npm test             # Run all unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:e2e     # Run end-to-end tests with Playwright
npm run test:all     # Run all tests (unit + e2e)
```

### Code Quality

```bash
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking (fast, no build artifacts)
```

**Tip**: Use `npm run type-check` during development to verify TypeScript without running a full build that could interfere with your dev server.

## Common Issues

### "Cannot find module './611.js'" after running build

**Problem**: After running `npm run build`, the dev server (`npm run dev`) fails with module not found errors.

**Solution**: Next.js build artifacts in `.next` directory can conflict between production build and development mode. Use one of these approaches:

1. **Quick fix**: Run `npm run clean` before switching between build and dev modes

   ```bash
   npm run build       # Build for production
   npm run clean       # Clean artifacts
   npm run dev         # Now dev mode works
   ```

2. **Automatic cleanup**: Use the clean variants of commands
   ```bash
   npm run build:clean # Builds with fresh artifacts
   npm run dev:clean   # Starts dev with fresh artifacts
   ```

### When to clean

You should run `npm run clean` when:

- Switching from `npm run build` to `npm run dev`
- Experiencing webpack module errors
- Getting "Cannot find module" errors
- After major dependency updates
- When things just "feel broken" 😅

## Workflow Recommendations

### Daily Development

```bash
npm run dev         # Just use regular dev mode
```

### Testing Production Build

```bash
npm run build       # Build production (automatically cleans first)
npm run start       # Test production build
npm run clean       # Clean up after testing (optional - dev will work anyway)
npm run dev         # Back to development
```

**Note**: The `build` command now automatically cleans before building, so you don't need to manually clean when switching back to dev mode.

### Pre-Deployment

```bash
npm run test:all    # Run all tests
npm run build:clean # Fresh production build
```

## Git Hooks

Pre-commit hooks automatically run:

1. `lint-staged` - Formats and lints staged files
2. `npm test` - Runs test suite

If you need to bypass hooks (not recommended):

```bash
git commit --no-verify
```
