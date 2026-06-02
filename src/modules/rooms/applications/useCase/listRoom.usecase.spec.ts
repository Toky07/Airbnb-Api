import { Property } from "../../../properties/domain/entities/property.entity";
import { IRoomRepository } from "../../domain/repositories/room.repository";
import { RoomOutput } from "../dto/room.output";
import { ListRoomsUseCase } from "./listRoom.usecase";

const repository = {
    findAll: async (): Promise<RoomOutput[]> => {
        return [
            {
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
                    name: 'Room 1',
                    description: 'Room 1 description',
                    type: 'Room 1 type',
                    address: 'Room 1 address',
                    city: 'Room 1 city',
                    country: 'Room 1 country',
                    latitude: 0,
                    longitude: 0,
                    checkInTime: 'Room 1 checkInTime',
                    checkOutTime: 'Room 1 checkOutTime',
                    ownerId: 1,
                }),
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        ];
    }
} as IRoomRepository;

describe('UseCase: list rooms use case', () => {
    it('should list rooms', async () => {
        const listRoomsUseCase = new ListRoomsUseCase(repository);

        const rooms = await listRoomsUseCase.execute();

        expect(rooms).toBeInstanceOf(Array<RoomOutput>);
        expect(rooms.length).toBe(1);
        expect(rooms).toEqual(expect.arrayContaining([
            expect.objectContaining({
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
                    name: 'Room 1',
                    description: 'Room 1 description',
                    type: 'Room 1 type',
                    address: 'Room 1 address',
                    city: 'Room 1 city',
                    country: 'Room 1 country',
                    latitude: 0,
                    longitude: 0,
                    checkInTime: 'Room 1 checkInTime',
                    checkOutTime: 'Room 1 checkOutTime',
                    ownerId: 1,
                }),
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            }),
        ]));
    });
});