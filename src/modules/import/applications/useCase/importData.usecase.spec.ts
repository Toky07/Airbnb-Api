import { describe, expect, it, vi } from 'vitest';
import { ImportDataUseCase } from './importData.usecase';

describe('ImportDataUseCase', () => {
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

    const useCase = new ImportDataUseCase(
      createUser as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      {
        findAll: async () => [
          {
            id: 9,
            email: 'exist@example.com',
          },
        ],
      } as never,
      { findAll: async () => [], findById: async () => null } as never,
      { findAll: async () => [] } as never,
      { findAll: async () => [] } as never,
      { findBySlug: async () => null } as never,
    );

    const result = await useCase.execute({
      users: [
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
    });

    expect(result.created.users).toBe(1);
    expect(createUser.execute).toHaveBeenCalledTimes(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.entity).toBe('user');
  });
});
