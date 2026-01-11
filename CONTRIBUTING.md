# Contributing to digital.va.gov Test Automation

Thank you for contributing to the VA's digital services test automation framework! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Testing Requirements](#testing-requirements)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Security Guidelines](#security-guidelines)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. All contributors are expected to:

- Be respectful and inclusive
- Welcome constructive feedback
- Focus on what benefits the community
- Show empathy to community members

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm 10 or later
- Git
- VS Code (recommended)

### Setup Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd digital_va_gov_automation_pipeline

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run tests to verify setup
npm run test
```

### Recommended VS Code Extensions

- ESLint
- Prettier
- Playwright Test for VS Code
- Thunder Client (API testing)

## Development Workflow

### Create a Feature Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
# Format: feature/ISSUE-###-short-description
git checkout -b feature/ISSUE-123-add-login-tests
```

### Make Your Changes

Follow the established project structure:

```
tests/
  ├── smoke/          # Quick smoke tests
  ├── e2e/            # Full E2E tests
  ├── unit/           # Jest unit tests
  └── fixtures/       # Test data and mocks

src/
  ├── helpers/        # Test helper functions
  ├── config/         # Configuration files
  └── utils/          # Utility functions

k6/                   # Load/performance tests
```

### Run Local Tests Before Committing

```bash
# Run all checks locally
npm run ci:pr

# Or individual commands
npm run lint
npm run test:unit
npm run test:smoke
npm run test:a11y
```

## Testing Requirements

### Unit Tests

- Minimum 70% code coverage
- Test both happy path and error cases
- Use descriptive test names

```typescript
describe('MyFunction', () => {
  it('should return expected value when given valid input', () => {
    expect(myFunction('test')).toBe('expected');
  });

  it('should throw error when given invalid input', () => {
    expect(() => myFunction(null)).toThrow();
  });
});
```

### E2E Tests (Playwright)

- Test critical user journeys
- Include accessibility assertions
- Use proper waits and selectors

```typescript
test('should complete user login flow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@va.gov');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

### Accessibility Tests

All UI changes require accessibility testing:

- Run `npm run test:a11y`
- Test with keyboard navigation
- Test with screen reader

### Contract/API Tests

API changes require contract tests:

- Validate response schema
- Test error scenarios
- Verify authentication

### Performance Tests

- Must not negatively impact Lighthouse scores
- Document any performance trade-offs

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only
- **style**: Changes that don't affect code meaning (formatting, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Code change that improves performance
- **test**: Adding or updating tests
- **ci**: Changes to CI/CD configuration
- **security**: Security improvements

### Examples

```
feat(login): add multi-factor authentication support

Implement TOTP-based MFA for enhanced security.
- Add MFA verification page
- Add TOTP generation and validation
- Update session management

Closes #123
```

```
fix(accessibility): improve keyboard navigation

Ensure all interactive elements are keyboard accessible.
- Add proper tab order
- Add focus indicators
- Add skip links

Fixes #456
```

## Pull Request Process

### Before Submitting PR

1. **Ensure all local tests pass**

   ```bash
   npm run ci:pr
   ```

2. **Update documentation** if needed
   - Update README
   - Add JSDoc comments
   - Update test plan if necessary

3. **Check for secrets**
   - No API keys or passwords
   - No PII in test data
   - No credentials in logs

4. **Verify code formatting**
   ```bash
   npm run format
   npm run lint:fix
   ```

### PR Review Checklist

Your PR should:

- [ ] Have a descriptive title
- [ ] Include a clear description
- [ ] Link related issues
- [ ] Include test coverage
- [ ] Pass all CI checks
- [ ] Have no merge conflicts
- [ ] Follow code standards
- [ ] Include accessibility testing
- [ ] Have security review if applicable

### After PR Approval

1. Ensure all conversations are resolved
2. Merge to main (when all checks pass)
3. Delete the feature branch
4. Watch for any post-merge issues

## Code Standards

### TypeScript/JavaScript

```typescript
// Use meaningful variable names
const userAuthenticationToken = getAuthToken();

// Use arrow functions
const handleClick = () => {
  /* ... */
};

// Use const by default, let only when needed
const defaultTimeout = 5000;
let retryCount = 0;

// Add type annotations
function getUserData(userId: string): Promise<User> {
  // ...
}

// Use descriptive comments for complex logic
// Calculate exponential backoff: delay = baseDelay * (2 ^ attempt)
const delayMs = 100 * Math.pow(2, attempt);
```

### Test Files

```typescript
// Organize tests with describe blocks
describe('Feature: User Authentication', () => {
  describe('Login Page', () => {
    it('should display form elements', async () => {
      // Arrange
      await page.goto('/login');

      // Act & Assert
      await expect(page.locator('input[name="email"]')).toBeVisible();
    });
  });
});

// Use descriptive test names
it('should validate email format before submission');
it('should display error message when credentials are invalid');
it('should redirect to dashboard after successful login');
```

### Accessibility

```typescript
// Always include accessibility attributes
<button aria-label="Close dialog">×</button>

// Use semantic HTML
<nav> <main> <footer> // not <div role="navigation">

// Ensure keyboard navigation
test('should be navigable with keyboard', async ({ page }) => {
  await page.keyboard.press('Tab');
  await expect(page.locator('button').first()).toBeFocused();
});
```

## Security Guidelines

### What NOT to Do

- ❌ Never commit secrets, API keys, or credentials
- ❌ Never use real user data in tests
- ❌ Never hardcode sensitive information
- ❌ Never skip security scans
- ❌ Never log sensitive data

### What TO Do

- ✅ Use environment variables for configuration
- ✅ Use test fixtures and mock data
- ✅ Use .gitignore for sensitive files
- ✅ Review security scan results
- ✅ Follow OWASP guidelines
- ✅ Use HTTPS for all connections

### Environment Variables

```bash
# .env.local (never commit)
VA_API_KEY=your-key-here
TEST_USER_EMAIL=test@va.gov
STAGING_API_URL=https://staging.api.va.gov
```

## Useful Commands

```bash
# Run all PR checks locally
npm run ci:pr

# Run specific test suites
npm run test:unit
npm run test:e2e
npm run test:smoke
npm run test:a11y
npm run test:api

# Format and lint
npm run format
npm run lint
npm run lint:fix

# Performance testing
npm run test:performance

# Watch mode for development
npm run test:watch
```

## Getting Help

- 📖 Check existing documentation
- 🔍 Search closed issues and PRs
- 💬 Ask in team Slack channel
- 🐛 Open an issue for bugs
- 💡 Open a discussion for suggestions

## Continuous Integration

Our CI/CD pipeline runs on every PR and push:

### PR Pipeline (8-10 min)

- Lint & Format
- Unit Tests
- Contract Tests
- Smoke E2E
- Accessibility Scan
- Security Scan

### Merge Pipeline (30-45 min)

- All PR checks
- Full E2E suite (multi-browser)
- Lighthouse CI
- Full SAST/DAST
- Load tests
- Deploy to staging

All checks must pass before merge to main.

## Release Process

Releases are managed through GitHub Actions:

1. Staging deployment (automatic after merge)
2. Canary deployment (5% traffic) - manual trigger
3. Production deployment (100% traffic) - manual trigger

See [release.yml](.github/workflows/release.yml) for details.

## Questions or Issues?

- Create an issue in GitHub
- Ask in team communications
- Reference this guide when asking for clarification

---

**Thank you for contributing to digital.va.gov!** 🙏
