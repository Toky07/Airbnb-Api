import { Room } from "../../domain/entities/room.entity";
import { IRoomRepository } from "../../domain/repositories/room.repository";
import { RoomOutput } from "../dto/room.output";
import { CreateRoomUseCase } from "./createRoom.usecase";
import { Property } from "../../../properties/domain/entities/property.entity";

const repository = {
    create: async (room: Room): Promise<RoomOutput> => {
        return {
            ...room,
            id: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as RoomOutput;
    }
} as IRoomRepository;

describe('UseCase: create room use case', () => {
    it('should create a room', async () => {
        const createRoomUseCase = new CreateRoomUseCase(repository);

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
        });

        expect(room).toBeInstanceOf(RoomOutput);
        expect(room.id).toBe(1);
        expect(room.name).toBe('Room 1');
        expect(room.description).toBe('Room 1 description');
        expect(room.pricePerNight).toBe(100);
        expect(room.maxGuests).toBe(2);
        expect(room.bedrooms).toBe(1);
        expect(room.bathrooms).toBe(1);
        expect(room.beds).toBe(1);
        expect(room.quantity).toBe(1);
        expect(room.size).toBe(1);
        expect(room.status).toBe('available');
        expect(room.property).toStrictEqual(new Property({
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
        }));
        expect(room.createdAt).toBeDefined();
        expect(room.updatedAt).toBeDefined();
        expect(room.id).toBeDefined();
    });
});