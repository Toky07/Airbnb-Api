import { NotFoundException } from '@nestjs/common';
import { AMENITY_SCOPE } from '../../../domain/constants/amenity-scope.constant';
import { Amenity } from '../../../domain/entities/amenity.entity';
import { SyncRoomAmenitiesCommandHandler } from './SyncRoomAmenitiesCommandHandler';
import { SyncRoomAmenitiesCommand } from '../commands/SyncRoomAmenitiesCommand';
import type { IRoomRepository } from '../../../../rooms/domain/repositories/room.repository';
import type { IRoomAmenityRepository } from '../../../domain/repositories/room-amenity.repository';
import { ResolveAmenitiesService } from '../../services/resolve-amenities.service';
import type { IAmenityRepository } from '../../../domain/repositories/amenity.repository';

describe('SyncRoomAmenitiesCommandHandler', () => {
  it('syncs amenities for an existing room', async () => {
    const roomRepository = {
      findById: async () => ({ id: 1 }),
    } as unknown as IRoomRepository;

    const roomAmenityRepository = {
      replaceForRoom: async () => undefined,
    } as unknown as IRoomAmenityRepository;

    const amenityRepository = {
      findByIds: async () => [
        new Amenity('TV', 'tv', AMENITY_SCOPE.ROOM, true, 2),
      ],
    } as unknown as IAmenityRepository;

    const resolveAmenitiesService = new ResolveAmenitiesService(
      amenityRepository,
    );
    const handler = new SyncRoomAmenitiesCommandHandler(
      roomRepository,
      roomAmenityRepository,
      resolveAmenitiesService,
    );

    const result = await handler.execute(
      new SyncRoomAmenitiesCommand(1, { amenityIds: [2] }),
    );

    expect(result).toHaveLength(1);
    expect(result[0].scope).toBe(AMENITY_SCOPE.ROOM);
  });

  it('throws when room is missing', async () => {
    const roomRepository = {
      findById: async () => null,
    } as unknown as IRoomRepository;

    const handler = new SyncRoomAmenitiesCommandHandler(
      roomRepository,
      {} as IRoomAmenityRepository,
      new ResolveAmenitiesService({} as IAmenityRepository),
    );

    await expect(
      handler.execute(new SyncRoomAmenitiesCommand(99, { amenityIds: [2] })),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
