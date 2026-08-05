import { ForbiddenException } from '@nestjs/common';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';

export class ResolveFavoriteUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async resolveUserId(authId: number): Promise<number> {
    const user = await this.userRepository.findByAuthId(authId);
    if (!user?.id) {
      throw new ForbiddenException('Accès refusé.');
    }

    return user.id;
  }
}
