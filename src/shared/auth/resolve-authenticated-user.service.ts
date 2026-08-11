import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { IUserRepository, User } from '../../modules/user/contracts';

export type ResolveUserFailure = 'forbidden' | 'not-found';

export class ResolveAuthenticatedUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async resolveUserId(
    authId: number,
    options: {
      failure?: ResolveUserFailure;
      message?: string;
    } = {},
  ): Promise<number> {
    const user = await this.resolveUser(authId, options);
    return user.id!;
  }

  async resolveUser(
    authId: number,
    options: {
      failure?: ResolveUserFailure;
      message?: string;
    } = {},
  ): Promise<User> {
    const { failure = 'forbidden', message } = options;
    const user = await this.userRepository.findByAuthId(authId);

    if (!user?.id) {
      if (failure === 'not-found') {
        throw new NotFoundException(message ?? 'Utilisateur introuvable.');
      }

      throw new ForbiddenException(message ?? 'Accès refusé.');
    }

    return user;
  }
}
