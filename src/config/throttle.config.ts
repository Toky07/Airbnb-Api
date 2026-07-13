export function isThrottleEnabled(): boolean {
  return process.env.THROTTLE_ENABLED !== 'false';
}

function readPositiveInt(envKey: string, fallback: number): number {
  const raw = process.env[envKey]?.trim();
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export function getThrottleLimit(envKey: string, fallback: number): number {
  return readPositiveInt(envKey, fallback);
}

export function getThrottleTtlMs(envKey: string, fallback: number): number {
  return readPositiveInt(envKey, fallback);
}

export function getThrottlerModuleOptions() {
  return {
    skipIf: () => !isThrottleEnabled(),
    throttlers: [
      {
        name: 'default',
        ttl: 60_000,
        limit: 100,
      },
    ],
  };
}

export const AUTH_LOGIN_THROTTLE = {
  default: {
    limit: getThrottleLimit('THROTTLE_AUTH_LOGIN_LIMIT', 5),
    ttl: getThrottleTtlMs('THROTTLE_AUTH_LOGIN_TTL_MS', 900_000),
  },
};

export const AUTH_REGISTER_THROTTLE = {
  default: {
    limit: getThrottleLimit('THROTTLE_AUTH_REGISTER_LIMIT', 3),
    ttl: getThrottleTtlMs('THROTTLE_AUTH_REGISTER_TTL_MS', 3_600_000),
  },
};

export const AUTH_PASSWORD_SETUP_THROTTLE = {
  default: {
    limit: getThrottleLimit('THROTTLE_AUTH_PASSWORD_SETUP_LIMIT', 10),
    ttl: getThrottleTtlMs('THROTTLE_AUTH_PASSWORD_SETUP_TTL_MS', 900_000),
  },
};

export const IMPORT_THROTTLE = {
  default: {
    limit: getThrottleLimit('THROTTLE_IMPORT_LIMIT', 5),
    ttl: getThrottleTtlMs('THROTTLE_IMPORT_TTL_MS', 3_600_000),
  },
};
