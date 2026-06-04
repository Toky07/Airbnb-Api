import { Property } from '../../domain/entities/property.entity';
import { ListPropertyUseCase } from './listProperty.usecase';
import type { IPropertyRepository } from '../../domain/repositories/property.repository';
import { mockPropertyMediaPresenter } from './test-helpers/property-usecase.mocks';
import { buildPaginationMeta } from '../../../../shared/pagination/pagination.types';

describe('ListPropertyUseCase', () => {
  const repository = {
    findPaginated: async () => ({
      data: [
        {
          id: 1,
          name: 'Test Property',
          description: 'Test Description',
          address: 'Test Address',
          city: 'Test City',
          country: 'Test Country',
          latitude: 0,
          longitude: 0,
          checkInTime: 'Test CheckInTime',
          checkOutTime: 'Test CheckOutTime',
          rooms: [],
          ownerId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Property,
      ],
      meta: buildPaginationMeta(1, 1, 10),
    }),
  } as unknown as IPropertyRepository;

  it('should list properties', async () => {
    const listPropertyUseCase = new ListPropertyUseCase(
      repository,
      mockPropertyMediaPresenter,
    );
    const result = await listPropertyUseCase.execute({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe(1);
    expect(result.data[0].name).toBe('Test Property');
  });
});
