import { describe, expect, it, vi } from 'vitest';
import { ImportDataUseCase } from './importData.usecase';

describe('ImportDataUseCase — catégories', () => {
  it('importe des types d’établissement et signale les doublons', async () => {
    const createPropertyType = {
      execute: vi
        .fn()
        .mockResolvedValueOnce({
          id: 1,
          name: 'Villa',
          slug: 'villa',
          sortOrder: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
    };

    const useCase = new ImportDataUseCase(
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      createPropertyType as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { findAll: async () => [] } as never,
      { findAll: async () => [], findById: async () => null } as never,
      {
        findAll: async () => [
          {
            id: 2,
            name: 'Resort',
            slug: 'resort',
            sortOrder: 0,
            isActive: true,
          },
        ],
      } as never,
      { findAll: async () => [] } as never,
      { findBySlug: async () => null } as never,
    );

    const result = await useCase.execute({
      propertyTypes: [
        { name: 'Villa', sortOrder: 0, isActive: true },
        { name: 'Resort', sortOrder: 1, isActive: true },
      ],
    });

    expect(result.created.propertyTypes).toBe(1);
    expect(createPropertyType.execute).toHaveBeenCalledTimes(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.entity).toBe('propertyType');
  });
});
