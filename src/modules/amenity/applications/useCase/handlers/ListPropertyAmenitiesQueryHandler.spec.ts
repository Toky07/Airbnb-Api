import { NotFoundException } from '@nestjs/common';
import { Property } from '../../../../properties/domain/entities/property.entity';
import { Amenity } from '../../../domain/entities/amenity.entity';
import { AMENITY_SCOPE } from '../../../domain/constants/amenity-scope.constant';
import { ListPropertyAmenitiesQueryHandler } from './ListPropertyAmenitiesQueryHandler';
import { ListPropertyAmenitiesQuery } from '../queries/ListPropertyAmenitiesQuery';

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
    const handler = new ListPropertyAmenitiesQueryHandler(
      {
        findById: async () => property,
      } as never,
      {
        findAmenityIdsByPropertyId: async () => [1],
      } as never,
      {
        findByIds: async () => [
          new Amenity('Parking', 'parking', AMENITY_SCOPE.PROPERTY, true, 1),
        ],
      } as never,
    );

    const result = await handler.execute(new ListPropertyAmenitiesQuery(1));

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Parking');
  });

  it('throws when property is not found', async () => {
    const handler = new ListPropertyAmenitiesQueryHandler(
      { findById: async () => null } as never,
      {} as never,
      {} as never,
    );

    await expect(
      handler.execute(new ListPropertyAmenitiesQuery(99)),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
