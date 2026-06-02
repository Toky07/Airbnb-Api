import { IRoomRepository } from "../../domain/repositories/room.repository";
import { Room } from "../../domain/entities/room.entity";
import { UpdateRoomUseCase } from "./updateRoom.usecase";
import { Property } from "../../../properties/domain/entities/property.entity";
import {
    mockRoomMediaPresenter,
    mockSaveEntityMedias,
} from "./test-helpers/room-usecase.mocks";

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

describe('UseCase: update room use case', () => {
    it('should update a room', async () => {
        const updateRoomUseCase = new UpdateRoomUseCase(
            repository,
            mockSaveEntityMedias,
            mockRoomMediaPresenter,
        );

        const updatedRoom = await updateRoomUseCase.execute(1, {
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
        });

        expect(updatedRoom.name).toBe('Room 2');
        expect(updatedRoom.images).toEqual([]);
    });

    it('should throw an error if the room is not found', async () => {
        const updateRoomUseCase = new UpdateRoomUseCase(
            repository,
            mockSaveEntityMedias,
            mockRoomMediaPresenter,
        );

        vi.spyOn(repository, 'findById').mockResolvedValue(null);

        await expect(
            updateRoomUseCase.execute(2, {
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
        ).rejects.toThrow('Room not found');
    });
});
