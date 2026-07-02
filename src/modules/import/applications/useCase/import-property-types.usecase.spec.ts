import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ImportPropertyTypesUseCase } from './import-property-types.usecase';
import { createImportBatchContext } from './import-test.helpers';

const mockExecute = vi.fn();

vi.mock('../../../../shared/useCase/bus/bus', () => ({
  CommandBus: { execute: (...args: unknown[]) => mockExecute(...args) },
}));

describe('ImportPropertyTypesUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValueOnce({
      id: 1,
      name: 'Villa',
      slug: 'villa',
      sortOrder: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('importe des types et signale les doublons', async () => {
    const context = createImportBatchContext({
      propertyTypeSlugs: new Set(['resort']),
    });

    const useCase = new ImportPropertyTypesUseCase();
    const result = await useCase.execute(
      [
        { name: 'Villa', sortOrder: 0, isActive: true },
        { name: 'Resort', sortOrder: 1, isActive: true },
      ],
      context,
    );

    expect(result.created).toBe(1);
    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.entity).toBe('propertyType');
    expect(context.propertyTypeSlugs.has('villa')).toBe(true);
  });
});
