import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { IRoleRepository } from '../../../domain/repositories/role.repository';
import { isSystemRoleSlug } from '../../../domain/constants/system-roles.constant';
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

    if (isSystemRoleSlug(role.slug)) {
      throw new ForbiddenException(
        'Les rôles système ne peuvent pas être supprimés',
      );
    }

    return this.repository.delete(command.id);
  }
}
