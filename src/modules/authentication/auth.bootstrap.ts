import type { IAuthRepository } from './domain/repositories/auth.repository';
import type { IRoleRepository } from './domain/repositories/role.repository';
import type { IUserRepository } from '../user/domain/repositories/user.repository';
import type { IPropertyRepository } from '../properties/domain/repositories/property.repository';
import type { IPasswordSetupTokenRepository } from './domain/repositories/password-setup-token.repository';
import type { TokenGenerator } from './domain/generator/token.generator';
import type { EnsurePropertyOwnerHostRoleService } from './application/services/ensure-property-owner-host-role.service';
import type { MailService } from '../mail/applications/services/mail.service';
import { PasswordSetupTokenService } from './domain/services/password-setup-token.service';
import { PasswordSetupLinkBuilder } from './domain/services/password-setup-link.builder';
import { CreateCredentialsCommandHandler } from './useCase/handlers/CreateCredentialsCommandHandler';
import { LoginCommandHandler } from './useCase/handlers/LoginCommandHandler';
import { AssignRoleCommandHandler } from './useCase/handlers/AssignRoleCommandHandler';
import { CreateRoleCommandHandler } from './useCase/handlers/CreateRoleCommandHandler';
import { UpdateRoleCommandHandler } from './useCase/handlers/UpdateRoleCommandHandler';
import { DeleteRoleCommandHandler } from './useCase/handlers/DeleteRoleCommandHandler';
import { SetRolePermissionsCommandHandler } from './useCase/handlers/SetRolePermissionsCommandHandler';
import { GetMeQueryHandler } from './useCase/handlers/GetMeQueryHandler';
import { ListRolesQueryHandler } from './useCase/handlers/ListRolesQueryHandler';
import { ListPermissionsQueryHandler } from './useCase/handlers/ListPermissionsQueryHandler';
import { SendAccountInvitationCommandHandler } from './useCase/handlers/SendAccountInvitationCommandHandler';
import { SetPasswordWithTokenCommandHandler } from './useCase/handlers/SetPasswordWithTokenCommandHandler';
import { ValidatePasswordSetupTokenQueryHandler } from './useCase/handlers/ValidatePasswordSetupTokenQueryHandler';

export class AuthBootstrap {
  static create(deps: {
    authRepository: IAuthRepository;
    roleRepository: IRoleRepository;
    userRepository: IUserRepository;
    propertyRepository: IPropertyRepository;
    tokenRepository: IPasswordSetupTokenRepository;
    tokenGenerator: TokenGenerator;
    ensurePropertyOwnerHostRole: EnsurePropertyOwnerHostRoleService;
    mailService: MailService;
  }) {
    const tokenService = new PasswordSetupTokenService();
    const linkBuilder = new PasswordSetupLinkBuilder();

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
    };
  }
}
