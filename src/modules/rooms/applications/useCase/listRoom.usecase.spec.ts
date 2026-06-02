import { Property } from "../../../properties/domain/entities/property.entity";
import { Room } from "../../domain/entities/room.entity";
import { IRoomRepository } from "../../domain/repositories/room.repository";
import { RoomOutput } from "../dto/room.output";
import { ListRoomsUseCase } from "./listRoom.usecase";
import { mockRoomMediaPresenter } from "./test-helpers/room-usecase.mocks";

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
    findAll: async (): Promise<Room[]> => [
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
} as IRoomRepository;

describe('UseCase: list rooms use case', () => {
    it('should list rooms', async () => {
        const listRoomsUseCase = new ListRoomsUseCase(
            repository,
            mockRoomMediaPresenter,
        );

        const rooms = await listRoomsUseCase.execute();

        expect(rooms).toHaveLength(1);
        expect(rooms[0]).toBeInstanceOf(RoomOutput);
        expect(rooms[0].images).toEqual([]);
    });
});
