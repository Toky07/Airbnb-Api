import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AMENITY_SCOPE } from '../../domain/constants/amenity-scope.constant';
import { Amenity } from '../../domain/entities/amenity.entity';
import { DeleteAmenityUseCase } from './delete-amenity.usecase';
import type { IAmenityRepository } from '../../domain/repositories/amenity.repository';

describe('DeleteAmenityUseCase', () => {
  it('deletes an unused amenity', async () => {
    const repository = {
      findById: async () =>
        new Amenity('WiFi', 'wifi', AMENITY_SCOPE.ROOM, true, 1),
      countPropertyUsages: async () => 0,
      countRoomUsages: async () => 0,
      delete: async () => true,
    } as unknown as IAmenityRepository;

    const useCase = new DeleteAmenityUseCase(repository);
    const result = await useCase.execute(1);

    expect(result).toBe(true);
  });

  it('rejects deletion when linked to a property', async () => {
    const repository = {
      findById: async () =>
        new Amenity('Parking', 'square-parking', AMENITY_SCOPE.PROPERTY, true, 2),
      countPropertyUsages: async () => 1,
      countRoomUsages: async () => 0,
    } as unknown as IAmenityRepository;

    const useCase = new DeleteAmenityUseCase(repository);

    await expect(useCase.execute(2)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when amenity is missing', async () => {
    const repository = {
      findById: async () => null,
    } as unknown as IAmenityRepository;

    const useCase = new DeleteAmenityUseCase(repository);

    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
