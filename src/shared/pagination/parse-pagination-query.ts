import { toScalarString } from '@src/shared/http/to-scalar-string';
import { parseAdvancedFilterFields } from './parse-advanced-filter-query';
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  type PageSizeOption,
  type PaginationParams,
} from './pagination.types';

export function parsePaginationQuery(
  query: Record<string, unknown>,
): PaginationParams {
  const page = Math.max(
    1,
    Number.parseInt(toScalarString(query.page, '1'), 10) || 1,
  );

  const rawLimit = Number.parseInt(
    toScalarString(query.limit, String(DEFAULT_PAGE_SIZE)),
    10,
  );
  const limit = PAGE_SIZE_OPTIONS.includes(rawLimit as PageSizeOption)
    ? (rawLimit as PageSizeOption)
    : DEFAULT_PAGE_SIZE;

  const search =
    typeof query.search === 'string' ? query.search.trim() : undefined;

  const propertyIdRaw = query.propertyId;
  const propertyId =
    propertyIdRaw !== undefined && propertyIdRaw !== ''
      ? Number.parseInt(toScalarString(propertyIdRaw), 10)
      : undefined;

  const checkInRaw = toScalarString(query.checkIn, '').trim();
  const checkOutRaw = toScalarString(query.checkOut, '').trim();
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const checkIn = datePattern.test(checkInRaw) ? checkInRaw : undefined;
  const checkOut = datePattern.test(checkOutRaw) ? checkOutRaw : undefined;
  const hasValidDateRange =
    checkIn !== undefined && checkOut !== undefined && checkOut > checkIn;

  return {
    page,
    limit,
    search: search || undefined,
    propertyId:
      propertyId !== undefined && Number.isFinite(propertyId) && propertyId > 0
        ? propertyId
        : undefined,
    checkIn: hasValidDateRange ? checkIn : undefined,
    checkOut: hasValidDateRange ? checkOut : undefined,
    ...parseAdvancedFilterFields(query),
  };
}
