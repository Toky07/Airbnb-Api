import { ConflictException } from '@nestjs/common';
import { AMENITY_SCOPE } from '@src/modules/amenity/domain/constants/amenity-scope.constant';
import { CreateAmenityCommandHandler } from './CreateAmenityCommandHandler';
import { CreateAmenityCommand } from '@src/modules/amenity/applications/useCase/commands/CreateAmenityCommand';
import type { IAmenityRepository } from '@src/modules/amenity/domain/repositories/amenity.repository';

describe('CreateAmenityCommandHandler', () => {
  it('creates an amenity', async () => {
    const repository = {
      findByName: async () => null,
      create: async () => ({
        id: 1,
        name: 'WiFi',
        icon: 'wifi',
        scope: AMENITY_SCOPE.ROOM,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    } as unknown as IAmenityRepository;

    const handler = new CreateAmenityCommandHandler(repository);
    const result = await handler.execute(
      new CreateAmenityCommand({
        name: 'WiFi',
        icon: 'wifi',
        scope: AMENITY_SCOPE.ROOM,
      }),
    );

    expect(result.name).toBe('WiFi');
    expect(result.scope).toBe(AMENITY_SCOPE.ROOM);
  });

  it('rejects empty name', async () => {
    const repository = {} as IAmenityRepository;
    const handler = new CreateAmenityCommandHandler(repository);

    await expect(
      handler.execute(
        new CreateAmenityCommand({
          name: '  ',
          icon: 'wifi',
          scope: AMENITY_SCOPE.ROOM,
        }),
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects duplicate name within the same scope', async () => {
    const repository = {
      findByName: async () => ({
        id: 2,
        name: 'WiFi',
        icon: 'wifi',
        scope: AMENITY_SCOPE.ROOM,
        isActive: true,
      }),
    } as unknown as IAmenityRepository;

    const handler = new CreateAmenityCommandHandler(repository);

    await expect(
      handler.execute(
        new CreateAmenityCommand({
          name: 'WiFi',
          icon: 'wifi',
          scope: AMENITY_SCOPE.ROOM,
        }),
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
