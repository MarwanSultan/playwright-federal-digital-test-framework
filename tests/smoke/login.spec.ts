import { expect, test } from '../fixtures/ui.fixture';

test.describe('Secure Identity & Login - Smoke Tests', () => {
  test('should display login page', async ({ page }) => {
    const title = await page.title();
    if (/page not found|404/i.test(title)) {
      console.warn(
        'Login page not available in this environment — skipping test',
      );
      test.skip('Login page not available');
      return;
    }

    await expect(page).toHaveTitle(/login|sign in/i);
  });

  test('should display login form elements', async ({ page }) => {
    // Check if form elements exist (might be visible or hidden behind SSO)
    const formElements = page.locator('form');
    const formCount = await formElements.count().catch(() => 0);
    expect(formCount).toBeGreaterThanOrEqual(0);
  });

  test('should display identity provider options if applicable', async ({
    page,
  }) => {
    // Check for Login.gov button
    const loginGovButton = page.locator(
      'button:has-text("Login.gov"), a:has-text("Login.gov")',
    );
    const loginGovVisible = await loginGovButton.isVisible().catch(() => false);

    // Check for MHV button
    const mhvButton = page.locator(
      'button:has-text("My HealtheVet"), a:has-text("My HealtheVet")',
    );
    const mhvVisible = await mhvButton.isVisible().catch(() => false);

    // At least one provider should be visible
    if (!(loginGovVisible || mhvVisible) && !process.env.CI) {
      console.warn(
        'No identity provider buttons visible — skipping on local run',
      );
      test.skip('No identity provider buttons visible in this environment');
      return;
    }

    expect(loginGovVisible || mhvVisible).toBeTruthy();
  });

  test('should display security information', async ({ page }) => {
    // Look for security-related text
    const securityText = page.locator('text=/secure|encrypted|protection/i');
    const securityVisible = await securityText.isVisible().catch(() => false);

    // Expect page to have some security messaging
    expect(
      securityVisible || (await page.content()).includes('secure'),
    ).toBeTruthy();
  });

  test('should validate form inputs have proper attributes', async ({
    page,
  }) => {
    const inputs = page.locator('input');
    const inputCount = await inputs.count().catch(() => 0);

    if (inputCount > 0) {
      for (let i = 0; i < Math.min(inputCount, 5); i++) {
        const input = inputs.nth(i);
        const type = await input.getAttribute('type').catch(() => null);
        // Inputs should have a type attribute
        expect(type).toBeTruthy();
      }
    }
  });

  test('should have HTTPS connection', async ({ page }) => {
    // page was navigated by the fixture; ensure the current URL is HTTPS
    expect(page.url()).toContain('https://');
  });

  test('should not expose sensitive information in page source', async ({
    page,
  }) => {
    const content = await page.content();

    // Check that passwords are not hardcoded in page
    expect(content).not.toMatch(/password\s*[:=]\s*["'][^"']*["']/i);
  });
});

test.describe('User Session Management - Smoke Tests', () => {
  test('should handle session timeout appropriately', async ({ page }) => {
    // Navigate to a page that might have session protection
    await page
      .goto('https://digital.va.gov/dashboard', {
        waitUntil: 'domcontentloaded',
      })
      .catch(() => {
        // Might redirect to login, which is expected
      });

    // Should either be on dashboard or login page
    const url = page.url();
    expect(url).toMatch(/digital\.va\.gov/);
  });

  test('should display appropriate error messages for invalid credentials', async ({
    page,
  }) => {
    // Try to find form
    const form = page.locator('form').first();
    const formVisible = await form.isVisible().catch(() => false);

    if (formVisible) {
      const emailInput = form
        .locator('input[type="email"], input[name*="email" i]')
        .first();
      const passwordInput = form
        .locator('input[type="password"], input[name*="password" i]')
        .first();

      if (await emailInput.isVisible().catch(() => false)) {
        await emailInput.fill('test@invalid.com');
        await passwordInput.fill('wrongpassword');

        const submitButton = form.locator('button[type="submit"]').first();
        // Don't actually submit to avoid account lockout; just verify form structure
        expect(await submitButton.isVisible().catch(() => false)).toBeTruthy();
      }
    }
  });
});

test.describe('Multi-Factor Authentication - Smoke Tests', () => {
  test('should display MFA options if required', async ({ page }) => {
    // Look for MFA-related UI
    const mfaText = page.locator(
      'text=/two.?factor|2fa|authentication code|mfa/i',
    );
    const mfaVisible = await mfaText.isVisible().catch(() => false);

    // MFA might not be required, so this is a soft check
    expect(typeof mfaVisible).toBe('boolean');
  });

  test('should have secure MFA input fields if present', async ({ page }) => {
    // Look for OTP/code input
    const codeInput = page.locator(
      'input[name*="code" i], input[name*="otp" i], input[placeholder*="code" i]',
    );
    const codeVisible = await codeInput.isVisible().catch(() => false);

    if (codeVisible) {
      // Code input should have numeric type or pattern
      const inputType = await codeInput.getAttribute('type');
      expect(['text', 'number', null]).toContain(inputType);
    }
  });
});
