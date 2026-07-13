import type { IQueryHandler } from '../../../../shared/useCase/bus/query-handler.interface';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import type { IPasswordSetupTokenRepository } from '../../domain/repositories/password-setup-token.repository';
import type { PasswordSetupValidationOutput } from '../../applications/dto/password-setup.output';
import { PasswordSetupTokenService } from '../../domain/services/password-setup-token.service';
import type { ValidatePasswordSetupTokenQuery } from '../queries/ValidatePasswordSetupTokenQuery';

export class ValidatePasswordSetupTokenQueryHandler implements IQueryHandler<
  ValidatePasswordSetupTokenQuery,
  PasswordSetupValidationOutput
> {
  constructor(
    private readonly tokenRepository: IPasswordSetupTokenRepository,
    private readonly userRepository: IUserRepository,
    private readonly tokenService: PasswordSetupTokenService,
  ) {}

  async execute(
    query: ValidatePasswordSetupTokenQuery,
  ): Promise<PasswordSetupValidationOutput> {
    const token = query.token?.trim();
    if (!token) {
      return { valid: false };
    }

    const tokenRecord = await this.tokenRepository.findValidByHash(
      this.tokenService.hash(token),
    );

    const auth = tokenRecord?.auth;
    if (!auth?.id) {
      return { valid: false };
    }

    const user = await this.userRepository.findByAuthId(auth.id);

    return {
      valid: true,
      email: auth.email,
      firstName: user?.firstName,
      lastName: user?.lastName,
    };
  }
}
