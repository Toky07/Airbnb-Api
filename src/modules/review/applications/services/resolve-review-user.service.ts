import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { ResolveAuthenticatedUserService } from '../../../../shared/auth/resolve-authenticated-user.service';

export class ResolveReviewUserService {
  private readonly resolveAuthenticatedUser: ResolveAuthenticatedUserService;

  constructor(userRepository: IUserRepository) {
    this.resolveAuthenticatedUser = new ResolveAuthenticatedUserService(
      userRepository,
    );
  }

  resolveUser(authId: number) {
    return this.resolveAuthenticatedUser.resolveUser(authId, {
      failure: 'not-found',
    });
  }
}
