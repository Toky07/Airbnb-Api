import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { RoomType } from '../../../domain/entities/room-type.entity';
import { CreateRoomTypeCommandHandler } from './CreateRoomTypeCommandHandler';
import { UpdateRoomTypeCommandHandler } from './UpdateRoomTypeCommandHandler';
import { DeleteRoomTypeCommandHandler } from './DeleteRoomTypeCommandHandler';
import { CreateRoomTypeCommand } from '../commands/CreateRoomTypeCommand';
import { UpdateRoomTypeCommand } from '../commands/UpdateRoomTypeCommand';
import { DeleteRoomTypeCommand } from '../commands/DeleteRoomTypeCommand';

const existingType = new RoomType(
  'Standard',
  'standard',
  0,
  true,
  1,
  new Date(),
  new Date(),
);

describe('CreateRoomTypeCommandHandler', () => {
  it('creates a room type', async () => {
    const repository = {
      findBySlug: async () => null,
      create: async (type: RoomType) =>
        new RoomType(type.name, type.slug, type.sortOrder, type.isActive, 1),
    };

    const handler = new CreateRoomTypeCommandHandler(repository as never);
    const result = await handler.execute(
      new CreateRoomTypeCommand({ name: 'Suite' }),
    );

    expect(result.name).toBe('Suite');
    expect(result.slug).toBe('suite');
  });

  it('throws when name is empty', async () => {
    const handler = new CreateRoomTypeCommandHandler({} as never);

    await expect(
      handler.execute(new CreateRoomTypeCommand({ name: '   ' })),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('UpdateRoomTypeCommandHandler', () => {
  it('updates a room type', async () => {
    const repository = {
      findById: async () => existingType,
      findBySlug: async () => null,
      update: async (type: RoomType) => type,
    };

    const handler = new UpdateRoomTypeCommandHandler(repository as never);
    const result = await handler.execute(
      new UpdateRoomTypeCommand(1, { name: 'Deluxe' }),
    );

    expect(result.name).toBe('Deluxe');
    expect(result.slug).toBe('deluxe');
  });

  it('throws when room type is not found', async () => {
    const handler = new UpdateRoomTypeCommandHandler({
      findById: async () => null,
    } as never);

    await expect(
      handler.execute(new UpdateRoomTypeCommand(99, { name: 'Test' })),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('DeleteRoomTypeCommandHandler', () => {
  it('deletes an unused room type', async () => {
    const repository = {
      findById: async () => existingType,
      countUsages: async () => 0,
      delete: async () => true,
    };

    const handler = new DeleteRoomTypeCommandHandler(repository as never);
    const result = await handler.execute(new DeleteRoomTypeCommand(1));

    expect(result).toBe(true);
  });

  it('throws when room type is in use', async () => {
    const handler = new DeleteRoomTypeCommandHandler({
      findById: async () => existingType,
      countUsages: async () => 2,
    } as never);

    await expect(
      handler.execute(new DeleteRoomTypeCommand(1)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
