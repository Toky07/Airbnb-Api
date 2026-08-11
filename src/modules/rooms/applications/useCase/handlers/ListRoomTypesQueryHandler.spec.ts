import { RoomType } from '@src/modules/rooms/domain/entities/room-type.entity';
import { RoomTypeOutput } from '@src/modules/rooms/applications/dto/room-type.output';
import { ListRoomTypesQueryHandler } from './ListRoomTypesQueryHandler';
import { ListRoomTypeOptionsQueryHandler } from './ListRoomTypeOptionsQueryHandler';
import { ListRoomTypesQuery } from '@src/modules/rooms/applications/useCase/queries/ListRoomTypesQuery';
import { ListRoomTypeOptionsQuery } from '@src/modules/rooms/applications/useCase/queries/ListRoomTypeOptionsQuery';

describe('ListRoomTypesQueryHandler', () => {
  it('lists all room types', async () => {
    const repository = {
      findAll: async () => [
        new RoomType(
          'Standard',
          'standard',
          0,
          true,
          1,
          new Date(),
          new Date(),
        ),
      ],
    };

    const handler = new ListRoomTypesQueryHandler(repository as never);
    const result = await handler.execute(new ListRoomTypesQuery());

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(RoomTypeOutput);
  });
});

describe('ListRoomTypeOptionsQueryHandler', () => {
  it('lists active room types', async () => {
    const repository = {
      findActive: async () => [
        new RoomType('Suite', 'suite', 0, true, 2, new Date(), new Date()),
      ],
    };

    const handler = new ListRoomTypeOptionsQueryHandler(repository as never);
    const result = await handler.execute(new ListRoomTypeOptionsQuery());

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Suite');
  });
});
