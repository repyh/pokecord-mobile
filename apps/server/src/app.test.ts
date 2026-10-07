import { expect, test } from 'bun:test';
import { HealthResponse, ReadinessResponse } from '@pokecord/contracts';
import { createApp } from './app';
import { readConfig } from './config';

test('liveness works without a database and readiness reports its schema', async () => {
  const app = createApp({ checkDatabase: async () => '001_baseline.sql' });
  try {
    const health = await app.inject('/health');
    expect(health.statusCode).toBe(200);
    expect(HealthResponse.parse(health.json()).status).toBe('ok');
    const ready = await app.inject('/ready');
    expect(ready.statusCode).toBe(200);
    expect(ReadinessResponse.parse(ready.json()).schemaVersion).toBe(
      '001_baseline.sql',
    );
  } finally {
    await app.close();
  }
});

test('database errors are unavailable without leaking connection credentials', async () => {
  const app = createApp({
    checkDatabase: async () => {
      throw new Error('postgres://secret:password@private');
    },
  });
  try {
    const response = await app.inject('/ready');
    expect(response.statusCode).toBe(503);
    expect(response.json<{ status: string; apiVersion: number }>()).toEqual({
      status: 'unavailable',
      apiVersion: 1,
    });
    expect(response.body).not.toContain('secret');
  } finally {
    await app.close();
  }
});

test('invalid configuration fails without exposing secrets', () => {
  expect(() => readConfig({ DATABASE_URL: 'secret', PORT: '70000' })).toThrow(
    'Invalid server configuration: DATABASE_URL, PORT',
  );
  expect(
    readConfig({ DATABASE_URL: 'postgres://user:pass@localhost/db' }).PORT,
  ).toBe(3000);
});

test('browser readiness allows configured origins only', async () => {
  const origin = 'http://localhost:8081';
  const app = createApp({
    checkDatabase: async () => '001_baseline.sql',
    browserOrigins: [origin],
  });
  try {
    const allowed = await app.inject({ url: '/ready', headers: { origin } });
    expect(allowed.headers['access-control-allow-origin']).toBe(origin);
    const denied = await app.inject({
      url: '/ready',
      headers: { origin: 'https://other.example' },
    });
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
    const native = await app.inject('/ready');
    expect(native.statusCode).toBe(200);
  } finally {
    await app.close();
  }
});
