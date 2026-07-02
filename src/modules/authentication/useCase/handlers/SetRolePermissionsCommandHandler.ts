import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { ICommandHandler } from '../../../../shared/useCase/bus/command-handler.interface';
import type { IRoleRepository } from '../../domain/repositories/role.repository';
import { RoleOutput } from '../../application/dto/role.output';
import { SUPERADMIN_ROLE_SLUG } from '../../domain/constants/permissions.constant';
import type { SetRolePermissionsCommand } from '../commands/SetRolePermissionsCommand';

export class SetRolePermissionsCommandHandler
  implements ICommandHandler<SetRolePermissionsCommand, RoleOutput>
{
  constructor(private readonly repository: IRoleRepository) {}

  async execute(command: SetRolePermissionsCommand): Promise<RoleOutput> {
    const role = await this.repository.findById(command.roleId);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.slug === SUPERADMIN_ROLE_SLUG) {
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
