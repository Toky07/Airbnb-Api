import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ImportRolesHandler } from './ImportRolesHandler';
import { CreateRoleCommand } from '../../../../authentication/applications/useCase/commands/CreateRoleCommand';
import { UpdateRoleCommand } from '../../../../authentication/applications/useCase/commands/UpdateRoleCommand';
import { SetRolePermissionsCommand } from '../../../../authentication/applications/useCase/commands/SetRolePermissionsCommand';
import { commandBusExecuteMock } from '../../../../../test/command-bus.mock';

describe('ImportRolesHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('crée un rôle et assigne ses permissions', async () => {
    commandBusExecuteMock
      .mockResolvedValueOnce({ id: 3, name: 'Support', slug: 'support' })
      .mockResolvedValueOnce({});

    const roleRepository = { findBySlug: vi.fn().mockResolvedValue(null) };
    const handler = new ImportRolesHandler(roleRepository as never);

    const result = await handler.execute([
      {
        name: 'Support',
        slug: 'support',
        description: 'Accès limité',
        permissionKeys: 'users.read;users.update',
      },
    ]);

    expect(result.created).toBe(1);
    expect(commandBusExecuteMock).toHaveBeenCalledTimes(2);
    expect(commandBusExecuteMock.mock.calls[0]?.[0]).toBeInstanceOf(
      CreateRoleCommand,
    );
    expect(commandBusExecuteMock.mock.calls[1]?.[0]).toEqual(
      new SetRolePermissionsCommand(3, ['users.read', 'users.update']),
    );
  });

  it('met à jour un rôle existant', async () => {
    commandBusExecuteMock.mockResolvedValue({});

    const roleRepository = {
      findBySlug: vi
        .fn()
        .mockResolvedValue({ id: 2, slug: 'support', name: 'Support' }),
    };

    const handler = new ImportRolesHandler(roleRepository as never);

    const result = await handler.execute([
      {
        name: 'Support',
        slug: 'support',
        permissionKeys: 'users.read',
      },
    ]);

    expect(result.created).toBe(1);
    expect(commandBusExecuteMock).toHaveBeenCalledTimes(2);
    expect(commandBusExecuteMock.mock.calls[0]?.[0]).toBeInstanceOf(
      UpdateRoleCommand,
    );
    expect(commandBusExecuteMock.mock.calls[1]?.[0]).toEqual(
      new SetRolePermissionsCommand(2, ['users.read']),
    );
  });
});
