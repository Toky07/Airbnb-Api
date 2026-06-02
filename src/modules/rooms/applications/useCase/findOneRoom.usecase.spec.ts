import { IRoomRepository } from "../../domain/repositories/room.repository";
import { RoomOutput } from "../dto/room.output";
import { FindOneRoomUseCase } from "./findOneRoom.usecase";

const repository = {
    findById: async (id: number): Promise<RoomOutput|null> => {
        return {
            id: 1,
            name: 'Room 1',
            description: 'Room 1 description',
        } as RoomOutput;
    }
} as IRoomRepository;

describe('UseCase: find one room use case', () => {
    it('should find one room', async () => {
        const findOneRoomUseCase = new FindOneRoomUseCase(repository);

        const room = await findOneRoomUseCase.execute(1);

        expect(room).toBeInstanceOf(RoomOutput);
        expect(room.id).toBe(1);
        expect(room.name).toBe('Room 1');
        expect(room.description).toBe('Room 1 description');
    });

    it('should throw an error if the room is not found', async () => {
        const findOneRoomUseCase = new FindOneRoomUseCase(repository);

        vi.spyOn(repository, 'findById').mockResolvedValue(null);

        await expect(findOneRoomUseCase.execute(2)).rejects.toThrow('Room not found');
    });
});
