import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import type { IPasswordSetupTokenRepository } from '../../../domain/repositories/password-setup-token.repository';
import { PasswordSetupTokenService } from '../../../domain/services/password-setup-token.service';
import { ACCOUNT_STATUS } from '../../../domain/constants/account-status.constant';
import type { SetPasswordWithTokenCommand } from '../commands/SetPasswordWithTokenCommand';

export class SetPasswordWithTokenCommandHandler implements ICommandHandler<
  SetPasswordWithTokenCommand,
  void
> {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly tokenRepository: IPasswordSetupTokenRepository,
    private readonly userRepository: IUserRepository,
    private readonly tokenService: PasswordSetupTokenService,
  ) {}

  async execute(command: SetPasswordWithTokenCommand): Promise<void> {
    const token = command.token?.trim();
    const trimmedPassword = command.password?.trim();

    if (!token || !trimmedPassword) {
      throw new BadRequestException('Token et mot de passe requis.');
    }

    if (trimmedPassword.length < 6) {
      throw new BadRequestException(
        'Le mot de passe doit contenir au moins 6 caractères.',
      );
    }

    const tokenRecord = await this.tokenRepository.findValidByHash(
      this.tokenService.hash(token),
    );

    const auth = tokenRecord?.auth;
    if (!auth?.id || !tokenRecord) {
      throw new NotFoundException('Lien invalide ou expiré.');
    }

    const passwordHash = await bcrypt.hash(trimmedPassword, 10);
    await this.authRepository.activateWithPassword(auth.id, passwordHash);
    await this.tokenRepository.consume(tokenRecord.id);

    const user = await this.userRepository.findByAuthId(auth.id);
    if (user?.id) {
      await this.userRepository.updateStatus(user.id, ACCOUNT_STATUS.ACTIVE);
    }
  }
}
