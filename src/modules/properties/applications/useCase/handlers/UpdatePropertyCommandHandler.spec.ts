import { Property } from '@src/modules/properties/domain/entities/property.entity';
import type { IPropertyRepository } from '@src/modules/properties/domain/repositories/property.repository';
import { UpdatePropertyCommandHandler } from './UpdatePropertyCommandHandler';
import { UpdatePropertyCommand } from '@src/modules/properties/applications/useCase/commands/UpdatePropertyCommand';
import { PropertyOutput } from '@src/modules/properties/applications/dto/property.output';
import { mockPropertyMediaPresenter } from '@src/modules/properties/applications/useCase/test-helpers/property-usecase.mocks';

const repository = {
  findById: async (): Promise<Property> =>
    new Property({
      name: 'Old',
      description: 'Old',
      address: 'Old',
      city: 'Old',
      country: 'Old',
      latitude: 0,
      longitude: 0,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      ownerId: 1,
      id: 1,
    }),
  update: async (property: Property): Promise<Property> => property,
} as IPropertyRepository;

describe('UpdatePropertyCommandHandler', () => {
  it('should update a property', async () => {
    const handler = new UpdatePropertyCommandHandler(
      repository,
      mockPropertyMediaPresenter,
    );

    const result = await handler.execute(
      new UpdatePropertyCommand(1, {
        name: 'Updated Property',
        description: 'Updated Description',
        address: 'Updated Address',
        city: 'Updated City',
        country: 'Updated Country',
        latitude: 1,
        longitude: 2,
        checkInTime: '16:00',
        checkOutTime: '10:00',
        ownerId: 1,
      }),
    );

    expect(result).toBeInstanceOf(PropertyOutput);
    expect(result.name).toBe('Updated Property');
  });
});
