import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ROLE_REPOSITORY } from '../domain/repositories/role.repository';
import type { IRoleRepository } from '../domain/repositories/role.repository';
import { RoleOutput } from '../application/dto/role.output';
import { UserNameVO } from '../../user/domain/valueObject/username.vo';
import { SUPERADMIN_ROLE_SLUG } from '../domain/constants/permissions.constant';

@Injectable()
export class UpdateRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly repository: IRoleRepository,
  ) {}

  async execute({
    id,
    name,
    description,
  }: {
    id: number;
    name?: string;
    description?: string | null;
  }): Promise<RoleOutput> {
    const role = await this.repository.findById(id);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.slug === SUPERADMIN_ROLE_SLUG && name && name !== role.name.value) {
      throw new ForbiddenException('Le rôle super administrateur ne peut pas être renommé');
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
