import { describe, expect, it, vi } from 'vitest';
import { AMENITY_SCOPE } from '@src/modules/amenity/domain/constants/amenity-scope.constant';
import { Amenity } from '@src/modules/amenity/domain/entities/amenity.entity';
import { ListEntityAmenitiesService } from './list-entity-amenities.service';

describe('ListEntityAmenitiesService', () => {
  it('lists amenities linked to a room', async () => {
    const roomRepository = { findById: vi.fn().mockResolvedValue({ id: 2 }) };
    const roomAmenityRepository = {
      findAmenityIdsByRoomId: vi.fn().mockResolvedValue([1]),
    };
    const amenityRepository = {
      findByIds: vi
        .fn()
        .mockResolvedValue([
          new Amenity('Wi-Fi', 'wifi', AMENITY_SCOPE.ROOM, true, 1),
        ]),
    };

    const service = new ListEntityAmenitiesService(
      {} as never,
      roomRepository as never,
      {} as never,
      roomAmenityRepository as never,
      amenityRepository as never,
    );

    const result = await service.listForRoom(2);

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Wi-Fi');
  });
});
