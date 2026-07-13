import { ConflictException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../shared/useCase/bus/command-handler.interface';
import { slugify } from '../../../../shared/utils/slug.util';
import { RoleEntity } from '../../domain/entities/role.entity';
import type { IRoleRepository } from '../../domain/repositories/role.repository';
import { RoleOutput } from '../../applications/dto/role.output';
import { UserNameVO } from '../../../user/domain/valueObject/username.vo';
import type { CreateRoleCommand } from '../commands/CreateRoleCommand';

export class CreateRoleCommandHandler implements ICommandHandler<
  CreateRoleCommand,
  RoleOutput
> {
  constructor(private readonly repository: IRoleRepository) {}

  async execute(command: CreateRoleCommand): Promise<RoleOutput> {
    const slug = command.dto.slug?.trim() || slugify(command.dto.name);
    const existing = await this.repository.findBySlug(slug);

    if (existing) {
      throw new ConflictException('Un rôle avec ce slug existe déjà');
    }

    const role = new RoleEntity(
      new UserNameVO(command.dto.name),
      slug,
      undefined,
      command.dto.description ?? null,
    );
    const newRole = await this.repository.create(role);

    return RoleOutput.fromDomain(newRole);
  }
}
