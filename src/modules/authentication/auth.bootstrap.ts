import type { IAuthRepository } from './domain/repositories/auth.repository';
import type { IRoleRepository } from './domain/repositories/role.repository';
import type { IUserRepository } from '../user/domain/repositories/user.repository';
import type { IPropertyRepository } from '../properties/domain/repositories/property.repository';
import type { IPasswordSetupTokenRepository } from './domain/repositories/password-setup-token.repository';
import type { IPasswordResetTokenRepository } from './domain/repositories/password-reset-token.repository';
import type { TokenGenerator } from './domain/generator/token.generator';
import type { EnsurePropertyOwnerHostRoleService } from './applications/services/ensure-property-owner-host-role.service';
import type { MailService } from '../mail/applications/services/mail.service';
import { PasswordSetupTokenService } from './domain/services/password-setup-token.service';
import { PasswordSetupLinkBuilder } from './domain/services/password-setup-link.builder';
import { CreateCredentialsCommandHandler } from './applications/useCase/handlers/CreateCredentialsCommandHandler';
import { LoginCommandHandler } from './applications/useCase/handlers/LoginCommandHandler';
import { AssignRoleCommandHandler } from './applications/useCase/handlers/AssignRoleCommandHandler';
import { CreateRoleCommandHandler } from './applications/useCase/handlers/CreateRoleCommandHandler';
import { UpdateRoleCommandHandler } from './applications/useCase/handlers/UpdateRoleCommandHandler';
import { DeleteRoleCommandHandler } from './applications/useCase/handlers/DeleteRoleCommandHandler';
import { SetRolePermissionsCommandHandler } from './applications/useCase/handlers/SetRolePermissionsCommandHandler';
import { GetMeQueryHandler } from './applications/useCase/handlers/GetMeQueryHandler';
import { ListRolesQueryHandler } from './applications/useCase/handlers/ListRolesQueryHandler';
import { ListPermissionsQueryHandler } from './applications/useCase/handlers/ListPermissionsQueryHandler';
import { SendAccountInvitationCommandHandler } from './applications/useCase/handlers/SendAccountInvitationCommandHandler';
import { SetPasswordWithTokenCommandHandler } from './applications/useCase/handlers/SetPasswordWithTokenCommandHandler';
import { ValidatePasswordSetupTokenQueryHandler } from './applications/useCase/handlers/ValidatePasswordSetupTokenQueryHandler';
import { PasswordResetLinkBuilder } from './domain/services/password-reset-link.builder';
import { RequestPasswordResetCommandHandler } from './applications/useCase/handlers/RequestPasswordResetCommandHandler';
import { ResetPasswordWithTokenCommandHandler } from './applications/useCase/handlers/ResetPasswordWithTokenCommandHandler';
import { ValidatePasswordResetTokenQueryHandler } from './applications/useCase/handlers/ValidatePasswordResetTokenQueryHandler';

export class AuthBootstrap {
  static create(deps: {
    authRepository: IAuthRepository;
    roleRepository: IRoleRepository;
    userRepository: IUserRepository;
    propertyRepository: IPropertyRepository;
    tokenRepository: IPasswordSetupTokenRepository;
    resetTokenRepository: IPasswordResetTokenRepository;
    tokenGenerator: TokenGenerator;
    ensurePropertyOwnerHostRole: EnsurePropertyOwnerHostRoleService;
    mailService: MailService;
  }) {
    const tokenService = new PasswordSetupTokenService();
    const linkBuilder = new PasswordSetupLinkBuilder();
    const resetLinkBuilder = new PasswordResetLinkBuilder();

    return {
      createCredentialsCommandHandler: new CreateCredentialsCommandHandler(
        deps.authRepository,
      ),
      loginCommandHandler: new LoginCommandHandler(deps.tokenGenerator),
      assignRoleCommandHandler: new AssignRoleCommandHandler(
        deps.authRepository,
      ),
      createRoleCommandHandler: new CreateRoleCommandHandler(
        deps.roleRepository,
      ),
      updateRoleCommandHandler: new UpdateRoleCommandHandler(
        deps.roleRepository,
      ),
      deleteRoleCommandHandler: new DeleteRoleCommandHandler(
        deps.roleRepository,
      ),
      setRolePermissionsCommandHandler: new SetRolePermissionsCommandHandler(
        deps.roleRepository,
      ),
      getMeQueryHandler: new GetMeQueryHandler(
        deps.authRepository,
        deps.userRepository,
        deps.propertyRepository,
        deps.ensurePropertyOwnerHostRole,
      ),
      listRolesQueryHandler: new ListRolesQueryHandler(deps.roleRepository),
      listPermissionsQueryHandler: new ListPermissionsQueryHandler(),
      sendAccountInvitationCommandHandler:
        new SendAccountInvitationCommandHandler(
          deps.userRepository,
          deps.authRepository,
          deps.tokenRepository,
          deps.mailService,
          tokenService,
          linkBuilder,
        ),
      setPasswordWithTokenCommandHandler:
        new SetPasswordWithTokenCommandHandler(
          deps.authRepository,
          deps.tokenRepository,
          deps.userRepository,
          tokenService,
        ),
      validatePasswordSetupTokenQueryHandler:
        new ValidatePasswordSetupTokenQueryHandler(
          deps.tokenRepository,
          deps.userRepository,
          tokenService,
        ),
      requestPasswordResetCommandHandler:
        new RequestPasswordResetCommandHandler(
          deps.authRepository,
          deps.resetTokenRepository,
          deps.mailService,
          tokenService,
          resetLinkBuilder,
        ),
      resetPasswordWithTokenCommandHandler:
        new ResetPasswordWithTokenCommandHandler(
          deps.authRepository,
          deps.resetTokenRepository,
          tokenService,
        ),
      validatePasswordResetTokenQueryHandler:
        new ValidatePasswordResetTokenQueryHandler(
          deps.resetTokenRepository,
          deps.userRepository,
          tokenService,
        ),
    };
  }
}
