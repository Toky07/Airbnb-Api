import { IRoomRepository } from "../../domain/repositories/room.repository";
import { Room } from "../../domain/entities/room.entity";
import { RoomOutput } from "../dto/room.output";
import { CreateRoomDto } from "../dto/createRoom.dto";
import { UpdateRoomUseCase } from "./updateRoom.usecase";
import { Property } from "../../../properties/domain/entities/property.entity";

const repository = {
    findById: async (id: number): Promise<RoomOutput|null> => {
        return {
            id: 1,
            name: 'Room 1',
            description: 'Room 1 description',
        } as RoomOutput;
    },
    update: async (room: Room): Promise<RoomOutput> => {
        return {
            ...room,
        } as RoomOutput;
    }
} as IRoomRepository;

describe('UseCase: update room use case', () => {
    it('should update a room', async () => {
        const updateRoomUseCase = new UpdateRoomUseCase(repository);

        const data = {
            id: 1,
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
            property: new Property({
                name: 'Room 2',
                description: 'Room 2 description',
                type: 'Room 2 type',
                address: 'Room 2 address',
                city: 'Room 2 city',
                country: 'Room 2 country',
                latitude: 0,
                longitude: 0,
                checkInTime: 'Room 2 checkInTime',
                checkOutTime: 'Room 2 checkOutTime',
                ownerId: 1,
            }),
        }

        const updatedRoom = await updateRoomUseCase.execute(1,{
           ...data, 
        });
        
        expect(updatedRoom).toEqual(expect.objectContaining({
            ...data,
        }));
    });

    it('should throw an error if the room is not found', async () => {
        const updateRoomUseCase = new UpdateRoomUseCase(repository);

        vi.spyOn(repository, 'findById').mockResolvedValue(null);

        await expect(updateRoomUseCase.execute(2, {
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
            propertyId: 1,
        })).rejects.toThrow('Room not found');
    });
});
