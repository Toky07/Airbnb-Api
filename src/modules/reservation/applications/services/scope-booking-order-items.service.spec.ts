import { describe, expect, it } from 'vitest';
import { ReservationItem } from '@src/modules/reservation/domain/entities/reservation-item.entity';
import { ReservationItemOutput } from '@src/modules/reservation/applications/dto/reservation-item.output';
import {
  filterItemsByPropertyIds,
  groupItemsByPropertyId,
} from './scope-booking-order-items.service';

function item(propertyId: number, roomId: number): ReservationItemOutput {
  return ReservationItemOutput.fromDomain(
    new ReservationItem(
      1,
      roomId,
      '2026-08-01',
      '2026-08-03',
      2,
      100,
      2,
      roomId,
    ),
    {
      propertyId,
      roomName: `Room ${roomId}`,
      propertyName: `Hotel ${propertyId}`,
    },
  );
}

describe('scope-booking-order-items.service', () => {
  it('filtre les items par établissement', () => {
    const items = [item(1, 10), item(2, 20), item(1, 11)];

    expect(filterItemsByPropertyIds(items, [1])).toHaveLength(2);
    expect(filterItemsByPropertyIds(items, [2])).toHaveLength(1);
  });

  it('regroupe les items par établissement', () => {
    const groups = groupItemsByPropertyId([
      item(1, 10),
      item(2, 20),
      item(1, 11),
    ]);

    expect(groups.get(1)).toHaveLength(2);
    expect(groups.get(2)).toHaveLength(1);
  });
});
