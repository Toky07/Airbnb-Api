import { describe, expect, it, vi } from 'vitest';
import { ImportPropertyTypesUseCase } from './import-property-types.usecase';
import { createImportBatchContext } from './import-test.helpers';

describe('ImportPropertyTypesUseCase', () => {
  it('importe des types et signale les doublons', async () => {
    const createPropertyType = {
      execute: vi.fn().mockResolvedValueOnce({
        id: 1,
        name: 'Villa',
        slug: 'villa',
        sortOrder: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };

    const context = createImportBatchContext({
      propertyTypeSlugs: new Set(['resort']),
    });

    const useCase = new ImportPropertyTypesUseCase(createPropertyType as never);
    const result = await useCase.execute(
      [
        { name: 'Villa', sortOrder: 0, isActive: true },
        { name: 'Resort', sortOrder: 1, isActive: true },
      ],
      context,
    );

    expect(result.created).toBe(1);
    expect(createPropertyType.execute).toHaveBeenCalledTimes(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.entity).toBe('propertyType');
    expect(context.propertyTypeSlugs.has('villa')).toBe(true);
  });
});
