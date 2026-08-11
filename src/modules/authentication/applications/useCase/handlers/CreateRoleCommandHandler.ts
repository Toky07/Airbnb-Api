import { ConflictException, ForbiddenException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { slugify } from '@src/shared/utils/slug.util';
import { RoleEntity } from '@src/modules/authentication/domain/entities/role.entity';
import type { IRoleRepository } from '@src/modules/authentication/domain/repositories/role.repository';
import { RoleOutput } from '@src/modules/authentication/applications/dto/role.output';
import { UserNameVO } from '@src/modules/user/contracts';
import { isSystemRoleSlug } from '@src/modules/authentication/domain/constants/system-roles.constant';
import type { CreateRoleCommand } from '@src/modules/authentication/applications/useCase/commands/CreateRoleCommand';

export class CreateRoleCommandHandler implements ICommandHandler<
  CreateRoleCommand,
  RoleOutput
> {
  constructor(private readonly repository: IRoleRepository) {}

  async execute(command: CreateRoleCommand): Promise<RoleOutput> {
    const slug = command.dto.slug?.trim() || slugify(command.dto.name);

    if (isSystemRoleSlug(slug)) {
      throw new ForbiddenException('Ce slug est réservé à un rôle système');
    }

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
