import { Property } from '@src/modules/properties/domain/entities/property.entity';
import type { IPropertyRepository } from '@src/modules/properties/domain/repositories/property.repository';
import { PropertyOutput } from '@src/modules/properties/applications/dto/property.output';
import { mockPropertyMediaPresenter } from '@src/modules/properties/applications/useCase/test-helpers/property-usecase.mocks';
import { ListPropertyOptionsQueryHandler } from './ListPropertyOptionsQueryHandler';
import { ListPropertyOptionsQuery } from '@src/modules/properties/applications/useCase/queries/ListPropertyOptionsQuery';

describe('ListPropertyOptionsQueryHandler', () => {
  it('lists all properties as options', async () => {
    const repository = {
      findAll: async () => [
        new Property({
          name: 'Hôtel Test',
          description: 'Desc',
          address: '1 rue Test',
          city: 'Paris',
          country: 'FR',
          latitude: 0,
          longitude: 0,
          checkInTime: '15:00',
          checkOutTime: '11:00',
          ownerId: 1,
          id: 1,
        }),
      ],
    } as unknown as IPropertyRepository;

    const handler = new ListPropertyOptionsQueryHandler(
      repository,
      mockPropertyMediaPresenter,
    );
    const result = await handler.execute(new ListPropertyOptionsQuery());

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(PropertyOutput);
    expect(result[0]?.name).toBe('Hôtel Test');
  });
});
