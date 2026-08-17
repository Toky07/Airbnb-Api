import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

type ThrottleProfile = Record<string, { limit: number; ttl: number }>;

export function SensitiveRouteThrottle(profile: ThrottleProfile) {
  return applyDecorators(Throttle(profile));
}
