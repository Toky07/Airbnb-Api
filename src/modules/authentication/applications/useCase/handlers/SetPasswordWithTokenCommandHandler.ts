import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IAuthRepository } from '@src/modules/authentication/domain/repositories/auth.repository';
import type { IUserRepository } from '@src/modules/user/contracts';
import type { IPasswordSetupTokenRepository } from '@src/modules/authentication/domain/repositories/password-setup-token.repository';
import { PasswordSetupTokenService } from '@src/modules/authentication/domain/services/password-setup-token.service';
import { ACCOUNT_STATUS } from '@src/modules/authentication/domain/constants/account-status.constant';
import { assertPasswordPolicy } from '@src/modules/authentication/domain/utils/assert-password-policy';
import type { SetPasswordWithTokenCommand } from '@src/modules/authentication/applications/useCase/commands/SetPasswordWithTokenCommand';

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

    assertPasswordPolicy(trimmedPassword);

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
