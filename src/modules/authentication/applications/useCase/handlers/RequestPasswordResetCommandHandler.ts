import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IAuthRepository } from '@src/modules/authentication/domain/repositories/auth.repository';
import type { IPasswordResetTokenRepository } from '@src/modules/authentication/domain/repositories/password-reset-token.repository';
import type { MailService } from '@src/modules/mail/contracts';
import { PasswordSetupTokenService } from '@src/modules/authentication/domain/services/password-setup-token.service';
import { PasswordResetLinkBuilder } from '@src/modules/authentication/domain/services/password-reset-link.builder';
import { PASSWORD_RESET_TOKEN_TTL_HOURS } from '@src/modules/authentication/domain/constants/account-status.constant';
import { ACCOUNT_STATUS } from '@src/modules/authentication/domain/constants/account-status.constant';
import type { RequestPasswordResetCommand } from '@src/modules/authentication/applications/useCase/commands/RequestPasswordResetCommand';

export class RequestPasswordResetCommandHandler implements ICommandHandler<
  RequestPasswordResetCommand,
  void
> {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly resetTokenRepository: IPasswordResetTokenRepository,
    private readonly mailService: MailService,
    private readonly tokenService: PasswordSetupTokenService,
    private readonly linkBuilder: PasswordResetLinkBuilder,
  ) {}

  async execute(command: RequestPasswordResetCommand): Promise<void> {
    const email = command.email?.trim().toLowerCase();
    if (!email) {
      return;
    }

    const auth = await this.authRepository.findByEmail(email);
    if (!auth?.id || auth.status !== ACCOUNT_STATUS.ACTIVE) {
      return;
    }

    const token = this.tokenService.generate();
    token.expiresAt = new Date(
      Date.now() + PASSWORD_RESET_TOKEN_TTL_HOURS * 60 * 60 * 1000,
    );

    await this.resetTokenRepository.create(
      auth.id,
      token.hash,
      token.expiresAt,
    );

    const resetLink = this.linkBuilder.build(token.raw);

    await this.mailService.sendSimple({
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      body: [
        'Bonjour,',
        '',
        'Vous avez demandé la réinitialisation de votre mot de passe.',
        'Cliquez sur le lien ci-dessous pour en choisir un nouveau :',
        resetLink,
        '',
        `Ce lien expire dans ${PASSWORD_RESET_TOKEN_TTL_HOURS} heures.`,
        '',
        'Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.',
      ].join('\n'),
      sourceModule: 'password-reset',
    });
  }
}
