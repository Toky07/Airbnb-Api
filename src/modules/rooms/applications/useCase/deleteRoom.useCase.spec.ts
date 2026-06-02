import { IRoomRepository } from "../../domain/repositories/room.repository";
import { DeleteRoomUseCase } from "./deleteRoom.usecase";
import { mockDeleteMediasByEntity } from "./test-helpers/room-usecase.mocks";

const repository = {
    delete: async (): Promise<boolean> => true,
} as IRoomRepository;

describe('UseCase: delete room use case', () => {
    it('should delete a room', async () => {
        const deleteRoomUseCase = new DeleteRoomUseCase(
            repository,
            mockDeleteMediasByEntity,
        );

        const room = await deleteRoomUseCase.execute(1);

        expect(room).toBe(true);
    });
});
