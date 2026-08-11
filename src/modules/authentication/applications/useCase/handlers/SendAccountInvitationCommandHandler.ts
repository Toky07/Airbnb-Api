import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IAuthRepository } from '@src/modules/authentication/domain/repositories/auth.repository';
import type { IUserRepository } from '@src/modules/user/contracts';
import type { IPasswordSetupTokenRepository } from '@src/modules/authentication/domain/repositories/password-setup-token.repository';
import type { MailService } from '@src/modules/mail/contracts';
import { PasswordSetupLinkBuilder } from '@src/modules/authentication/domain/services/password-setup-link.builder';
import { PasswordSetupTokenService } from '@src/modules/authentication/domain/services/password-setup-token.service';
import { ACCOUNT_STATUS } from '@src/modules/authentication/domain/constants/account-status.constant';
import type { SendAccountInvitationCommand } from '@src/modules/authentication/applications/useCase/commands/SendAccountInvitationCommand';

export class SendAccountInvitationCommandHandler implements ICommandHandler<
  SendAccountInvitationCommand,
  void
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authRepository: IAuthRepository,
    private readonly tokenRepository: IPasswordSetupTokenRepository,
    private readonly mailService: MailService,
    private readonly tokenService: PasswordSetupTokenService,
    private readonly linkBuilder: PasswordSetupLinkBuilder,
  ) {}

  async execute(command: SendAccountInvitationCommand): Promise<void> {
    const user = await this.userRepository.findById(command.options.userId);
    if (!user?.id) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    const email = user.email.trim().toLowerCase();
    let auth =
      user.authId != null
        ? await this.authRepository.findById(user.authId)
        : await this.authRepository.findByEmail(email);

    if (auth?.isActive) {
      throw new BadRequestException('Ce compte est déjà activé.');
    }

    if (!auth?.id) {
      auth = await this.authRepository.createPending(email);
      if (!auth?.id) {
        throw new BadRequestException(
          'Impossible de créer le compte de connexion.',
        );
      }
    }

    if (user.authId == null) {
      await this.userRepository.linkAuthAccount(user.id, auth.id);
    }

    await this.userRepository.updateStatus(user.id, ACCOUNT_STATUS.PENDING);

    const token = this.tokenService.generate();
    await this.tokenRepository.create(auth.id, token.hash, token.expiresAt);

    const setupLink = this.linkBuilder.build(token.raw);

    await this.mailService.sendSimple({
      to: email,
      subject: 'Activez votre compte',
      body: [
        `Bonjour ${user.firstName} ${user.lastName},`,
        '',
        'Votre compte a été créé. Cliquez sur le lien ci-dessous pour définir votre mot de passe et activer votre accès :',
        setupLink,
        '',
        'Ce lien expire dans 48 heures.',
      ].join('\n'),
      sourceModule: command.options.sourceModule ?? 'account-invitation',
    });
  }
}
