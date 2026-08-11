import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserNameVO } from '@src/modules/user/contracts';
import { RoleEntity } from '@src/modules/authentication/domain/entities/role.entity';
import { SUPERADMIN_ROLE_SLUG } from '@src/modules/authentication/domain/constants/permissions.constant';
import type { IRoleRepository } from '@src/modules/authentication/domain/repositories/role.repository';
import { SetRolePermissionsCommandHandler } from './SetRolePermissionsCommandHandler';
import { SetRolePermissionsCommand } from '@src/modules/authentication/applications/useCase/commands/SetRolePermissionsCommand';

describe('SetRolePermissionsCommandHandler', () => {
  const hostRole = new RoleEntity(new UserNameVO('Hôte'), 'host', 2, null, [
    'host.dashboard.read',
  ]);

  const repository = {
    findById: async () => hostRole,
    setPermissions: async (_id: number, keys: string[]) =>
      new RoleEntity(new UserNameVO('Hôte'), 'host', 2, null, keys),
  } as unknown as IRoleRepository;

  it('should update role permissions', async () => {
    const handler = new SetRolePermissionsCommandHandler(repository);
    const result = await handler.execute(
      new SetRolePermissionsCommand(2, [
        'host.property.read',
        'host.rooms.read',
      ]),
    );

    expect(result.permissionKeys).toEqual([
      'host.property.read',
      'host.rooms.read',
    ]);
  });

  it('should throw if role is not found', async () => {
    const handler = new SetRolePermissionsCommandHandler({
      ...repository,
      findById: async () => null,
    });

    await expect(
      handler.execute(new SetRolePermissionsCommand(99, ['users.read'])),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should forbid updating superadmin permissions', async () => {
    const handler = new SetRolePermissionsCommandHandler({
      ...repository,
      findById: async () =>
        new RoleEntity(new UserNameVO('Super'), SUPERADMIN_ROLE_SLUG, 1),
    });

    await expect(
      handler.execute(new SetRolePermissionsCommand(1, ['users.read'])),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
