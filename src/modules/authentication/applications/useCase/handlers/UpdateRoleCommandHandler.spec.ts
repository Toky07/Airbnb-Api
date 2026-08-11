import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserNameVO } from '@src/modules/user/contracts';
import { RoleEntity } from '@src/modules/authentication/domain/entities/role.entity';
import {
  HOST_ROLE_SLUG,
  SUPERADMIN_ROLE_SLUG,
} from '@src/modules/authentication/domain/constants/permissions.constant';
import { TRAVELER_ROLE_SLUG } from '@src/modules/authentication/domain/constants/system-roles.constant';
import type { IRoleRepository } from '@src/modules/authentication/domain/repositories/role.repository';
import { UpdateRoleCommandHandler } from './UpdateRoleCommandHandler';
import { UpdateRoleCommand } from '@src/modules/authentication/applications/useCase/commands/UpdateRoleCommand';

describe('UpdateRoleCommandHandler', () => {
  const customRole = new RoleEntity(new UserNameVO('test'), 'test', 1);
  const repository = {
    update: async (role: RoleEntity): Promise<RoleEntity> => role,
    findById: async (): Promise<RoleEntity | null> => customRole,
  } as unknown as IRoleRepository;

  it('should update a custom role', async () => {
    const handler = new UpdateRoleCommandHandler(repository);
    const role = await handler.execute(
      new UpdateRoleCommand({ id: 1, name: 'updated' }),
    );
    expect(role.name).toBe('updated');
    expect(role.isSystem).toBe(false);
  });

  it('should throw if the role is not found', async () => {
    const handler = new UpdateRoleCommandHandler({
      ...repository,
      findById: async () => null,
    });

    await expect(
      handler.execute(new UpdateRoleCommand({ id: 2, name: 'test' })),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it.each([SUPERADMIN_ROLE_SLUG, HOST_ROLE_SLUG, TRAVELER_ROLE_SLUG])(
    'should forbid updating system role %s',
    async (slug) => {
      const handler = new UpdateRoleCommandHandler({
        ...repository,
        findById: async () => new RoleEntity(new UserNameVO(slug), slug, 10),
      });

      await expect(
        handler.execute(
          new UpdateRoleCommand({ id: 10, name: 'renamed', description: 'x' }),
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    },
  );
});
