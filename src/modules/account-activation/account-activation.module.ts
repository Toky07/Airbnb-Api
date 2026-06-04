import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from '../authentication/infrastructure/entity/auth.entity';
import { UserEntity } from '../user/infrastructure/entities/user.entity';
import { MailModule } from '../mail/mail.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../authentication/auth.module';
import { SendAccountInvitationUseCase } from './application/useCase/send-account-invitation.usecase';
import { ValidatePasswordSetupTokenUseCase } from './application/useCase/validate-password-setup-token.usecase';
import { SetPasswordWithTokenUseCase } from './application/useCase/set-password-with-token.usecase';
import { PasswordSetupTokenService } from './domain/services/password-setup-token.service';
import { PasswordSetupLinkBuilder } from './domain/services/password-setup-link.builder';
import { PasswordSetupTokenOrmEntity } from './infrastructure/entities/password-setup-token.orm-entity';
import { PasswordSetupTokenRepository } from './infrastructure/repositories/password-setup-token.repository';
import { PASSWORD_SETUP_TOKEN_REPOSITORY } from './domain/repositories/password-setup-token.repository';
import { AccountStatusSyncService } from './infrastructure/seed/account-status-sync.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PasswordSetupTokenOrmEntity,
      AuthEntity,
      UserEntity,
    ]),
    MailModule,
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
  ],
  providers: [
    SendAccountInvitationUseCase,
    ValidatePasswordSetupTokenUseCase,
    SetPasswordWithTokenUseCase,
    PasswordSetupTokenService,
    PasswordSetupLinkBuilder,
    AccountStatusSyncService,
    PasswordSetupTokenRepository,
    {
      provide: PASSWORD_SETUP_TOKEN_REPOSITORY,
      useClass: PasswordSetupTokenRepository,
    },
  ],
  exports: [
    SendAccountInvitationUseCase,
    ValidatePasswordSetupTokenUseCase,
    SetPasswordWithTokenUseCase,
  ],
})
export class AccountActivationModule {}
