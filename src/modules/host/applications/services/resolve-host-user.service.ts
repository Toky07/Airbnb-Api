import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '@src/modules/user/contracts';
import type { IUserRepository } from '@src/modules/user/contracts';
import type { User } from '@src/modules/user/contracts';
import { ResolveAuthenticatedUserService } from '@src/shared/auth/resolve-authenticated-user.service';

@Injectable()
export class ResolveHostUserService {
  private readonly resolveAuthenticatedUser: ResolveAuthenticatedUserService;

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {
    this.resolveAuthenticatedUser = new ResolveAuthenticatedUserService(
      userRepository,
    );
  }

  resolve(authId: number): Promise<User> {
    return this.resolveAuthenticatedUser.resolveUser(authId, {
      message: 'Profil hôte introuvable.',
    });
  }

  update(user: User): Promise<User> {
    return this.userRepository.update(user);
  }
}
