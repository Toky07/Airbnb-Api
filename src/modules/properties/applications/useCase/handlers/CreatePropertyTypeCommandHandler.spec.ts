import { CreatePropertyTypeCommandHandler } from './CreatePropertyTypeCommandHandler';
import { CreatePropertyTypeCommand } from '@src/modules/properties/applications/useCase/commands/CreatePropertyTypeCommand';
import type { IPropertyTypeRepository } from '@src/modules/properties/domain/repositories/property-type.repository';

describe('CreatePropertyTypeCommandHandler', () => {
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

    const handler = new CreatePropertyTypeCommandHandler(repository);
    const result = await handler.execute(
      new CreatePropertyTypeCommand({ name: 'Villa' }),
    );

    expect(result.name).toBe('Villa');
    expect(result.slug).toBe('villa');
  });
});
