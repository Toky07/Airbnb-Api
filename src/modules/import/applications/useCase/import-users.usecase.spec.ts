import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ImportUsersUseCase } from './import-users.usecase';
import { createImportBatchContext } from './import-test.helpers';

const mockExecute = vi.fn();

vi.mock('../../../../shared/useCase/bus/bus', () => ({
  CommandBus: { execute: (...args: unknown[]) => mockExecute(...args) },
}));

describe('ImportUsersUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue({
      id: 1,
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@example.com',
      phoneNumber: '+33612345678',
      avatar: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('crée un utilisateur et signale un e-mail dupliqué', async () => {
    const context = createImportBatchContext({
      emailToUserId: new Map([['exist@example.com', 9]]),
    });

    const useCase = new ImportUsersUseCase();
    const result = await useCase.execute(
      [
        {
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean@example.com',
          phoneNumber: '+33612345678',
        },
        {
          firstName: 'Marie',
          lastName: 'Curie',
          email: 'exist@example.com',
          phoneNumber: '+33698765432',
        },
      ],
      context,
    );

    expect(result.created).toBe(1);
    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.entity).toBe('user');
    expect(context.emailToUserId.get('jean@example.com')).toBe(1);
  });

  it('retourne un résultat vide sans lignes', async () => {
    const useCase = new ImportUsersUseCase();
    const result = await useCase.execute(undefined, createImportBatchContext());

    expect(result.created).toBe(0);
    expect(result.errors).toHaveLength(0);
  });
});
