import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { IRoleRepository } from '../../../domain/repositories/role.repository';
import { SUPERADMIN_ROLE_SLUG } from '../../../domain/constants/permissions.constant';
import type { DeleteRoleCommand } from '../commands/DeleteRoleCommand';

export class DeleteRoleCommandHandler implements ICommandHandler<
  DeleteRoleCommand,
  boolean
> {
  constructor(private readonly repository: IRoleRepository) {}

  async execute(command: DeleteRoleCommand): Promise<boolean> {
    const role = await this.repository.findById(command.id);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.slug === SUPERADMIN_ROLE_SLUG) {
      throw new ForbiddenException(
        'Le rôle super administrateur ne peut pas être supprimé',
      );
    }

    return this.repository.delete(command.id);
  }
}
