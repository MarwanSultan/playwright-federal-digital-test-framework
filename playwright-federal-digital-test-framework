# Test Plan: Agile + CI/CD for digital.va.gov

## Executive Summary

This test plan covers 12 key domain areas for digital.va.gov (Lighthouse API Library, VA SaaS/PaaS Catalog, Accessibility, Mobile Apps Hub, AI Strategy, EHRM, Digital Transformation, Web Governance, Software Factory, Secure Identity & Login, Analytics, and Communications). It prescribes Agile practices, automated test types, CI/CD pipeline stages, environments, tooling, and a phased roadmap.

---

## 1. Goals & Scope 🎯

- **Functional Correctness**: Ensure all services behave as specified
- **Security**: Validate authentication, authorization, and data protection
- **Accessibility**: All digital products comply with WCAG standards
- **Performance**: Meet response time and scalability targets
- **Reliability**: Catch regressions and prevent production incidents
- **Continuous Delivery**: Automated checks on PRs and full validations before production
- **Production Monitoring**: Synthetic monitoring and canary checks for critical flows

---

## 2. Agile Testing Approach 🧩

### Sprint-Based Testing

- Use 2-week sprints; treat testing as part of each story
- Include **Acceptance Criteria** and automated tests in the Definition of Done (DoD)
- Leverage BDD/TDD practices for critical flows (Gherkin, test-first)

### Test Backlog Management

- Maintain a prioritized **Test Backlog** with explicit risk-based priorities
- Include "test tasks" checklist in PR templates
- Allocate sprint capacity for test debt reduction and flaky test triage

### Example Acceptance Criteria Format

```gherkin
Given <precondition>
When <action>
Then <expected result>

Notes:
- Expected API response codes
- Accessibility checks required
- Performance thresholds
```

---

## 3. Test Strategy & Types (Test Pyramid) 🏗️

### Test Layers

| Layer                    | Type                          | Tools                       | Execution                 |
| ------------------------ | ----------------------------- | --------------------------- | ------------------------- |
| **Unit Tests**           | Fast, high coverage           | Jest, Mocha                 | Dev local + PR CI         |
| **Integration Tests**    | Service & persistence layer   | Integration test frameworks | Merge-to-main             |
| **Contract Tests**       | API schema validation         | Pact, OpenAPI validators    | PR + merge                |
| **API Tests**            | Auth, rate-limits, headers    | Supertest, k6               | PR + merge                |
| **E2E Tests**            | Critical user journeys        | Playwright                  | PR (smoke) + merge (full) |
| **Accessibility Tests**  | WCAG compliance               | axe-core, Pa11y             | PR + scheduled audits     |
| **Performance Tests**    | Load, response times, budgets | Lighthouse CI, k6           | Scheduled runs            |
| **Security Tests**       | SAST, DAST, SCA, IaC          | SonarQube, OWASP ZAP, Snyk  | PR + merge                |
| **Mobile Tests**         | Cross-device compatibility    | BrowserStack / device farm  | Scheduled matrix runs     |
| **Synthetic Monitoring** | Production health checks      | Custom scripts, scheduled   | Production                |

### Coverage Targets

- **Unit**: 70–90%
- **Integration**: Targeted for critical services
- **E2E**: Only critical flows (keep suite fast, < 15 min)

---

## 4. CI/CD Pipeline — Stages & Gates 🛠️

### Pipeline Architecture

```
PR Created
  ↓
[PR Pipeline: 8–10 min] ← FAST FEEDBACK
  ├─ Lint & Format Check
  ├─ Unit Tests (parallel)
  ├─ Static Analysis (SAST, fast subset)
  ├─ Dependency Scan (SCA)
  ├─ Contract Validation (OpenAPI/Pact)
  ├─ Build artifacts
  ├─ Smoke E2E + Accessibility Scan (parallel)
  └─ Publish reports
     ↓
[Gate: Lint + Unit + Contract + Smoke must PASS]
     ↓
PR Approved & Merged to main
  ↓
[Merge Pipeline: 30–45 min] ← FULL VALIDATION
  ├─ Repeat all PR checks
  ├─ Full E2E suite (cross-browser)
  ├─ Lighthouse CI & performance budgets
  ├─ Full DAST & SAST
  ├─ Load/stress tests
  ├─ Deploy to staging
  ├─ Post-deploy integration tests
  └─ Manual QA & security sign-off (if needed)
     ↓
[Gate: All tests + security sign-off]
     ↓
[Release Pipeline: Canary → Prod]
  ├─ Deploy canary (5–10% traffic)
  ├─ Run production smoke & synthetic checks
  ├─ Monitor error rates & latency
  └─ Promote to full rollout (blue/green or rolling)
```

### PR Pipeline Steps

```yaml
- Lint & Format Check (eslint, prettier)
- Unit Tests (jest --coverage)
- Static Analysis (fast SAST)
- Dependency Scan (npm audit, Snyk)
- Contract Validation (openapi-validator)
- Build artifacts
- Playwright Smoke (critical paths, headless)
- Accessibility Scan (axe, WCAG AA)
- Upload test reports (Allure, HTML)
```

### Merge-to-Main Pipeline Steps

```yaml
- [Repeat all PR steps]
- Full E2E (Chromium, Firefox, WebKit)
- Lighthouse CI (performance budgets)
- DAST (OWASP ZAP)
- Full SAST (SonarQube)
- Load Tests (k6)
- Deploy to staging
- Integration tests
- Security review & approval
```

### Release-to-Prod Pipeline Steps

```yaml
- Deploy canary (5–10%)
- Monitor health (error rate, latency, error budget)
- Run production smoke suite
- Synthetic monitoring checks
- Promote to full rollout (if all thresholds met)
- Post-deploy monitoring
```

---

## 5. Environments & Test Data 🧪

### Environment Strategy

| Environment    | Purpose                      | Data                              | Refresh               |
| -------------- | ---------------------------- | --------------------------------- | --------------------- |
| **Local Dev**  | Developer sandbox            | Fixtures, mocks, containers       | On-demand             |
| **PR Preview** | Ephemeral per-PR deployments | Synthetic, non-PHI                | Auto-cleanup after PR |
| **Staging**    | Pre-production mirror        | Production-like schema, test data | Nightly               |
| **Production** | Live service                 | Real data with access controls    | N/A                   |

### Test Data Management

- Use **ephemeral containers** and test snapshots in CI
- Employ **service virtualization** (WireMock, MSW, Pact) to decouple third-party dependencies
- Manage **sensitive data** via secrets store; redact PII in logs
- Use **production-like schema** in staging; rotate test data regularly
- Never use production PII in test suites

---

## 6. Tooling Recommendations 🔧

### Core Tools

| Category              | Tools                                     | Purpose                               |
| --------------------- | ----------------------------------------- | ------------------------------------- |
| **E2E Testing**       | Playwright                                | Critical user journeys, cross-browser |
| **API Testing**       | Supertest, k6                             | Contract, integration, load tests     |
| **Contract Tests**    | Pact, OpenAPI Validator                   | Consumer-driven contracts             |
| **Accessibility**     | axe-core, Pa11y, Lighthouse               | WCAG AA compliance, audits            |
| **Performance**       | Lighthouse CI, k6                         | Budgets, load, response times         |
| **Security Scanning** | SonarQube, OWASP ZAP, Snyk, tfsec         | SAST, DAST, SCA, IaC                  |
| **Test Reporting**    | Allure, Playwright HTML, GitHub artifacts | Test results, trends                  |
| **Observability**     | Datadog, Grafana, Prometheus              | Synthetic monitoring, metrics         |
| **Notifications**     | GitHub Actions, Slack, MS Teams           | Pipeline status, alerts               |
| **CI/CD Platform**    | GitHub Actions / GitLab CI                | Pipeline orchestration                |

### Configuration Example

- `playwright.config.ts`: Configure browsers, timeouts, retries, traces, video
- `lighthouse.config.js`: Set performance budgets (LCP, FID, CLS)
- `.github/workflows/ci.yml`: PR and merge pipelines
- `k6-script.js`: Load test scenarios
- `owasp-zap-config.yml`: DAST scanning rules

---

## 7. Accessibility & Compliance ♿

### Automation

- **WCAG AA checks** in PR pipelines (axe-core, Pa11y)
- **Color contrast**, **heading hierarchy**, **ARIA labels** validation
- **Keyboard navigation** scripting for critical flows

### Manual Review

- Include a11y expert in manual QA for complex UI patterns
- Test with assistive technology (screen readers, voice control)

### Governance

- **Accessibility is part of DoD** for all UI stories
- Create a11y tickets for violations exceeding threshold
- Document remediation steps in commits
- Maintain a11y scoreboard / dashboard

---

## 8. Security & Federal Compliance 🔐

### Scanning & Controls

- **SAST** (SonarQube, CodeQL): code vulnerabilities
- **DAST** (OWASP ZAP): runtime vulnerabilities
- **SCA** (Snyk, npm audit): dependency vulnerabilities
- **IaC** (tfsec): infrastructure misconfigurations
- **Secrets scanning**: Prevent credential leaks

### Compliance

- Enforce **FedRAMP/FISMA controls** in environment provisioning
- Manage secrets via **secure vaults** (AWS Secrets Manager, HashiCorp Vault)
- Require **security sign-off** for major releases
- Perform **annual penetration tests** and audit logs

### Required Gates

- No high-severity SAST/DAST findings in PRs
- All dependencies scanned for known CVEs
- Security review approval before production deploy

---

## 9. Flakiness & Maintenance Strategy 🧹

### Flaky Test Policy

- **Retry strategy**: Rerun up to 3 times before marking as failed
- **Quarantine unstable tests**: Move to a separate suite, create bug ticket
- Investigate root cause (timing issues, async operations, test isolation)
- Fix or remove within the next sprint

### Test Hygiene Sprints

- Allocate **2–5% of sprint capacity** to test debt reduction
- Review and refactor aging test code
- Remove or consolidate redundant tests
- Update assertions for maintainability

### Metrics to Track

- Flaky test rate (target: < 1%)
- Mean time to fix (MTTF) for broken tests
- Test suite execution time (target: PR < 15 min, merge < 45 min)
- Test coverage drift (trend weekly)

---

## 10. Metrics & Dashboards 📊

### Key Metrics

| Metric                                    | Target    | Review Cadence |
| ----------------------------------------- | --------- | -------------- |
| PR test pass rate                         | > 95%     | Weekly         |
| Pipeline duration (PR)                    | < 15 min  | Weekly         |
| Pipeline duration (merge)                 | < 45 min  | Weekly         |
| Flaky test rate                           | < 1%      | Weekly         |
| Unit test coverage                        | 70–90%    | Per sprint     |
| E2E critical flow coverage                | 100%      | Per release    |
| Mean time to detect failure               | < 5 min   | Weekly         |
| Mean time to fix (MTTF)                   | < 4 hours | Weekly         |
| Accessibility violations found (pre-prod) | 0         | Per sprint     |
| Security findings (high/critical)         | 0 in prod | Per release    |
| Performance budget compliance             | 100%      | Per PR         |
| Lighthouse score (avg)                    | ≥ 85      | Per sprint     |

### Dashboard Components

- **Pipeline status** (pass/fail rates, duration trends)
- **Test coverage** (line, branch, feature coverage)
- **Flakiness metrics** (trending flaky tests, retry rates)
- **Performance** (Lighthouse scores, response times, error rates)
- **Security** (SAST/DAST findings, CVE count)
- **Accessibility** (automated violations, manual audit findings)
- **Release velocity** (deploys per week, MTTR, incident rate)

**Tools**: Grafana, Datadog, GitHub Insights, or custom dashboards

---

## 11. Roadmap & Implementation Phases 🗺️

### Phase 0: Foundations (1–2 sprints)

**Goal**: Establish baseline testing and CI/CD gates

- [ ] Add linter & formatter (eslint, prettier)
- [ ] Implement unit test framework & baseline tests (jest)
- [ ] Add PR pipeline (lint + unit checks)
- [ ] Add contract validation for API endpoints
- [ ] Add smoke Playwright tests for login & homepage
- [ ] Configure GitHub Actions (or CI platform)
- [ ] Set up test artifact uploads (Allure/HTML reports)

**Success Criteria**: PR pipeline runs in < 10 min; all PRs gate on lint + unit + smoke

---

### Phase 1: Expand Coverage (2–4 sprints)

**Goal**: Comprehensive E2E and accessibility coverage

- [ ] Build full Playwright E2E suite (top 10–15 user journeys)
- [ ] Integrate axe-core accessibility checks in PRs
- [ ] Add Lighthouse CI & performance budgets
- [ ] Implement cross-browser matrix tests (Chromium, Firefox, WebKit)
- [ ] Add integration tests for critical services
- [ ] Configure test data & staging mirrors
- [ ] Publish coverage dashboards

**Success Criteria**: E2E suite runs in < 20 min; accessibility violations down to < 5; coverage > 80%

---

### Phase 2: Security & Performance (2–3 sprints)

**Goal**: Automate security scanning and load testing

- [ ] Add DAST scanning (OWASP ZAP) to merge pipeline
- [ ] Add SAST scanning (SonarQube/CodeQL)
- [ ] Enable SCA scanning (Snyk, npm audit) with CVE tracking
- [ ] Add IaC scanning (tfsec)
- [ ] Implement k6 load tests (API endpoints, critical paths)
- [ ] Set up scheduled perf tests (nightly)
- [ ] Integrate secrets scanning (GitGuardian, TruffleHog)
- [ ] Require security approvals for releases

**Success Criteria**: 0 high/critical SAST findings; SCA findings triaged; load tests automated

---

### Phase 3: Production Confidence (ongoing)

**Goal**: Continuous monitoring and canary deployments

- [ ] Set up production synthetic monitors (health, login, critical flows)
- [ ] Implement canary deployments (5–10% traffic)
- [ ] Establish error budget tracking & alerting
- [ ] Configure post-deploy automated tests
- [ ] Set up alerting in Slack/Teams for pipeline & production issues
- [ ] Conduct weekly test-health reviews
- [ ] Perform quarterly penetration tests & a11y audits
- [ ] Measure and report on metrics (dashboards)

**Success Criteria**: < 1% production incidents; MTTR < 30 min; user satisfaction > 90%

---

## 12. Example Priority Test Cases 🔍

### Lighthouse API Library

- **Contract Tests**: OpenAPI schema validation for all endpoints
- **Auth Tests**: Token expiry, MFA, role-based access control (RBAC)
- **Rate-Limiting**: Validate throttling & quota enforcement
- **Error Handling**: Proper 4xx/5xx responses and error payloads

### Secure Identity & Login

- **OIDC/SAML Flows**: Full authentication lifecycle
- **Session Management**: Timeout, refresh token rotation
- **MFA**: Multi-factor authentication flows (if applicable)
- **Error Paths**: Invalid credentials, expired tokens, locked accounts

### Accessibility Guidance

- **Automated Checks**: All pages pass WCAG AA (axe-core)
- **Keyboard Navigation**: All interactive elements keyboard-accessible
- **ARIA Labels**: Proper semantics for screen readers
- **Color Contrast**: Minimum 4.5:1 ratio for text

### VA Mobile Apps Hub

- **App Listing**: Correct app metadata and deep linking
- **Download Redirect**: App Store/Play Store redirects work
- **PWA Functionality**: Offline support, installability checks
- **Device Compatibility**: Responsive on mobile, tablet, desktop

### Electronic Health Record Modernization (EHRM)

- **Access Control**: Patient data access limited to authorized users
- **Performance**: > 95th percentile response times under load
- **Audit Logging**: All data access logged with timestamps
- **Data Integrity**: CRUD operations maintain consistency

### AI at VA Strategy

- **Model Output Sanity**: Results within expected ranges
- **Data Drift Monitoring**: Model performance tracked over time
- **Inference Speed**: Real-time model inference < 200ms
- **Explainability**: Model decisions can be traced

### Web Governance & Standards

- **Design System Compliance**: Components match design tokens
- **Brand Consistency**: Logo, colors, fonts applied correctly
- **Link Validation**: No broken internal/external links
- **Meta Tags**: SEO tags (title, description, OG) correct

---

## 13. Governance, Roles & Responsibilities 👥

| Role                    | Responsibilities                                                   |
| ----------------------- | ------------------------------------------------------------------ |
| **Developer**           | Write unit tests, contract tests; submit PRs with test checklist   |
| **QA / Test Engineer**  | Maintain E2E suite, exploratory testing, a11y audits, test reviews |
| **SRE / DevOps**        | Environment provisioning, canary deploys, monitoring, alerting     |
| **Security Engineer**   | SAST/DAST configuration, CVE triage, security sign-off             |
| **Product Manager**     | Define acceptance criteria, prioritize test scenarios              |
| **Engineering Manager** | Enforce DoD, allocate test-debt sprints, review metrics            |

### Review Cadence

- **Weekly**: Pipeline metrics, flaky tests, coverage trends
- **Sprint**: Test backlog grooming, DoD compliance
- **Monthly**: Security scan findings, performance trends
- **Quarterly**: A11y audits, penetration tests, release retrospectives

---

## 14. Next Steps (Actionable) ✅

### Immediate (Next 1–2 weeks)

- [ ] Create PR template with test checklist
- [ ] Initialize `.github/workflows/ci.yml` with PR pipeline (lint, unit, contract, smoke)
- [ ] Add baseline smoke Playwright tests (`tests/smoke/`)
- [ ] Configure Playwright HTML report uploads to artifacts

### Short-term (Weeks 3–4)

- [ ] Set up Lighthouse CI & performance budgets
- [ ] Integrate axe-core accessibility checks
- [ ] Add cross-browser Playwright matrix (Chromium, Firefox)
- [ ] Document test data strategy and staging environment

### Medium-term (Weeks 5–8)

- [ ] Build full E2E suite for top 10 user journeys
- [ ] Add SAST scanning (SonarQube / CodeQL)
- [ ] Integrate SCA scanning (Snyk)
- [ ] Configure OWASP ZAP DAST scanning
- [ ] Set up k6 load tests

### Long-term (Weeks 9+)

- [ ] Production synthetic monitoring
- [ ] Canary deployment automation
- [ ] Metrics dashboards (Grafana / Datadog)
- [ ] Quarterly penetration & a11y audits

---

## Appendix: References & Resources

### Agile & Testing Best Practices

- [Agile Testing Manifesto](https://agiletestingmanifesto.org)
- [Test Pyramid & Trophy (Kent C. Dodds)](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [ISTQB Agile Testing](https://www.istqb.org)

### Tools & Documentation

- [Playwright Docs](https://playwright.dev)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [OWASP ZAP](https://www.zaproxy.org)
- [Pact Testing](https://pact.foundation)
- [axe-core](https://github.com/dequelabs/axe-core)

### Federal Compliance

- [FedRAMP Requirements](https://www.fedramp.gov)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Document Version**: 1.0  
**Last Updated**: January 11, 2026  
**Owner**: QA & DevOps Team  
**Review Cadence**: Monthly
