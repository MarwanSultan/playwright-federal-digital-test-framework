# Digital VA.gov Test Automation Pipeline

[![Node.js](https://img.shields.io/badge/Node.js-20+-brightgreen)]() [![Playwright](https://img.shields.io/badge/Playwright-1.57+-blue)]() [![Jest](https://img.shields.io/badge/Jest-29.7-red)]() [![License](https://img.shields.io/badge/License-ISC-informational)]()

A comprehensive, enterprise-grade test automation framework for **digital.va.gov** built with modern tools and agile + CI/CD best practices. This pipeline enables continuous delivery through automated testing across multiple dimensions: unit tests, API contracts, end-to-end (E2E), accessibility (a11y), performance, and security.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Project Overview](#project-overview)
- [Architecture & Test Pyramid](#architecture--test-pyramid)
- [Running Tests](#running-tests)
- [CI/CD Pipeline](#cicd-pipeline)
- [Agile Testing Practices](#agile-testing-practices)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [Code Quality & Standards](#code-quality--standards)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

---

## Quick Start

### Prerequisites

- **Node.js** 20+ and **npm** 10+
- **Git** for version control
- **VS Code** (recommended) with Playwright Test for VS Code extension

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd digital_va_gov_automation_pipeline

# Install dependencies
npm install

# Install Playwright browsers (required once)
npx playwright install

# Verify setup by running smoke tests
npm run test:smoke
```

### First Test Run

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in debug mode with visual step-through
npm run test:e2e:debug
```

---

## Project Overview

This test automation pipeline is built on **agile** and **CI/CD principles**, ensuring that:

✅ **Tests are first-class citizens** in the development lifecycle  
✅ **Automated checks gate every change** through the pipeline  
✅ **Feedback is fast** with parallelized, intelligent test execution  
✅ **Quality metrics** are continuously monitored and reported  
✅ **Security, accessibility, and performance** are non-negotiable

### Key Technologies

| Tool                  | Purpose                                   | Version    |
| --------------------- | ----------------------------------------- | ---------- |
| **Playwright**        | Cross-browser E2E & UI automation         | 1.57+      |
| **Jest**              | Unit tests, API contract testing, mocking | 29.7+      |
| **TypeScript**        | Type-safe test code                       | 5.3+       |
| **ESLint + Prettier** | Code linting and formatting               | Latest     |
| **Axe Core**          | Automated accessibility testing (WCAG)    | 4.8+       |
| **K6**                | API load/performance testing              | Latest     |
| **Lighthouse CI**     | Performance & PWA audits                  | Latest     |
| **SonarQube**         | Code quality & security analysis          | Integrated |

---

## Architecture & Test Pyramid

This framework follows the **test pyramid** pattern to optimize speed, reliability, and cost:

```
                    🚀 E2E & Integration Tests (10%)
                  Critical user journeys, cross-service flows

                  ⚙️ API & Contract Tests (20%)
              Service endpoints, request/response validation

      ✔️ Unit Tests (70%)
   Business logic, utility functions, component behavior
```

### Test Categories

| Category                 | Location                          | Tools            | Purpose                                             | Execution Speed |
| ------------------------ | --------------------------------- | ---------------- | --------------------------------------------------- | --------------- |
| **Unit**                 | `tests/unit/`                     | Jest             | Test individual functions/modules in isolation      | ~100ms          |
| **API**                  | `tests/api/`                      | Jest + Supertest | Validate API contracts, endpoints, response schemas | ~500ms          |
| **Smoke**                | `tests/smoke/`                    | Playwright       | Critical happy-path scenarios; fast gate checks     | ~2s per test    |
| **E2E**                  | `tests/e2e/`                      | Playwright       | Complete user workflows across browsers             | ~5s per test    |
| **Accessibility (a11y)** | `tests/e2e/accessibility.spec.ts` | Playwright + Axe | WCAG 2.1 compliance validation                      | ~3s per test    |
| **Performance**          | `k6/`                             | K6 + Lighthouse  | Load testing, performance profiling, PWA audits     | Varies          |

---

## Running Tests

### By Test Type

```bash
# Unit Tests (Jest) - Fast feedback on code changes
npm run test:unit

# Watch mode for TDD workflows
npm run test:watch

# API Contract Tests (Jest)
npm run test:api

# Smoke Tests (Playwright) - Critical path validation
npm run test:smoke

# End-to-End Tests (Playwright)
npm run test:e2e

# Accessibility Tests
npm run test:a11y

# Performance & Load Tests (K6)
npm run test:performance
```

### Advanced Options

```bash
# Run with coverage report (HTML + terminal summary)
npm run test

# Debug mode - step through tests interactively
npm run test:e2e:debug

# Run specific test file
npx playwright test tests/smoke/homepage.spec.ts

# Run tests matching a pattern
npx playwright test --grep "login"

# Run only in Chrome (faster CI feedback)
npx playwright test --project=chromium

# Headed mode (watch browser interaction)
npx playwright test --headed

# Slow down execution for debugging (10x slower)
npx playwright test --headed --headed-timeout=30000
```

### Test Reports

After test runs, reports are generated:

```bash
# View Playwright HTML report
npx playwright show-report

# View Jest coverage report
open coverage/index.html
```

---

## CI/CD Pipeline

This project uses a **staged CI/CD approach**, running progressively comprehensive test suites based on the event and branch:

### Pipeline Stages

```
┌─────────────────────────────────────────────────────┐
│ Pull Request Created/Updated                        │
├─────────────────────────────────────────────────────┤
│ Stage 1: LINT & SECURITY CHECK                      │
│   • ESLint + Prettier checks                        │
│   • Dependency vulnerability scan (npm audit)       │
│   └─ FAIL: Block PR until resolved                  │
├─────────────────────────────────────────────────────┤
│ Stage 2: UNIT TESTS                                 │
│   • Jest unit tests with coverage thresholds        │
│   • Run in parallel across CI workers               │
│   └─ FAIL: Block PR, require fixes + re-review     │
├─────────────────────────────────────────────────────┤
│ Stage 3: SMOKE TESTS                                │
│   • Critical path E2E scenarios                     │
│   • Detect obvious regressions early                │
│   └─ FAIL: Block merge, investigate                │
│                                                     │
│  ✅ PR APPROVED & READY TO MERGE                    │
├─────────────────────────────────────────────────────┤
│ On Merge to Main: FULL TEST SUITE                   │
│   • All E2E tests across 3 browsers                 │
│   • Accessibility compliance checks                 │
│   • API contract validation                         │
│   • Performance/Lighthouse audits                   │
│   └─ If any fail → automated rollback alert         │
├─────────────────────────────────────────────────────┤
│ Pre-Production: SYNTHETIC MONITORING                │
│   • Load testing (K6)                               │
│   • Canary checks on critical flows                 │
│   └─ Continuous monitoring post-deploy              │
└─────────────────────────────────────────────────────┘
```

### NPM Scripts for CI

```bash
# PR validation (fast feedback loop)
npm run ci:pr
# Runs: lint + unit tests + smoke tests (~5-10 minutes)

# Pre-merge validation (comprehensive)
npm run ci:merge
# Runs: lint + full unit coverage + all E2E + accessibility

# Security validation (weekly/on-demand)
npm run ci:security
# Runs: npm audit + ESLint security rules
```

### Environment-Specific Configuration

Tests are configured to run against **staging/production** URLs:

```typescript
// Set via environment variables or .env file
baseURL: process.env.TEST_URL || 'https://digital.va.gov';
```

Before production deployment:

1. Run full test suite in staging
2. Validate synthetic monitoring probes
3. Execute manual smoke tests on canary deployment
4. Monitor error rates and performance metrics

---

## Agile Testing Practices

This framework embeds agile testing principles throughout the development lifecycle:

### 1. **Definition of Done (DoD)**

A feature is NOT considered complete until:

- [ ] Code reviewed and approved
- [ ] Unit tests written (TDD style) with >80% coverage
- [ ] Acceptance criteria automated as E2E tests
- [ ] Accessibility tests added and passing (WCAG 2.1 AA)
- [ ] Performance benchmarks validated
- [ ] Documentation updated
- [ ] CI/CD pipeline passes all checks
- [ ] Manual QA sign-off (critical features)

### 2. **Test-Driven Development (TDD)**

Follow the **Red-Green-Refactor** cycle:

```typescript
// 1. RED: Write failing test first
test('should validate email format', () => {
  expect(validateEmail('invalid')).toBe(false);
  expect(validateEmail('user@example.com')).toBe(true);
});

// 2. GREEN: Implement minimal code to pass
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 3. REFACTOR: Improve code quality while keeping tests green
// (extract to utils, add type safety, etc.)
```

### 3. **Behavior-Driven Development (BDD)**

Use Gherkin-style comments for complex E2E scenarios:

```typescript
test('User login flow', async ({ page }) => {
  // Given a registered user
  await page.goto('/login');

  // When they enter valid credentials
  await page.fill('input[name="username"]', 'user@va.gov');
  await page.fill('input[name="password"]', 'secure-pass');
  await page.click('button:has-text("Sign In")');

  // Then they are redirected to the dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('[data-testid="greeting"]')).toContainText(
    'Welcome',
  );
});
```

### 4. **Sprint-Based Test Planning**

**Each Sprint:**

- Allocate **15-20%** of sprint capacity for testing & test maintenance
- Create explicit test tasks in the sprint backlog
- Review and refactor flaky tests weekly
- Update test documentation as acceptance criteria evolve

**Risk-Based Testing:**

- Prioritize tests for high-risk features (authentication, payments, data)
- Automate critical paths; keep manual testing for edge cases
- Periodically audit test coverage vs. business risk map

### 5. **Continuous Feedback Loop**

**Daily:**

- Check CI/CD pipeline status in standup
- Triage failed tests immediately; don't accumulate debt
- Share test insights with developers

**Sprint Retrospective:**

- Review test flakiness trends
- Discuss automation ROI (cost vs. bugs caught)
- Identify tests to remove, refactor, or add

---

## Project Structure

```
digital_va_gov_automation_pipeline/
├── README.md                          # This file
├── CONTRIBUTING.md                    # Contribution guidelines
├── package.json                       # Dependencies & npm scripts
├── tsconfig.json                      # TypeScript configuration
├── playwright.config.ts               # Playwright test config
├── jest.config.js                     # Jest test config
├── lighthouse.config.js               # Performance audit config
├── sonar-project.properties           # SonarQube config
│
├── tests/
│   ├── setup.ts                       # Global test setup/teardown
│   ├── seed.spec.ts                   # Data seeding for tests
│   │
│   ├── unit/                          # Jest unit tests
│   │   └── example.test.ts
│   │
│   ├── api/                           # Jest API contract tests
│   │   ├── comprehensive-api.spec.ts
│   │   └── integration.spec.ts
│   │
│   ├── smoke/                         # Quick E2E smoke tests
│   │   ├── homepage.spec.ts           # Core site functionality
│   │   └── login.spec.ts              # Auth flow validation
│   │
│   ├── e2e/                           # Full E2E workflows (Playwright)
│   │   ├── accessibility.spec.ts      # WCAG compliance (Axe)
│   │   └── api-contracts.spec.ts      # End-to-end + API validation
│   │
│   ├── fixtures/                      # Playwright fixtures & setup
│   │   └── ui.fixture.ts
│   │
│   ├── types/                         # TypeScript type definitions
│   │   └── supertest.d.ts
│   │
│   └── README.md                      # Test documentation
│
├── k6/                                # Performance & load tests
│   ├── load-test.js                   # General load testing
│   └── api-load-test.js               # API-specific load tests
│
├── specs/                             # Test specifications & plans
│   └── README.md
│
├── playwright-report/                 # Playwright test results (auto-generated)
│   └── index.html
│
└── test-results/                      # Detailed test logs (auto-generated)
```

### Key Files Explained

- **tests/setup.ts**: Global hooks for test initialization, auth tokens, database seeding
- **tests/fixtures/ui.fixture.ts**: Reusable Playwright fixtures (logged-in users, test data)
- **playwright.config.ts**: Cross-browser config, retry logic, reporter settings
- **jest.config.js**: Unit test framework, coverage thresholds, module mapping
- **CONTRIBUTING.md**: Guidelines for adding new tests and code standards

---

## Configuration

### Environment Variables

Create a `.env` file in the project root (see `.env.example` if provided):

```bash
# Test Environment URLs
TEST_URL=https://staging.digital.va.gov
TEST_TIMEOUT=30000

# Credentials (use secrets manager in production)
TEST_USER_EMAIL=test@va.gov
TEST_USER_PASSWORD=****

# API Testing
API_BASE_URL=https://api.staging.digital.va.gov
API_AUTH_TOKEN=****

# Performance Thresholds
LIGHTHOUSE_MIN_SCORE=85
PERFORMANCE_BUDGET_MS=3000
```

### Playwright Configuration

Edit [playwright.config.ts](playwright.config.ts) to:

- Add/remove browsers: `projects` array
- Configure retry strategy: `retries`, `workers`
- Adjust timeouts: `use.timeout`
- Enable/disable tracing: `trace: 'on-first-retry'`

### Jest Configuration

Edit [jest.config.js](jest.config.js) to:

- Set coverage thresholds (currently >80%)
- Configure test environment (`jsdom` for unit, `node` for API)
- Add test path aliases

---

## Code Quality & Standards

### Linting & Formatting

```bash
# Check for style violations
npm run lint

# Auto-fix style issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check format without modifying
npm run format:check
```

### Coverage Requirements

- **Unit Tests**: >80% coverage (statements, branches, functions, lines)
- **Critical Paths**: 100% coverage
- API endpoints: All happy path + error scenarios

View coverage:

```bash
npm run test
open coverage/index.html
```

### Security & Vulnerabilities

```bash
# Audit npm dependencies
npm run security:audit

# Integrate with SonarQube for deeper analysis
npm run sonar  # (if configured)
```

---

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on:

- Setting up your development environment
- Code of conduct
- Pull request workflow
- Test requirements
- Commit message conventions
- Review process

**Quick Summary:**

1. Create a feature branch: `git checkout -b feature/test-xxx`
2. Write tests FIRST (TDD)
3. Implement feature to pass tests
4. Run `npm run ci:pr` locally to verify
5. Push and create a pull request
6. Address review feedback
7. Merge after approvals and CI passes

---

## Troubleshooting

### Common Issues

#### Tests Timing Out

```bash
# Increase timeout for slow environments
npx playwright test --timeout=60000

# Check if app is running/reachable
curl https://digital.va.gov
```

#### Flaky Tests

Flaky tests are indicators of test or application instability:

```bash
# Run a specific test multiple times to identify flakiness
for i in {1..10}; do npx playwright test tests/smoke/login.spec.ts; done

# View test trace for failed runs
npx playwright show-trace trace.zip
```

**Solutions:**

- Add explicit waits: `await page.waitForSelector(selector, { timeout: 5000 })`
- Use more stable locators (data-testid > CSS > XPath)
- Check for race conditions or timing assumptions
- Consider marking as `slow` or increasing retries for that test

#### Port Already in Use

```bash
# Kill the process using the port
lsof -i :3000
kill -9 <PID>
```

#### Playwright Browsers Not Installed

```bash
npx playwright install

# Or install specific browser
npx playwright install chromium
```

---

## Resources

### Documentation

- [Playwright Docs](https://playwright.dev) - E2E testing framework
- [Jest Docs](https://jestjs.io) - Unit testing & mocking
- [Axe Accessibility](https://www.deque.com/axe/) - WCAG testing
- [K6 Load Testing](https://k6.io) - Performance & stress testing
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance auditing

### Agile & CI/CD Best Practices

- [Test Pyramid by Mike Cohn](https://martinfowler.com/bliki/TestPyramid.html)
- [Continuous Integration by Martin Fowler](https://martinfowler.com/articles/continuousIntegration.html)
- [Agile Testing Manifesto](http://agilemanifesto.org)
- [WCAG 2.1 Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Internal Documentation

- [Test Plan](digital_va_gov_test_plan.md) - Comprehensive testing strategy
- [Test Specifications](specs/) - Domain-specific test scenarios

---

## License

This project is licensed under the ISC License. See `LICENSE` file for details.

---

**Last Updated:** January 2026  
**Maintained By:** Marwan Sultan
