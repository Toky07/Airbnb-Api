import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AUTH_REPOSITORY } from '../../../authentication/domain/repositories/auth.repository';
import type { IAuthRepository } from '../../../authentication/domain/repositories/auth.repository';
import { USER_REPOSITORY } from '../../../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { ACCOUNT_STATUS } from '../../domain/constants/account-status.constant';
import { PasswordSetupTokenService } from '../../domain/services/password-setup-token.service';
import {
  PASSWORD_SETUP_TOKEN_REPOSITORY,
  type IPasswordSetupTokenRepository,
} from '../../domain/repositories/password-setup-token.repository';

@Injectable()
export class SetPasswordWithTokenUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
    @Inject(PASSWORD_SETUP_TOKEN_REPOSITORY)
    private readonly tokenRepository: IPasswordSetupTokenRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly tokenService: PasswordSetupTokenService,
  ) {}

  async execute(rawToken: string, password: string): Promise<void> {
    const token = rawToken?.trim();
    const trimmedPassword = password?.trim();

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
