import { describe, expect, it, vi } from 'vitest';
import { ImportRoomTypesUseCase } from './import-room-types.usecase';
import { createImportBatchContext } from './import-test.helpers';

describe('ImportRoomTypesUseCase', () => {
  it('importe des types et signale les doublons', async () => {
    const createRoomType = {
      execute: vi.fn().mockResolvedValueOnce({
        id: 1,
        name: 'Standard',
        slug: 'standard',
        sortOrder: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };

    const context = createImportBatchContext({
      roomTypeSlugs: new Set(['suite']),
    });

    const useCase = new ImportRoomTypesUseCase(createRoomType as never);
    const result = await useCase.execute(
      [
        { name: 'Standard', sortOrder: 0, isActive: true },
        { name: 'Suite', sortOrder: 1, isActive: true },
      ],
      context,
    );

    expect(result.created).toBe(1);
    expect(createRoomType.execute).toHaveBeenCalledTimes(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.entity).toBe('roomType');
  });
});
