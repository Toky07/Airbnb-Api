import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  EnvValidationError,
  getJwtSecret,
  getMailTransport,
  validateEnv,
} from './env.config';

describe('validateEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('skips validation when SKIP_ENV_VALIDATION=true', () => {
    vi.stubEnv('SKIP_ENV_VALIDATION', 'true');
    vi.stubEnv('NODE_ENV', 'production');

    expect(() => validateEnv(process.env)).not.toThrow();
  });

  it('accepts a valid production configuration', () => {
    vi.stubEnv('SKIP_ENV_VALIDATION', 'false');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DB_TYPE', 'postgres');
    vi.stubEnv('DB_HOST', 'postgres');
    vi.stubEnv('DB_USER', 'airbnb_prod');
    vi.stubEnv('DB_PASSWORD', 'super-secure-db-password');
    vi.stubEnv('DB_NAME', 'airbnb');
    vi.stubEnv('JWT_SECRET', 'a'.repeat(32));
    vi.stubEnv('MAIL_TRANSPORT', 'resend');
    vi.stubEnv('RESEND_API_KEY', 're_live_example');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_live_example');
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_example');
    vi.stubEnv('STRIPE_PUBLISHABLE_KEY', 'pk_live_example');

    expect(() => validateEnv(process.env)).not.toThrow();
  });

  it('rejects missing database secrets in production', () => {
    vi.stubEnv('SKIP_ENV_VALIDATION', 'false');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DB_TYPE', 'postgres');
    vi.stubEnv('DB_PASSWORD', 'airbnb');

    try {
      validateEnv(process.env);
      expect.unreachable('validateEnv should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);
      const issues = (error as EnvValidationError).issues.join(' ');
      expect(issues).toContain('DB_HOST is required');
      expect(issues).toContain(
        'DB_PASSWORD must not use the default Docker value',
      );
    }
  });

  it('requires resend api key when mail transport is resend', () => {
    vi.stubEnv('SKIP_ENV_VALIDATION', 'false');
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('MAIL_TRANSPORT', 'resend');

    try {
      validateEnv(process.env);
      expect.unreachable('validateEnv should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);
      expect((error as EnvValidationError).issues).toContain(
        'RESEND_API_KEY is required',
      );
    }
  });

  it('provides a dev-only jwt secret outside production', () => {
    vi.stubEnv('NODE_ENV', 'development');
    delete process.env.JWT_SECRET;

    expect(getJwtSecret(process.env)).toContain('dev-only');
  });

  it('defaults mail transport to console', () => {
    delete process.env.MAIL_TRANSPORT;
    expect(getMailTransport(process.env)).toBe('console');
  });
});
