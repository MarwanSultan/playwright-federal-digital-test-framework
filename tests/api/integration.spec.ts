// tests/api/integration.spec.ts
import request from 'supertest';

const API_BASE_URL = process.env.VA_API_URL || 'https://api.va.gov/v1';
const API_KEY = process.env.VA_API_KEY || 'test-key';

describe('API Integration Tests', () => {
  describe('User Workflow - Complete Journey', () => {
    let veteranId: string;
    let benefitId: string;
    let appealId: string;

    it('should retrieve veteran information', async () => {
      const response = await request(API_BASE_URL)
        .get('/veterans/current')
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(200);

      veteranId = response.body.data.id;
      expect(veteranId).toBeTruthy();
    });

    it('should retrieve benefits for veteran', async () => {
      const response = await request(API_BASE_URL)
        .get(`/veterans/${veteranId}/benefits`)
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      benefitId = response.body.data[0].id;
    });

    it('should get benefit details', async () => {
      const response = await request(API_BASE_URL)
        .get(`/veterans/${veteranId}/benefits/${benefitId}`)
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('description');
      expect(response.body.data).toHaveProperty('eligibility');
    });

    it('should retrieve appeals', async () => {
      const response = await request(API_BASE_URL)
        .get(`/veterans/${veteranId}/appeals`)
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(200);

      if (response.body.data.length > 0) {
        appealId = response.body.data[0].id;
      }
    });

    it('should get appeal details', async () => {
      if (!appealId) {
        return;
      }

      const response = await request(API_BASE_URL)
        .get(`/veterans/${veteranId}/appeals/${appealId}`)
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('timeline');
    });
  });

  describe('Data Consistency Tests', () => {
    it('benefits list should match individual benefit requests', async () => {
      const listResponse = await request(API_BASE_URL)
        .get('/benefits')
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(200);

      const benefitId = listResponse.body.data[0].id;

      const detailResponse = await request(API_BASE_URL)
        .get(`/benefits/${benefitId}`)
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(200);

      expect(listResponse.body.data[0].name).toBe(detailResponse.body.data.name);
    });

    it('pagination should return consistent data', async () => {
      const page1 = await request(API_BASE_URL)
        .get('/forms?page=1&limit=5')
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(200);

      const page1Again = await request(API_BASE_URL)
        .get('/forms?page=1&limit=5')
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(200);

      expect(page1.body.data).toEqual(page1Again.body.data);
    });
  });

  describe('Performance Tests', () => {
    it('should respond within acceptable time for list endpoints', async () => {
      const startTime = Date.now();

      await request(API_BASE_URL)
        .get('/facilities')
        .set('Authorization', `Bearer ${API_KEY}`)
        .expect(200);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(2000); // 2 second threshold
    });

    it('should handle concurrent requests', async () => {
      const requests = Array(5)
        .fill(null)
        .map(() =>
          request(API_BASE_URL)
            .get('/benefits')
            .set('Authorization', `Bearer ${API_KEY}`),
        );

      const responses = await Promise.all(requests);
      const successCount = responses.filter((r) => r.status === 200).length;

      expect(successCount).toBe(5);
    });
  });
});