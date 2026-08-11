import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AUTH_REPOSITORY } from '../../../authentication/contracts';
import type { IAuthRepository } from '../../../authentication/contracts';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { IUserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class EnsureUserAuthAccountService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
  ) {}

  async execute(userId: number): Promise<{ userId: number; authId: number }> {
    const user = await this.userRepository.findById(userId);

    if (!user?.id) {
      throw new NotFoundException('User not found');
    }

    let auth =
      user.authId != null
        ? await this.authRepository.findById(user.authId)
        : await this.authRepository.findByEmail(user.email);

    if (!auth?.id) {
      auth = await this.authRepository.createPending(user.email);
      if (!auth?.id) {
        throw new BadRequestException(
          'Impossible de créer le compte de connexion.',
        );
      }
    }

    if (user.authId == null) {
      await this.userRepository.linkAuthAccount(user.id, auth.id);
    }

    return { userId: user.id, authId: auth.id };
  }
}
