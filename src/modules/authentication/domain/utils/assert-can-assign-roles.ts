import { ForbiddenException } from '@nestjs/common';
import { SUPERADMIN_ROLE_SLUG } from '@src/modules/authentication/domain/constants/permissions.constant';
import type { IRoleRepository } from '@src/modules/authentication/domain/repositories/role.repository';

export async function assertCanAssignRoleIds(
  roleRepository: IRoleRepository,
  roleIds: number[],
  actorIsSuperAdmin: boolean,
): Promise<void> {
  if (roleIds.length === 0) {
    return;
  }

  for (const roleId of roleIds) {
    const role = await roleRepository.findById(roleId);
    if (role?.slug === SUPERADMIN_ROLE_SLUG && !actorIsSuperAdmin) {
      throw new ForbiddenException(
        'Seul un super administrateur peut attribuer ce rôle.',
      );
    }
  }
}
