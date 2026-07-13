import { Inject, Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from './infrastructure/entity/auth.entity';
import { AuthController } from './interfaces/http/auth.controller';
import { AUTH_REPOSITORY } from './domain/repositories/auth.repository';
import type { IAuthRepository } from './domain/repositories/auth.repository';
import { AuthRepository } from './infrastructure/repositories/auth.repository';
import { TOKEN_GENERATOR } from './domain/generator/token.generator';
import type { TokenGenerator } from './domain/generator/token.generator';
import { JwtTokenGenerator } from './infrastructure/generator/jwt-token.generator';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { RoleController } from './interfaces/http/role.controller';
import { ROLE_REPOSITORY } from './domain/repositories/role.repository';
import type { IRoleRepository } from './domain/repositories/role.repository';
import { RoleRepository } from './infrastructure/repositories/role.repository';
import { Role } from './infrastructure/entity/role.entity';
import { PermissionEntity } from './infrastructure/entity/permission.entity';
import { AuthRbacSeedService } from './infrastructure/seed/auth-rbac.seed';
import { AuthGuard } from './interfaces/guard/auth.guard';
import { PermissionsGuard } from './interfaces/guard/permissions.guard';
import { EnsurePropertyOwnerHostRoleService } from './applications/services/ensure-property-owner-host-role.service';
import { UserModule } from '../user/user.module';
import { PropertiesModule } from '../properties/properties.module';
import { MailModule } from '../mail/mail.module';
import { USER_REPOSITORY } from '../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../user/domain/repositories/user.repository';
import { PROPERTY_REPOSITORY } from '../properties/infrastructure/repositories/property.repository';
import type { IPropertyRepository } from '../properties/domain/repositories/property.repository';
import { UserEntity } from '../user/infrastructure/entities/user.entity';
import { PasswordSetupTokenOrmEntity } from './infrastructure/entities/password-setup-token.orm-entity';
import { PASSWORD_SETUP_TOKEN_REPOSITORY } from './domain/repositories/password-setup-token.repository';
import type { IPasswordSetupTokenRepository } from './domain/repositories/password-setup-token.repository';
import { PasswordSetupTokenRepository } from './infrastructure/repositories/password-setup-token.repository';
import { AccountStatusSyncService } from './infrastructure/seed/account-status-sync.service';
import { MailService } from '../mail/applications/services/mail.service';
import { AuthBootstrap } from './auth.bootstrap';
import { CommandBus } from '../../shared/useCase/bus/bus';
import { QueryBus } from '../../shared/useCase/bus/query-bus';
import { CreateCredentialsCommand } from './useCase/commands/CreateCredentialsCommand';
import { LoginCommand } from './useCase/commands/LoginCommand';
import { AssignRoleCommand } from './useCase/commands/AssignRoleCommand';
import { CreateRoleCommand } from './useCase/commands/CreateRoleCommand';
import { UpdateRoleCommand } from './useCase/commands/UpdateRoleCommand';
import { DeleteRoleCommand } from './useCase/commands/DeleteRoleCommand';
import { SetRolePermissionsCommand } from './useCase/commands/SetRolePermissionsCommand';
import { SendAccountInvitationCommand } from './useCase/commands/SendAccountInvitationCommand';
import { SetPasswordWithTokenCommand } from './useCase/commands/SetPasswordWithTokenCommand';
import { GetMeQuery } from './useCase/queries/GetMeQuery';
import { ListRolesQuery } from './useCase/queries/ListRolesQuery';
import { ListPermissionsQuery } from './useCase/queries/ListPermissionsQuery';
import { ValidatePasswordSetupTokenQuery } from './useCase/queries/ValidatePasswordSetupTokenQuery';
import { RateLimitModule } from '../../shared/rate-limit.module';
import { getJwtExpiresIn, getJwtSecret } from '../../config/env.config';

@Module({
  imports: [
    RateLimitModule,
    TypeOrmModule.forFeature([
      AuthEntity,
      Role,
      PermissionEntity,
      PasswordSetupTokenOrmEntity,
      UserEntity,
    ]),
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: getJwtSecret(),
        signOptions: {
          expiresIn: getJwtExpiresIn() as JwtSignOptions['expiresIn'],
        },
      }),
    }),
    forwardRef(() => UserModule),
    PropertiesModule,
    MailModule,
  ],
  controllers: [AuthController, RoleController],
  providers: [
    EnsurePropertyOwnerHostRoleService,
    AuthRbacSeedService,
    AccountStatusSyncService,
    PasswordSetupTokenRepository,
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthRepository,
    },
    {
      provide: TOKEN_GENERATOR,
      useClass: JwtTokenGenerator,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: RoleRepository,
    },
    {
      provide: PASSWORD_SETUP_TOKEN_REPOSITORY,
      useClass: PasswordSetupTokenRepository,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  exports: [
    AUTH_REPOSITORY,
    ROLE_REPOSITORY,
    EnsurePropertyOwnerHostRoleService,
  ],
})
export class AuthModule implements OnModuleInit {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    @Inject(PASSWORD_SETUP_TOKEN_REPOSITORY)
    private readonly tokenRepository: IPasswordSetupTokenRepository,
    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: TokenGenerator,
    private readonly ensurePropertyOwnerHostRole: EnsurePropertyOwnerHostRoleService,
    private readonly mailService: MailService,
  ) {}

  onModuleInit() {
    const bootstrap = AuthBootstrap.create({
      authRepository: this.authRepository,
      roleRepository: this.roleRepository,
      userRepository: this.userRepository,
      propertyRepository: this.propertyRepository,
      tokenRepository: this.tokenRepository,
      tokenGenerator: this.tokenGenerator,
      ensurePropertyOwnerHostRole: this.ensurePropertyOwnerHostRole,
      mailService: this.mailService,
    });

    CommandBus.register(
      CreateCredentialsCommand,
      bootstrap.createCredentialsCommandHandler,
    );
    CommandBus.register(LoginCommand, bootstrap.loginCommandHandler);
    CommandBus.register(AssignRoleCommand, bootstrap.assignRoleCommandHandler);
    CommandBus.register(CreateRoleCommand, bootstrap.createRoleCommandHandler);
    CommandBus.register(UpdateRoleCommand, bootstrap.updateRoleCommandHandler);
    CommandBus.register(DeleteRoleCommand, bootstrap.deleteRoleCommandHandler);
    CommandBus.register(
      SetRolePermissionsCommand,
      bootstrap.setRolePermissionsCommandHandler,
    );
    CommandBus.register(
      SendAccountInvitationCommand,
      bootstrap.sendAccountInvitationCommandHandler,
    );
    CommandBus.register(
      SetPasswordWithTokenCommand,
      bootstrap.setPasswordWithTokenCommandHandler,
    );

    QueryBus.register(GetMeQuery, bootstrap.getMeQueryHandler);
    QueryBus.register(ListRolesQuery, bootstrap.listRolesQueryHandler);
    QueryBus.register(
      ListPermissionsQuery,
      bootstrap.listPermissionsQueryHandler,
    );
    QueryBus.register(
      ValidatePasswordSetupTokenQuery,
      bootstrap.validatePasswordSetupTokenQueryHandler,
    );
  }
}
