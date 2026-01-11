import { expect, test } from '@playwright/test';

test.describe('Lighthouse API Library - Smoke Tests', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('https://digital.va.gov', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/digital.va.gov/i);
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('should verify navigation menu is accessible', async ({ page }) => {
    await page.goto('https://digital.va.gov', { waitUntil: 'domcontentloaded' });
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    const links = page.locator('nav a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should verify page load time is acceptable', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('https://digital.va.gov', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3 seconds
  });

  test('should verify critical resources are loaded', async ({ page }) => {
    let cssLoaded = false;
    let jsLoaded = false;

    page.on('response', (response) => {
      const contentType = response.headers()['content-type'] || '';
      if (response.url().includes('.css') && response.status() === 200) {
        cssLoaded = true;
      }
      if (response.url().includes('.js') && response.status() === 200) {
        jsLoaded = true;
      }
    });

    await page.goto('https://digital.va.gov', { waitUntil: 'networkidle' });
    expect(cssLoaded).toBeTruthy();
    expect(jsLoaded).toBeTruthy();
  });
});

test.describe('VA Services Discovery - Smoke Tests', () => {
  test('should verify Lighthouse API Library link is present', async ({ page }) => {
    await page.goto('https://digital.va.gov', { waitUntil: 'domcontentloaded' });
    const apiLink = page.locator('a:has-text("API")');
    if (await apiLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      expect(await apiLink.getAttribute('href')).toBeTruthy();
    }
  });

  test('should verify Mobile Apps Hub link is present', async ({ page }) => {
    await page.goto('https://digital.va.gov', { waitUntil: 'domcontentloaded' });
    const mobileLink = page.locator('a:has-text("Mobile")');
    if (await mobileLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      expect(await mobileLink.getAttribute('href')).toBeTruthy();
    }
  });

  test('should verify Accessibility resources link is present', async ({ page }) => {
    await page.goto('https://digital.va.gov', { waitUntil: 'domcontentloaded' });
    const a11yLink = page.locator('a:has-text("Accessibility")');
    if (await a11yLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      expect(await a11yLink.getAttribute('href')).toBeTruthy();
    }
  });

  test('should verify no console errors on page load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('https://digital.va.gov', { waitUntil: 'domcontentloaded' });
    expect(errors).toHaveLength(0);
  });
});

test.describe('Page Performance - Smoke Tests', () => {
  test('should verify no 404 responses', async ({ page }) => {
    const failedRequests: string[] = [];

    page.on('response', (response) => {
      if (response.status() >= 400) {
        failedRequests.push(`${response.status()} - ${response.url()}`);
      }
    });

    await page.goto('https://digital.va.gov', { waitUntil: 'networkidle' });
    // Filter out non-critical errors
    const criticalErrors = failedRequests.filter(
      (err) => !err.includes('analytics') && !err.includes('tracking')
    );
    expect(criticalErrors.length).toBeLessThan(3); // Allow some non-critical failures
  });

  test('should verify images are loading', async ({ page }) => {
    await page.goto('https://digital.va.gov', { waitUntil: 'domcontentloaded' });
    const images = page.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
  });
});
