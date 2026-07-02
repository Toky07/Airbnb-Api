import { Property } from '../../../domain/entities/property.entity';
import type { IPropertyRepository } from '../../../domain/repositories/property.repository';
import { ListPropertiesQueryHandler } from './ListPropertiesQueryHandler';
import { ListPropertiesQuery } from '../queries/ListPropertiesQuery';
import { PropertyOutput } from '../../dto/property.outup';
import { buildPaginationMeta } from '../../../../../shared/pagination/pagination.types';
import { mockPropertyMediaPresenter } from '../test-helpers/property-usecase.mocks';

const repository = {
  findPaginated: async () => ({
    data: [
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
    ],
    meta: buildPaginationMeta(1, 1, 10),
  }),
} as unknown as IPropertyRepository;

describe('ListPropertiesQueryHandler', () => {
  it('should list properties', async () => {
    const handler = new ListPropertiesQueryHandler(
      repository,
      mockPropertyMediaPresenter,
    );

    const result = await handler.execute(new ListPropertiesQuery({ page: 1, limit: 10 }));

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toBeInstanceOf(PropertyOutput);
    expect(result.meta.total).toBe(1);
  });
});
