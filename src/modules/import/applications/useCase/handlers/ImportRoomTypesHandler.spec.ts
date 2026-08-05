import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ImportRoomTypesHandler } from './import-category-types.handler';
import { createImportBatchContext } from './import-test.helpers';
import { CreateRoomTypeCommand } from '../../../../rooms/applications/useCase/commands/CreateRoomTypeCommand';
import { commandBusExecuteMock } from '../../../../../test/command-bus.mock';

describe('ImportRoomTypesHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    commandBusExecuteMock.mockResolvedValueOnce({
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

    const handler = new ImportRoomTypesHandler();
    const result = await handler.execute(
      [
        { name: 'Standard', sortOrder: 0, isActive: true },
        { name: 'Suite', sortOrder: 1, isActive: true },
      ],
      context,
    );

    expect(result.created).toBe(1);
    expect(commandBusExecuteMock).toHaveBeenCalledTimes(1);
    expect(commandBusExecuteMock.mock.calls[0]?.[0]).toBeInstanceOf(
      CreateRoomTypeCommand,
    );
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.entity).toBe('roomType');
  });
});
