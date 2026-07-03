import { NotFoundException } from '@nestjs/common';
import { AMENITY_SCOPE } from '../../../domain/constants/amenity-scope.constant';
import { Amenity } from '../../../domain/entities/amenity.entity';
import { UpdateAmenityCommandHandler } from './UpdateAmenityCommandHandler';
import { UpdateAmenityCommand } from '../commands/UpdateAmenityCommand';
import type { IAmenityRepository } from '../../../domain/repositories/amenity.repository';

describe('UpdateAmenityCommandHandler', () => {
  it('updates an amenity', async () => {
    const current = new Amenity(
      'WiFi',
      'wifi',
      AMENITY_SCOPE.ROOM,
      true,
      1,
      new Date(),
      new Date(),
    );
    const repository = {
      findById: async () => current,
      findByName: async () => null,
      update: async () =>
        new Amenity(
          'WiFi Pro',
          'wifi',
          AMENITY_SCOPE.ROOM,
          true,
          1,
          new Date(),
          new Date(),
        ),
    } as unknown as IAmenityRepository;

    const handler = new UpdateAmenityCommandHandler(repository);
    const result = await handler.execute(
      new UpdateAmenityCommand(1, { name: 'WiFi Pro' }),
    );

    expect(result.name).toBe('WiFi Pro');
    expect(result.scope).toBe(AMENITY_SCOPE.ROOM);
  });

  it('throws when amenity is missing', async () => {
    const repository = {
      findById: async () => null,
    } as unknown as IAmenityRepository;

    const handler = new UpdateAmenityCommandHandler(repository);

    await expect(
      handler.execute(new UpdateAmenityCommand(99, { name: 'TV' })),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
