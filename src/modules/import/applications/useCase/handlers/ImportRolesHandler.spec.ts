import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ImportRolesHandler } from './ImportRolesHandler';
import { CreateRoleCommand } from '../../../../authentication/contracts';
import { UpdateRoleCommand } from '../../../../authentication/contracts';
import { SetRolePermissionsCommand } from '../../../../authentication/contracts';
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

  it('met à jour uniquement les permissions d’un rôle système hôte', async () => {
    commandBusExecuteMock.mockResolvedValue({});

    const roleRepository = {
      findBySlug: vi
        .fn()
        .mockResolvedValue({ id: 4, slug: 'host', name: 'Hôte' }),
    };

    const handler = new ImportRolesHandler(roleRepository as never);

    const result = await handler.execute([
      {
        name: 'Hôte',
        slug: 'host',
        permissionKeys: 'host.dashboard.read',
      },
    ]);

    expect(result.created).toBe(1);
    expect(commandBusExecuteMock).toHaveBeenCalledTimes(1);
    expect(commandBusExecuteMock.mock.calls[0]?.[0]).toEqual(
      new SetRolePermissionsCommand(4, ['host.dashboard.read']),
    );
  });

  it('n’altère pas les permissions du superadmin à l’import', async () => {
    const roleRepository = {
      findBySlug: vi.fn().mockResolvedValue({
        id: 1,
        slug: 'superadmin',
        name: 'Super administrateur',
      }),
    };

    const handler = new ImportRolesHandler(roleRepository as never);

    const result = await handler.execute([
      {
        name: 'Super administrateur',
        slug: 'superadmin',
        permissionKeys: 'users.read',
      },
    ]);

    expect(result.created).toBe(1);
    expect(commandBusExecuteMock).not.toHaveBeenCalled();
  });
});
