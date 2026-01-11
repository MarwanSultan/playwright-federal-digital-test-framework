import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Gauge, Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('api_errors');
const responseTime = new Trend('response_time');
const successCount = new Counter('successful_requests');
const activeVirtualUsers = new Gauge('active_users');

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // Ramp to 50 users
    { duration: '1m30s', target: 100 }, // Ramp to 100 users
    { duration: '20s', target: 0 }, // Scale down
  ],
  thresholds: {
    response_time: ['p(95)<500', 'p(99)<1000'],
    api_errors: ['rate<0.1'],
    http_req_failed: ['rate<0.05'],
  },
};

const API_BASE_URL = __ENV.API_BASE_URL || 'https://api.va.gov/v1';
const API_KEY = __ENV.VA_API_KEY || 'test-key';

export default function () {
  activeVirtualUsers.add(1);

  group('Benefits API Load Test', () => {
    const params = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      tags: { name: 'BenefitsAPI' },
    };

    const res = http.get(`${API_BASE_URL}/benefits`, params);

    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
      'has data': (r) => r.body.includes('data'),
    });

    responseTime.add(res.timings.duration);
    errorRate.add(res.status !== 200);

    if (res.status === 200) {
      successCount.add(1);
    }

    sleep(1);
  });

  group('Health Records API Load Test', () => {
    const params = {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      tags: { name: 'HealthAPI' },
    };

    const res = http.get(`${API_BASE_URL}/health-records`, params);

    check(res, {
      'status is 2xx': (r) => r.status >= 200 && r.status < 300,
      'response time < 1s': (r) => r.timings.duration < 1000,
    });

    responseTime.add(res.timings.duration);
    errorRate.add(res.status >= 400);

    sleep(1);
  });

  group('Facilities API Search Load Test', () => {
    const params = {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    };

    const res = http.get(
      `${API_BASE_URL}/facilities/search?lat=38.9&lon=-77.0&distance=10`,
      params,
    );

    check(res, {
      'status is valid': (r) => [200, 400, 404].includes(r.status),
      'response time acceptable': (r) => r.timings.duration < 2000,
    });

    responseTime.add(res.timings.duration);

    sleep(1);
  });

  group('Forms API Load Test', () => {
    const params = {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    };

    const res = http.get(`${API_BASE_URL}/forms`, params);

    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 800ms': (r) => r.timings.duration < 800,
    });

    responseTime.add(res.timings.duration);
    errorRate.add(res.status !== 200);

    sleep(1);
  });

  group('Appeals API Load Test', () => {
    const params = {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    };

    const res = http.get(`${API_BASE_URL}/appeals`, params);

    check(res, {
      'status is valid': (r) => r.status < 500,
      'response time < 1s': (r) => r.timings.duration < 1000,
    });

    responseTime.add(res.timings.duration);

    sleep(1);
  });

  group('Rate Limiting Test', () => {
    for (let i = 0; i < 15; i++) {
      const params = {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      };

      const res = http.get(`${API_BASE_URL}/benefits`, params);

      check(res, {
        'rate limit check': (r) => {
          if (r.status === 429) {
            console.log('Rate limited at request ' + i);
            return true;
          }
          return r.status < 500;
        },
      });

      responseTime.add(res.timings.duration);
    }

    sleep(2);
  });

  activeVirtualUsers.add(-1);
}

export function handleSummary(data) {
  const summary = `
    API Load Test Summary
    ====================
    
    Total Requests: ${data.metrics.http_reqs.value}
    Successful: ${data.metrics.successful_requests.value}
    Error Rate: ${(data.metrics.api_errors.values.rate * 100).toFixed(2)}%
    
    Response Times:
    - Average: ${Math.round(data.metrics.response_time.values.avg)}ms
    - P95: ${Math.round(data.metrics.response_time.values['p(95)'])}ms
    - P99: ${Math.round(data.metrics.response_time.values['p(99)'])}ms
    
    Thresholds: ${Object.keys(data.thresholds).every((key) => data.thresholds[key].ok) ? 'PASSED ✓' : 'FAILED ✗'}
  `;

  console.log(summary);
  return { stdout: summary };
}
