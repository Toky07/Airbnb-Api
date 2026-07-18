import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ImportPropertyTypesHandler } from './ImportPropertyTypesHandler';
import { createImportBatchContext } from './import-test.helpers';
import { commandBusExecuteMock } from '../../../../../test/command-bus.mock';

describe('ImportPropertyTypesHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    commandBusExecuteMock.mockResolvedValueOnce({
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

    const handler = new ImportPropertyTypesHandler();
    const result = await handler.execute(
      [
        { name: 'Villa', sortOrder: 0, isActive: true },
        { name: 'Resort', sortOrder: 1, isActive: true },
      ],
      context,
    );

    expect(result.created).toBe(1);
    expect(commandBusExecuteMock).toHaveBeenCalledTimes(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.entity).toBe('propertyType');
    expect(context.propertyTypeSlugs.has('villa')).toBe(true);
  });
});
