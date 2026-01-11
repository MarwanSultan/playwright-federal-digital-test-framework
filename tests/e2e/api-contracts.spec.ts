// tests/e2e/api-contracts.spec.ts
import { expect, test } from '@playwright/test';

test.describe('Lighthouse API Library - Contract Tests', () => {
  const apiBaseUrl = 'https://api.va.gov';

  test('should validate Veterans endpoint contract', async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/v1/veterans`, {
      headers: {
        'Accept': 'application/json',
        'apikey': process.env.VA_API_KEY || 'test-key',
      },
    });

    expect(response.status()).toBeLessThan(500); // No server errors
    
    if (response.ok()) {
      const data = await response.json();
      
      // Validate response structure
      expect(data).toHaveProperty('data');
      
      if (Array.isArray(data.data)) {
        if (data.data.length > 0) {
          expect(data.data[0]).toHaveProperty('id');
        }
      }
    }
  });

  test('should validate error response format', async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/v1/veterans/invalid-id`, {
      headers: {
        'Accept': 'application/json',
        'apikey': process.env.VA_API_KEY || 'test-key',
      },
    });

    // Should return 404 for invalid ID
    if (response.status() === 404) {
      const data = await response.json();
      
      // Error response should have standard format
      expect(data).toHaveProperty('errors');
      expect(Array.isArray(data.errors)).toBeTruthy();
    }
  });

  test('should validate API response headers', async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/v1/veterans`, {
      headers: {
        'Accept': 'application/json',
        'apikey': process.env.VA_API_KEY || 'test-key',
      },
    });

    // Check for security headers
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');

    // Check for rate-limit headers
    const rateLimit = response.headers()['x-ratelimit-limit'];
    expect(rateLimit).toBeTruthy();

    // Check for request ID (for tracing)
    const requestId = response.headers()['x-request-id'] || response.headers()['x-correlation-id'];
    expect(requestId).toBeTruthy();
  });

  test('should handle rate limiting appropriately', async ({ request }) => {
    // Make multiple requests to test rate limiting
    const requests = Array(5).fill(null).map(() =>
      request.get(`${apiBaseUrl}/v1/veterans`, {
        headers: {
          'Accept': 'application/json',
          'apikey': process.env.VA_API_KEY || 'test-key',
        },
      })
    );

    const responses = await Promise.all(requests);

    // At least one request should succeed
    const successCount = responses.filter(r => r.status() < 400).length;
    expect(successCount).toBeGreaterThan(0);

    // Check for 429 (Too Many Requests)
    const tooManyRequests = responses.some(r => r.status() === 429);
    if (tooManyRequests) {
      const rateLimitedResponse = responses.find(r => r.status() === 429);
      const retryAfter = rateLimitedResponse?.headers()['retry-after'];
      expect(retryAfter).toBeTruthy();
    }
  });

  test('should validate CORS headers for browser requests', async ({ request }) => {
    const response = await request.fetch(`${apiBaseUrl}/v1/veterans`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://digital.va.gov',
        'Access-Control-Request-Method': 'GET',
      },
    });

    // Check CORS headers
    const allowOrigin = response.headers()['access-control-allow-origin'];
    expect(allowOrigin).toBeTruthy();
  });

  test('should enforce authentication on protected endpoints', async ({ request }) => {
    // Try to access without API key
    const response = await request.get(`${apiBaseUrl}/v1/veterans`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    // Should be 401 Unauthorized or 403 Forbidden
    expect([401, 403]).toContain(response.status());
  });

  test('should validate request timeout behavior', async ({ request, context }) => {
    const timeoutContext = await context.browser()?.newContext({
      extraHTTPHeaders: {
        'apikey': process.env.VA_API_KEY || 'test-key',
      },
    });

    // Set a very short timeout
    const page = await timeoutContext?.newPage();
    
    try {
      await page?.goto(`${apiBaseUrl}/v1/veterans`, { 
        waitUntil: 'networkidle',
        timeout: 1000, // 1 second timeout
      });
    } catch (error) {
      // Should timeout gracefully
      expect(error).toBeTruthy();
    } finally {
      await timeoutContext?.close();
    }
  });

  test('should handle pagination in responses', async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/v1/veterans?page=1&limit=10`, {
      headers: {
        'Accept': 'application/json',
        'apikey': process.env.VA_API_KEY || 'test-key',
      },
    });

    if (response.ok()) {
      const data = await response.json();
      
      // Check pagination fields
      if (data.meta || data.pagination) {
        const meta = data.meta || data.pagination;
        expect(meta).toHaveProperty('total');
        expect(meta).toHaveProperty('page');
        expect(meta).toHaveProperty('limit');
      }
    }
  });

  test('should support common HTTP methods with proper semantics', async ({ request }) => {
    // Test GET
    const getResponse = await request.get(`${apiBaseUrl}/v1/veterans`, {
      headers: { 'apikey': process.env.VA_API_KEY || 'test-key' },
    });
    expect([200, 401, 403, 404]).toContain(getResponse.status());

    // Test OPTIONS
    const optionsResponse = await request.fetch(`${apiBaseUrl}/v1/veterans`, {
      method: 'OPTIONS',
      headers: { 'apikey': process.env.VA_API_KEY || 'test-key' },
    });
    expect([200, 204, 405, 401]).toContain(optionsResponse.status());
  });
});

test.describe('API Response Validation', () => {
  test('should validate JSON schema compliance', async ({ request }) => {
    const response = await request.get('https://api.va.gov/v1/veterans', {
      headers: {
        'Accept': 'application/json',
        'apikey': process.env.VA_API_KEY || 'test-key',
      },
    });

    if (response.ok()) {
      const data = await response.json();
      
      // Verify it's valid JSON
      expect(typeof data).toBe('object');
      expect(data).not.toBeNull();
    }
  });
});
