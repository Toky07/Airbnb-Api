import { applyDecorators, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

type ThrottleProfile = Record<string, { limit: number; ttl: number }>;

export function SensitiveRouteThrottle(profile: ThrottleProfile) {
  return applyDecorators(UseGuards(ThrottlerGuard), Throttle(profile));
}
