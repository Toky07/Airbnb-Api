import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/$/, '');
}

function parseOrigins(value: string | undefined): string[] {
  if (!value?.trim()) {
    return [];
  }

  return [...new Set(value.split(',').map(normalizeOrigin).filter(Boolean))];
}

function getDefaultOrigins(): string[] {
  const origins = new Set<string>();

  const appPublicUrl = process.env.APP_PUBLIC_URL?.trim();
  if (appPublicUrl) {
    origins.add(normalizeOrigin(appPublicUrl));
  }

  const adminPublicUrl = process.env.ADMIN_PUBLIC_URL?.trim();
  if (adminPublicUrl) {
    origins.add(normalizeOrigin(adminPublicUrl));
  } else if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:5174');
  }

  return [...origins];
}

export function getAllowedCorsOrigins(): string[] {
  const configuredOrigins = parseOrigins(process.env.CORS_ORIGINS);
  return configuredOrigins.length > 0 ? configuredOrigins : getDefaultOrigins();
}

export function getCorsConfig(): CorsOptions {
  const allowedOrigins = getAllowedCorsOrigins();

  return {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(normalizeOrigin(origin))) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  };
}
