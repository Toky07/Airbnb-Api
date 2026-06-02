import { IRoomRepository } from "../../domain/repositories/room.repository";
import { DeleteRoomUseCase } from "./deleteRoom.usecase";

const repository = {
    delete: async (id: number): Promise<boolean> => {
        return true;
    }
} as IRoomRepository;

describe('UseCase: delete room use case', () => {
    it('should delete a room', async () => {
        const deleteRoomUseCase = new DeleteRoomUseCase(repository);

        const room = await deleteRoomUseCase.execute(1);

        expect(room).toBe(true);
    });
});
