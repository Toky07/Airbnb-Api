import type { JwtSignOptions } from '@nestjs/jwt';

type EnvSource = NodeJS.ProcessEnv;

const WEAK_JWT_SECRETS = new Set(['1234', 'change-me', 'secret', 'jwt-secret']);
const DEFAULT_DB_PASSWORD = 'airbnb';

function readEnv(env: EnvSource, key: string): string | undefined {
  const value = env[key]?.trim();
  return value || undefined;
}

export function isProductionEnv(env: EnvSource = process.env): boolean {
  return env.NODE_ENV === 'production';
}

export function shouldSkipEnvValidation(env: EnvSource = process.env): boolean {
  return env.SKIP_ENV_VALIDATION === 'true';
}

export function getMailTransport(env: EnvSource = process.env): string {
  return (readEnv(env, 'MAIL_TRANSPORT') ?? 'console').toLowerCase();
}

export function getJwtSecret(env: EnvSource = process.env): string {
  const configured = readEnv(env, 'JWT_SECRET');
  if (configured) {
    return configured;
  }

  if (isProductionEnv(env)) {
    return '';
  }

  return 'dev-only-jwt-secret-not-for-production';
}

export function getJwtExpiresIn(env: EnvSource = process.env): string {
  return readEnv(env, 'JWT_EXPIRES_IN') ?? '8h';
}

export function getJwtIssuer(env: EnvSource = process.env): string {
  return readEnv(env, 'JWT_ISSUER') ?? 'airbnb-api';
}

export function getJwtAudience(env: EnvSource = process.env): string {
  return readEnv(env, 'JWT_AUDIENCE') ?? 'airbnb-clients';
}

export function getJwtModuleOptions(env: EnvSource = process.env) {
  return {
    secret: getJwtSecret(env),
    signOptions: {
      expiresIn: getJwtExpiresIn(env) as JwtSignOptions['expiresIn'],
      algorithm: 'HS256' as const,
      issuer: getJwtIssuer(env),
      audience: getJwtAudience(env),
    },
    verifyOptions: {
      algorithms: ['HS256' as const],
      issuer: getJwtIssuer(env),
      audience: getJwtAudience(env),
    },
  };
}

export function getStripeSecretKey(env: EnvSource = process.env): string {
  return readEnv(env, 'STRIPE_SECRET_KEY') ?? '';
}

export function getStripeWebhookSecret(env: EnvSource = process.env): string {
  return readEnv(env, 'STRIPE_WEBHOOK_SECRET') ?? '';
}

export function getStripePublishableKey(env: EnvSource = process.env): string {
  return readEnv(env, 'STRIPE_PUBLISHABLE_KEY') ?? '';
}

export function getStripeCurrency(env: EnvSource = process.env): string {
  return (readEnv(env, 'STRIPE_CURRENCY') ?? 'eur').toLowerCase();
}

export function getStripeConnectCountry(env: EnvSource = process.env): string {
  return (readEnv(env, 'STRIPE_CONNECT_COUNTRY') ?? 'FR').toUpperCase();
}

export function getAppPublicUrl(env: EnvSource = process.env): string {
  return (readEnv(env, 'APP_PUBLIC_URL') ?? 'http://localhost:5173').replace(
    /\/$/,
    '',
  );
}

/** URL publique de l'API (préfixe des images/uploads renvoyés aux clients). */
export function getApiPublicUrl(env: EnvSource = process.env): string {
  const configured = readEnv(env, 'API_PUBLIC_URL');
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  const port = readEnv(env, 'PORT') ?? '3000';
  return `http://localhost:${port}`;
}

export function getResendApiKey(
  env: EnvSource = process.env,
): string | undefined {
  return readEnv(env, 'RESEND_API_KEY');
}

export function getResendFrom(env: EnvSource = process.env): string {
  return (
    readEnv(env, 'RESEND_FROM') ??
    readEnv(env, 'SMTP_FROM') ??
    'onboarding@resend.dev'
  );
}

export function getSmtpHost(env: EnvSource = process.env): string | undefined {
  return readEnv(env, 'SMTP_HOST');
}

export function getSmtpPort(env: EnvSource = process.env): number {
  return Number.parseInt(readEnv(env, 'SMTP_PORT') ?? '587', 10);
}

export function getSmtpUser(env: EnvSource = process.env): string | undefined {
  return readEnv(env, 'SMTP_USER');
}

export function getSmtpPass(env: EnvSource = process.env): string | undefined {
  return readEnv(env, 'SMTP_PASS');
}

export function isSmtpSecure(env: EnvSource = process.env): boolean {
  return env.SMTP_SECURE === 'true';
}

export function getSmtpFrom(env: EnvSource = process.env): string {
  return (
    readEnv(env, 'SMTP_FROM') ??
    readEnv(env, 'SMTP_USER') ??
    'noreply@airbnb.local'
  );
}

export function getDatabaseType(env: EnvSource = process.env): string {
  return readEnv(env, 'DB_TYPE') ?? 'sqlite';
}

function requireEnv(
  env: EnvSource,
  key: string,
  issues: string[],
): string | undefined {
  const value = readEnv(env, key);
  if (!value) {
    issues.push(`${key} is required`);
  }
  return value;
}

export class EnvValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Environment validation failed:\n- ${issues.join('\n- ')}`);
    this.name = 'EnvValidationError';
  }
}

export function validateEnv(env: EnvSource = process.env): void {
  if (shouldSkipEnvValidation(env)) {
    return;
  }

  const issues: string[] = [];
  const production = isProductionEnv(env);
  const dbType = getDatabaseType(env);
  const mailTransport = getMailTransport(env);

  if (dbType === 'postgres') {
    requireEnv(env, 'DB_HOST', issues);
    requireEnv(env, 'DB_USER', issues);
    requireEnv(env, 'DB_PASSWORD', issues);
    requireEnv(env, 'DB_NAME', issues);

    if (production && readEnv(env, 'DB_PASSWORD') === DEFAULT_DB_PASSWORD) {
      issues.push(
        'DB_PASSWORD must not use the default Docker value in production',
      );
    }
  }

  const jwtSecret = getJwtSecret(env);
  if (production) {
    if (!jwtSecret || jwtSecret.length < 32) {
      issues.push(
        'JWT_SECRET is required in production (minimum 32 characters)',
      );
    } else if (WEAK_JWT_SECRETS.has(jwtSecret)) {
      issues.push(
        'JWT_SECRET must not use a default or weak value in production',
      );
    }
  }

  if (production && mailTransport === 'console') {
    issues.push(
      'MAIL_TRANSPORT must be "resend" or "smtp" in production (console is dev-only)',
    );
  }

  if (mailTransport === 'resend') {
    requireEnv(env, 'RESEND_API_KEY', issues);
  }

  if (mailTransport === 'smtp') {
    requireEnv(env, 'SMTP_HOST', issues);
    requireEnv(env, 'SMTP_USER', issues);
    requireEnv(env, 'SMTP_PASS', issues);
  }

  if (production) {
    requireEnv(env, 'STRIPE_SECRET_KEY', issues);
    requireEnv(env, 'STRIPE_WEBHOOK_SECRET', issues);
    requireEnv(env, 'STRIPE_PUBLISHABLE_KEY', issues);
  }

  if (issues.length > 0) {
    throw new EnvValidationError(issues);
  }
}
