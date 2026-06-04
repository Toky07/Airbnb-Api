import { Inject, Injectable } from '@nestjs/common';
import { AUTH_REPOSITORY } from '../../../authentication/domain/repositories/auth.repository';
import type { IAuthRepository } from '../../../authentication/domain/repositories/auth.repository';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../infrastructure/repositories/user.repository';
import { SaveUserAvatarUseCase } from './saveUserAvatar.usecase';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly repository: IUserRepository,
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
    private readonly saveUserAvatar: SaveUserAvatarUseCase,
  ) {}

  async execute(id: number): Promise<boolean> {
    const user = await this.repository.findById(id);

    if (user?.id) {
      await this.saveUserAvatar.deleteStored(user.avatar);
    }

    const authId =
      user?.authId ??
      (user ? (await this.authRepository.findByEmail(user.email))?.id : null) ??
      null;

    const deleted = await this.repository.delete(Number(id));

    if (deleted && authId != null) {
      await this.authRepository.delete(authId);
    }

    return deleted;
  }
}
