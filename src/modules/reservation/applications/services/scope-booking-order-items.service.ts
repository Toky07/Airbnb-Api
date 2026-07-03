export function filterItemsByPropertyIds<
  T extends { propertyId: number | null },
>(items: T[], propertyIds: number[]): T[] {
  if (propertyIds.length === 0) {
    return items;
  }

  const allowed = new Set(propertyIds);
  return items.filter(
    (item) => item.propertyId != null && allowed.has(item.propertyId),
  );
}

export function groupItemsByPropertyId<
  T extends { propertyId: number | null },
>(items: T[]): Map<number, T[]> {
  const groups = new Map<number, T[]>();

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
