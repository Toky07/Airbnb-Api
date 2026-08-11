import { BadRequestException } from '@nestjs/common';
import { AMENITY_SCOPE } from '@src/modules/amenity/domain/constants/amenity-scope.constant';
import { Amenity } from '@src/modules/amenity/domain/entities/amenity.entity';
import { ResolveAmenitiesService } from './resolve-amenities.service';
import type { IAmenityRepository } from '@src/modules/amenity/domain/repositories/amenity.repository';

describe('ResolveAmenitiesService', () => {
  it('returns active amenities for valid ids', async () => {
    const repository = {
      findByIds: async () => [
        new Amenity('WiFi', 'wifi', AMENITY_SCOPE.ROOM, true, 1),
        new Amenity('TV', 'tv', AMENITY_SCOPE.ROOM, true, 2),
      ],
    } as unknown as IAmenityRepository;

    const service = new ResolveAmenitiesService(repository);
    const result = await service.resolveActiveAmenities(
      [1, 2],
      AMENITY_SCOPE.ROOM,
    );

    expect(result).toHaveLength(2);
  });

  it('rejects amenities from another scope', async () => {
    const repository = {
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

    const service = new ResolveAmenitiesService(repository);

    await expect(
      service.resolveActiveAmenities([1], AMENITY_SCOPE.ROOM),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects unknown amenity ids', async () => {
    const repository = {
      findByIds: async () => [
        new Amenity('WiFi', 'wifi', AMENITY_SCOPE.ROOM, true, 1),
      ],
    } as unknown as IAmenityRepository;

    const service = new ResolveAmenitiesService(repository);

    await expect(
      service.resolveActiveAmenities([1, 2], AMENITY_SCOPE.ROOM),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
