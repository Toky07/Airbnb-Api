import { vi } from 'vitest';
import { Property } from '../../../domain/entities/property.entity';
import type { IPropertyRepository } from '../../../domain/repositories/property.repository';
import { DeletePropertyCommandHandler } from './DeletePropertyCommandHandler';
import { DeletePropertyCommand } from '../commands/DeletePropertyCommand';

vi.mock('../../../../../shared/useCase/bus/bus', () => ({
  CommandBus: { execute: vi.fn(async () => undefined) },
}));

const repository = {
  findById: async (): Promise<Property> =>
    new Property({
      name: 'Test',
      description: 'Test',
      address: 'Test',
      city: 'Test',
      country: 'Test',
      latitude: 0,
      longitude: 0,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      ownerId: 1,
      id: 1,
    }),
  delete: async () => true,
} as IPropertyRepository;

describe('DeletePropertyCommandHandler', () => {
  it('should delete a property', async () => {
    const handler = new DeletePropertyCommandHandler(repository);

    const result = await handler.execute(new DeletePropertyCommand(1));

    expect(result).toBe(true);
  });

  it('should throw when property is not found', async () => {
    const handler = new DeletePropertyCommandHandler({
      findById: async () => null,
    } as IPropertyRepository);

    await expect(handler.execute(new DeletePropertyCommand(2))).rejects.toThrow(
      'Property not found',
    );
  });
});
