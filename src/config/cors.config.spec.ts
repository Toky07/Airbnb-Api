import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAllowedCorsOrigins } from './cors.config';

describe('getAllowedCorsOrigins', () => {
  const env = process.env;

  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllEnvs();
  });

  it('uses CORS_ORIGINS when provided and always includes API origin', () => {
    vi.stubEnv(
      'CORS_ORIGINS',
      'https://app.example.com, https://admin.example.com/',
    );
    vi.stubEnv('APP_PUBLIC_URL', 'http://localhost:5173');
    vi.stubEnv('API_PUBLIC_URL', 'http://localhost:3000');

    expect(getAllowedCorsOrigins()).toEqual([
      'https://app.example.com',
      'https://admin.example.com',
      'http://localhost:3000',
    ]);
  });

  it('falls back to APP_PUBLIC_URL and ADMIN_PUBLIC_URL plus API origin', () => {
    vi.stubEnv('CORS_ORIGINS', '');
    vi.stubEnv('APP_PUBLIC_URL', 'http://localhost:5173/');
    vi.stubEnv('ADMIN_PUBLIC_URL', 'http://localhost:5174');
    vi.stubEnv('API_PUBLIC_URL', 'http://localhost:3000');

    expect(getAllowedCorsOrigins()).toEqual([
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
    ]);
  });

  it('includes local admin origin outside production when ADMIN_PUBLIC_URL is missing', () => {
    vi.stubEnv('CORS_ORIGINS', '');
    vi.stubEnv('APP_PUBLIC_URL', 'http://localhost:5173');
    vi.stubEnv('ADMIN_PUBLIC_URL', '');
    vi.stubEnv('API_PUBLIC_URL', 'http://localhost:3000');
    vi.stubEnv('NODE_ENV', 'development');

    expect(getAllowedCorsOrigins()).toEqual([
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
    ]);
  });
});
