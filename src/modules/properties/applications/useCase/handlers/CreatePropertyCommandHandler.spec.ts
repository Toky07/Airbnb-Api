import { Property } from '../../../domain/entities/property.entity';
import type { IPropertyRepository } from '../../../domain/repositories/property.repository';
import { CreatePropertyCommandHandler } from './CreatePropertyCommandHandler';
import { CreatePropertyCommand } from '../commands/CreatePropertyCommand';
import { PropertyOutput } from '../../dto/property.outup';
import { mockPropertyMediaPresenter } from '../test-helpers/property-usecase.mocks';

const repository = {
  create: async (property: Property): Promise<Property> => ({
    ...property,
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
} as IPropertyRepository;

describe('CreatePropertyCommandHandler', () => {
  it('should create a property', async () => {
    const handler = new CreatePropertyCommandHandler(
      repository,
      mockPropertyMediaPresenter,
    );
    const result = await handler.execute(
      new CreatePropertyCommand({
        name: 'Test Property',
        description: 'Test Description',
        address: 'Test Address',
        city: 'Test City',
        country: 'Test Country',
        latitude: 0,
        longitude: 0,
        checkInTime: 'Test CheckInTime',
        checkOutTime: 'Test CheckOutTime',
        ownerId: 1,
      }),
    );

    expect(result).toBeInstanceOf(PropertyOutput);
    expect(result.name).toBe('Test Property');
    expect(result.ownerId).toBe(1);
    expect(result.image).toBeNull();
  });
});
