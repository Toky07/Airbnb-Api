import { describe, expect, it, vi } from 'vitest';
import { getHelmetOptions, isHelmetEnabled } from './helmet.config';

describe('helmet.config', () => {
  it('disables helmet only when HELMET_ENABLED=false', () => {
    vi.stubEnv('HELMET_ENABLED', 'false');
    expect(isHelmetEnabled()).toBe(false);

    vi.stubEnv('HELMET_ENABLED', 'true');
    expect(isHelmetEnabled()).toBe(true);
  });

  it('enables HSTS only in production', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(getHelmetOptions().strictTransportSecurity).toBe(false);

    vi.stubEnv('NODE_ENV', 'production');
    expect(getHelmetOptions().strictTransportSecurity).toEqual({
      maxAge: 31_536_000,
      includeSubDomains: true,
      preload: true,
    });
  });

  it('allows cross-origin access to static API assets', () => {
    expect(getHelmetOptions().crossOriginResourcePolicy).toEqual({
      policy: 'cross-origin',
    });
  });
});
