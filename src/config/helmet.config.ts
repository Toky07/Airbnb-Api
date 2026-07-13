import type { HelmetOptions } from 'helmet';

export function isHelmetEnabled(): boolean {
  return process.env.HELMET_ENABLED !== 'false';
}

export function getHelmetOptions(): HelmetOptions {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    strictTransportSecurity: isProduction
      ? {
          maxAge: 31_536_000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
  };
}
