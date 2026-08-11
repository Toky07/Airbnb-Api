import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { IAuthRepository } from '../../../../authentication/contracts';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { UserOutput } from '../../../domain/dtos/user.output';
import { ACCOUNT_STATUS } from '../../../../authentication/contracts';
import type { EnsureUserAuthAccountService } from '../../services/ensure-user-auth-account.service';
import type { SetUserPasswordCommand } from '../commands/SetUserPasswordCommand';

export class SetUserPasswordCommandHandler implements ICommandHandler<
  SetUserPasswordCommand,
  UserOutput
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authRepository: IAuthRepository,
    private readonly ensureUserAuthAccount: EnsureUserAuthAccountService,
  ) {}

  async execute(command: SetUserPasswordCommand): Promise<UserOutput> {
    const password = command.password?.trim();

    if (!password || password.length < 6) {
      throw new BadRequestException(
        'Le mot de passe doit contenir au moins 6 caractères.',
      );
    }

    const { authId } = await this.ensureUserAuthAccount.execute(command.userId);
    const auth = await this.authRepository.findById(authId);

    if (!auth?.id) {
      throw new NotFoundException('Compte de connexion introuvable.');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (auth.password) {
      await this.authRepository.updatePassword(auth.id, passwordHash);
      if (auth.status === ACCOUNT_STATUS.DISABLED) {
        await this.authRepository.updateStatus(auth.id, ACCOUNT_STATUS.ACTIVE);
        await this.userRepository.updateStatus(
          command.userId,
          ACCOUNT_STATUS.ACTIVE,
        );
      }
    } else {
      await this.authRepository.activateWithPassword(auth.id, passwordHash);
      await this.userRepository.updateStatus(
        command.userId,
        ACCOUNT_STATUS.ACTIVE,
      );
    }

    const updated = await this.userRepository.findById(command.userId);
    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return UserOutput.fromDomain(updated);
  }
}
