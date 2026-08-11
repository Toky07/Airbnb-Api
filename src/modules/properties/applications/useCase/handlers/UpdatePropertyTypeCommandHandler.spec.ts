import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PropertyType } from '@src/modules/properties/domain/entities/property-type.entity';
import { UpdatePropertyTypeCommandHandler } from './UpdatePropertyTypeCommandHandler';
import { DeletePropertyTypeCommandHandler } from './DeletePropertyTypeCommandHandler';
import { UpdatePropertyTypeCommand } from '@src/modules/properties/applications/useCase/commands/UpdatePropertyTypeCommand';
import { DeletePropertyTypeCommand } from '@src/modules/properties/applications/useCase/commands/DeletePropertyTypeCommand';

const existingType = new PropertyType(
  'Villa',
  'villa',
  0,
  true,
  1,
  new Date(),
  new Date(),
);

describe('UpdatePropertyTypeCommandHandler', () => {
  it('updates a property type', async () => {
    const repository = {
      findById: async () => existingType,
      findBySlug: async () => null,
      update: async (type: PropertyType) => type,
    };

    const handler = new UpdatePropertyTypeCommandHandler(repository as never);
    const result = await handler.execute(
      new UpdatePropertyTypeCommand(1, { name: 'Maison' }),
    );

    expect(result.name).toBe('Maison');
    expect(result.slug).toBe('maison');
  });

  it('throws when property type is not found', async () => {
    const handler = new UpdatePropertyTypeCommandHandler({
      findById: async () => null,
    } as never);

    await expect(
      handler.execute(new UpdatePropertyTypeCommand(99, { name: 'Test' })),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws on duplicate slug', async () => {
    const handler = new UpdatePropertyTypeCommandHandler({
      findById: async () => existingType,
      findBySlug: async () =>
        new PropertyType('Autre', 'maison', 0, true, 2, new Date(), new Date()),
    } as never);

    await expect(
      handler.execute(new UpdatePropertyTypeCommand(1, { name: 'Maison' })),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('DeletePropertyTypeCommandHandler', () => {
  it('deletes an unused property type', async () => {
    const repository = {
      findById: async () => existingType,
      countUsages: async () => 0,
      delete: async () => true,
    };

    const handler = new DeletePropertyTypeCommandHandler(repository as never);
    const result = await handler.execute(new DeletePropertyTypeCommand(1));

    expect(result).toBe(true);
  });

  it('throws when property type is not found', async () => {
    const handler = new DeletePropertyTypeCommandHandler({
      findById: async () => null,
    } as never);

    await expect(
      handler.execute(new DeletePropertyTypeCommand(99)),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when property type is in use', async () => {
    const handler = new DeletePropertyTypeCommandHandler({
      findById: async () => existingType,
      countUsages: async () => 3,
    } as never);

    await expect(
      handler.execute(new DeletePropertyTypeCommand(1)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
