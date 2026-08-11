/**
 * Surface publique du module authentication.
 * Les autres modules doivent importer uniquement depuis ce barrel
 * (sauf AuthModule Nest et ORM AuthEntity).
 */
export {
  AUTH_REPOSITORY,
  type IAuthRepository,
} from '../domain/repositories/auth.repository';
export {
  ROLE_REPOSITORY,
  type IRoleRepository,
} from '../domain/repositories/role.repository';
export {
  ACCOUNT_STATUS,
  ADMIN_MANAGEABLE_ACCOUNT_STATUSES,
  type AccountStatus,
  type AdminManageableAccountStatus,
} from '../domain/constants/account-status.constant';
export {
  HOST_ROLE_SLUG,
  SUPERADMIN_ROLE_SLUG,
  TRAVELER_ROLE_SLUG,
} from '../domain/constants/permissions.constant';
export { SendAccountInvitationCommand } from '../applications/useCase/commands/SendAccountInvitationCommand';
export { RequirePermissions } from '../interfaces/decorators/require-permissions.decorator';
export { Public } from '../interfaces/decorators/public.decorator';
export { AccountStatusResolver } from '../domain/services/account-status.resolver';
export { Auth } from '../domain/entities/user.entity';
export type { JwtPayload } from '../domain/types/jwt-payload';
