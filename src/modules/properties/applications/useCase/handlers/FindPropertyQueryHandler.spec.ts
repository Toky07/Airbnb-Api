import { Property } from '../../../domain/entities/property.entity';
import type { IPropertyRepository } from '../../../domain/repositories/property.repository';
import { FindPropertyQueryHandler } from './FindPropertyQueryHandler';
import { FindPropertyQuery } from '../queries/FindPropertyQuery';
import { PropertyOutput } from '../../dto/property.outup';
import { mockPropertyMediaPresenter } from '../test-helpers/property-usecase.mocks';

const repository = {
  findById: async (): Promise<Property> =>
    new Property({
      name: 'Test Property',
      description: 'Test Description',
      address: 'Test Address',
      city: 'Test City',
      country: 'Test Country',
      latitude: 0,
      longitude: 0,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      ownerId: 1,
      id: 1,
    }),
} as IPropertyRepository;

describe('FindPropertyQueryHandler', () => {
  it('should find a property', async () => {
    const handler = new FindPropertyQueryHandler(
      repository,
      mockPropertyMediaPresenter,
    );

    const result = await handler.execute(new FindPropertyQuery(1));

    expect(result).toBeInstanceOf(PropertyOutput);
    expect(result.id).toBe(1);
  });

  it('should throw when property is not found', async () => {
    const handler = new FindPropertyQueryHandler(
      { findById: async () => null } as IPropertyRepository,
      mockPropertyMediaPresenter,
    );

    await expect(handler.execute(new FindPropertyQuery(2))).rejects.toThrow(
      'Property not found',
    );
  });
});
