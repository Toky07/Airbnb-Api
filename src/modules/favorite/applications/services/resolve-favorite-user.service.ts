import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { ResolveAuthenticatedUserService } from '../../../../shared/auth/resolve-authenticated-user.service';

export class ResolveFavoriteUserService {
  private readonly resolveAuthenticatedUser: ResolveAuthenticatedUserService;

  constructor(userRepository: IUserRepository) {
    this.resolveAuthenticatedUser = new ResolveAuthenticatedUserService(
      userRepository,
    );
  }

  resolveUserId(authId: number): Promise<number> {
    return this.resolveAuthenticatedUser.resolveUserId(authId);
  }
}
