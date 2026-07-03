import { IRoomRepository } from '../../../domain/repositories/room.repository';
import { DeleteRoomCommandHandler } from './DeleteRoomCommandHandler';
import { DeleteRoomCommand } from '../commands/DeleteRoomCommand';

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
