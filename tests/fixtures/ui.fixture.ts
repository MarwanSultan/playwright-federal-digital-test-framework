import { test as baseTest, expect } from '@playwright/test';

/**
 * Simple fixture that navigates to the digital.va.gov sign-in page before tests
 * that opt into the `signIn` fixture run.
 */
export const test = baseTest.extend({
  // Override `page` to navigate to sign-in before each test that uses this test instance.
  page: async ({ page }, use) => {
    await page
      .goto('https://digital.va.gov/sign-in', { waitUntil: 'domcontentloaded' })
      .catch(() => {
        // swallow navigation errors (page might redirect or not exist in some environments)
      });
    await use(page);
  },
});

export { expect };
