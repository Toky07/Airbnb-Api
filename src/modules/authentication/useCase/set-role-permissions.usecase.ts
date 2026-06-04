import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ROLE_REPOSITORY } from '../domain/repositories/role.repository';
import type { IRoleRepository } from '../domain/repositories/role.repository';
import { RoleOutput } from '../application/dto/role.output';
import { SUPERADMIN_ROLE_SLUG } from '../domain/constants/permissions.constant';

@Injectable()
export class SetRolePermissionsUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly repository: IRoleRepository,
  ) {}

  async execute(
    roleId: number,
    permissionKeys: string[],
  ): Promise<RoleOutput> {
    const role = await this.repository.findById(roleId);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.slug === SUPERADMIN_ROLE_SLUG) {
      throw new ForbiddenException(
        'Les permissions du super administrateur ne peuvent pas être modifiées',
      );
    }

    const updated = await this.repository.setPermissions(roleId, permissionKeys);
    return RoleOutput.fromDomain(updated);
  }
}
