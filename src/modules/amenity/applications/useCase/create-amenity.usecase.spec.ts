import { ConflictException } from '@nestjs/common';
import { AMENITY_SCOPE } from '../../domain/constants/amenity-scope.constant';
import { CreateAmenityUseCase } from './create-amenity.usecase';
import type { IAmenityRepository } from '../../domain/repositories/amenity.repository';

describe('CreateAmenityUseCase', () => {
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

    const useCase = new CreateAmenityUseCase(repository);
    const result = await useCase.execute({
      name: 'WiFi',
      icon: 'wifi',
      scope: AMENITY_SCOPE.ROOM,
    });

    expect(result.name).toBe('WiFi');
    expect(result.scope).toBe(AMENITY_SCOPE.ROOM);
  });

  it('rejects empty name', async () => {
    const repository = {} as IAmenityRepository;
    const useCase = new CreateAmenityUseCase(repository);

    await expect(
      useCase.execute({ name: '  ', icon: 'wifi', scope: AMENITY_SCOPE.ROOM }),
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

    const useCase = new CreateAmenityUseCase(repository);

    await expect(
      useCase.execute({ name: 'WiFi', icon: 'wifi', scope: AMENITY_SCOPE.ROOM }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
