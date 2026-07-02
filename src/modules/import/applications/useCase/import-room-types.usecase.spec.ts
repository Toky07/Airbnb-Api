import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ImportRoomTypesUseCase } from './import-room-types.usecase';
import { createImportBatchContext } from './import-test.helpers';
import { CreateRoomTypeCommand } from '../../../rooms/applications/useCase/commands/CreateRoomTypeCommand';

const mockExecute = vi.fn();

vi.mock('../../../../shared/useCase/bus/bus', () => ({
  CommandBus: { execute: (...args: unknown[]) => mockExecute(...args) },
}));

describe('ImportRoomTypesUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValueOnce({
      id: 1,
      name: 'Standard',
      slug: 'standard',
      sortOrder: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('importe des types et signale les doublons', async () => {
    const context = createImportBatchContext({
      roomTypeSlugs: new Set(['suite']),
    });

    const useCase = new ImportRoomTypesUseCase();
    const result = await useCase.execute(
      [
        { name: 'Standard', sortOrder: 0, isActive: true },
        { name: 'Suite', sortOrder: 1, isActive: true },
      ],
      context,
    );

    expect(result.created).toBe(1);
    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(mockExecute.mock.calls[0]?.[0]).toBeInstanceOf(CreateRoomTypeCommand);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.entity).toBe('roomType');
  });
});
