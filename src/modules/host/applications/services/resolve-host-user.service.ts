import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../user/contracts';
import type { IUserRepository } from '../../../user/contracts';
import type { User } from '../../../user/contracts';
import { ResolveAuthenticatedUserService } from '../../../../shared/auth/resolve-authenticated-user.service';

@Injectable()
export class ResolveHostUserService {
  private readonly resolveAuthenticatedUser: ResolveAuthenticatedUserService;

  constructor(@Inject(USER_REPOSITORY) userRepository: IUserRepository) {
    this.resolveAuthenticatedUser = new ResolveAuthenticatedUserService(
      userRepository,
    );
  }

  resolve(authId: number): Promise<User> {
    return this.resolveAuthenticatedUser.resolveUser(authId, {
      message: 'Profil hôte introuvable.',
    });
  }
}
