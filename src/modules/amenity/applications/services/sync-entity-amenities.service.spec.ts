import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AMENITY_SCOPE } from '@src/modules/amenity/domain/constants/amenity-scope.constant';
import { Amenity } from '@src/modules/amenity/domain/entities/amenity.entity';
import { SyncEntityAmenitiesService } from './sync-entity-amenities.service';
import { ResolveAmenitiesService } from './resolve-amenities.service';

describe('SyncEntityAmenitiesService', () => {
  it('syncs property amenities', async () => {
    const propertyRepository = {
      findById: vi.fn().mockResolvedValue({ id: 1 }),
    };
    const propertyAmenityRepository = {
      replaceForProperty: vi.fn().mockResolvedValue(undefined),
    };
    const amenityRepository = {
      findByIds: vi
        .fn()
        .mockResolvedValue([
          new Amenity('Parking', 'parking', AMENITY_SCOPE.PROPERTY, true, 1),
        ]),
    };

    const service = new SyncEntityAmenitiesService(
      propertyRepository as never,
      {} as never,
      propertyAmenityRepository as never,
      {} as never,
      new ResolveAmenitiesService(amenityRepository as never),
    );

    const result = await service.syncProperty(1, [1]);

    expect(propertyAmenityRepository.replaceForProperty).toHaveBeenCalledWith(
      1,
      [1],
    );
    expect(result).toHaveLength(1);
  });

  it('throws when property is missing', async () => {
    const service = new SyncEntityAmenitiesService(
      { findById: vi.fn().mockResolvedValue(null) } as never,
      {} as never,
      {} as never,
      {} as never,
      new ResolveAmenitiesService({ findByIds: vi.fn() } as never),
    );

    await expect(service.syncProperty(99, [1])).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
