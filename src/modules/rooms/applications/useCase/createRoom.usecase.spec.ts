import { Room } from "../../domain/entities/room.entity";
import { IRoomRepository } from "../../domain/repositories/room.repository";
import { RoomOutput } from "../dto/room.output";
import { CreateRoomUseCase } from "./createRoom.usecase";
import { Property } from "../../../properties/domain/entities/property.entity";
import {
    mockRoomMediaPresenter,
    mockSaveEntityMedias,
} from "./test-helpers/room-usecase.mocks";

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
    create: async (room: Room): Promise<Room> => ({
        ...room,
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    }),
} as IRoomRepository;

describe('UseCase: create room use case', () => {
    it('should create a room', async () => {
        const createRoomUseCase = new CreateRoomUseCase(
            repository,
            mockSaveEntityMedias,
            mockRoomMediaPresenter,
        );

        const room = await createRoomUseCase.execute({
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
        });

        expect(room).toBeInstanceOf(RoomOutput);
        expect(room.id).toBe(1);
        expect(room.name).toBe('Room 1');
        expect(room.images).toEqual([]);
    });
});
