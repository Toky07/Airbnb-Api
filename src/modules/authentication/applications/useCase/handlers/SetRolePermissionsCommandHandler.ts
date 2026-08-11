import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IRoleRepository } from '@src/modules/authentication/domain/repositories/role.repository';
import { RoleOutput } from '@src/modules/authentication/applications/dto/role.output';
import { isPermissionLockedRoleSlug } from '@src/modules/authentication/domain/constants/system-roles.constant';
import type { SetRolePermissionsCommand } from '@src/modules/authentication/applications/useCase/commands/SetRolePermissionsCommand';

export class SetRolePermissionsCommandHandler implements ICommandHandler<
  SetRolePermissionsCommand,
  RoleOutput
> {
  constructor(private readonly repository: IRoleRepository) {}

  async execute(command: SetRolePermissionsCommand): Promise<RoleOutput> {
    const role = await this.repository.findById(command.roleId);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (isPermissionLockedRoleSlug(role.slug)) {
      throw new ForbiddenException(
        'Les permissions du super administrateur ne peuvent pas être modifiées',
      );
    }

    const updated = await this.repository.setPermissions(
      command.roleId,
      command.permissionKeys,
    );
    return RoleOutput.fromDomain(updated);
  }
}
