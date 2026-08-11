import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IRoleRepository } from '@src/modules/authentication/domain/repositories/role.repository';
import { isSystemRoleSlug } from '@src/modules/authentication/domain/constants/system-roles.constant';
import type { DeleteRoleCommand } from '@src/modules/authentication/applications/useCase/commands/DeleteRoleCommand';

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

    if (isSystemRoleSlug(role.slug)) {
      throw new ForbiddenException(
        'Les rôles système ne peuvent pas être supprimés',
      );
    }

    return this.repository.delete(command.id);
  }
}
