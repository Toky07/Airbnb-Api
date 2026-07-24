import { Inject, Injectable } from '@nestjs/common';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository';
import type { IAuthRepository } from '../../domain/repositories/auth.repository';
import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository';
import type { IRoleRepository } from '../../domain/repositories/role.repository';

@Injectable()
export class EnsureAuthHasRoleService {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
  ) {}

  /**
   * Ensures the auth account has the given role slug.
   * @returns true when the role was newly assigned.
   */
  async execute(authId: number, roleSlug: string): Promise<boolean> {
    const auth = await this.authRepository.findById(authId);
    if (!auth?.id) {
      return false;
    }

    const alreadyHasRole = auth.roles.some((role) => role.slug === roleSlug);
    if (alreadyHasRole) {
      return false;
    }

    const role = await this.roleRepository.findBySlug(roleSlug);
    if (!role?.id) {
      return false;
    }

    const roleIds = auth.roles
      .map((existing) => existing.id)
      .filter((id): id is number => id != null);

    await this.authRepository.assignRoles(auth.id, [...roleIds, role.id]);
    return true;
  }
}
