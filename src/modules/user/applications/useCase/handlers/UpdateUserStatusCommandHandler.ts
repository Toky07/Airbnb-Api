import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { IAuthRepository } from '../../../../authentication/contracts';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { UserOutput } from '../../../domain/dtos/user.output';
import {
  ACCOUNT_STATUS,
  type AdminManageableAccountStatus,
} from '../../../../authentication/contracts';
import type { EnsureUserAuthAccountService } from '../../services/ensure-user-auth-account.service';
import type { UpdateUserStatusCommand } from '../commands/UpdateUserStatusCommand';

export class UpdateUserStatusCommandHandler implements ICommandHandler<
  UpdateUserStatusCommand,
  UserOutput
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authRepository: IAuthRepository,
    private readonly ensureUserAuthAccount: EnsureUserAuthAccountService,
  ) {}

  async execute(command: UpdateUserStatusCommand): Promise<UserOutput> {
    this.assertAllowedStatus(command.status);

    const { authId } = await this.ensureUserAuthAccount.execute(command.userId);
    const auth = await this.authRepository.findById(authId);

    if (!auth?.id) {
      throw new NotFoundException('Compte de connexion introuvable.');
    }

    if (
      command.status === ACCOUNT_STATUS.ACTIVE &&
      !auth.password &&
      auth.status !== ACCOUNT_STATUS.ACTIVE
    ) {
      throw new BadRequestException(
        'Impossible d’activer un compte sans mot de passe. Définissez d’abord un mot de passe.',
      );
    }

    await this.authRepository.updateStatus(auth.id, command.status);
    await this.userRepository.updateStatus(command.userId, command.status);

    const updated = await this.userRepository.findById(command.userId);
    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return UserOutput.fromDomain(updated);
  }

  private assertAllowedStatus(
    status: AdminManageableAccountStatus,
  ): asserts status is AdminManageableAccountStatus {
    if (
      status !== ACCOUNT_STATUS.ACTIVE &&
      status !== ACCOUNT_STATUS.DISABLED
    ) {
      throw new BadRequestException(
        'Seuls les statuts actif et désactivé sont autorisés.',
      );
    }
  }
}
