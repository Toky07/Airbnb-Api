import type { ReservationItemOutput } from '../dto/reservation-item.output';

export function filterItemsByPropertyIds(
  items: ReservationItemOutput[],
  propertyIds: number[],
): ReservationItemOutput[] {
  if (propertyIds.length === 0) {
    return items;
  }

  const allowed = new Set(propertyIds);
  return items.filter(
    (item) => item.propertyId != null && allowed.has(item.propertyId),
  );
}

export function groupItemsByPropertyId(
  items: ReservationItemOutput[],
): Map<number, ReservationItemOutput[]> {
  const groups = new Map<number, ReservationItemOutput[]>();

  for (const item of items) {
    if (item.propertyId == null) {
      continue;
    }

    const current = groups.get(item.propertyId) ?? [];
    current.push(item);
    groups.set(item.propertyId, current);
  }

  return groups;
}
