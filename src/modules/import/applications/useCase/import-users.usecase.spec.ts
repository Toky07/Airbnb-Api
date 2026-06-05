import { describe, expect, it, vi } from 'vitest';
import { ImportUsersUseCase } from './import-users.usecase';
import { createImportBatchContext } from './import-test.helpers';

describe('ImportUsersUseCase', () => {
  it('crée un utilisateur et signale un e-mail dupliqué', async () => {
    const createUser = {
      execute: vi.fn().mockResolvedValue({
        id: 1,
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        phoneNumber: '+33612345678',
        avatar: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };

    const context = createImportBatchContext({
      emailToUserId: new Map([['exist@example.com', 9]]),
    });

    const useCase = new ImportUsersUseCase(createUser as never);
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
    expect(createUser.execute).toHaveBeenCalledTimes(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.entity).toBe('user');
    expect(context.emailToUserId.get('jean@example.com')).toBe(1);
  });

  it('retourne un résultat vide sans lignes', async () => {
    const useCase = new ImportUsersUseCase({ execute: vi.fn() } as never);
    const result = await useCase.execute(undefined, createImportBatchContext());

    expect(result.created).toBe(0);
    expect(result.errors).toHaveLength(0);
  });
});
