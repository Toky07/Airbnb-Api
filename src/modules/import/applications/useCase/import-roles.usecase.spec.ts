import { describe, expect, it, vi } from 'vitest';
import { ImportRolesUseCase } from './import-roles.usecase';

describe('ImportRolesUseCase', () => {
  it('crée un rôle et assigne ses permissions', async () => {
    const createRole = {
      execute: vi.fn().mockResolvedValue({ id: 3, name: 'Support', slug: 'support' }),
    };
    const updateRole = { execute: vi.fn() };
    const setRolePermissions = { execute: vi.fn().mockResolvedValue({}) };
    const roleRepository = { findBySlug: vi.fn().mockResolvedValue(null) };

    const useCase = new ImportRolesUseCase(
      createRole as never,
      updateRole as never,
      setRolePermissions as never,
      roleRepository as never,
    );

    const result = await useCase.execute([
      {
        name: 'Support',
        slug: 'support',
        description: 'Accès limité',
        permissionKeys: 'users.read;users.update',
      },
    ]);

    expect(result.created).toBe(1);
    expect(createRole.execute).toHaveBeenCalledTimes(1);
    expect(setRolePermissions.execute).toHaveBeenCalledWith(3, [
      'users.read',
      'users.update',
    ]);
  });

  it('met à jour un rôle existant', async () => {
    const createRole = { execute: vi.fn() };
    const updateRole = { execute: vi.fn().mockResolvedValue({}) };
    const setRolePermissions = { execute: vi.fn().mockResolvedValue({}) };
    const roleRepository = {
      findBySlug: vi.fn().mockResolvedValue({ id: 2, slug: 'support', name: 'Support' }),
    };

    const useCase = new ImportRolesUseCase(
      createRole as never,
      updateRole as never,
      setRolePermissions as never,
      roleRepository as never,
    );

    const result = await useCase.execute([
      {
        name: 'Support',
        slug: 'support',
        permissionKeys: 'users.read',
      },
    ]);

    expect(result.created).toBe(1);
    expect(createRole.execute).not.toHaveBeenCalled();
    expect(updateRole.execute).toHaveBeenCalledTimes(1);
    expect(setRolePermissions.execute).toHaveBeenCalledWith(2, ['users.read']);
  });
});
