import { IRoomRepository } from "../../domain/repositories/room.repository";
import { Room } from "../../domain/entities/room.entity";
import { RoomOutput } from "../dto/room.output";
import { FindOneRoomUseCase } from "./findOneRoom.usecase";
import { Property } from "../../../properties/domain/entities/property.entity";
import { mockRoomMediaPresenter } from "./test-helpers/room-usecase.mocks";

const repository = {
    findById: async (): Promise<Room | null> =>
        new Room({
            id: 1,
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
            property: new Property({
                name: 'P',
                description: 'D',
                address: 'A',
                city: 'C',
                country: 'Co',
                latitude: 0,
                longitude: 0,
                checkInTime: 'in',
                checkOutTime: 'out',
                ownerId: 1,
            }),
        }),
} as IRoomRepository;

describe('UseCase: find one room use case', () => {
    it('should find one room', async () => {
        const findOneRoomUseCase = new FindOneRoomUseCase(
            repository,
            mockRoomMediaPresenter,
        );

        const room = await findOneRoomUseCase.execute(1);

        expect(room).toBeInstanceOf(RoomOutput);
        expect(room.id).toBe(1);
        expect(room.name).toBe('Room 1');
        expect(room.images).toEqual([]);
    });

    it('should throw an error if the room is not found', async () => {
        const findOneRoomUseCase = new FindOneRoomUseCase(
            repository,
            mockRoomMediaPresenter,
        );

        vi.spyOn(repository, 'findById').mockResolvedValue(null);

        await expect(findOneRoomUseCase.execute(2)).rejects.toThrow('Room not found');
    });
});
