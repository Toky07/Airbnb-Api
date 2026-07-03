import { NotFoundException } from '@nestjs/common';
import { AMENITY_SCOPE } from '../../../domain/constants/amenity-scope.constant';
import { Amenity } from '../../../domain/entities/amenity.entity';
import { SyncPropertyAmenitiesCommandHandler } from './SyncPropertyAmenitiesCommandHandler';
import { SyncPropertyAmenitiesCommand } from '../commands/SyncPropertyAmenitiesCommand';
import type { IPropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import type { IPropertyAmenityRepository } from '../../../domain/repositories/property-amenity.repository';
import { ResolveAmenitiesService } from '../../services/resolve-amenities.service';
import type { IAmenityRepository } from '../../../domain/repositories/amenity.repository';

describe('SyncPropertyAmenitiesCommandHandler', () => {
  it('syncs amenities for an existing property', async () => {
    const propertyRepository = {
      findById: async () => ({ id: 1 }),
    } as unknown as IPropertyRepository;

    const propertyAmenityRepository = {
      replaceForProperty: async () => undefined,
    } as unknown as IPropertyAmenityRepository;

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
    } as unknown as IAmenityRepository;

    const resolveAmenitiesService = new ResolveAmenitiesService(
      amenityRepository,
    );
    const handler = new SyncPropertyAmenitiesCommandHandler(
      propertyRepository,
      propertyAmenityRepository,
      resolveAmenitiesService,
    );

    const result = await handler.execute(
      new SyncPropertyAmenitiesCommand(1, { amenityIds: [1] }),
    );

    expect(result).toHaveLength(1);
    expect(result[0].scope).toBe(AMENITY_SCOPE.PROPERTY);
  });

  it('throws when property is missing', async () => {
    const propertyRepository = {
      findById: async () => null,
    } as unknown as IPropertyRepository;

    const handler = new SyncPropertyAmenitiesCommandHandler(
      propertyRepository,
      {} as IPropertyAmenityRepository,
      new ResolveAmenitiesService({} as IAmenityRepository),
    );

    await expect(
      handler.execute(
        new SyncPropertyAmenitiesCommand(99, { amenityIds: [1] }),
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
