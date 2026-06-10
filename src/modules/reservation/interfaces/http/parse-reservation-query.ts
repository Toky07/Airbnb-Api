import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  type PageSizeOption,
} from '../../../../shared/pagination/pagination.types';
import type { ReservationListParams } from '../../domain/repositories/reservation.repository';

export function parseReservationQuery(
  query: Record<string, unknown>,
): ReservationListParams {
  const page = Math.max(1, Number.parseInt(String(query.page ?? '1'), 10) || 1);

  const rawLimit = Number.parseInt(String(query.limit ?? DEFAULT_PAGE_SIZE), 10);
  const limit = PAGE_SIZE_OPTIONS.includes(rawLimit as PageSizeOption)
    ? (rawLimit as PageSizeOption)
    : DEFAULT_PAGE_SIZE;

  const search =
    typeof query.search === 'string' ? query.search.trim() : undefined;

  const roomId = parseOptionalPositiveInt(query.roomId);
  const userId = parseOptionalPositiveInt(query.userId);
  const propertyId = parseOptionalPositiveInt(query.propertyId);

  return {
    page,
    limit,
    search: search || undefined,
    roomId,
    userId,
    propertyId,
  };
}

function parseOptionalPositiveInt(value: unknown): number | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}
