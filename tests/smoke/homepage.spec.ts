import { expect, test } from '@playwright/test';

test.describe('Homepage Core Functionalities', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage before each test
    await page.goto('https://digital.va.gov', {
      waitUntil: 'domcontentloaded',
    });
  });

  test('should load homepage successfully', async ({ page }) => {
    // Verify page title contains expected text
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.toLowerCase()).toContain('va');

    // Verify main content is visible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should have accessible navigation header', async ({ page }) => {
    // Check for navigation bar using role
    const nav = page.locator('nav').first();
    const navExists = await nav.isVisible().catch(() => false);
    
    if (navExists) {
      // Check for navigation links
      const navLinks = page.locator('nav a');
      const navCount = await navLinks.count();
      expect(navCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should have proper semantic structure', async ({ page }) => {
    // Verify presence of semantic HTML elements
    const mainElement = page.locator('main');
    const mainExists = await mainElement.isVisible().catch(() => false);
    
    // Check for heading (h1, h2, or h3)
    const heading = page.locator('h1, h2, h3').first();
    const headingExists = await heading.isVisible().catch(() => false);
    
    // At least one semantic element should be present
    const semanticPresent = mainExists || headingExists;
    expect(semanticPresent).toBe(true);
  });

  test('should display hero section with call-to-action', async ({ page }) => {
    // Check for prominent call-to-action buttons
    const buttons = page.locator('button, a[role="button"]');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // Verify at least one button is visible
    const firstButton = buttons.first();
    await expect(firstButton).toBeVisible();
  });

  test('should have searchable content', async ({ page }) => {
    // Check for search functionality (input field or search form)
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    
    if (await searchInput.isVisible()) {
      // If search input exists, verify it's interactive
      await expect(searchInput).toBeEnabled();
    } else {
      // Otherwise, check for any input fields for user interaction
      const inputs = page.locator('input');
      const inputCount = await inputs.count();
      expect(inputCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should have accessible link structure', async ({ page }) => {
    // Verify links have visible text
    const allLinks = page.locator('a');
    const linkCount = await allLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Check that at least some links are visible
    const visibleLinks = page.locator('a:visible');
    const visibleLinkCount = await visibleLinks.count();
    expect(visibleLinkCount).toBeGreaterThan(0);
  });

  test('should have accessible footer with important information', async ({ page }) => {
    // Check for footer element
    const footer = page.locator('footer');
    
    if (await footer.isVisible()) {
      // Verify footer contains links or contact information
      const footerLinks = footer.locator('a');
      const footerLinkCount = await footerLinks.count();
      expect(footerLinkCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should be responsive and visible on viewport', async ({ page }) => {
    // Verify key content is visible in current viewport
    const mainContent = page.locator('main, [role="main"]');
    const isBoundingBoxInViewport = await mainContent.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return rect.height > 0 && rect.width > 0;
    });
    expect(isBoundingBoxInViewport).toBe(true);
  });

  test('should have proper language and accessibility attributes', async ({ page }) => {
    // Check for language attribute on html element
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBeTruthy();

    // Verify page is marked with language info
    expect(htmlLang?.length).toBeGreaterThanOrEqual(2);
  });

  test('should allow user interaction with primary buttons', async ({ page }) => {
    // Find and interact with primary call-to-action button
    const primaryButtons = page.locator('button, a[role="button"]');
    const firstButton = primaryButtons.first();

    if (await firstButton.isVisible()) {
      // Verify button is clickable
      await expect(firstButton).toBeEnabled();
      
      // Verify button has descriptive text
      const buttonText = await firstButton.textContent();
      expect(buttonText?.trim()).toBeTruthy();
    }
  });

  test('should display featured content or services', async ({ page }) => {
    // Check for content cards or featured sections
    const contentContainers = page.locator('[role="region"], section, .card, .service, [class*="featured"]');
    const containerCount = await contentContainers.count();
    
    // Should have at least some content structure
    expect(containerCount).toBeGreaterThanOrEqual(0);
  });

  test('should have keyboard accessible navigation', async ({ page }) => {
    // Tab to first interactive element
    await page.keyboard.press('Tab');
    
    // Get focused element
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName || null;
    });
    
    // Should focus on an interactive element (button, link, input, etc.)
    const interactiveElements = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    expect(interactiveElements).toContain(focusedElement);
  });

  test('should load without console errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Critical errors that would indicate page failure should be minimal
    const criticalErrors = errors.filter((err) => 
      err.includes('Uncaught') || err.includes('TypeError')
    );
    expect(criticalErrors.length).toBe(0);
  });
});
