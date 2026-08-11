import { Inject, Injectable } from '@nestjs/common';
import { AUTH_REPOSITORY } from '@src/modules/authentication/domain/repositories/auth.repository';
import type { IAuthRepository } from '@src/modules/authentication/domain/repositories/auth.repository';
import { USER_REPOSITORY } from '@src/modules/user/contracts';
import type { IUserRepository } from '@src/modules/user/contracts';
import { HOST_ROLE_SLUG } from '@src/modules/authentication/domain/constants/permissions.constant';
import { EnsureAuthHasRoleService } from './ensure-auth-has-role.service';

@Injectable()
export class EnsurePropertyOwnerHostRoleService {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly ensureAuthHasRole: EnsureAuthHasRoleService,
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

    return this.ensureAuthHasRole.execute(auth.id, HOST_ROLE_SLUG);
  }
}
