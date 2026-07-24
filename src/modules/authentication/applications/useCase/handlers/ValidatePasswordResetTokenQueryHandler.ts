import { NotFoundException } from '@nestjs/common';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IPasswordResetTokenRepository } from '../../../domain/repositories/password-reset-token.repository';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import { PasswordSetupTokenService } from '../../../domain/services/password-setup-token.service';
import type { ValidatePasswordResetTokenQuery } from '../queries/ValidatePasswordResetTokenQuery';

export class ValidatePasswordResetTokenQueryHandler implements IQueryHandler<
  ValidatePasswordResetTokenQuery,
  { email: string }
> {
  constructor(
    private readonly resetTokenRepository: IPasswordResetTokenRepository,
    private readonly userRepository: IUserRepository,
    private readonly tokenService: PasswordSetupTokenService,
  ) {}

  async execute(query: ValidatePasswordResetTokenQuery): Promise<{ email: string }> {
    const token = query.token?.trim();
    if (!token) {
      throw new NotFoundException('Lien invalide ou expiré.');
    }

    const tokenRecord = await this.resetTokenRepository.findValidByHash(
      this.tokenService.hash(token),
    );

    const auth = tokenRecord?.auth;
    if (!auth?.id) {
      throw new NotFoundException('Lien invalide ou expiré.');
    }

    const user = await this.userRepository.findByAuthId(auth.id);

    return {
      email: user?.email?.value ?? auth.email.value,
    };
  }
}
