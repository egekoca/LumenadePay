import {afterEach, describe, expect, it} from 'vitest';
import {buildApp} from '../src/app';

const apps: ReturnType<typeof buildApp>[] = [];
afterEach(async () => Promise.all(apps.splice(0).map(app => app.close())));

describe('API', () => {
  it('reports service health', async () => {
    const app = buildApp();
    apps.push(app);
    const response = await app.inject({method: 'GET', url: '/v1/health'});
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({status: 'ok'});
  });

  it('validates intent input before persistence', async () => {
    const app = buildApp();
    apps.push(app);
    const response = await app.inject({
      method: 'POST',
      url: '/v1/payment-intents',
      headers: {'idempotency-key': '0123456789abcdef'},
      payload: {version: 'not-rtp'},
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().code).toBe('INVALID_REQUEST');
  });
});
