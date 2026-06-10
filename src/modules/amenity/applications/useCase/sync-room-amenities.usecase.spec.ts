import { NotFoundException } from '@nestjs/common';
import { AMENITY_SCOPE } from '../../domain/constants/amenity-scope.constant';
import { Amenity } from '../../domain/entities/amenity.entity';
import { SyncRoomAmenitiesUseCase } from './sync-room-amenities.usecase';
import type { IRoomRepository } from '../../../rooms/domain/repositories/room.repository';
import type { IRoomAmenityRepository } from '../../domain/repositories/room-amenity.repository';
import { ResolveAmenitiesService } from '../services/resolve-amenities.service';
import type { IAmenityRepository } from '../../domain/repositories/amenity.repository';

describe('SyncRoomAmenitiesUseCase', () => {
  it('syncs amenities for an existing room', async () => {
    const roomRepository = {
      findById: async () => ({ id: 1 }),
    } as unknown as IRoomRepository;

    const roomAmenityRepository = {
      replaceForRoom: async () => undefined,
    } as unknown as IRoomAmenityRepository;

    const amenityRepository = {
      findByIds: async () => [new Amenity('TV', 'tv', AMENITY_SCOPE.ROOM, true, 2)],
    } as unknown as IAmenityRepository;

    const resolveAmenitiesService = new ResolveAmenitiesService(amenityRepository);
    const useCase = new SyncRoomAmenitiesUseCase(
      roomRepository,
      roomAmenityRepository,
      resolveAmenitiesService,
    );

    const result = await useCase.execute(1, { amenityIds: [2] });

    expect(result).toHaveLength(1);
    expect(result[0].scope).toBe(AMENITY_SCOPE.ROOM);
  });

  it('throws when room is missing', async () => {
    const roomRepository = {
      findById: async () => null,
    } as unknown as IRoomRepository;

    const useCase = new SyncRoomAmenitiesUseCase(
      roomRepository,
      {} as IRoomAmenityRepository,
      new ResolveAmenitiesService({} as IAmenityRepository),
    );

    await expect(
      useCase.execute(99, { amenityIds: [2] }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
