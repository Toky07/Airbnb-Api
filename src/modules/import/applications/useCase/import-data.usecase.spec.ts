import { describe, expect, it, vi } from 'vitest';
import { ImportDataUseCase } from './import-data.usecase';

describe('ImportDataUseCase', () => {
  it('orchestre les imports et agrège les résultats', async () => {
    const importBatchContext = {
      create: vi.fn().mockResolvedValue({
        emailToUserId: new Map(),
        propertyKeyToId: new Map(),
        propertyNameToId: new Map(),
        propertyTypeSlugs: new Set(),
        roomTypeSlugs: new Set(),
      }),
    };
    const importUsers = {
      execute: vi.fn().mockResolvedValue({ created: 1, errors: [] }),
    };
    const importProperties = {
      execute: vi.fn().mockResolvedValue({ created: 0, errors: [] }),
    };
    const importRooms = {
      execute: vi.fn().mockResolvedValue({ created: 0, errors: [] }),
    };
    const importPropertyTypes = {
      execute: vi.fn().mockResolvedValue({ created: 0, errors: [] }),
    };
    const importRoomTypes = {
      execute: vi.fn().mockResolvedValue({ created: 0, errors: [] }),
    };
    const importRoles = {
      execute: vi.fn().mockResolvedValue({ created: 2, errors: [{ entity: 'role', index: 1, message: 'Erreur' }] }),
    };

    const useCase = new ImportDataUseCase(
      importBatchContext as never,
      importUsers as never,
      importProperties as never,
      importRooms as never,
      importPropertyTypes as never,
      importRoomTypes as never,
      importRoles as never,
    );

    const result = await useCase.execute({
      users: [{ firstName: 'Jean', lastName: 'Dupont', email: 'jean@example.com', phoneNumber: '+33612345678' }],
      roles: [
        { name: 'Support', slug: 'support', permissionKeys: 'users.read' },
        { name: 'Bad', slug: 'bad', permissionKeys: 'unknown.permission' },
      ],
    });

    expect(importBatchContext.create).toHaveBeenCalledTimes(1);
    expect(importUsers.execute).toHaveBeenCalledTimes(1);
    expect(importRoles.execute).toHaveBeenCalledTimes(1);
    expect(result.created.users).toBe(1);
    expect(result.created.roles).toBe(2);
    expect(result.errors).toHaveLength(1);
  });
});
