import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import type { PasswordSetupValidationOutput } from '../dto/password-setup.output';
import { PasswordSetupTokenService } from '../../domain/services/password-setup-token.service';
import {
  PASSWORD_SETUP_TOKEN_REPOSITORY,
  type IPasswordSetupTokenRepository,
} from '../../domain/repositories/password-setup-token.repository';

@Injectable()
export class ValidatePasswordSetupTokenUseCase {
  constructor(
    @Inject(PASSWORD_SETUP_TOKEN_REPOSITORY)
    private readonly tokenRepository: IPasswordSetupTokenRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly tokenService: PasswordSetupTokenService,
  ) {}

  async execute(rawToken: string): Promise<PasswordSetupValidationOutput> {
    const token = rawToken?.trim();
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
