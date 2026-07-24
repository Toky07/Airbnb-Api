import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { IRoleRepository } from '../../../domain/repositories/role.repository';
import { RoleOutput } from '../../dto/role.output';
import { UserNameVO } from '../../../../user/domain/valueObject/username.vo';
import { isSystemRoleSlug } from '../../../domain/constants/system-roles.constant';
import type { UpdateRoleCommand } from '../commands/UpdateRoleCommand';

export class UpdateRoleCommandHandler implements ICommandHandler<
  UpdateRoleCommand,
  RoleOutput
> {
  constructor(private readonly repository: IRoleRepository) {}

  async execute(command: UpdateRoleCommand): Promise<RoleOutput> {
    const { id, name, description } = command.payload;
    const role = await this.repository.findById(id);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (isSystemRoleSlug(role.slug)) {
      throw new ForbiddenException(
        'Les rôles système ne peuvent pas être modifiés (hors permissions)',
      );
    }

    if (name) {
      role.name = new UserNameVO(name);
    }

    if (description !== undefined) {
      role.description = description;
    }

    const updated = await this.repository.update(role);
    return RoleOutput.fromDomain(updated);
  }
}
