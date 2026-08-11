import { NotFoundException } from '@nestjs/common';
import { AMENITY_SCOPE } from '@src/modules/amenity/domain/constants/amenity-scope.constant';
import { Amenity } from '@src/modules/amenity/domain/entities/amenity.entity';
import { SyncPropertyAmenitiesCommandHandler } from './SyncPropertyAmenitiesCommandHandler';
import { SyncPropertyAmenitiesCommand } from '@src/modules/amenity/applications/useCase/commands/SyncPropertyAmenitiesCommand';
import { SyncEntityAmenitiesService } from '@src/modules/amenity/applications/services/sync-entity-amenities.service';
import { ResolveAmenitiesService } from '@src/modules/amenity/applications/services/resolve-amenities.service';

describe('SyncPropertyAmenitiesCommandHandler', () => {
  it('syncs amenities for an existing property', async () => {
    const propertyRepository = {
      findById: async () => ({ id: 1 }),
    };
    const propertyAmenityRepository = {
      replaceForProperty: async () => undefined,
    };
    const amenityRepository = {
      findByIds: async () => [
        new Amenity(
          'Parking',
          'square-parking',
          AMENITY_SCOPE.PROPERTY,
          true,
          1,
        ),
      ],
    };

    const syncEntityAmenitiesService = new SyncEntityAmenitiesService(
      propertyRepository as never,
      {} as never,
      propertyAmenityRepository as never,
      {} as never,
      new ResolveAmenitiesService(amenityRepository as never),
    );
    const handler = new SyncPropertyAmenitiesCommandHandler(
      syncEntityAmenitiesService,
    );

    const result = await handler.execute(
      new SyncPropertyAmenitiesCommand(1, { amenityIds: [1] }),
    );

    expect(result).toHaveLength(1);
    expect(result[0].scope).toBe(AMENITY_SCOPE.PROPERTY);
  });

  it('throws when property is missing', async () => {
    const syncEntityAmenitiesService = new SyncEntityAmenitiesService(
      { findById: async () => null } as never,
      {} as never,
      {} as never,
      {} as never,
      new ResolveAmenitiesService({ findByIds: async () => [] } as never),
    );
    const handler = new SyncPropertyAmenitiesCommandHandler(
      syncEntityAmenitiesService,
    );

    await expect(
      handler.execute(
        new SyncPropertyAmenitiesCommand(99, { amenityIds: [1] }),
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
