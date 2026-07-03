import { vi } from 'vitest';
import { IRoomRepository } from '../../../domain/repositories/room.repository';
import { Room } from '../../../domain/entities/room.entity';
import { Property } from '../../../../properties/domain/entities/property.entity';
import { UpdateRoomCommandHandler } from './UpdateRoomCommandHandler';
import { UpdateRoomCommand } from '../commands/UpdateRoomCommand';
import {
  mockGenerateRoomSlug,
  mockRoomMediaPresenter,
} from '../test-helpers/room-usecase.mocks';

const property = new Property({
  name: 'Room 2',
  description: 'Room 2 description',
  address: 'Room 2 address',
  city: 'Room 2 city',
  country: 'Room 2 country',
  latitude: 0,
  longitude: 0,
  checkInTime: 'Room 2 checkInTime',
  checkOutTime: 'Room 2 checkOutTime',
  ownerId: 1,
  id: 3,
});

const repository = {
  findById: async (): Promise<Room | null> =>
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
    }),
  update: async (room: Room): Promise<Room> => room,
} as IRoomRepository;

describe('UpdateRoomCommandHandler', () => {
  it('should update a room', async () => {
    const handler = new UpdateRoomCommandHandler(
      repository,
      mockRoomMediaPresenter,
      mockGenerateRoomSlug,
    );

    const updatedRoom = await handler.execute(
      new UpdateRoomCommand(1, {
        name: 'Room 2',
        description: 'Room 2 description',
        pricePerNight: 150,
        maxGuests: 3,
        bedrooms: 2,
        bathrooms: 2,
        beds: 2,
        quantity: 2,
        size: 2,
        status: 'available',
        property,
      }),
    );

    expect(updatedRoom.name).toBe('Room 2');
    expect(updatedRoom.images).toEqual([]);
  });

  it('should throw an error if the room is not found', async () => {
    const handler = new UpdateRoomCommandHandler(
      repository,
      mockRoomMediaPresenter,
      mockGenerateRoomSlug,
    );

    vi.spyOn(repository, 'findById').mockResolvedValue(null);

    await expect(
      handler.execute(
        new UpdateRoomCommand(2, {
          name: 'Room 2',
          description: 'Room 2 description',
          pricePerNight: 150,
          maxGuests: 3,
          bedrooms: 2,
          bathrooms: 2,
          beds: 2,
          quantity: 2,
          size: 2,
          status: 'available',
          property,
        }),
      ),
    ).rejects.toThrow('Room not found');
  });
});
