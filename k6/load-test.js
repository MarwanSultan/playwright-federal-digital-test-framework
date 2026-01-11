// k6/load-test.js
import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Gauge, Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');
const successCount = new Counter('success');
const activeUsers = new Gauge('active_users');

// Test options
export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up
    { duration: '1m', target: 50 }, // Stay at 50 users
    { duration: '30s', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    errors: ['rate<0.1'], // Less than 10% errors
    http_req_failed: ['rate<0.05'], // Less than 5% failed requests
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://digital.va.gov';
const API_BASE_URL = __ENV.API_BASE_URL || 'https://api.va.gov';
const API_KEY = __ENV.VA_API_KEY || 'test-key';

export default function () {
  group('Homepage Load Test', () => {
    const res = http.get(`${BASE_URL}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      tags: { name: 'Homepage' },
    });

    check(res, {
      'status is 200': (r) => r.status === 200,
      'page loads within 2 seconds': (r) => r.timings.duration < 2000,
      'content is not empty': (r) => r.body.length > 0,
    });

    apiDuration.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    activeUsers.add(1);

    if (res.status === 200) {
      successCount.add(1);
    }

    sleep(1);
  });

  group('API Endpoint Load Test', () => {
    const apiRes = http.get(`${API_BASE_URL}/v1/veterans`, {
      headers: {
        'Content-Type': 'application/json',
        apikey: API_KEY,
      },
      tags: { name: 'API' },
    });

    check(apiRes, {
      'API status is 2xx or 3xx': (r) => r.status < 400,
      'API response time < 500ms': (r) => r.timings.duration < 500,
      'API has required headers': (r) =>
        r.headers['content-type'] && r.headers['x-request-id'],
    });

    apiDuration.add(apiRes.timings.duration);
    errorRate.add(apiRes.status >= 400);

    if (apiRes.status < 400) {
      successCount.add(1);
    }

    sleep(1);
  });

  group('Authentication Load Test', () => {
    const loginRes = http.post(
      `${BASE_URL}/sign-in`,
      JSON.stringify({
        email: `test${Math.random()}@va.gov`,
        password: 'test-password',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        tags: { name: 'Login' },
      },
    );

    check(loginRes, {
      'login endpoint responds': (r) => [200, 400, 401, 403].includes(r.status),
      'login endpoint responds quickly': (r) => r.timings.duration < 1000,
    });

    apiDuration.add(loginRes.timings.duration);
    errorRate.add(loginRes.status >= 500);

    sleep(1);
  });

  group('Resource Loading', () => {
    const batch = http.batch([
      { method: 'GET', url: `${BASE_URL}/api/config` },
      { method: 'GET', url: `${BASE_URL}/api/health` },
      { method: 'GET', url: `${BASE_URL}/api/status` },
    ]);

    batch.forEach((res) => {
      check(res, {
        'status is 2xx': (r) => r.status >= 200 && r.status < 300,
        'response time < 1s': (r) => r.timings.duration < 1000,
      });

      apiDuration.add(res.timings.duration);
      errorRate.add(res.status >= 400);
    });

    sleep(1);
  });

  // Rate limiting test
  group('Rate Limiting Test', () => {
    for (let i = 0; i < 20; i++) {
      const res = http.get(`${API_BASE_URL}/v1/veterans`, {
        headers: {
          apikey: API_KEY,
        },
        tags: { name: 'RateLimitTest' },
      });

      check(res, {
        'rate limit check': (r) => {
          if (r.status === 429) {
            console.log('Rate limited at request ' + i);
            return true;
          }
          return r.status < 500;
        },
      });

      apiDuration.add(res.timings.duration);
    }

    sleep(5);
  });

  group('Concurrent Users Test', () => {
    // Simulate multiple users accessing resources
    const resources = [
      `${BASE_URL}/resources/lighthouse-api`,
      `${BASE_URL}/resources/mobile-hub`,
      `${BASE_URL}/resources/accessibility`,
    ];

    resources.forEach((resource) => {
      const res = http.get(resource, {
        tags: { name: 'ConcurrentUser' },
      });

      check(res, {
        'resource loads': (r) => r.status === 200 || r.status === 304,
        'resource loads quickly': (r) => r.timings.duration < 2000,
      });

      apiDuration.add(res.timings.duration);
      errorRate.add(res.status >= 400);
    });

    sleep(2);
  });
}

// Summary function
export function handleSummary(data) {
  const summary = `
    Performance Test Summary
    ========================
    
    Total Requests: ${data.metrics.http_reqs.value}
    Successful: ${data.metrics.success.value}
    Errors: ${(data.metrics.errors.value * 100).toFixed(2)}%
    
    Response Times:
    - Avg: ${Math.round(data.metrics.api_duration.values.avg)}ms
    - Min: ${Math.round(data.metrics.api_duration.values.min)}ms
    - Max: ${Math.round(data.metrics.api_duration.values.max)}ms
    - p95: ${Math.round(data.metrics.api_duration.values['p(95)'])}ms
    - p99: ${Math.round(data.metrics.api_duration.values['p(99)'])}ms
    
    Thresholds: ${data.metrics.http_req_duration ? 'PASSED' : 'FAILED'}
  `;

  console.log(summary);
  return {
    stdout: summary,
  };
}
