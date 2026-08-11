import { Room } from '../../../domain/entities/room.entity';
import { IRoomRepository } from '../../../domain/repositories/room.repository';
import { RoomOutput } from '../../dto/room.output';
import { Property } from '../../../../properties/contracts';
import { CreateRoomCommandHandler } from './CreateRoomCommandHandler';
import { CreateRoomCommand } from '../commands/CreateRoomCommand';
import {
  mockGenerateRoomSlug,
  mockRoomMediaPresenter,
} from '../test-helpers/room-usecase.mocks';

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
  id: 3,
});

const repository = {
  create: async (room: Room): Promise<Room> => ({
    ...room,
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
} as IRoomRepository;

describe('CreateRoomCommandHandler', () => {
  it('should create a room', async () => {
    const handler = new CreateRoomCommandHandler(
      repository,
      mockRoomMediaPresenter,
      mockGenerateRoomSlug,
    );

    const room = await handler.execute(
      new CreateRoomCommand({
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
      }),
    );

    expect(room).toBeInstanceOf(RoomOutput);
    expect(room.id).toBe(1);
    expect(room.name).toBe('Room 1');
    expect(room.images).toEqual([]);
  });
});
