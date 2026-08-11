import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserNameVO } from '../../../../user/contracts';
import { RoleEntity } from '../../../domain/entities/role.entity';
import {
  HOST_ROLE_SLUG,
  SUPERADMIN_ROLE_SLUG,
} from '../../../domain/constants/permissions.constant';
import { TRAVELER_ROLE_SLUG } from '../../../domain/constants/system-roles.constant';
import type { IRoleRepository } from '../../../domain/repositories/role.repository';
import { DeleteRoleCommandHandler } from './DeleteRoleCommandHandler';
import { DeleteRoleCommand } from '../commands/DeleteRoleCommand';

describe('DeleteRoleCommandHandler', () => {
  const customRole = new RoleEntity(new UserNameVO('test'), 'test', 1);
  const repository = {
    delete: async (): Promise<boolean> => true,
    findById: async (): Promise<RoleEntity | null> => customRole,
  } as unknown as IRoleRepository;

  it('should delete a custom role', async () => {
    const handler = new DeleteRoleCommandHandler(repository);
    const isDeleted = await handler.execute(new DeleteRoleCommand(1));
    expect(isDeleted).toBe(true);
  });

  it('should throw if the role is not found', async () => {
    const handler = new DeleteRoleCommandHandler({
      ...repository,
      findById: async () => null,
    });

    await expect(
      handler.execute(new DeleteRoleCommand(2)),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it.each([SUPERADMIN_ROLE_SLUG, HOST_ROLE_SLUG, TRAVELER_ROLE_SLUG])(
    'should forbid deleting system role %s',
    async (slug) => {
      const handler = new DeleteRoleCommandHandler({
        ...repository,
        findById: async () => new RoleEntity(new UserNameVO(slug), slug, 10),
      });

      await expect(
        handler.execute(new DeleteRoleCommand(10)),
      ).rejects.toBeInstanceOf(ForbiddenException);
    },
  );
});
