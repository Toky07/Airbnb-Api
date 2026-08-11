import { IRoomRepository } from '@src/modules/rooms/domain/repositories/room.repository';
import { DeleteRoomCommandHandler } from './DeleteRoomCommandHandler';
import { DeleteRoomCommand } from '@src/modules/rooms/applications/useCase/commands/DeleteRoomCommand';

const repository = {
  delete: async (): Promise<boolean> => true,
} as IRoomRepository;

describe('DeleteRoomCommandHandler', () => {
  it('should delete a room', async () => {
    const handler = new DeleteRoomCommandHandler(repository);

    const status = await handler.execute(new DeleteRoomCommand(1));

    expect(status).toBe(true);
  });
});
