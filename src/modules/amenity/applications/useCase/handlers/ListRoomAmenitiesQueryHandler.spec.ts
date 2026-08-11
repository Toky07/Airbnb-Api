import { NotFoundException } from '@nestjs/common';
import { Property } from '@src/modules/properties/contracts';
import { Room } from '@src/modules/rooms/contracts';
import { Amenity } from '@src/modules/amenity/domain/entities/amenity.entity';
import { AMENITY_SCOPE } from '@src/modules/amenity/domain/constants/amenity-scope.constant';
import { ListRoomAmenitiesQueryHandler } from './ListRoomAmenitiesQueryHandler';
import { ListRoomAmenitiesQuery } from '@src/modules/amenity/applications/useCase/queries/ListRoomAmenitiesQuery';
import { ListEntityAmenitiesService } from '@src/modules/amenity/applications/services/list-entity-amenities.service';

const property = new Property({
  name: 'Hôtel Test',
  description: 'Desc',
  address: '1 rue Test',
  city: 'Paris',
  country: 'FR',
  latitude: 0,
  longitude: 0,
  checkInTime: '15:00',
  checkOutTime: '11:00',
  ownerId: 1,
  id: 1,
});

const room = new Room({
  name: 'Suite',
  slug: 'suite',
  description: 'Desc',
  pricePerNight: 120,
  maxGuests: 2,
  bedrooms: 1,
  bathrooms: 1,
  beds: 1,
  quantity: 1,
  size: 30,
  status: 'available',
  property,
  id: 5,
});

describe('ListRoomAmenitiesQueryHandler', () => {
  it('lists amenities linked to a room', async () => {
    const listEntityAmenitiesService = new ListEntityAmenitiesService(
      {} as never,
      { findById: async () => room } as never,
      {} as never,
      { findAmenityIdsByRoomId: async () => [2] } as never,
      {
        findByIds: async () => [
          new Amenity('WiFi', 'wifi', AMENITY_SCOPE.ROOM, true, 2),
        ],
      } as never,
    );
    const handler = new ListRoomAmenitiesQueryHandler(
      listEntityAmenitiesService,
    );

    const result = await handler.execute(new ListRoomAmenitiesQuery(5));

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('WiFi');
  });

  it('throws when room is not found', async () => {
    const listEntityAmenitiesService = new ListEntityAmenitiesService(
      {} as never,
      { findById: async () => null } as never,
      {} as never,
      {} as never,
      {} as never,
    );
    const handler = new ListRoomAmenitiesQueryHandler(
      listEntityAmenitiesService,
    );

    await expect(
      handler.execute(new ListRoomAmenitiesQuery(99)),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
