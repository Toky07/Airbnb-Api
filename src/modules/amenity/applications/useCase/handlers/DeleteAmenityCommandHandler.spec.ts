import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AMENITY_SCOPE } from '@src/modules/amenity/domain/constants/amenity-scope.constant';
import { Amenity } from '@src/modules/amenity/domain/entities/amenity.entity';
import { DeleteAmenityCommandHandler } from './DeleteAmenityCommandHandler';
import { DeleteAmenityCommand } from '@src/modules/amenity/applications/useCase/commands/DeleteAmenityCommand';
import type { IAmenityRepository } from '@src/modules/amenity/domain/repositories/amenity.repository';

describe('DeleteAmenityCommandHandler', () => {
  it('deletes an unused amenity', async () => {
    const repository = {
      findById: async () =>
        new Amenity('WiFi', 'wifi', AMENITY_SCOPE.ROOM, true, 1),
      countPropertyUsages: async () => 0,
      countRoomUsages: async () => 0,
      delete: async () => true,
    } as unknown as IAmenityRepository;

    const handler = new DeleteAmenityCommandHandler(repository);
    const result = await handler.execute(new DeleteAmenityCommand(1));

    expect(result).toBe(true);
  });

  it('rejects deletion when linked to a property', async () => {
    const repository = {
      findById: async () =>
        new Amenity(
          'Parking',
          'square-parking',
          AMENITY_SCOPE.PROPERTY,
          true,
          2,
        ),
      countPropertyUsages: async () => 1,
      countRoomUsages: async () => 0,
    } as unknown as IAmenityRepository;

    const handler = new DeleteAmenityCommandHandler(repository);

    await expect(
      handler.execute(new DeleteAmenityCommand(2)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when amenity is missing', async () => {
    const repository = {
      findById: async () => null,
    } as unknown as IAmenityRepository;

    const handler = new DeleteAmenityCommandHandler(repository);

    await expect(
      handler.execute(new DeleteAmenityCommand(99)),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
