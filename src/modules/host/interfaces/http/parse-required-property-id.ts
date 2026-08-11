import { BadRequestException } from '@nestjs/common';

export function parseRequiredPropertyId(
  query: Record<string, unknown>,
): number {
  const propertyId = Number(query.propertyId);
  if (!Number.isFinite(propertyId) || propertyId <= 0) {
    throw new BadRequestException('propertyId requis');
  }

  return propertyId;
}
