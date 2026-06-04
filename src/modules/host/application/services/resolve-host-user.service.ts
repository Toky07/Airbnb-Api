import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import type { User } from '../../../user/domain/entities/user.entity';

@Injectable()
export class ResolveHostUserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async resolve(authId: number): Promise<User> {
    const user = await this.userRepository.findByAuthId(authId);

    if (!user?.id) {
      throw new ForbiddenException('Profil hôte introuvable.');
    }

    return user;
  }
}
