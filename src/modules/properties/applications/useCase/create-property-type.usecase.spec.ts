import { CreatePropertyTypeUseCase } from './create-property-type.usecase';
import type { IPropertyTypeRepository } from '../../domain/repositories/property-type.repository';

describe('CreatePropertyTypeUseCase', () => {
  it('creates a property type', async () => {
    const repository = {
      findBySlug: async () => null,
      create: async () => ({
        id: 1,
        name: 'Villa',
        slug: 'villa',
        sortOrder: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    } as unknown as IPropertyTypeRepository;

    const useCase = new CreatePropertyTypeUseCase(repository);
    const result = await useCase.execute({ name: 'Villa' });

    expect(result.name).toBe('Villa');
    expect(result.slug).toBe('villa');
  });
});
