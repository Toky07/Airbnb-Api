import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IAuthRepository } from '@src/modules/authentication/domain/repositories/auth.repository';
import type { IPasswordResetTokenRepository } from '@src/modules/authentication/domain/repositories/password-reset-token.repository';
import { PasswordSetupTokenService } from '@src/modules/authentication/domain/services/password-setup-token.service';
import { assertPasswordPolicy } from '@src/modules/authentication/domain/utils/assert-password-policy';
import type { ResetPasswordWithTokenCommand } from '@src/modules/authentication/applications/useCase/commands/ResetPasswordWithTokenCommand';

export class ResetPasswordWithTokenCommandHandler implements ICommandHandler<
  ResetPasswordWithTokenCommand,
  void
> {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly resetTokenRepository: IPasswordResetTokenRepository,
    private readonly tokenService: PasswordSetupTokenService,
  ) {}

  async execute(command: ResetPasswordWithTokenCommand): Promise<void> {
    const token = command.token?.trim();
    const trimmedPassword = command.password?.trim();

    if (!token || !trimmedPassword) {
      throw new BadRequestException('Token et mot de passe requis.');
    }

    assertPasswordPolicy(trimmedPassword);

    const tokenRecord = await this.resetTokenRepository.findValidByHash(
      this.tokenService.hash(token),
    );

    const auth = tokenRecord?.auth;
    if (!auth?.id || !tokenRecord) {
      throw new NotFoundException('Lien invalide ou expiré.');
    }

    const passwordHash = await bcrypt.hash(trimmedPassword, 10);
    await this.authRepository.updatePassword(auth.id, passwordHash);
    await this.resetTokenRepository.consume(tokenRecord.id);
  }
}
