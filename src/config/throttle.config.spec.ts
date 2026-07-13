import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getThrottleLimit,
  getThrottleTtlMs,
  isThrottleEnabled,
} from './throttle.config';

describe('throttle.config', () => {
  const env = process.env;

  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllEnvs();
  });

  it('disables throttling only when THROTTLE_ENABLED=false', () => {
    vi.stubEnv('THROTTLE_ENABLED', 'false');
    expect(isThrottleEnabled()).toBe(false);

    vi.stubEnv('THROTTLE_ENABLED', 'true');
    expect(isThrottleEnabled()).toBe(true);
  });

  it('reads custom auth login limits from env', () => {
    vi.stubEnv('THROTTLE_AUTH_LOGIN_LIMIT', '12');
    vi.stubEnv('THROTTLE_AUTH_LOGIN_TTL_MS', '120000');

    expect(getThrottleLimit('THROTTLE_AUTH_LOGIN_LIMIT', 5)).toBe(12);
    expect(getThrottleTtlMs('THROTTLE_AUTH_LOGIN_TTL_MS', 900_000)).toBe(
      120_000,
    );
  });
});
