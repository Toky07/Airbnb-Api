import { toScalarString } from '../http/to-scalar-string';

function parsePositiveInt(value: unknown): number | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number.parseInt(toScalarString(value), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

function parseNonNegativeInt(value: unknown): number | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number.parseInt(toScalarString(value), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

function parseFloatParam(value: unknown): number | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number.parseFloat(toScalarString(value));
  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return parsed;
}

export function parseAmenityIds(query: Record<string, unknown>): number[] | undefined {
  const raw = query.amenityIds ?? query['amenityIds[]'];

  if (raw === undefined || raw === '') {
    return undefined;
  }

  const values = Array.isArray(raw) ? raw : String(raw).split(',');
  const ids = values
    .map((entry) => Number.parseInt(String(entry).trim(), 10))
    .filter((id) => Number.isFinite(id) && id > 0);

  return ids.length > 0 ? [...new Set(ids)] : undefined;
}

export function parseAdvancedFilterFields(query: Record<string, unknown>) {
  const minPrice = parseNonNegativeInt(query.minPrice);
  const maxPrice = parseNonNegativeInt(query.maxPrice);
  const minGuests = parsePositiveInt(query.minGuests);
  const roomTypeId = parsePositiveInt(query.roomTypeId);
  const amenityIds = parseAmenityIds(query);
  const city =
    typeof query.city === 'string' && query.city.trim()
      ? query.city.trim()
      : undefined;
  const status =
    typeof query.status === 'string' && query.status.trim()
      ? query.status.trim()
      : undefined;

  const lat = parseFloatParam(query.lat);
  const lng = parseFloatParam(query.lng);
  const radiusKmRaw = parseFloatParam(query.radiusKm);
  const radiusKm =
    lat !== undefined && lng !== undefined
      ? Math.min(100, Math.max(1, radiusKmRaw ?? 25))
      : undefined;

  const hasGeo = lat !== undefined && lng !== undefined && radiusKm !== undefined;

  return {
    minPrice,
    maxPrice:
      minPrice !== undefined &&
      maxPrice !== undefined &&
      maxPrice < minPrice
        ? undefined
        : maxPrice,
    minGuests,
    roomTypeId,
    amenityIds,
    city,
    status,
    lat: hasGeo ? lat : undefined,
    lng: hasGeo ? lng : undefined,
    radiusKm: hasGeo ? radiusKm : undefined,
  };
}
