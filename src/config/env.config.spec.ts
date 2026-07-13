import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  EnvValidationError,
  getJwtSecret,
  getMailTransport,
  validateEnv,
} from './env.config';

function createEnv(
  overrides: Record<string, string | undefined> = {},
): NodeJS.ProcessEnv {
  return { ...overrides };
}

describe('validateEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('skips validation when SKIP_ENV_VALIDATION=true', () => {
    expect(() =>
      validateEnv(
        createEnv({
          SKIP_ENV_VALIDATION: 'true',
          NODE_ENV: 'production',
        }),
      ),
    ).not.toThrow();
  });

  it('accepts a valid production configuration', () => {
    expect(() =>
      validateEnv(
        createEnv({
          SKIP_ENV_VALIDATION: 'false',
          NODE_ENV: 'production',
          DB_TYPE: 'postgres',
          DB_HOST: 'postgres',
          DB_USER: 'airbnb_prod',
          DB_PASSWORD: 'super-secure-db-password',
          DB_NAME: 'airbnb',
          JWT_SECRET: 'a'.repeat(32),
          MAIL_TRANSPORT: 'resend',
          RESEND_API_KEY: 're_live_example',
          STRIPE_SECRET_KEY: 'sk_live_example',
          STRIPE_WEBHOOK_SECRET: 'whsec_example',
          STRIPE_PUBLISHABLE_KEY: 'pk_live_example',
        }),
      ),
    ).not.toThrow();
  });

  it('rejects missing database secrets in production', () => {
    try {
      validateEnv(
        createEnv({
          SKIP_ENV_VALIDATION: 'false',
          NODE_ENV: 'production',
          DB_TYPE: 'postgres',
          DB_PASSWORD: 'airbnb',
        }),
      );
      expect.unreachable('validateEnv should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);
      expect((error as EnvValidationError).issues).toEqual(
        expect.arrayContaining([
          'DB_HOST is required',
          'DB_USER is required',
          'DB_NAME is required',
          'DB_PASSWORD must not use the default Docker value in production',
        ]),
      );
    }
  });

  it('requires resend api key when mail transport is resend', () => {
    try {
      validateEnv(
        createEnv({
          SKIP_ENV_VALIDATION: 'false',
          NODE_ENV: 'development',
          MAIL_TRANSPORT: 'resend',
        }),
      );
      expect.unreachable('validateEnv should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);
      expect((error as EnvValidationError).issues).toEqual([
        'RESEND_API_KEY is required',
      ]);
    }
  });

  it('provides a dev-only jwt secret outside production', () => {
    expect(getJwtSecret(createEnv({ NODE_ENV: 'development' }))).toContain(
      'dev-only',
    );
  });

  it('defaults mail transport to console', () => {
    expect(getMailTransport(createEnv())).toBe('console');
  });
});
