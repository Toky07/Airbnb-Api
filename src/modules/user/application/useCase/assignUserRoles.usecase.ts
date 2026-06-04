import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AUTH_REPOSITORY } from '../../../authentication/domain/repositories/auth.repository';
import type { IAuthRepository } from '../../../authentication/domain/repositories/auth.repository';
import { UserOutput } from '../../domain/dtos/user.output';
import { USER_REPOSITORY } from '../../infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { SendAccountInvitationUseCase } from '../../../account-activation/application/useCase/send-account-invitation.usecase';

@Injectable()
export class AssignUserRolesUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
    private readonly sendAccountInvitation: SendAccountInvitationUseCase,
  ) {}

  async execute(userId: number, roleIds: number[]): Promise<UserOutput> {
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
        throw new NotFoundException('Impossible de créer le compte de connexion.');
      }
      await this.userRepository.linkAuthAccount(userId, auth.id);
      await this.sendAccountInvitation.execute({
        userId,
        sourceModule: 'admin-role-assign',
      });
    } else if (user.authId == null) {
      await this.userRepository.linkAuthAccount(userId, auth.id);
    }

    await this.authRepository.assignRoles(auth.id, roleIds);

    const updated = await this.userRepository.findById(userId);
    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return UserOutput.fromDomain(updated);
  }
}
