# Pull Request

## Description

<!-- Provide a brief description of the changes in this PR -->

Fixes #(issue number)

## Type of Change

<!-- Mark the relevant option with an "x" -->

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update
- [ ] Test coverage improvement
- [ ] Security improvement
- [ ] Performance improvement

## Changes Made

<!-- List the specific changes made in this PR -->

- Change 1
- Change 2
- Change 3

## Test Coverage Checklist

<!-- Verify that your changes are properly tested -->

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Accessibility tests added/updated
- [ ] Performance impact assessed
- [ ] Manual testing completed

## Security Checklist

<!-- Security review before submitting -->

- [ ] No hardcoded credentials or secrets
- [ ] No sensitive data logged
- [ ] Input validation implemented
- [ ] Output encoding implemented
- [ ] Authentication/authorization checks in place
- [ ] No new dependencies with known vulnerabilities

## Accessibility Checklist

<!-- WCAG 2.1 Level AA compliance -->

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
- [ ] ARIA labels present
- [ ] Focus indicators visible
- [ ] No flashing content

## Code Quality Checklist

<!-- Code review requirements -->

- [ ] Lint passes (`npm run lint`)
- [ ] Format checks pass (`npm run format:check`)
- [ ] Tests pass locally
- [ ] No console errors
- [ ] Comments added for complex logic
- [ ] Code follows project conventions

## Performance Impact

<!-- Assess performance implications -->

- Estimated performance impact: None / Minimal / Moderate / Significant
- Load time change: N/A / Improved / Unchanged / Degraded
- Bundle size change: N/A / Reduced / Unchanged / Increased

## Deployment Notes

<!-- Any special deployment considerations -->

- [ ] No database migrations needed
- [ ] No environment variables needed
- [ ] No breaking API changes
- [ ] Rollback procedure documented

## Screenshots (if applicable)

<!-- Add screenshots for UI changes -->

## Related Issues

<!-- Link related issues -->

- Closes #(issue number)
- Related to #(issue number)

---

## Reviewer Guidance

**Reviewers**: Please verify the following:

1. Code changes align with the description
2. All tests are passing
3. Security and accessibility standards are met
4. Performance impact is acceptable
5. Documentation is updated if needed

**CI/CD Status**: All checks must pass before merge

- ✅ Lint & Format
- ✅ Unit Tests
- ✅ Contract Tests
- ✅ Smoke E2E Tests
- ✅ Accessibility Scan
- ✅ Security Scan
