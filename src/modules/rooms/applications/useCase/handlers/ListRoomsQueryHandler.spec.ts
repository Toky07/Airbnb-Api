import { Property } from '../../../../properties/domain/entities/property.entity';
import { Room } from '../../../domain/entities/room.entity';
import type { IRoomRepository } from '../../../domain/repositories/room.repository';
import { RoomOutput } from '../../dto/room.output';
import { ListRoomsQueryHandler } from './ListRoomsQueryHandler';
import { ListRoomsQuery } from '../queries/ListRoomsQuery';
import { mockRoomMediaPresenter } from '../test-helpers/room-usecase.mocks';
import { buildPaginationMeta } from '../../../../../shared/pagination/pagination.types';

const property = new Property({
  name: 'Room 1',
  description: 'Room 1 description',
  address: 'Room 1 address',
  city: 'Room 1 city',
  country: 'Room 1 country',
  latitude: 0,
  longitude: 0,
  checkInTime: 'Room 1 checkInTime',
  checkOutTime: 'Room 1 checkOutTime',
  ownerId: 1,
});

const repository = {
  findPaginated: async () => ({
    data: [
      new Room({
        name: 'Room 1',
        description: 'Room 1 description',
        pricePerNight: 100,
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1,
        beds: 1,
        quantity: 1,
        size: 1,
        status: 'available',
        property,
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ],
    meta: buildPaginationMeta(1, 1, 10),
  }),
} as unknown as IRoomRepository;

describe('ListRoomsQueryHandler', () => {
  it('should list rooms', async () => {
    const handler = new ListRoomsQueryHandler(
      repository,
      mockRoomMediaPresenter,
    );

    const result = await handler.execute(new ListRoomsQuery({ page: 1, limit: 10 }));

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toBeInstanceOf(RoomOutput);
    expect(result.data[0].images).toEqual([]);
  });
});
