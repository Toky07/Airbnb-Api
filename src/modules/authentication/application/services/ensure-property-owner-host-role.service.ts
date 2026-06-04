import { Inject, Injectable } from '@nestjs/common';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository';
import type { IAuthRepository } from '../../domain/repositories/auth.repository';
import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository';
import type { IRoleRepository } from '../../domain/repositories/role.repository';
import { USER_REPOSITORY } from '../../../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { HOST_ROLE_SLUG } from '../../domain/constants/permissions.constant';

@Injectable()
export class EnsurePropertyOwnerHostRoleService {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async executeForOwnerUserId(userId: number): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (user?.authId == null) {
      return false;
    }
    return this.executeForAuthId(user.authId);
  }

  async executeForAuthId(authId: number): Promise<boolean> {
    const auth = await this.authRepository.findById(authId);
    if (!auth?.id) {
      return false;
    }

    const hasHostRole = auth.roles.some((role) => role.slug === HOST_ROLE_SLUG);
    if (hasHostRole) {
      return false;
    }

    const hostRole = await this.roleRepository.findBySlug(HOST_ROLE_SLUG);
    if (!hostRole?.id) {
      return false;
    }

    const roleIds = auth.roles
      .map((role) => role.id)
      .filter((id): id is number => id != null);

    await this.authRepository.assignRoles(auth.id, [...roleIds, hostRole.id]);
    return true;
  }
}
