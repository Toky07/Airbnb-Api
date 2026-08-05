import { NotFoundException } from '@nestjs/common';
import { AMENITY_SCOPE } from '../../../domain/constants/amenity-scope.constant';
import { Amenity } from '../../../domain/entities/amenity.entity';
import { SyncRoomAmenitiesCommandHandler } from './SyncRoomAmenitiesCommandHandler';
import { SyncRoomAmenitiesCommand } from '../commands/SyncRoomAmenitiesCommand';
import { SyncEntityAmenitiesService } from '../../services/entity-amenities.service';
import { ResolveAmenitiesService } from '../../services/resolve-amenities.service';

describe('SyncRoomAmenitiesCommandHandler', () => {
  it('syncs amenities for an existing room', async () => {
    const roomRepository = {
      findById: async () => ({ id: 1 }),
    };
    const roomAmenityRepository = {
      replaceForRoom: async () => undefined,
    };
    const amenityRepository = {
      findByIds: async () => [
        new Amenity('TV', 'tv', AMENITY_SCOPE.ROOM, true, 2),
      ],
    };

    const syncEntityAmenitiesService = new SyncEntityAmenitiesService(
      {} as never,
      roomRepository as never,
      {} as never,
      roomAmenityRepository as never,
      new ResolveAmenitiesService(amenityRepository as never),
    );
    const handler = new SyncRoomAmenitiesCommandHandler(
      syncEntityAmenitiesService,
    );

    const result = await handler.execute(
      new SyncRoomAmenitiesCommand(1, { amenityIds: [2] }),
    );

    expect(result).toHaveLength(1);
    expect(result[0].scope).toBe(AMENITY_SCOPE.ROOM);
  });

  it('throws when room is missing', async () => {
    const syncEntityAmenitiesService = new SyncEntityAmenitiesService(
      {} as never,
      { findById: async () => null } as never,
      {} as never,
      {} as never,
      new ResolveAmenitiesService({ findByIds: async () => [] } as never),
    );
    const handler = new SyncRoomAmenitiesCommandHandler(
      syncEntityAmenitiesService,
    );

    await expect(
      handler.execute(new SyncRoomAmenitiesCommand(99, { amenityIds: [2] })),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
