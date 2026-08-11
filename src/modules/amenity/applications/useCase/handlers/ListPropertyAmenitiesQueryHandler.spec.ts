import { NotFoundException } from '@nestjs/common';
import { Property } from '@src/modules/properties/contracts';
import { Amenity } from '@src/modules/amenity/domain/entities/amenity.entity';
import { AMENITY_SCOPE } from '@src/modules/amenity/domain/constants/amenity-scope.constant';
import { ListPropertyAmenitiesQueryHandler } from './ListPropertyAmenitiesQueryHandler';
import { ListPropertyAmenitiesQuery } from '@src/modules/amenity/applications/useCase/queries/ListPropertyAmenitiesQuery';
import { ListEntityAmenitiesService } from '@src/modules/amenity/applications/services/list-entity-amenities.service';

describe('ListPropertyAmenitiesQueryHandler', () => {
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

  it('lists amenities linked to a property', async () => {
    const listEntityAmenitiesService = new ListEntityAmenitiesService(
      { findById: async () => property } as never,
      {} as never,
      { findAmenityIdsByPropertyId: async () => [1] } as never,
      {} as never,
      {
        findByIds: async () => [
          new Amenity('Parking', 'parking', AMENITY_SCOPE.PROPERTY, true, 1),
        ],
      } as never,
    );
    const handler = new ListPropertyAmenitiesQueryHandler(
      listEntityAmenitiesService,
    );

    const result = await handler.execute(new ListPropertyAmenitiesQuery(1));

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Parking');
  });

  it('throws when property is not found', async () => {
    const listEntityAmenitiesService = new ListEntityAmenitiesService(
      { findById: async () => null } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
    const handler = new ListPropertyAmenitiesQueryHandler(
      listEntityAmenitiesService,
    );

    await expect(
      handler.execute(new ListPropertyAmenitiesQuery(99)),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
