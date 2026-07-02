import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ImportRolesUseCase } from './import-roles.usecase';
import { CreateRoleCommand } from '../../../authentication/useCase/commands/CreateRoleCommand';
import { UpdateRoleCommand } from '../../../authentication/useCase/commands/UpdateRoleCommand';
import { SetRolePermissionsCommand } from '../../../authentication/useCase/commands/SetRolePermissionsCommand';

const mockExecute = vi.fn();

vi.mock('../../../../shared/useCase/bus/bus', () => ({
  CommandBus: { execute: (...args: unknown[]) => mockExecute(...args) },
}));

describe('ImportRolesUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('crée un rôle et assigne ses permissions', async () => {
    mockExecute
      .mockResolvedValueOnce({ id: 3, name: 'Support', slug: 'support' })
      .mockResolvedValueOnce({});

    const roleRepository = { findBySlug: vi.fn().mockResolvedValue(null) };
    const useCase = new ImportRolesUseCase(roleRepository as never);

    const result = await useCase.execute([
      {
        name: 'Support',
        slug: 'support',
        description: 'Accès limité',
        permissionKeys: 'users.read;users.update',
      },
    ]);

    expect(result.created).toBe(1);
    expect(mockExecute).toHaveBeenCalledTimes(2);
    expect(mockExecute.mock.calls[0]?.[0]).toBeInstanceOf(CreateRoleCommand);
    expect(mockExecute.mock.calls[1]?.[0]).toEqual(
      new SetRolePermissionsCommand(3, ['users.read', 'users.update']),
    );
  });

  it('met à jour un rôle existant', async () => {
    mockExecute.mockResolvedValue({});

    const roleRepository = {
      findBySlug: vi.fn().mockResolvedValue({ id: 2, slug: 'support', name: 'Support' }),
    };

    const useCase = new ImportRolesUseCase(roleRepository as never);

    const result = await useCase.execute([
      {
        name: 'Support',
        slug: 'support',
        permissionKeys: 'users.read',
      },
    ]);

    expect(result.created).toBe(1);
    expect(mockExecute).toHaveBeenCalledTimes(2);
    expect(mockExecute.mock.calls[0]?.[0]).toBeInstanceOf(UpdateRoleCommand);
    expect(mockExecute.mock.calls[1]?.[0]).toEqual(
      new SetRolePermissionsCommand(2, ['users.read']),
    );
  });
});
