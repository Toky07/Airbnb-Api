import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ImportPropertiesUseCase } from './import-properties.usecase';
import { createImportBatchContext } from './import-test.helpers';

const mockExecute = vi.fn();

vi.mock('../../../../shared/useCase/bus/bus', () => ({
  CommandBus: { execute: (...args: unknown[]) => mockExecute(...args) },
}));

describe('ImportPropertiesUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue({
      id: 10,
      name: 'Hôtel Azur',
    });
  });

  it('crée un établissement pour un propriétaire connu', async () => {
    const context = createImportBatchContext({
      emailToUserId: new Map([['owner@example.com', 5]]),
    });

    const useCase = new ImportPropertiesUseCase();
    const result = await useCase.execute(
      [
        {
          name: 'Hôtel Azur',
          description: 'Description assez longue pour valider.',
          address: '1 rue',
          city: 'Nice',
          country: 'France',
          latitude: 43.7,
          longitude: 7.2,
          checkInTime: '15:00',
          checkOutTime: '11:00',
          ownerEmail: 'owner@example.com',
        },
      ],
      context,
    );

    expect(result.created).toBe(1);
    expect(context.propertyNameToId.get('Hôtel Azur')).toBe(10);
  });

  it('signale un propriétaire introuvable', async () => {
    const useCase = new ImportPropertiesUseCase();
    const result = await useCase.execute(
      [
        {
          name: 'Hôtel Azur',
          description: 'Description assez longue pour valider.',
          address: '1 rue',
          city: 'Nice',
          country: 'France',
          latitude: 43.7,
          longitude: 7.2,
          checkInTime: '15:00',
          checkOutTime: '11:00',
          ownerEmail: 'missing@example.com',
        },
      ],
      createImportBatchContext(),
    );

    expect(result.created).toBe(0);
    expect(result.errors[0]?.field).toBe('ownerEmail');
  });
});
